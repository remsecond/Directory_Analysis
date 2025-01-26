import os
import shutil
import hashlib
import sqlite3
import json
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import logging
from pyairtable import Table
import time

class DocumentProcessor:
    def __init__(self, base_dir="c:/Users/robmo/Desktop/evidenceai"):
        self.base_dir = base_dir
        self.input_dir = os.path.join(base_dir, "input")
        self.files_dir = os.path.join(base_dir, "documents/files")
        self.cache_db = os.path.join(base_dir, "documents/db/cache.db")
        
        # Airtable configuration
        self.airtable_api_key = os.getenv('AIRTABLE_API_KEY')
        self.base_id = os.getenv('AIRTABLE_BASE_ID')
        self.docs_table = Table(self.airtable_api_key, self.base_id, 'Documents')
        self.relations_table = Table(self.airtable_api_key, self.base_id, 'Relationships')
        
        self.setup_logging()
        self.init_cache()

    def setup_logging(self):
        logging.basicConfig(
            filename='document_processor.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def init_cache(self):
        """Initialize SQLite cache database"""
        conn = sqlite3.connect(self.cache_db)
        c = conn.cursor()

        # Documents cache table
        c.execute('''
            CREATE TABLE IF NOT EXISTS documents_cache (
                id TEXT PRIMARY KEY,
                airtable_id TEXT,
                content_hash TEXT,
                original_name TEXT,
                doc_type TEXT,
                received_date TIMESTAMP,
                source TEXT,
                file_path TEXT,
                last_synced TIMESTAMP
            )
        ''')

        # Relationships cache table
        c.execute('''
            CREATE TABLE IF NOT EXISTS relationships_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                airtable_id TEXT,
                source_doc TEXT,
                target_doc TEXT,
                relation_type TEXT,
                metadata TEXT,
                last_synced TIMESTAMP,
                FOREIGN KEY (source_doc) REFERENCES documents_cache (id),
                FOREIGN KEY (target_doc) REFERENCES documents_cache (id)
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
            # Generate document info
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            content_hash = self.calculate_hash(file_path)
            original_name = os.path.basename(file_path)
            doc_id = f"{timestamp}_{content_hash[:8]}"
            
            # Check Airtable for duplicates
            formula = f"{{content_hash}} = '{content_hash}'"
            existing = self.docs_table.first(formula=formula)
            
            if existing:
                logging.info(f"Duplicate detected in Airtable: {original_name}")
                # Handle different format if needed
                ext = os.path.splitext(file_path)[1].lower()
                existing_ext = os.path.splitext(existing['fields']['original_name'])[1].lower()
                
                if ext != existing_ext:
                    # Store as alternative format
                    new_path = os.path.join(self.files_dir, f"{doc_id}_{original_name}")
                    shutil.copy2(file_path, new_path)
                    
                    # Update Airtable record
                    self.docs_table.update(existing['id'], {
                        'formats': f"{existing['fields'].get('formats', '')}|{ext}"
                    })
                    
                    logging.info(f"Stored alternate format: {new_path}")
                else:
                    logging.info(f"Identical file already exists: {existing['fields']['original_name']}")
                
                return existing['id']
            
            # Store new document
            new_path = os.path.join(self.files_dir, f"{doc_id}_{original_name}")
            shutil.copy2(file_path, new_path)
            
            # Create Airtable record
            doc_record = {
                'id': doc_id,
                'content_hash': content_hash,
                'original_name': original_name,
                'doc_type': self.get_doc_type(file_path),
                'received_date': datetime.now().isoformat(),
                'source': 'upload',
                'file_path': new_path
            }
            
            airtable_record = self.docs_table.create(doc_record)
            
            # Update local cache
            self.update_cache(airtable_record)
            
            logging.info(f"Stored new document: {new_path}")
            return airtable_record['id']
            
        except Exception as e:
            logging.error(f"Error processing {file_path}: {str(e)}")
            raise

    def update_cache(self, airtable_record):
        """Update local cache with Airtable record"""
        conn = sqlite3.connect(self.cache_db)
        c = conn.cursor()
        
        fields = airtable_record['fields']
        c.execute('''
            INSERT OR REPLACE INTO documents_cache
            (id, airtable_id, content_hash, original_name, doc_type, 
             received_date, source, file_path, last_synced)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            fields['id'],
            airtable_record['id'],
            fields['content_hash'],
            fields['original_name'],
            fields['doc_type'],
            fields['received_date'],
            fields['source'],
            fields['file_path'],
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()

    def sync_cache(self):
        """Sync local cache with Airtable"""
        try:
            # Get all records from Airtable
            airtable_records = self.docs_table.all()
            
            conn = sqlite3.connect(self.cache_db)
            c = conn.cursor()
            
            for record in airtable_records:
                self.update_cache(record)
            
            conn.commit()
            conn.close()
            
            logging.info("Cache sync completed")
            
        except Exception as e:
            logging.error(f"Error syncing cache: {str(e)}")
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
            
            # Clean up input file
            if os.path.exists(file_path):
                os.remove(file_path)
                
        except Exception as e:
            logging.error(f"Error handling file {event.src_path}: {str(e)}")

def start_monitoring(base_dir="c:/Users/robmo/Desktop/evidenceai"):
    """Start the document processing system"""
    processor = DocumentProcessor(base_dir)
    
    # Initial cache sync
    processor.sync_cache()
    
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
            # Periodic cache sync
            processor.sync_cache()
            time.sleep(300)  # Sync every 5 minutes
    except KeyboardInterrupt:
        observer.stop()
        print("\nShutting down...")
        
    observer.join()

if __name__ == "__main__":
    start_monitoring()
