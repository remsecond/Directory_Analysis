# Asset Database System Documentation

## Directory Structure

### 01_Input/
- Entry point for new files
- Files awaiting processing
- Current test files: test.txt, test_duplicate.txt

### 02_Processing/
- Temporary workspace during processing
- System-managed directory
- No manual file placement

### 03_Processed/
- Successfully processed files
- Contains test.txt with metadata and tags
- Files organized by type

### 04_Metadata/
- Database files location
- Contains:
  - asset_database.csv: Core file metadata
  - tags.csv: Available tags
  - file_tags.csv: Tag relationships

### 05_Archive/
- Storage for deprecated files
- Maintains file history
- Preserves relationships

## Database Structure

### Asset Database (asset_database.csv)
- file_id: Unique identifier
- name: Original filename
- path: Full file path
- type: File extension
- category: Classification
- hash: SHA-256 hash
- modified: Last modified timestamp

### Tags (tags.csv)
- tag_id: Unique identifier
- tag_name: Human-readable name
Current tags:
1. important
2. evidence

### File Tags (file_tags.csv)
- file_id: References asset_database.file_id
- tag_id: References tags.tag_id
Current mappings:
- File 1 (test.txt) has tags: important (1), evidence (2)

## Processing Flow
1. Files placed in 01_Input/
2. System moves to 02_Processing/
3. Analysis performed:
   - Metadata extraction
   - Content analysis
   - Deduplication
   - Tag assignment
4. Files moved to final location:
   - Text files to 03_Processed/
   - PDF files to 04_Completed/
   - Metadata to 04_Metadata/

## Future Integration
- OCR text extraction
- Document summaries
- Enhanced tagging
- Content analysis
- AI/LLM integration
