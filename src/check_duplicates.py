#!/usr/bin/env python3
import os
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Tuple

class DuplicateChecker:
    def __init__(self, base_dir: str = "."):
        self.base_dir = Path(base_dir)
        self.metadata_dir = self.base_dir / "04_Metadata"
        self.input_dir = self.base_dir / "01_Input"
        self.db_file = self.metadata_dir / "asset_database.json"
        self.database = self._load_database()

    def _load_database(self) -> Dict:
        """Load existing database or create new one if it doesn't exist."""
        if self.db_file.exists():
            with open(self.db_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"files": [], "last_updated": None}

    def _calculate_hash(self, file_path: Path) -> str:
        """Calculate SHA-256 hash of file."""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def check_duplicates(self) -> Tuple[List[Dict], List[Dict]]:
        """Check input files against database for duplicates.
        Returns tuple of (new_files, duplicate_files)."""
        new_files = []
        duplicate_files = []

        # Get all hashes from database
        db_hashes = {f["sha256_hash"]: f for f in self.database["files"]}

        # Check each file in input directory
        for file_path in self.input_dir.rglob("*"):
            if not file_path.is_file():
                continue

            file_hash = self._calculate_hash(file_path)
            rel_path = str(file_path.relative_to(self.base_dir))

            file_info = {
                "file_name": file_path.name,
                "file_path": rel_path,
                "sha256_hash": file_hash
            }

            if file_hash in db_hashes:
                # Found duplicate
                existing_file = db_hashes[file_hash]
                file_info["duplicate_of"] = existing_file["file_path"]
                duplicate_files.append(file_info)
            else:
                new_files.append(file_info)

        return new_files, duplicate_files

def main():
    """Main function to check for duplicates."""
    checker = DuplicateChecker()
    new_files, duplicate_files = checker.check_duplicates()

    print("\nChecking for duplicates in Input directory...")
    print("\nNew files to process:")
    if new_files:
        for f in new_files:
            print(f"  - {f['file_path']}")
    else:
        print("  None found")

    print("\nDuplicate files found:")
    if duplicate_files:
        for f in duplicate_files:
            print(f"  - {f['file_path']} (duplicate of {f['duplicate_of']})")
    else:
        print("  None found")

    print("\nRecommendation:")
    if duplicate_files:
        print("Consider removing the following files from Input before processing:")
        for f in duplicate_files:
            print(f"  - {f['file_path']}")
    else:
        print("All files are unique - safe to proceed with processing")

if __name__ == "__main__":
    main()
