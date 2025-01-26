# Asset Database Documentation

## Overview
The asset database is a structured system for tracking and managing files and their metadata. It consists of three main components stored in CSV format:

## Database Structure

### 1. Asset Database (asset_database.csv)
Primary file metadata storage:
- file_id: Unique identifier for each file
- name: Original filename
- path: Full path to file location
- type: File extension/type (e.g., pdf, txt)
- category: File classification (e.g., Evidence, Created_Evidence)
- hash: SHA-256 hash for deduplication and integrity
- modified: Last modified timestamp

Current entries:
- test.txt (ID: 1) in 03_Completed/
- Emails With Lisa to Date_Part1.pdf (ID: 2) in 04_Completed/

### 2. Tags (tags.csv)
Available classification tags:
- tag_id: Unique identifier for each tag
- tag_name: Human-readable tag name

Current tags:
- important (ID: 1)
- evidence (ID: 2)

### 3. File Tags (file_tags.csv)
Maps relationships between files and tags:
- file_id: References asset_database.file_id
- tag_id: References tags.tag_id

Current mappings:
- File 1 (test.txt) has tags: important (1), evidence (2)

## Directory Structure
- 03_Completed/: Contains processed text files
- 04_Completed/: Contains processed PDF files
- 04_Metadata/: Stores database CSV files

## Future Integration Points
The database includes placeholder fields for future AI/LLM integration:
- OCR text extraction
- Document summaries
- Enhanced tagging
- Content analysis
