# Input Directory

This directory is the entry point for new files to be processed by the asset database system.

## Purpose
- Initial storage location for new files before processing
- Files placed here will be analyzed and moved to appropriate directories
- Supports the automated file organization workflow

## Current Contents
- test.txt: Sample text file for testing
- test_duplicate.txt: Duplicate file for testing deduplication

## Processing Flow
1. Files are placed in this directory
2. System analyzes files for:
   - File type
   - Content
   - Metadata
   - Duplicates
3. Files are moved to appropriate directories:
   - 03_Completed/: For processed text files
   - 04_Completed/: For processed PDF files
   - Metadata is stored in 04_Metadata/
   
## Usage
Place new files in this directory for:
- Metadata extraction
- Categorization
- Deduplication
- Integration into the asset database
