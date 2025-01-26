import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime
from collections import defaultdict

class DirectoryAnalyzer:
    def __init__(self):
        # Setup directories
        self.results_dir = Path("analysis_results")
        self.results_dir.mkdir(exist_ok=True)

        # Setup logging
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)

        logging.basicConfig(
            filename=log_dir / "analysis.log",
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

    def analyze_directory(self, root_path: str):
        """Comprehensive directory analysis"""
        self.logger.info(f"Starting directory analysis for: {root_path}")

        file_stats = {
            'total_files': 0,
            'total_size': 0,
            'file_types': defaultdict(int),
            'file_sizes': [],
            'duplicates': defaultdict(list)
        }

        try:
            root_path = Path(root_path)
            file_hashes = {}

            for dirpath, dirnames, filenames in os.walk(root_path):
                for filename in filenames:
                    try:
                        full_path = Path(dirpath) / filename
                        file_size = os.path.getsize(full_path)
                        file_extension = full_path.suffix.lower()

                        # Update statistics
                        file_stats['total_files'] += 1
                        file_stats['total_size'] += file_size
                        file_stats['file_types'][file_extension] += 1
                        file_stats['file_sizes'].append({
                            'path': str(full_path),
                            'size': file_size
                        })

                        # Check for potential duplicates (by size for now)
                        size_hash = f"{file_size}_{filename}"
                        if size_hash in file_hashes:
                            file_stats['duplicates'][size_hash].append(str(full_path))
                        else:
                            file_hashes[size_hash] = str(full_path)

                    except Exception as e:
                        self.logger.error(f"Error processing file {filename}: {str(e)}")

            # Clean up duplicates to only include actual duplicates
            file_stats['duplicates'] = {
                k: v + [file_hashes[k]]
                for k, v in file_stats['duplicates'].items()
            }

            # Generate report
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            report_path = self.results_dir / f'directory_analysis_{timestamp}.json'

            report = {
                'analysis_timestamp': timestamp,
                'root_path': str(root_path),
                'summary': {
                    'total_files': file_stats['total_files'],
                    'total_size_bytes': file_stats['total_size'],
                    'unique_file_types': len(file_stats['file_types']),
                    'potential_duplicates': len(file_stats['duplicates'])
                },
                'details': {
                    'file_types': dict(file_stats['file_types']),
                    'potential_duplicates': dict(file_stats['duplicates']),
                    'largest_files': sorted(
                        file_stats['file_sizes'],
                        key=lambda x: x['size'],
                        reverse=True
                    )[:10]
                }
            }

            with open(report_path, 'w') as f:
                json.dump(report, f, indent=4)

            self.logger.info(f"Analysis complete. Report saved to {report_path}")
            return report_path

        except Exception as e:
            self.logger.error(f"Analysis failed: {str(e)}")
            raise

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python directory_analyzer.py <directory_path>")
        sys.exit(1)

    target_dir = sys.argv[1]
    print(f"Starting analysis of directory: {target_dir}")

    # Check if target directory exists
    if not os.path.exists(target_dir):
        print(f"Error: Target directory does not exist: {target_dir}")
        sys.exit(1)
    else:
        print("Target directory found")

    try:
        print("Initializing analyzer...")
        analyzer = DirectoryAnalyzer()
        print("Starting directory analysis...")
        report_path = analyzer.analyze_directory(target_dir)
        print(f"Analysis complete. Report saved to: {report_path}")
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        sys.exit(1)
