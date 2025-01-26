#!/usr/bin/env python3
import sqlite3
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

class AssetDatabaseSQL:
    def __init__(self, base_dir: str = "."):
        self.base_dir = Path(base_dir)
        self.db_path = self.base_dir / "04_Metadata" / "asset_database.db"
        self.json_path = self.base_dir / "04_Metadata" / "asset_database.json"
        self._init_database()

    def _init_database(self):
        """Initialize SQLite database with proper schema."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        # Create tables with proper relationships
        c.executescript("""
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY,
                file_name TEXT NOT NULL,
                file_path TEXT UNIQUE NOT NULL,
                file_type TEXT NOT NULL,
                document_category TEXT NOT NULL,
                sha256_hash TEXT NOT NULL,
                date_modified TEXT NOT NULL,
                ocr_text TEXT,
                summary TEXT,
                date_range_start TEXT,
                date_range_end TEXT
            );

            CREATE TABLE IF NOT EXISTS tags (
                id INTEGER PRIMARY KEY,
                name TEXT UNIQUE NOT NULL
            );

            CREATE TABLE IF NOT EXISTS file_tags (
                file_id INTEGER,
                tag_id INTEGER,
                FOREIGN KEY (file_id) REFERENCES files (id),
                FOREIGN KEY (tag_id) REFERENCES tags (id),
                PRIMARY KEY (file_id, tag_id)
            );

            CREATE TABLE IF NOT EXISTS participants (
                id INTEGER PRIMARY KEY,
                name TEXT UNIQUE NOT NULL
            );

            CREATE TABLE IF NOT EXISTS file_participants (
                file_id INTEGER,
                participant_id INTEGER,
                FOREIGN KEY (file_id) REFERENCES files (id),
                FOREIGN KEY (participant_id) REFERENCES participants (id),
                PRIMARY KEY (file_id, participant_id)
            );

            CREATE TABLE IF NOT EXISTS related_documents (
                file_id INTEGER,
                related_file_id INTEGER,
                FOREIGN KEY (file_id) REFERENCES files (id),
                FOREIGN KEY (related_file_id) REFERENCES files (id),
                PRIMARY KEY (file_id, related_file_id)
            );
        """)
        conn.commit()
        conn.close()

    def _get_or_create_tag(self, conn, tag_name: str) -> int:
        """Get tag ID or create if not exists."""
        c = conn.cursor()
        c.execute("INSERT OR IGNORE INTO tags (name) VALUES (?)", (tag_name,))
        c.execute("SELECT id FROM tags WHERE name = ?", (tag_name,))
        return c.fetchone()[0]

    def _get_or_create_participant(self, conn, participant_name: str) -> int:
        """Get participant ID or create if not exists."""
        c = conn.cursor()
        c.execute("INSERT OR IGNORE INTO participants (name) VALUES (?)", (participant_name,))
        c.execute("SELECT id FROM participants WHERE name = ?", (participant_name,))
        return c.fetchone()[0]

    def update_database(self, file_metadata: Dict):
        """Update both SQLite and JSON databases."""
        # Update SQLite database
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        # Insert/update file record
        c.execute("""
            INSERT OR REPLACE INTO files (
                file_name, file_path, file_type, document_category,
                sha256_hash, date_modified, ocr_text, summary,
                date_range_start, date_range_end
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            file_metadata["file_name"],
            file_metadata["file_path"],
            file_metadata["file_type"],
            file_metadata["document_category"],
            file_metadata["sha256_hash"],
            file_metadata["date_modified"],
            file_metadata["ocr_text"],
            file_metadata["summary"],
            file_metadata["date_range"].get("start"),
            file_metadata["date_range"].get("end")
        ))
        file_id = c.lastrowid

        # Update tags
        c.execute("DELETE FROM file_tags WHERE file_id = ?", (file_id,))
        for tag in file_metadata["tags"]:
            tag_id = self._get_or_create_tag(conn, tag)
            c.execute("INSERT INTO file_tags (file_id, tag_id) VALUES (?, ?)", 
                     (file_id, tag_id))

        # Update participants
        c.execute("DELETE FROM file_participants WHERE file_id = ?", (file_id,))
        for participant in file_metadata["participants"]:
            participant_id = self._get_or_create_participant(conn, participant)
            c.execute("INSERT INTO file_participants (file_id, participant_id) VALUES (?, ?)", 
                     (file_id, participant_id))

        conn.commit()

        # Update JSON database for LLMs
        self._update_json_database()

    def _update_json_database(self):
        """Generate JSON database from SQLite for LLM consumption."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        files = []
        c.execute("SELECT * FROM files")
        for file_row in c.fetchall():
            file_id = file_row[0]
            file_data = {
                "file_name": file_row[1],
                "file_path": file_row[2],
                "file_type": file_row[3],
                "document_category": file_row[4],
                "sha256_hash": file_row[5],
                "date_modified": file_row[6],
                "ocr_text": file_row[7],
                "summary": file_row[8],
                "date_range": {
                    "start": file_row[9],
                    "end": file_row[10]
                }
            }

            # Get tags
            c.execute("""
                SELECT t.name FROM tags t
                JOIN file_tags ft ON ft.tag_id = t.id
                WHERE ft.file_id = ?
            """, (file_id,))
            file_data["tags"] = [row[0] for row in c.fetchall()]

            # Get participants
            c.execute("""
                SELECT p.name FROM participants p
                JOIN file_participants fp ON fp.participant_id = p.id
                WHERE fp.file_id = ?
            """, (file_id,))
            file_data["participants"] = [row[0] for row in c.fetchall()]

            # Get related documents
            c.execute("""
                SELECT f.file_path FROM files f
                JOIN related_documents rd ON rd.related_file_id = f.id
                WHERE rd.file_id = ?
            """, (file_id,))
            file_data["related_documents"] = [row[0] for row in c.fetchall()]

            files.append(file_data)

        json_data = {
            "files": files,
            "last_updated": datetime.now().isoformat()
        }

        os.makedirs(os.path.dirname(self.json_path), exist_ok=True)
        with open(self.json_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2)

        conn.close()

    def find_duplicates(self) -> List[List[Dict]]:
        """Find duplicate files based on hash."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        
        duplicates = []
        c.execute("""
            SELECT sha256_hash
            FROM files
            GROUP BY sha256_hash
            HAVING COUNT(*) > 1
        """)
        
        for (hash_value,) in c.fetchall():
            c.execute("SELECT * FROM files WHERE sha256_hash = ?", (hash_value,))
            group = []
            for file_row in c.fetchall():
                file_data = {
                    "file_name": file_row[1],
                    "file_path": file_row[2],
                    "file_type": file_row[3],
                    "document_category": file_row[4],
                    "sha256_hash": file_row[5],
                    "date_modified": file_row[6]
                }
                group.append(file_data)
            duplicates.append(group)
        
        conn.close()
        return duplicates

    def get_by_category(self, category: str) -> List[Dict]:
        """Get all files in a specific category."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        
        c.execute("SELECT * FROM files WHERE document_category = ?", (category,))
        files = []
        for file_row in c.fetchall():
            file_data = {
                "file_name": file_row[1],
                "file_path": file_row[2],
                "file_type": file_row[3],
                "document_category": file_row[4],
                "sha256_hash": file_row[5],
                "date_modified": file_row[6],
                "ocr_text": file_row[7],
                "summary": file_row[8]
            }
            files.append(file_data)
        
        conn.close()
        return files

def main():
    """Main function to run database updates."""
    db = AssetDatabaseSQL()
    # Example usage
    file_metadata = {
        "file_name": "test.txt",
        "file_path": "03_Completed/test.txt",
        "file_type": "txt",
        "document_category": "Created_Evidence",
        "sha256_hash": "abc123",
        "date_modified": datetime.now().isoformat(),
        "tags": ["important", "evidence"],
        "ocr_text": None,
        "summary": None,
        "related_documents": [],
        "participants": ["John Doe"],
        "date_range": {
            "start": None,
            "end": None
        }
    }
    db.update_database(file_metadata)
    print(f"Database updated: {db.db_path}")
    print(f"JSON updated: {db.json_path}")
    
    # Print duplicate report
    duplicates = db.find_duplicates()
    if duplicates:
        print("\nDuplicate files found:")
        for group in duplicates:
            print("\nDuplicate group:")
            for file in group:
                print(f"  - {file['file_path']}")

if __name__ == "__main__":
    main()
