import os
import shutil
import hashlib
import sqlite3
import json
from datetime import datetime
import logging
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import time

class DocumentProcessor:
    def __init__(self, base_dir="c:/Users/robmo/Desktop/evidenceai"):
        self.base_dir = base_dir
        self.input_dir = os.path.join(base_dir, "input")
        self.files_dir = os.path.join(base_dir, "documents/files")
        self.cache_db = os.path.join(base_dir, "documents/db/cache.db")
        
        # Google Sheets configuration
        self.creds = Credentials.from_authorized_user_file('google-token.json', ['https://www.googleapis.com/auth/spreadsheets'])
        self.sheets_service = build('sheets', 'v4', credentials=self.creds)
        self.spreadsheet_id = os.getenv('SHEETS_SPREADSHEET_ID')
        
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
                sheet_row INTEGER,
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
                sheet_row INTEGER,
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

    def sync_to_sheets(self, doc_info, sheet_name='Documents'):
        """Sync document info to Google Sheets"""
        try:
            # Prepare values for sheets
            values = [
                [
                    doc_info['id'],
                    doc_info['content_hash'],
                    doc_info['original_name'],
                    doc_info['doc_type'],
                    doc_info['received_date'],
                    doc_info['source'],
                    doc_info['file_path']
                ]
            ]
            
            # Append to sheet
            body = {
                'values': values
            }
            result = self.sheets_service.spreadsheets().values().append(
                spreadsheetId=self.spreadsheet_id,
                range=f'{sheet_name}!A:G',
                valueInputOption='RAW',
                body=body
            ).execute()
            
            return result.get('updates').get('updatedRange')
            
        except Exception as e:
            logging.error(f"Error syncing to sheets: {str(e)}")
            raise

    def store_document(self, file_path):
        """Process and store a new document"""
        try:
            # Generate document info
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            content_hash = self.calculate_hash(file_path)
            original_name = os.path.basename(file_path)
            doc_id = f"{timestamp}_{content_hash[:8]}"
            
            # Check cache for duplicates
            conn = sqlite3.connect(self.cache_db)
            c = conn.cursor()
            c.execute('SELECT id FROM documents_cache WHERE content_hash = ?', (content_hash,))
            existing = c.fetchone()
            
            if existing:
                logging.info(f"Duplicate detected: {original_name}")
                # Handle different format if needed
                ext = os.path.splitext(file_path)[1].lower()
                c.execute('SELECT original_name FROM documents_cache WHERE content_hash = ?', (content_hash,))
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
            
            # Prepare document info
            doc_info = {
                'id': doc_id,
                'content_hash': content_hash,
                'original_name': original_name,
                'doc_type': self.get_doc_type(file_path),
                'received_date': datetime.now().isoformat(),
                'source': 'upload',
                'file_path': new_path
            }
            
            # Sync to Google Sheets
            sheet_range = self.sync_to_sheets(doc_info)
            sheet_row = int(sheet_range.split('!')[1].split(':')[0][1:])
            
            # Update local cache
            c.execute('''
                INSERT INTO documents_cache
                (id, sheet_row, content_hash, original_name, doc_type, 
                 received_date, source, file_path, last_synced)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                doc_id,
                sheet_row,
                content_hash,
                original_name,
                doc_info['doc_type'],
                doc_info['received_date'],
                'upload',
                new_path,
                datetime.now().isoformat()
            ))
            
            conn.commit()
            conn.close()
            
            logging.info(f"Stored new document: {new_path}")
            return doc_id
            
        except Exception as e:
            logging.error(f"Error processing {file_path}: {str(e)}")
            raise

    def sync_cache(self):
        """Sync local cache with Google Sheets"""
        try:
            # Get all records from sheets
            result = self.sheets_service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range='Documents!A2:G'
            ).execute()
            rows = result.get('values', [])
            
            conn = sqlite3.connect(self.cache_db)
            c = conn.cursor()
            
            for i, row in enumerate(rows, start=2):  # start=2 to account for header row
                doc_id = row[0]
                c.execute('''
                    INSERT OR REPLACE INTO documents_cache
                    (id, sheet_row, content_hash, original_name, doc_type, 
                     received_date, source, file_path, last_synced)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    doc_id,
                    i,
                    row[1],  # content_hash
                    row[2],  # original_name
                    row[3],  # doc_type
                    row[4],  # received_date
                    row[5],  # source
                    row[6],  # file_path
                    datetime.now().isoformat()
                ))
            
            conn.commit()
            conn.close()
            
            logging.info("Cache sync completed")
            
        except Exception as e:
            logging.error(f"Error syncing cache: {str(e)}")
            raise

class FileHandler:
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
    
    from watchdog.observers import Observer
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
