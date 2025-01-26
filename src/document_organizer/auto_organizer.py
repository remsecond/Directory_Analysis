import os
import shutil
import logging
from pathlib import Path
from typing import Dict, List, Set
import magic
import hashlib

class AutoOrganizer:
    """Automated document organization system"""
    
    def __init__(self, input_dir: str, base_dir: str = None):
        self.input_dir = Path(input_dir)
        self.base_dir = Path(base_dir) if base_dir else self.input_dir.parent
        self.setup_logging()
        
        # Define standard directory structure
        self.directories = {
            'documents': {
                'forms': ['.pdf'],
                'records': ['.ods', '.xlsx', '.csv'],
                'attachments': []
            },
            'images': ['.png', '.jpg', '.jpeg', '.gif'],
            'email': ['.eml', '.msg'],
            'ofw': [],
            'temp': []
        }
        
        # Track processed files
        self.processed_files: Dict[str, str] = {}
        self.duplicates: List[Set[str]] = []

    def setup_logging(self):
        """Configure logging"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

    def create_directory_structure(self):
        """Create the organized directory structure"""
        for main_dir, sub_dirs in self.directories.items():
            if isinstance(sub_dirs, dict):
                # Create main directory with subdirectories
                main_path = self.base_dir / main_dir
                main_path.mkdir(exist_ok=True)
                for sub_dir in sub_dirs:
                    (main_path / sub_dir).mkdir(exist_ok=True)
            else:
                # Create main directory only
                (self.base_dir / main_dir).mkdir(exist_ok=True)

    def get_file_hash(self, filepath: Path) -> str:
        """Calculate file hash for deduplication"""
        hasher = hashlib.sha256()
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                hasher.update(chunk)
        return hasher.hexdigest()

    def detect_duplicates(self, files: List[Path]):
        """Identify duplicate files"""
        hash_map: Dict[str, List[Path]] = {}
        
        for file in files:
            file_hash = self.get_file_hash(file)
            if file_hash in hash_map:
                hash_map[file_hash].append(file)
            else:
                hash_map[file_hash] = [file]
        
        self.duplicates = [set(files) for files in hash_map.values() if len(files) > 1]

    def determine_target_directory(self, file: Path) -> Path:
        """Determine the appropriate directory for a file"""
        ext = file.suffix.lower()
        mime = magic.from_file(str(file), mime=True)
        
        # Check each directory's file types
        for main_dir, sub_dirs in self.directories.items():
            if isinstance(sub_dirs, dict):
                # Check subdirectories
                for sub_dir, extensions in sub_dirs.items():
                    if ext in extensions:
                        return self.base_dir / main_dir / sub_dir
            elif ext in sub_dirs:
                return self.base_dir / main_dir
        
        # Default to documents/attachments if no match
        return self.base_dir / 'documents' / 'attachments'

    def organize_files(self):
        """Main function to organize files"""
        self.logger.info("Starting file organization")
        
        # Create directory structure
        self.create_directory_structure()
        
        # Get list of files
        files = [f for f in self.input_dir.rglob('*') if f.is_file()]
        
        # Detect duplicates
        self.detect_duplicates(files)
        
        # Process each file
        for file in files:
            try:
                # Skip if already processed
                if str(file) in self.processed_files:
                    continue
                
                # Determine target directory
                target_dir = self.determine_target_directory(file)
                
                # Create target directory if it doesn't exist
                target_dir.mkdir(parents=True, exist_ok=True)
                
                # Move file
                target_path = target_dir / file.name
                shutil.move(str(file), str(target_path))
                
                self.processed_files[str(file)] = str(target_path)
                self.logger.info(f"Moved {file.name} to {target_dir}")
                
            except Exception as e:
                self.logger.error(f"Error processing {file}: {str(e)}")
        
        self.logger.info("File organization complete")
        return {
            'processed': len(self.processed_files),
            'duplicates': len(self.duplicates),
            'success': True
        }

def main():
    """CLI entry point"""
    import argparse
    parser = argparse.ArgumentParser(description='Automated document organization')
    parser.add_argument('input_dir', help='Input directory to organize')
    parser.add_argument('--base-dir', help='Base directory for organized files')
    args = parser.parse_args()
    
    organizer = AutoOrganizer(args.input_dir, args.base_dir)
    result = organizer.organize_files()
    
    if result['success']:
        print(f"Organization complete. Processed {result['processed']} files.")
        if result['duplicates'] > 0:
            print(f"Found {result['duplicates']} duplicate file groups.")
    else:
        print("Organization failed. Check logs for details.")

if __name__ == '__main__':
    main()
