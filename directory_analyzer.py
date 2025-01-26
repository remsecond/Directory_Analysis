import os
import json
from pathlib import Path
from datetime import datetime

class DirectoryAnalyzer:
    def __init__(self):
        self.results_dir = Path("analysis_results")
        self.results_dir.mkdir(exist_ok=True)

    def analyze_directory(self, root_path: str):
        """Basic directory analysis"""
        file_data = []
        root_path = Path(root_path)

        for dirpath, dirnames, filenames in os.walk(root_path):
            for filename in filenames:
                full_path = Path(dirpath) / filename
                file_data.append({
                    'filename': filename,
                    'directory': str(dirpath),
                    'size': os.path.getsize(full_path)
                })

        # Save basic report
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = self.results_dir / f'basic_analysis_{timestamp}.json'

        with open(report_path, 'w') as f:
            json.dump(file_data, f, indent=4)

        print(f"Analysis complete. Report saved to {report_path}")

if __name__ == "__main__":
    analyzer = DirectoryAnalyzer()
    # Analyze the current directory
    analyzer.analyze_directory(".")
