from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import os
import json
import time
import sqlite3
from datetime import datetime
import hashlib
from pathlib import Path

app = Flask(__name__)
CORS(app)

DB_PATH = "documents/db/documents.db"

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS folder_history (
            folder_path TEXT PRIMARY KEY,
            last_processed TIMESTAMP,
            total_files INTEGER,
            total_size INTEGER,
            status TEXT
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS file_fingerprints (
            file_path TEXT PRIMARY KEY,
            folder_path TEXT,
            hash TEXT,
            size INTEGER,
            last_modified TIMESTAMP,
            FOREIGN KEY(folder_path) REFERENCES folder_history(folder_path)
        )
    ''')
    conn.commit()
    conn.close()

def get_file_hash(file_path):
    """Calculate SHA-256 hash of file contents"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def analyze_folder(folder_path, recursive=True):
    """Analyze folder contents and compare with previous state"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Get previous folder state
    c.execute('SELECT last_processed FROM folder_history WHERE folder_path = ?', (folder_path,))
    result = c.fetchone()
    last_processed = result[0] if result else None
    
    # Get previous file fingerprints
    c.execute('SELECT file_path, hash, size, last_modified FROM file_fingerprints WHERE folder_path = ?', (folder_path,))
    previous_files = {row[0]: {'hash': row[1], 'size': row[2], 'modified': row[3]} for row in c.fetchall()}
    
    # Scan current folder state
    pattern = '**/*' if recursive else '*'
    current_files = {}
    new_files = []
    modified_files = []
    total_size = 0
    
    try:
        for file_path in Path(folder_path).glob(pattern):
            if file_path.is_file():
                abs_path = str(file_path.absolute())
                stat = file_path.stat()
                current_files[abs_path] = {
                    'size': stat.st_size,
                    'modified': datetime.fromtimestamp(stat.st_mtime),
                    'hash': get_file_hash(abs_path)
                }
                total_size += stat.st_size
                
                if abs_path not in previous_files:
                    new_files.append(abs_path)
                elif (current_files[abs_path]['hash'] != previous_files[abs_path]['hash'] or
                      current_files[abs_path]['modified'] != previous_files[abs_path]['modified']):
                    modified_files.append(abs_path)
    
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500
    
    deleted_files = [f for f in previous_files if f not in current_files]
    
    conn.close()
    return {
        'last_processed': last_processed,
        'new_files': new_files,
        'modified_files': modified_files,
        'deleted_files': deleted_files,
        'total_files': len(current_files),
        'total_size': total_size
    }

def process_folder(folder_path, recursive=True, selected_files=None):
    """Process files in the folder"""
    def generate():
        try:
            total_files = len(selected_files) if selected_files else sum(1 for _ in Path(folder_path).glob('**/*' if recursive else '*') if _.is_file())
            processed = 0
            
            files_to_process = selected_files if selected_files else [
                str(f.absolute()) for f in Path(folder_path).glob('**/*' if recursive else '*')
                if f.is_file()
            ]
            
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            
            for file_path in files_to_process:
                if not os.path.exists(file_path):
                    continue
                    
                processed += 1
                progress = int((processed / total_files) * 100)
                
                # Calculate file fingerprint
                stat = Path(file_path).stat()
                file_hash = get_file_hash(file_path)
                
                # Update database
                c.execute('''
                    INSERT OR REPLACE INTO file_fingerprints 
                    (file_path, folder_path, hash, size, last_modified)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    file_path,
                    folder_path,
                    file_hash,
                    stat.st_size,
                    datetime.fromtimestamp(stat.st_mtime)
                ))
                
                # Simulate processing time
                time.sleep(0.1)
                
                yield f"data: {json.dumps({
                    'progress': progress,
                    'message': f'Processing: {os.path.basename(file_path)}',
                    'status': 'processing',
                    'processed_files': processed,
                    'total_files': total_files
                })}\n\n"
            
            # Update folder history
            c.execute('''
                INSERT OR REPLACE INTO folder_history 
                (folder_path, last_processed, total_files, total_size, status)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                folder_path,
                datetime.now(),
                total_files,
                sum(Path(f).stat().st_size for f in files_to_process if os.path.exists(f)),
                'completed'
            ))
            
            conn.commit()
            conn.close()
            
            yield f"data: {json.dumps({
                'progress': 100,
                'message': 'Processing complete',
                'status': 'completed',
                'processed_files': processed,
                'total_files': total_files
            })}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({
                'progress': 0,
                'message': f'Error: {str(e)}',
                'status': 'error'
            })}\n\n"

    return Response(generate(), mimetype='text/event-stream')

@app.route('/api/preview', methods=['POST'])
def preview_folder():
    data = request.get_json()
    folder_path = data.get('folder_path')
    recursive = data.get('recursive', True)
    
    if not folder_path or not os.path.isdir(folder_path):
        return jsonify({'error': 'Invalid folder path'}), 400
        
    try:
        result = analyze_folder(folder_path, recursive)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/process')
def process():
    folder_path = request.args.get('folder_path')
    recursive = request.args.get('recursive', 'true').lower() == 'true'
    files = request.args.get('files')
    selected_files = files.split(',') if files else None
    
    if not folder_path or not os.path.isdir(folder_path):
        return jsonify({'error': 'Invalid folder path'}), 400
        
    return process_folder(folder_path, recursive, selected_files)

@app.route('/api/folder-history')
def get_folder_history():
    folder_path = request.args.get('folder_path')
    
    if not folder_path:
        return jsonify({'error': 'Folder path is required'}), 400
        
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('''
        SELECT last_processed, total_files, total_size, status 
        FROM folder_history 
        WHERE folder_path = ?
    ''', (folder_path,))
    
    result = c.fetchone()
    conn.close()
    
    if result:
        return jsonify({
            'last_processed': result[0],
            'processed_files': result[1],
            'total_size': result[2],
            'status': result[3]
        })
    else:
        return jsonify({
            'last_processed': None,
            'processed_files': 0,
            'total_size': 0,
            'status': 'never'
        })

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
