# Directory Analysis Tool

A Python tool for analyzing directory structures and generating comprehensive reports about file distributions, sizes, types, and potential duplicates.

## Features

- Analyzes directory structures recursively
- Generates detailed reports in JSON format including:
  - Total number of files and size
  - File type distribution
  - Largest files (top 10)
  - Potential duplicate files (based on size and name)
- Includes logging for tracking analysis progress and errors

## Requirements

- Python 3.6+
- Required packages:
  ```
  pathlib
  ```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/remsecond/Directory_Analysis.git
   cd Directory_Analysis
   ```

2. No additional installation required as the tool uses Python standard library modules.

## Usage

Run the script from the command line, providing the target directory as an argument:

```bash
python directory_analyzer.py /path/to/directory
```

### Output

The tool creates two directories:
- `analysis_results/`: Contains JSON reports of the analysis
- `logs/`: Contains log files with analysis details and any errors

The analysis report includes:
- Analysis timestamp
- Root path analyzed
- Summary statistics
  - Total files
  - Total size
  - Number of unique file types
  - Number of potential duplicates
- Detailed information
  - File type distribution
  - List of potential duplicates
  - Top 10 largest files

## Example Report

```json
{
    "analysis_timestamp": "20240126_083000",
    "root_path": "/example/path",
    "summary": {
        "total_files": 150,
        "total_size_bytes": 1024000,
        "unique_file_types": 10,
        "potential_duplicates": 5
    },
    "details": {
        "file_types": {
            ".txt": 50,
            ".pdf": 30,
            ".doc": 20
        },
        "potential_duplicates": {
            "size_hash": [
                "/path/to/file1.txt",
                "/path/to/file2.txt"
            ]
        },
        "largest_files": [
            {
                "path": "/path/to/large_file.pdf",
                "size": 102400
            }
        ]
    }
}
```

## License

MIT License
