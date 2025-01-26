#!/usr/bin/env python3
import os
import shutil
from pathlib import Path
from datetime import datetime

class FileMigrator:
    def __init__(self, base_dir: str = "."):
        self.base_dir = Path(base_dir)
        self.input_dir = self.base_dir / "01_Input"
        self.processing_dir = self.base_dir / "02_Processing"
        self.completed_dir = self.base_dir / "03_Completed"
        self.metadata_dir = self.base_dir / "04_Metadata"
        self.archive_dir = self.base_dir / "05_Archive"

    def _ensure_directories(self):
        """Ensure all required directories exist."""
        for dir_path in [self.input_dir, self.processing_dir, self.completed_dir,
                        self.metadata_dir, self.archive_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)

    def _get_category_path(self, file_path: Path) -> Path:
        """Determine appropriate category directory based on file patterns."""
        path_str = str(file_path).lower()
        
        # Check common patterns
        if any(x in path_str for x in ["order", "ruling", "decision"]):
            return self.completed_dir / "Court_Orders"
        if any(x in path_str for x in ["financial", "payment", "settlement"]):
            return self.completed_dir / "Financial_Agreements"
        if any(x in path_str for x in ["mediation", "agreement"]):
            return self.completed_dir / "Mediation_Agreements"
        if any(x in path_str for x in ["exhibit", "evidence"]):
            return self.completed_dir / "Exhibits"
        if any(x in path_str for x in ["letter", "correspondence"]):
            return self.completed_dir / "Legal_Correspondence"
        if "attachment" in path_str:
            return self.completed_dir / "Document_Attachments"
        if "email" in path_str:
            # Subcategorize emails
            if "lawyer" in path_str:
                return self.completed_dir / "Email_Threads" / "Lawyers"
            if "therapist" in path_str:
                return self.completed_dir / "Email_Threads" / "Therapists"
            if "ex" in path_str and "wife" in path_str:
                return self.completed_dir / "Email_Threads" / "Ex_Wife"
            return self.completed_dir / "Email_Threads"
        
        return self.completed_dir / "Created_Evidence"

    def move_to_processing(self, file_path: Path) -> Path:
        """Copy file from Input to Processing, preserving original."""
        if not isinstance(file_path, Path):
            file_path = Path(file_path)
        
        self._ensure_directories()
        
        # Create timestamped filename to avoid conflicts
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        new_filename = f"{timestamp}_{file_path.name}"
        dest_path = self.processing_dir / new_filename
        
        # Copy file, preserving original
        shutil.copy2(file_path, dest_path)
        return dest_path

    def move_to_completed(self, file_path: Path) -> Path:
        """Copy file from Processing to appropriate category in Completed."""
        if not isinstance(file_path, Path):
            file_path = Path(file_path)
        
        self._ensure_directories()
        
        # Determine category and create directory if needed
        category_path = self._get_category_path(file_path)
        category_path.mkdir(parents=True, exist_ok=True)
        
        # Copy to category directory
        dest_path = category_path / file_path.name
        shutil.copy2(file_path, dest_path)
        
        # Archive original
        archive_path = self.archive_dir / file_path.name
        shutil.copy2(file_path, archive_path)
        
        return dest_path

def main():
    """Main function to test file migration."""
    migrator = FileMigrator()
    
    # Example usage
    test_file = Path("01_Input/test.txt")
    if test_file.exists():
        print(f"Moving {test_file} through pipeline...")
        processing_path = migrator.move_to_processing(test_file)
        print(f"Copied to processing: {processing_path}")
        completed_path = migrator.move_to_completed(processing_path)
        print(f"Copied to completed: {completed_path}")
        print("Original preserved in Input directory")
        print("Processing copy preserved")
        print("Final copy in category directory")
        print("Backup copy in Archive")

if __name__ == "__main__":
    main()
