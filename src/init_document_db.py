import sqlite3
import os

def init_databases():
    """Initialize SQLite databases for document tracking"""
    db_path = "processed/metadata"
    
    # Create versions database
    versions_db = os.path.join(db_path, "versions.db")
    conn = sqlite3.connect(versions_db)
    c = conn.cursor()
    
    # Documents table stores unique documents by content hash
    c.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            content_hash TEXT PRIMARY KEY,
            title TEXT,              -- Original document title/name
            first_seen TIMESTAMP,    -- When first version was seen
            doc_type TEXT,           -- Document type (court order, email, etc)
            category TEXT,           -- Primary category
            tags TEXT               -- Additional tags/categories
        )
    ''')
    
    # Versions table tracks all versions of each document
    c.execute('''
        CREATE TABLE IF NOT EXISTS versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content_hash TEXT,       -- Links to documents table
            file_path TEXT,          -- Path to this version
            file_format TEXT,        -- File format (PDF, DOC, etc)
            version_num INTEGER,     -- Version number
            created TIMESTAMP,       -- When this version was created
            FOREIGN KEY (content_hash) REFERENCES documents (content_hash)
        )
    ''')
    
    conn.commit()
    conn.close()
    
    # Create relationships database
    relations_db = os.path.join(db_path, "relationships.db")
    conn = sqlite3.connect(relations_db)
    c = conn.cursor()
    
    # Document relationships table
    c.execute('''
        CREATE TABLE IF NOT EXISTS relationships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_hash TEXT,        -- Source document hash
            target_hash TEXT,        -- Target document hash
            relation_type TEXT,      -- Type of relationship (attachment, reference, etc)
            metadata TEXT,           -- Additional relationship metadata
            created TIMESTAMP,
            FOREIGN KEY (source_hash) REFERENCES documents (content_hash),
            FOREIGN KEY (target_hash) REFERENCES documents (content_hash)
        )
    ''')
    
    # Document context table for additional metadata
    c.execute('''
        CREATE TABLE IF NOT EXISTS context (
            content_hash TEXT PRIMARY KEY,
            source_type TEXT,        -- How document was received (email, upload, etc)
            source_metadata TEXT,    -- Source-specific metadata
            processing_history TEXT, -- Record of processing steps
            notes TEXT,             -- Additional notes/context
            FOREIGN KEY (content_hash) REFERENCES documents (content_hash)
        )
    ''')
    
    conn.commit()
    conn.close()
    
    print("Databases initialized successfully")
    print(f"Versions DB: {versions_db}")
    print(f"Relations DB: {relations_db}")

if __name__ == "__main__":
    init_databases()
