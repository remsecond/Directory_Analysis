import os
import json
import hashlib
import sqlite3
from datetime import datetime
from typing import Dict, List, Optional, Tuple

class FolderAnalyzer:
    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        self.db_path = os.path.join(base_dir, "documents/db/documents.db")
        self.init_database()

    def init_database(self):
        """Initialize the database tables for folder history tracking"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        # Folder history table
        c.execute('''
            CREATE TABLE IF NOT EXISTS folder_history (
                id TEXT PRIMARY KEY,
                path TEXT,
                last_processed TIMESTAMP,
                file_count INTEGER,
                total_size INTEGER,
                fingerprint TEXT,
                status TEXT
            )
        ''')

        # Folder changes table
        c.execute('''
            CREATE TABLE IF NOT EXISTS folder_changes (
                id TEXT PRIMARY KEY,
                folder_id TEXT,
                detected_at TIMESTAMP,
                change_type TEXT,
                file_path TEXT,
                file_hash TEXT,
                FOREIGN KEY (folder_id) REFERENCES folder_history(id)
            )
        ''')

        conn.commit()
        conn.close()

    def calculate_file_hash(self, file_path: str) -> str:
        """Calculate SHA-256 hash of a file"""
        hasher = hashlib.sha256()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                hasher.update(chunk)
        return hasher.hexdigest()

    def generate_folder_fingerprint(self, folder_path: str, recursive: bool = True) -> Dict:
        """Generate a fingerprint of the folder's contents"""
        fingerprint = {
            'files': {},
            'structure': {},
            'total_size': 0,
            'file_count': 0
        }

        for root, dirs, files in os.walk(folder_path):
            if not recursive and root != folder_path:
                continue

            rel_path = os.path.relpath(root, folder_path)
            fingerprint['structure'][rel_path] = {
                'dirs': dirs,
                'files': []
            }

            for file in files:
                file_path = os.path.join(root, file)
                try:
                    file_size = os.path.getsize(file_path)
                    file_hash = self.calculate_file_hash(file_path)
                    rel_file_path = os.path.relpath(file_path, folder_path)
                    
                    fingerprint['files'][rel_file_path] = {
                        'size': file_size,
                        'hash': file_hash,
                        'modified': os.path.getmtime(file_path)
                    }
                    
                    fingerprint['structure'][rel_path]['files'].append(file)
                    fingerprint['total_size'] += file_size
                    fingerprint['file_count'] += 1
                except (IOError, OSError) as e:
                    print(f"Error processing {file_path}: {str(e)}")

            if not recursive:
                break

        return fingerprint

    def get_last_processing_info(self, folder_path: str) -> Optional[Dict]:
        """Get information about the last time this folder was processed"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        
        c.execute('''
            SELECT id, last_processed, file_count, total_size, fingerprint, status
            FROM folder_history
            WHERE path = ?
            ORDER BY last_processed DESC
            LIMIT 1
        ''', (folder_path,))
        
        result = c.fetchone()
        conn.close()

        if result:
            return {
                'id': result[0],
                'last_processed': result[1],
                'file_count': result[2],
                'total_size': result[3],
                'fingerprint': json.loads(result[4]),
                'status': result[5]
            }
        return None

    def compare_with_previous(self, folder_path: str, recursive: bool = True) -> Tuple[Dict, List[Dict]]:
        """Compare current folder state with previous processing"""
        current = self.generate_folder_fingerprint(folder_path, recursive)
        previous = self.get_last_processing_info(folder_path)
        
        if not previous:
            return {
                'is_first_time': True,
                'total_files': current['file_count'],
                'total_size': current['total_size']
            }, []

        changes = []
        prev_files = previous['fingerprint']['files']
        
        # Check for new and modified files
        for file_path, curr_info in current['files'].items():
            if file_path not in prev_files:
                changes.append({
                    'type': 'new',
                    'path': file_path,
                    'size': curr_info['size']
                })
            elif prev_files[file_path]['hash'] != curr_info['hash']:
                changes.append({
                    'type': 'modified',
                    'path': file_path,
                    'size': curr_info['size']
                })

        # Check for deleted files
        for file_path in prev_files:
            if file_path not in current['files']:
                changes.append({
                    'type': 'deleted',
                    'path': file_path,
                    'size': prev_files[file_path]['size']
                })

        summary = {
            'is_first_time': False,
            'last_processed': previous['last_processed'],
            'total_files': current['file_count'],
            'total_size': current['total_size'],
            'new_files': len([c for c in changes if c['type'] == 'new']),
            'modified_files': len([c for c in changes if c['type'] == 'modified']),
            'deleted_files': len([c for c in changes if c['type'] == 'deleted'])
        }

        return summary, changes

    def store_processing_record(self, folder_path: str, fingerprint: Dict, status: str = 'success'):
        """Store a record of processing this folder"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        
        record_id = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hashlib.sha256(folder_path.encode()).hexdigest()[:8]}"
        
        c.execute('''
            INSERT INTO folder_history 
            (id, path, last_processed, file_count, total_size, fingerprint, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            record_id,
            folder_path,
            datetime.now(),
            fingerprint['file_count'],
            fingerprint['total_size'],
            json.dumps(fingerprint),
            status
        ))
        
        conn.commit()
        conn.close()
        
        return record_id

    def store_changes(self, folder_id: str, changes: List[Dict]):
        """Store detected changes in the database"""
        if not changes:
            return

        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        
        for change in changes:
            change_id = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hashlib.sha256(change['path'].encode()).hexdigest()[:8]}"
            
            c.execute('''
                INSERT INTO folder_changes 
                (id, folder_id, detected_at, change_type, file_path, file_hash)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                change_id,
                folder_id,
                datetime.now(),
                change['type'],
                change['path'],
                change.get('hash', '')
            ))
        
        conn.commit()
        conn.close()
