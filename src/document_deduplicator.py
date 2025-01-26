import os
import hashlib
import shutil
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Tuple

class DocumentDeduplicator:
    def __init__(self):
        # Setup directories
        self.base_dir = Path("C:/Projects/Moyer/data/processed")
        self.archive_dir = Path("C:/Projects/Moyer/data/archive")
        self.log_dir = Path("C:/Projects/Moyer/logs")
        
        # Create required directories
        self.archive_dir.mkdir(parents=True, exist_ok=True)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(
            filename=self.log_dir / "deduplication.log",
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

    def calculate_file_hash(self, filepath: Path) -> str:
        """Calculate SHA-256 hash of a file"""
        sha256_hash = hashlib.sha256()
        
        try:
            with open(filepath, "rb") as f:
                for byte_block in iter(lambda: f.read(4096), b""):
                    sha256_hash.update(byte_block)
            return sha256_hash.hexdigest()
        except Exception as e:
            self.logger.error(f"Error calculating hash for {filepath}: {str(e)}")
            return None

    def get_file_info(self, filepath: Path) -> Tuple[str, float]:
        """Get file hash and modification time"""
        try:
            file_hash = self.calculate_file_hash(filepath)
            mod_time = os.path.getmtime(filepath)
            return (file_hash, mod_time)
        except Exception as e:
            self.logger.error(f"Error getting file info for {filepath}: {str(e)}")
            return None

    def find_duplicates(self) -> Dict[str, List[Path]]:
        """Find duplicate files based on content hash"""
        hash_map: Dict[str, List[Tuple[Path, float]]] = {}
        duplicates: Dict[str, List[Path]] = {}
        
        self.logger.info("Starting duplicate file search")
        
        try:
            for root, _, files in os.walk(self.base_dir):
                for filename in files:
                    filepath = Path(root) / filename
                    file_info = self.get_file_info(filepath)
                    
                    if file_info:
                        file_hash, mod_time = file_info
                        if file_hash in hash_map:
                            hash_map[file_hash].append((filepath, mod_time))
                        else:
                            hash_map[file_hash] = [(filepath, mod_time)]

            # Identify duplicates (files with same hash)
            for file_hash, file_list in hash_map.items():
                if len(file_list) > 1:
                    # Sort by modification time, newest first
                    sorted_files = sorted(file_list, key=lambda x: x[1], reverse=True)
                    # Keep newest file, list others as duplicates
                    duplicates[file_hash] = [path for path, _ in sorted_files[1:]]
                    
            self.logger.info(f"Found {len(duplicates)} sets of duplicate files")
            return duplicates
            
        except Exception as e:
            self.logger.error(f"Error during duplicate search: {str(e)}")
            return {}

    def archive_duplicates(self, duplicates: Dict[str, List[Path]]) -> Dict[str, List[str]]:
        """Archive duplicate files and maintain a record"""
        archive_record = {
            "timestamp": datetime.now().isoformat(),
            "archived_files": {}
        }
        
        try:
            for file_hash, duplicate_files in duplicates.items():
                archived_paths = []
                for filepath in duplicate_files:
                    try:
                        # Create archive path maintaining relative structure
                        rel_path = filepath.relative_to(self.base_dir)
                        archive_path = self.archive_dir / rel_path
                        
                        # Create necessary directories
                        archive_path.parent.mkdir(parents=True, exist_ok=True)
                        
                        # Move file to archive
                        shutil.move(str(filepath), str(archive_path))
                        archived_paths.append(str(archive_path))
                        self.logger.info(f"Archived duplicate file: {filepath} -> {archive_path}")
                        
                    except Exception as e:
                        self.logger.error(f"Error archiving {filepath}: {str(e)}")
                
                if archived_paths:
                    archive_record["archived_files"][file_hash] = {
                        "original_paths": [str(f) for f in duplicate_files],
                        "archive_paths": archived_paths
                    }
            
            # Save archive record
            record_path = self.archive_dir / f"archive_record_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(record_path, 'w') as f:
                json.dump(archive_record, f, indent=4)
            
            self.logger.info(f"Archive record saved to {record_path}")
            return archive_record
            
        except Exception as e:
            self.logger.error(f"Error during archiving: {str(e)}")
            return None

    def deduplicate(self) -> Dict:
        """Main deduplication process"""
        self.logger.info("Starting deduplication process")
        
        try:
            # Find duplicates
            duplicates = self.find_duplicates()
            if not duplicates:
                self.logger.info("No duplicates found")
                return {"status": "completed", "duplicates_found": 0}
            
            # Archive duplicates
            archive_record = self.archive_duplicates(duplicates)
            if not archive_record:
                return {"status": "error", "message": "Error during archiving"}
            
            return {
                "status": "completed",
                "duplicates_found": len(duplicates),
                "files_archived": len([f for files in duplicates.values() for f in files]),
                "archive_record": archive_record
            }
            
        except Exception as e:
            self.logger.error(f"Error during deduplication: {str(e)}")
            return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    deduplicator = DocumentDeduplicator()
    result = deduplicator.deduplicate()
    print(json.dumps(result, indent=4))
