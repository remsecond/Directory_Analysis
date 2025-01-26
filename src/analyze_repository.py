import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime
from collections import defaultdict
from typing import Dict, List, Generator, Any

class RepositoryAnalyzer:
    def __init__(self, chunk_size: int = 1000):
        """Initialize analyzer with configurable chunk size for files"""
        self.chunk_size = chunk_size
        self.results_dir = Path("analysis_results")
        self.results_dir.mkdir(exist_ok=True)

        # Setup logging
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)

        logging.basicConfig(
            filename=log_dir / "repository_analysis.log",
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

    def chunk_repository(self, root_path: Path) -> Generator[List[Path], None, None]:
        """Generate chunks of files to process"""
        current_chunk: List[Path] = []
        
        for dirpath, dirnames, filenames in os.walk(root_path):
            # Skip .git directory
            if '.git' in dirpath:
                continue
                
            for filename in filenames:
                current_chunk.append(Path(dirpath) / filename)
                
                if len(current_chunk) >= self.chunk_size:
                    yield current_chunk
                    current_chunk = []
        
        if current_chunk:  # Yield any remaining files
            yield current_chunk

    def analyze_chunk(self, files: List[Path]) -> Dict[str, Any]:
        """Analyze a chunk of files"""
        chunk_stats = {
            'total_files': 0,
            'total_size': 0,
            'file_types': defaultdict(int),
            'file_sizes': [],
            'duplicates': defaultdict(list),
            'file_contents': defaultdict(int)  # Track content size by file type
        }

        file_hashes: Dict[str, str] = {}

        for file_path in files:
            try:
                if not file_path.is_file():
                    continue

                file_size = os.path.getsize(file_path)
                file_extension = file_path.suffix.lower()

                # Update statistics
                chunk_stats['total_files'] += 1
                chunk_stats['total_size'] += file_size
                chunk_stats['file_types'][file_extension] += 1
                chunk_stats['file_sizes'].append({
                    'path': str(file_path),
                    'size': file_size
                })
                chunk_stats['file_contents'][file_extension] += file_size

                # Check for potential duplicates (by size and name)
                size_hash = f"{file_size}_{file_path.name}"
                if size_hash in file_hashes:
                    chunk_stats['duplicates'][size_hash].append(str(file_path))
                else:
                    file_hashes[size_hash] = str(file_path)

            except Exception as e:
                self.logger.error(f"Error processing file {file_path}: {str(e)}")

        # Add original locations to duplicates
        chunk_stats['duplicates'] = {
            k: v + [file_hashes[k]]
            for k, v in chunk_stats['duplicates'].items()
        }

        return chunk_stats

    def merge_stats(self, stats_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Merge statistics from multiple chunks"""
        merged_stats = {
            'total_files': 0,
            'total_size': 0,
            'file_types': defaultdict(int),
            'file_sizes': [],
            'duplicates': {},
            'file_contents': defaultdict(int)
        }

        for stats in stats_list:
            merged_stats['total_files'] += stats['total_files']
            merged_stats['total_size'] += stats['total_size']
            
            # Merge file types
            for ext, count in stats['file_types'].items():
                merged_stats['file_types'][ext] += count
            
            # Combine file sizes
            merged_stats['file_sizes'].extend(stats['file_sizes'])
            
            # Merge duplicates
            for size_hash, paths in stats['duplicates'].items():
                if size_hash in merged_stats['duplicates']:
                    merged_stats['duplicates'][size_hash].extend(paths)
                else:
                    merged_stats['duplicates'][size_hash] = paths

            # Merge content sizes
            for ext, size in stats['file_contents'].items():
                merged_stats['file_contents'][ext] += size

        # Sort file sizes to get largest files
        merged_stats['file_sizes'].sort(key=lambda x: x['size'], reverse=True)
        merged_stats['file_sizes'] = merged_stats['file_sizes'][:10]  # Keep top 10

        return merged_stats

    def analyze_repository(self, root_path: str) -> Path:
        """Analyze repository in chunks and generate report"""
        self.logger.info(f"Starting chunked repository analysis for: {root_path}")
        root_path = Path(root_path)
        
        try:
            chunk_stats: List[Dict[str, Any]] = []
            total_files_processed = 0
            
            # Process repository in chunks
            for file_chunk in self.chunk_repository(root_path):
                stats = self.analyze_chunk(file_chunk)
                chunk_stats.append(stats)
                total_files_processed += stats['total_files']
                self.logger.info(f"Processed {total_files_processed} files...")

            # Merge all chunk statistics
            merged_stats = self.merge_stats(chunk_stats)

            # Generate report
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            report_path = self.results_dir / f'repository_analysis_{timestamp}.json'

            report = {
                'analysis_timestamp': timestamp,
                'root_path': str(root_path),
                'summary': {
                    'total_files': merged_stats['total_files'],
                    'total_size_bytes': merged_stats['total_size'],
                    'total_size_mb': round(merged_stats['total_size'] / (1024 * 1024), 2),
                    'unique_file_types': len(merged_stats['file_types']),
                    'potential_duplicates': len(merged_stats['duplicates'])
                },
                'details': {
                    'file_types': {
                        ext: {
                            'count': count,
                            'total_size_mb': round(merged_stats['file_contents'][ext] / (1024 * 1024), 2)
                        }
                        for ext, count in merged_stats['file_types'].items()
                    },
                    'potential_duplicates': dict(merged_stats['duplicates']),
                    'largest_files': merged_stats['file_sizes']
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
        print("Usage: python analyze_repository.py <repository_path>")
        sys.exit(1)

    repo_path = sys.argv[1]
    print(f"Starting analysis of repository: {repo_path}")

    if not os.path.exists(repo_path):
        print(f"Error: Repository path does not exist: {repo_path}")
        sys.exit(1)

    try:
        print("Initializing repository analyzer...")
        analyzer = RepositoryAnalyzer(chunk_size=1000)  # Process 1000 files at a time
        print("Starting chunked repository analysis...")
        report_path = analyzer.analyze_repository(repo_path)
        print(f"Analysis complete. Report saved to: {report_path}")
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        sys.exit(1)
