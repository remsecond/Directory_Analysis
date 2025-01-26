# Processing Directory

This directory serves as a temporary workspace for files being processed by the asset database system.

## Purpose
- Temporary storage during file analysis and processing
- Prevents conflicts with new incoming files
- Maintains clean separation between unprocessed and processed files

## Processing Steps
Files in this directory are undergoing:
1. Metadata extraction
2. Content analysis
3. Deduplication checks
4. Tag assignment
5. Category determination

## File Flow
1. Files move here from 01_Input/
2. System processes files
3. Files are moved to final locations:
   - 03_Completed/ for text files
   - 04_Completed/ for PDF files
   - Metadata stored in 04_Metadata/

## Usage
- System managed directory
- Files should not be manually placed here
- Temporary storage only
