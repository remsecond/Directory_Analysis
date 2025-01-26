#!/usr/bin/env python3
import os
import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Union

class AssetDatabase:
    def __init__(self, base_dir: str = "."):
        self.base_dir = Path(base_dir)
        self.input_dir = self.base_dir / "01_Input"
        self.processing_dir = self.base_dir / "02_Processing"
        self.completed_dir = self.base_dir / "03_Completed"
        self.metadata_dir = self.base_dir / "04_Metadata"
        self.archive_dir = self.base_dir / "05_Archive"
        self.db_file = self.metadata_dir / "asset_database.json"
        self.database: Dict = self._load_database()

    def _load_database(self) -> Dict:
        """Load existing database or create new one if it doesn't exist."""
        if self.db_file.exists():
            with open(self.db_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"files": [], "last_updated": None}

    def _save_database(self) -> None:
        """Save database to file."""
        self.database["last_updated"] = datetime.now().isoformat()
        self.metadata_dir.mkdir(parents=True, exist_ok=True)
        with open(self.db_file, 'w', encoding='utf-8') as f:
            json.dump(self.database, f, indent=2)

    def _calculate_hash(self, file_path: Path) -> str:
        """Calculate SHA-256 hash of file."""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def _get_category(self, file_path: Path) -> str:
        """Determine document category based on path and filename patterns."""
        path_str = str(file_path).lower()
        
        # Check parent directory first
        parent = file_path.parent.name
        if parent in ["Court_Orders", "Financial_Agreements", "Mediation_Agreements", 
                     "Document_Attachments", "Legal_Correspondence", "Exhibits", 
                     "Created_Evidence"]:
            return parent
        
        if "Email_Threads" in str(file_path):
            for subcat in ["Lawyers", "Therapists", "Ex_Wife"]:
                if subcat.lower() in path_str:
                    return f"Email_Threads/{subcat}"
            return "Email_Threads"
        
        # Pattern matching on filename
        if any(x in path_str for x in ["order", "ruling", "decision"]):
            return "Court_Orders"
        if any(x in path_str for x in ["financial", "payment", "settlement"]):
            return "Financial_Agreements"
        if any(x in path_str for x in ["mediation", "agreement"]):
            return "Mediation_Agreements"
        if any(x in path_str for x in ["exhibit", "evidence"]):
            return "Exhibits"
        if any(x in path_str for x in ["letter", "correspondence"]):
            return "Legal_Correspondence"
        if "attachment" in path_str:
            return "Document_Attachments"
        
        return "Uncategorized"

    def extract_metadata(self, file_path: Path) -> Dict:
        """Extract metadata from a file."""
        stat = file_path.stat()
        file_hash = self._calculate_hash(file_path)
        category = self._get_category(file_path)
        
        return {
            "file_name": file_path.name,
            "file_path": str(file_path.relative_to(self.base_dir)),
            "file_type": file_path.suffix.lower().lstrip('.'),
            "document_category": category,
            "sha256_hash": file_hash,
            "date_modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "tags": [],
            "ocr_text": None,
            "summary": None,
            "related_documents": [],
            "participants": [],
            "date_range": {
                "start": None,
                "end": None
            }
        }

    def update_database(self, directory: Optional[Path] = None) -> None:
        """Update database with metadata from files in specified directory."""
        if directory is None:
            directories = [self.completed_dir]
        else:
            directories = [directory]

        # Track processed files to identify removed files
        processed_files = set()

        for dir_path in directories:
            if not dir_path.exists():
                continue

            for file_path in dir_path.rglob("*"):
                if not file_path.is_file():
                    continue

                rel_path = str(file_path.relative_to(self.base_dir))
                processed_files.add(rel_path)

                # Check if file already exists in database
                existing_entry = next(
                    (item for item in self.database["files"] 
                     if item["file_path"] == rel_path),
                    None
                )

                if existing_entry:
                    # Update if file has been modified
                    file_hash = self._calculate_hash(file_path)
                    if file_hash != existing_entry["sha256_hash"]:
                        new_metadata = self.extract_metadata(file_path)
                        existing_entry.update(new_metadata)
                else:
                    # Add new file
                    self.database["files"].append(self.extract_metadata(file_path))

        # Remove entries for files that no longer exist
        self.database["files"] = [
            f for f in self.database["files"]
            if f["file_path"] in processed_files
        ]

        self._save_database()

    def get_by_category(self, category: str) -> List[Dict]:
        """Get all files in a specific category."""
        return [f for f in self.database["files"]
                if f["document_category"] == category]

    def get_by_hash(self, file_hash: str) -> Optional[Dict]:
        """Get file metadata by hash."""
        return next(
            (f for f in self.database["files"]
             if f["sha256_hash"] == file_hash),
            None
        )

    def find_duplicates(self) -> List[List[Dict]]:
        """Find duplicate files based on hash."""
        hash_groups = {}
        for file in self.database["files"]:
            hash_groups.setdefault(file["sha256_hash"], []).append(file)
        return [group for group in hash_groups.values() if len(group) > 1]

def main():
    """Main function to run database updates."""
    db = AssetDatabase()
    db.update_database()
    print(f"Database updated: {db.db_file}")
    
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
