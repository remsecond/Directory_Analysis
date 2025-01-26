from pathlib import Path
import os
import json
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DirectoryAnalyzer:
    def __init__(self):
        self.results_dir = Path("analysis_results")
        self.results_dir.mkdir(exist_ok=True)

    def analyze_directory(self, root_path: str):
        """Basic directory analysis"""
        logger.info(f"Starting analysis of directory: {root_path}")

        file_data = []
        root_path = Path(root_path)

        try:
            # Walk through directory
            for dirpath, dirnames, filenames in os.walk(root_path):
                for filename in filenames:
                    full_path = Path(dirpath) / filename
                    file_data.append({
                        'filename': filename,
                        'directory': dirpath,
                        'size': os.path.getsize(full_path)
                    })

            # Save basic report
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            report_path = self.results_dir / f'basic_analysis_{timestamp}.json'

            with open(report_path, 'w') as f:
                json.dump(file_data, f, indent=4)

            logger.info(f"Analysis complete. Report saved to {report_path}")
            return {"status": "success", "files_processed": len(file_data)}

        except Exception as e:
            logger.error(f"Error during analysis: {str(e)}")
            return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    analyzer = DirectoryAnalyzer()
    result = analyzer.analyze_directory(".")  # Analyze current directory
    print(result)
