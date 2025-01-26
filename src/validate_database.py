import json
import os
import hashlib
from datetime import datetime

def calculate_file_hash(file_path):
    """Calculate SHA256 hash of a file"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def validate_database(database_path="docs/asset_database.json"):
    """Validate the asset database integrity"""
    try:
        # Load database
        with open(database_path, "r", encoding="utf-8") as f:
            database = json.load(f)
        
        print(f"Validating database: {database_path}")
        print(f"Found {len(database)} entries")
        
        issues = []
        
        for entry in database:
            # Check required fields
            required_fields = ["file_name", "file_path", "file_type", "sha256_hash", "date_modified"]
            missing_fields = [field for field in required_fields if field not in entry]
            if missing_fields:
                issues.append(f"Entry {entry.get('file_name', 'UNKNOWN')} missing required fields: {missing_fields}")
                continue
            
            file_path = entry["file_path"]
            
            # Check file existence
            if not os.path.exists(file_path):
                issues.append(f"File not found: {file_path}")
                continue
            
            # Verify file hash
            current_hash = calculate_file_hash(file_path)
            if current_hash != entry["sha256_hash"]:
                issues.append(f"Hash mismatch for {file_path}")
                issues.append(f"  Stored:   {entry['sha256_hash']}")
                issues.append(f"  Current:  {current_hash}")
            
            # Check modification time
            file_stats = os.stat(file_path)
            current_mtime = datetime.fromtimestamp(file_stats.st_mtime).isoformat()
            if current_mtime != entry["date_modified"]:
                issues.append(f"Modification time mismatch for {file_path}")
                issues.append(f"  Stored:   {entry['date_modified']}")
                issues.append(f"  Current:  {current_mtime}")
            
            # Verify file type matches extension
            actual_ext = os.path.splitext(file_path)[1].lstrip(".").lower()
            if actual_ext != entry["file_type"].lower():
                issues.append(f"File type mismatch for {file_path}")
                issues.append(f"  Stored:   {entry['file_type']}")
                issues.append(f"  Actual:   {actual_ext}")
            
            # Check content array
            if "content" not in entry:
                issues.append(f"Missing content array for {file_path}")
            elif not isinstance(entry["content"], list):
                issues.append(f"Content is not an array for {file_path}")
            elif not entry["content"]:
                issues.append(f"Empty content array for {file_path}")
        
        # Print results
        if issues:
            print("\nValidation Issues Found:")
            for issue in issues:
                print(f"- {issue}")
            print(f"\nTotal issues: {len(issues)}")
        else:
            print("\nValidation successful! No issues found.")
            
    except Exception as e:
        print(f"Error during validation: {str(e)}")
        raise

if __name__ == "__main__":
    validate_database()
