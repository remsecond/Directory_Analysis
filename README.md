# File Organization Project

A standardized system for organizing and deduplicating sensitive legal and evidence files.

## Project Structure

```
C:/Projects/Moyer/
├── data/
│   ├── processed/           # Organized file structure
│   │   ├── 01_Legal_Documents/
│   │   │   ├── Court_Orders/
│   │   │   ├── Declarations/
│   │   │   ├── Exhibits/
│   │   │   └── Parenting_Plans/
│   │   ├── 02_Communications/
│   │   │   ├── Email/
│   │   │   ├── Text_Messages/
│   │   │   └── OFW_Messages/
│   │   ├── 03_Evidence_Exhibits/
│   │   │   ├── Photos/
│   │   │   ├── Documents/
│   │   │   └── Records/
│   │   ├── 04_Case_Materials/
│   │   │   ├── Reports/
│   │   │   ├── Assessments/
│   │   │   └── Evaluations/
│   │   └── 05_Administrative/
│   │       ├── Metadata/
│   │       ├── Logs/
│   │       └── Summaries/
│   └── archive/            # Archive of deduplicated files
├── logs/                   # System logs
└── src/                    # Source code
    ├── directory_analyzer_enhanced.py
    ├── document_organizer_phase2.py
    ├── document_deduplicator.py
    └── file_migrator.py
```

## Implementation Results

### File Migration Statistics
- Total files processed: 2,555
- Successfully migrated: 2,048 files
- File type distribution:
  * PDFs: 1,080 files (52.7%)
  * Images: 604 files (29.5%)
  * Documents: 197 files (9.6%)
  * Other formats: 167 files (8.2%)

### Deduplication Results
- 122 sets of duplicate files identified
- 343 redundant copies archived
- Original files preserved in main structure
- Full audit trail maintained

## Features

1. **Standardized Organization**
   - Logical category-based structure
   - Clear separation of document types
   - Consistent naming conventions

2. **Deduplication System**
   - SHA-256 hash-based identification
   - Newest version retention
   - Archived copies preservation
   - Detailed change logging

3. **File Type Management**
   - Automatic categorization
   - Format-specific handling
   - Extensible mapping system

4. **Audit & Tracking**
   - Comprehensive logging
   - Migration records
   - Deduplication history
   - Archive references

## Scripts

### directory_analyzer_enhanced.py
Analyzes directory structure and generates detailed reports about file distribution and potential duplicates.

### document_organizer_phase2.py
Creates and manages the standardized folder structure for organized file storage.

### document_deduplicator.py
Identifies and processes duplicate files, maintaining newest versions and archiving duplicates.

### file_migrator.py
Handles the migration of files from source to organized structure with appropriate categorization.

## Getting Started

1. Clone the repository
2. Install requirements: `pip install -r requirements.txt`
3. Configure paths in scripts if needed
4. Run the organization process:
   ```bash
   python src/document_organizer_phase2.py
   python src/file_migrator.py
   python src/document_deduplicator.py
   ```

## Maintenance

- Regular deduplication runs recommended
- Monitor logs for any issues
- Update file type mappings as needed
- Verify archive integrity periodically

## Contributing

1. Create a feature branch
2. Make changes
3. Submit pull request
4. Include test results and logs

## License

Proprietary - All rights reserved
