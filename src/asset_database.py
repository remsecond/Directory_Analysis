import os
import json
import hashlib
from datetime import datetime
from pathlib import Path

def calculate_sha256(file_path):
    """Calculate SHA256 hash of a file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        # Read the file in chunks to handle large files efficiently
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def get_file_metadata(file_path):
    """Extract metadata for a single file."""
    file_stat = os.stat(file_path)
    file_path_obj = Path(file_path)
    
    return {
        "file_name": file_path_obj.name,
        "file_path": str(file_path_obj),
        "file_type": file_path_obj.suffix.lower().lstrip('.'),
        "sha256_hash": calculate_sha256(file_path),
        "date_modified": datetime.fromtimestamp(file_stat.st_mtime).isoformat(),
        "tags": [],  # Empty list for future tag support
        "ocr_text": None,  # Placeholder for future OCR support
        "summary": None  # Placeholder for future summary support
    }

def build_asset_database(root_dirs):
    """Build asset database by scanning specified directories."""
    database = []
    
    for root_dir in root_dirs:
        if not os.path.exists(root_dir):
            print(f"Warning: Directory {root_dir} does not exist, skipping...")
            continue
            
        for root, _, files in os.walk(root_dir):
            for file in files:
                file_path = os.path.join(root, file)
                try:
                    metadata = get_file_metadata(file_path)
                    database.append(metadata)
                except Exception as e:
                    print(f"Error processing {file_path}: {str(e)}")
    
    return database

def main():
    # Directories to scan
    directories = [
        "02_Incoming",
        "03_Processing", 
        "04_Completed"
    ]
    
    print("Building asset database...")
    database = build_asset_database(directories)
    
    # Save to JSON file
    output_file = "asset_database.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(database, f, indent=2, ensure_ascii=False)
    
    print(f"Asset database saved to {output_file}")
    print(f"Processed {len(database)} files")

if __name__ == "__main__":
    main()
