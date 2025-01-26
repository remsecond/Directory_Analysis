import os
import shutil
import hashlib
import sqlite3
import json
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import logging

class DocumentProcessor:
    def __init__(self, base_dir="c:/Users/robmo/Desktop/evidenceai"):
        self.base_dir = base_dir
        self.input_dir = os.path.join(base_dir, "input")
        self.files_dir = os.path.join(base_dir, "documents/files")
        self.db_path = os.path.join(base_dir, "documents/db/documents.db")
        self.setup_logging()
        self.init_database()

    def setup_logging(self):
        logging.basicConfig(
            filename='document_processor.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def init_database(self):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        # Documents table - stores unique documents
        c.execute('''
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                original_name TEXT,
                content_hash TEXT,
                doc_type TEXT,
                received_date TIMESTAMP,
                source TEXT
            )
        ''')

        # Relationships table - tracks document relationships
        c.execute('''
            CREATE TABLE IF NOT EXISTS relationships (
                source_id TEXT,
                target_id TEXT,
                relation_type TEXT,
                metadata TEXT,
                FOREIGN KEY (source_id) REFERENCES documents (id),
                FOREIGN KEY (target_id) REFERENCES documents (id)
            )
        ''')

        conn.commit()
        conn.close()

    def calculate_hash(self, file_path):
        """Calculate SHA-256 hash of file content"""
        hasher = hashlib.sha256()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                hasher.update(chunk)
        return hasher.hexdigest()

    def get_doc_type(self, file_path):
        """Determine document type based on extension and content"""
        ext = os.path.splitext(file_path)[1].lower()
        if ext in ['.eml', '.msg']:
            return 'email'
        elif ext in ['.pdf']:
            return 'document'
        elif ext in ['.jpg', '.jpeg', '.png']:
            return 'image'
        elif ext in ['.doc', '.docx']:
            return 'word_document'
        return 'unknown'

    def store_document(self, file_path):
        """Process and store a new document"""
        try:
            # Generate document ID and hash
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            content_hash = self.calculate_hash(file_path)
            original_name = os.path.basename(file_path)
            doc_id = f"{timestamp}_{content_hash[:8]}"
            
            # Check for duplicates
            conn = sqlite3.connect(self.db_path)
            c = conn.cursor()
            c.execute('SELECT id FROM documents WHERE content_hash = ?', (content_hash,))
            existing = c.fetchone()
            
            if existing:
                logging.info(f"Duplicate detected: {original_name}")
                # Store as new version if format is different
                ext = os.path.splitext(file_path)[1].lower()
                c.execute('SELECT original_name FROM documents WHERE content_hash = ?', (content_hash,))
                existing_name = c.fetchone()[0]
                existing_ext = os.path.splitext(existing_name)[1].lower()
                
                if ext != existing_ext:
                    # Store as alternative format
                    new_path = os.path.join(self.files_dir, f"{doc_id}_{original_name}")
                    shutil.copy2(file_path, new_path)
                    logging.info(f"Stored alternate format: {new_path}")
                else:
                    logging.info(f"Identical file already exists: {existing_name}")
                
                conn.close()
                return existing[0]
            
            # Store new document
            new_path = os.path.join(self.files_dir, f"{doc_id}_{original_name}")
            shutil.copy2(file_path, new_path)
            
            # Record in database
            c.execute('''
                INSERT INTO documents 
                (id, original_name, content_hash, doc_type, received_date, source)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                doc_id,
                original_name,
                content_hash,
                self.get_doc_type(file_path),
                datetime.now(),
                'upload'
            ))
            
            conn.commit()
            conn.close()
            
            logging.info(f"Stored new document: {new_path}")
            return doc_id
            
        except Exception as e:
            logging.error(f"Error processing {file_path}: {str(e)}")
            raise

    def store_relationship(self, source_id, target_id, relation_type, metadata=None):
        """Record a relationship between documents"""
        try:
            conn = sqlite3.connect(self.db_path)
            c = conn.cursor()
            
            c.execute('''
                INSERT INTO relationships 
                (source_id, target_id, relation_type, metadata)
                VALUES (?, ?, ?, ?)
            ''', (
                source_id,
                target_id,
                relation_type,
                json.dumps(metadata) if metadata else None
            ))
            
            conn.commit()
            conn.close()
            
            logging.info(f"Stored relationship: {source_id} -> {target_id} ({relation_type})")
            
        except Exception as e:
            logging.error(f"Error storing relationship: {str(e)}")
            raise

class FileHandler(FileSystemEventHandler):
    def __init__(self, processor):
        self.processor = processor

    def on_created(self, event):
        if event.is_directory:
            return
            
        try:
            file_path = event.src_path
            logging.info(f"Processing new file: {file_path}")
            
            # Process the document
            doc_id = self.processor.store_document(file_path)
            
            # If it's an email, check for attachments
            if file_path.lower().endswith(('.eml', '.msg')):
                # TODO: Extract and process attachments
                pass
                
            # Clean up input file
            if os.path.exists(file_path):
                os.remove(file_path)
                
        except Exception as e:
            logging.error(f"Error handling file {event.src_path}: {str(e)}")

def start_monitoring(base_dir="c:/Users/robmo/Desktop/evidenceai"):
    """Start the document processing system"""
    processor = DocumentProcessor(base_dir)
    
    print(f"\nDocument Processor Started")
    print("========================")
    print(f"Monitoring: {processor.input_dir}")
    print(f"Storage: {processor.files_dir}")
    print("\nReady to process files...")
    print("Press Ctrl+C to stop\n")
    
    event_handler = FileHandler(processor)
    observer = Observer()
    observer.schedule(event_handler, processor.input_dir, recursive=False)
    observer.start()
    
    try:
        while True:
            import time
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\nShutting down...")
        
    observer.join()

if __name__ == "__main__":
    start_monitoring()
