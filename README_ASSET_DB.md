# Asset Database

## Overview
This database catalogs all files in the organized directory structure, including their metadata, for use in future automation and AI workflows.

## Database Structure
Each file entry contains the following fields:

- `file_name`: Name of the file
- `file_path`: Full path to the file
- `file_type`: File type/extension (e.g., PDF, DOCX, PNG)
- `sha256_hash`: Unique hash for deduplication and integrity checks
- `date_modified`: Last modified timestamp of the file (ISO format)
- `tags`: Array of metadata tags for categorization (currently empty, to be populated in future)
- `ocr_text`: Optional field for extracted text from scanned files (currently null)
- `summary`: Optional field for document summaries (currently null)

## Usage

### Running the Database Builder
```bash
python src/asset_database.py
```
This will:
1. Scan the organized directories (02_Incoming, 03_Processing, 04_Completed)
2. Extract metadata from all files
3. Save the results to asset_database.json

### Example: Querying the Database
```python
import json

# Load the database
with open("asset_database.json", "r") as f:
    database = json.load(f)

# Example: Find all PDF files
pdf_files = [file for file in database if file["file_type"] == "pdf"]

# Example: Find files modified after a certain date
from datetime import datetime
date_threshold = datetime.fromisoformat("2024-01-01T00:00:00")
recent_files = [
    file for file in database 
    if datetime.fromisoformat(file["date_modified"]) > date_threshold
]

# Example: Find potential duplicates using hash
from collections import defaultdict
hash_groups = defaultdict(list)
for file in database:
    hash_groups[file["sha256_hash"]].append(file["file_path"])
duplicates = {hash: paths for hash, paths in hash_groups.items() if len(paths) > 1}
```

## Future Enhancements
The database structure includes placeholder fields for future AI/LLM integration:

- `tags`: Will support automatic file categorization and organization
- `ocr_text`: Will store extracted text from scanned documents
- `summary`: Will contain AI-generated summaries of document content

## Validation
The database builder includes basic validation:
- Ensures all required fields are present
- Verifies file existence and accessibility
- Handles errors gracefully with logging
- Maintains data integrity with SHA-256 hashing

## Notes
- The database is regenerated each time the script runs
- File paths are stored relative to the project root
- All timestamps are in ISO format with timezone information
- Hash values can be used for deduplication and integrity verification
