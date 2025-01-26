import os
import shutil
import json
import logging
from pathlib import Path
from datetime import datetime

class DocumentOrganizer:
    def __init__(self):
        # Setup base directories
        self.base_dir = Path("C:/Projects/Moyer/data/processed")
        self.log_dir = Path("C:/Projects/Moyer/logs")
        
        # Create required directories
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(
            filename=self.log_dir / "project.log",
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
        
        # Define standard folder structure
        self.folders = {
            "01_Legal_Documents": [
                "Court_Orders",
                "Declarations",
                "Exhibits",
                "Parenting_Plans"
            ],
            "02_Communications": [
                "Email",
                "Text_Messages",
                "OFW_Messages"
            ],
            "03_Evidence_Exhibits": [
                "Photos",
                "Documents",
                "Records"
            ],
            "04_Case_Materials": [
                "Reports",
                "Assessments",
                "Evaluations"
            ],
            "05_Administrative": [
                "Metadata",
                "Logs",
                "Summaries"
            ]
        }

    def create_folder_structure(self):
        """Create the standardized folder structure"""
        self.logger.info("Creating folder structure")
        
        try:
            for main_folder, subfolders in self.folders.items():
                main_path = self.base_dir / main_folder
                main_path.mkdir(exist_ok=True)
                
                for subfolder in subfolders:
                    subfolder_path = main_path / subfolder
                    subfolder_path.mkdir(exist_ok=True)
                    
            self.logger.info("Folder structure created successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Error creating folder structure: {str(e)}")
            return False

    def generate_structure_report(self):
        """Generate a report of the created folder structure"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "base_directory": str(self.base_dir),
            "structure": {}
        }
        
        try:
            for main_folder, subfolders in self.folders.items():
                report["structure"][main_folder] = {
                    "path": str(self.base_dir / main_folder),
                    "subfolders": {
                        subfolder: str(self.base_dir / main_folder / subfolder)
                        for subfolder in subfolders
                    }
                }
            
            # Save report
            report_path = self.base_dir / "folder_structure_report.json"
            with open(report_path, "w") as f:
                json.dump(report, f, indent=4)
                
            self.logger.info(f"Structure report generated: {report_path}")
            return report_path
            
        except Exception as e:
            self.logger.error(f"Error generating structure report: {str(e)}")
            return None

if __name__ == "__main__":
    organizer = DocumentOrganizer()
    if organizer.create_folder_structure():
        organizer.generate_structure_report()
