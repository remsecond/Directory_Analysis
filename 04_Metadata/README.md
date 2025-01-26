# Metadata Directory

This directory contains the database files that track and manage file metadata and relationships.

## Files

### asset_database.csv
Main database file containing file metadata:
- file_id: Unique identifier
- name: Original filename
- path: Full file path
- type: File extension
- category: Classification
- hash: SHA-256 hash
- modified: Last modified timestamp

### tags.csv
Available tags for file classification:
- tag_id: Unique identifier
- tag_name: Human-readable name

Current tags:
1. important
2. evidence

### file_tags.csv
Maps relationships between files and tags:
- file_id: References asset_database.file_id
- tag_id: References tags.tag_id

## Current State
- Tracking 2 files (test.txt and Emails With Lisa to Date_Part1.pdf)
- 2 defined tags
- File tagging relationships established

## Usage
These files are used by the asset database system to:
- Track file locations and metadata
- Enable file categorization
- Support deduplication
- Prepare for future AI/LLM integration
