# Automated Document Organization System

This system automatically organizes files into a structured directory layout based on file types and metadata. It's designed to be a "one-click" solution for organizing documents.

## Features

- Automatic file categorization based on type
- Duplicate detection and handling
- Maintains existing email and OFW structures
- Handles PDFs, images, spreadsheets, and more
- Logging and error handling
- Tested and verified organization

## Directory Structure

```
input/
├── email/              # Email files (.eml, .msg)
├── ofw/               # OFW exports
├── documents/         # Document files
│   ├── forms/        # PDF forms
│   ├── records/      # Spreadsheets
│   └── attachments/  # Other attachments
├── images/           # Image files
└── temp/             # Temporary processing
```

## Quick Start

1. Place files to organize in the input directory
2. Run the auto-organizer:
   ```
   auto-organize.bat
   ```

## Testing

To verify the system is working correctly:

1. Run the test suite:
   ```
   test-auto-organize.bat
   ```
2. Check test results for any issues

## Integration

The auto-organizer is designed to be integrated into larger pipelines:

```python
from document_organizer.auto_organizer import AutoOrganizer

# Create organizer instance
organizer = AutoOrganizer("input_dir")

# Run organization
result = organizer.organize_files()

# Check results
if result['success']:
    print(f"Processed {result['processed']} files")
    if result['duplicates'] > 0:
        print(f"Found {result['duplicates']} duplicate groups")
```

## Logging

The system logs all operations to help track file processing:
- File movements
- Duplicate detection
- Errors and issues
- Processing completion

Logs can be found in the application's log directory.

## Error Handling

The system is designed to:
- Continue processing despite individual file errors
- Log all issues for review
- Maintain data integrity
- Never delete original files

## Dependencies

- Python 3.7+
- python-magic-bin
- pathlib

Install dependencies:
```bash
pip install python-magic-bin pathlib
