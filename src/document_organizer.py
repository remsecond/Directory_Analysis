import os
import shutil
import json
import hashlib
from datetime import datetime

def calculate_hash(file_path):
    """Calculate SHA-256 hash of a file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def get_file_metadata(file_path):
    """Extract metadata from a file."""
    file_name = os.path.basename(file_path)
    file_type = os.path.splitext(file_name)[1].lower().replace('.', '')
    modified_time = os.path.getmtime(file_path)
    
    return {
        "file_name": file_name,
        "file_path": file_path,
        "file_type": file_type,
        "sha256_hash": calculate_hash(file_path),
        "date_modified": datetime.fromtimestamp(modified_time).isoformat(),
        "tags": [],
        "ocr_text": None,
        "summary": None
    }

def categorize_document(file_name, file_type):
    """Determine document category based on name and type."""
    name_lower = file_name.lower()
    
    # Financial Agreements
    if any(term in name_lower for term in ['asset', 'liability', 'financial', 'property']):
        return "02_Financial_Agreements"
        
    # Mediation Agreements
    if any(term in name_lower for term in ['mediation', 'settlement', 'agreement']):
        return "03_Mediation_Agreements"
        
    # Email Threads
    if any(term in name_lower for term in ['email', 'correspondence']) or file_type in ['eml', 'msg']:
        return "04_Email_Threads"
        
    # Document Attachments
    if 'attachment' in name_lower:
        return "05_Document_Attachments"
        
    # Legal Correspondence
    if any(term in name_lower for term in ['letter', 'legal', 'attorney']):
        return "06_Legal_Correspondence"
        
    # Exhibits
    if any(term in name_lower for term in ['exhibit', 'evidence']):
        return "07_Exhibits"
        
    # Created Evidence
    if any(term in name_lower for term in ['timeline', 'analysis', 'summary']):
        return "08_Created_Evidence"
        
    # Court Orders
    if any(term in name_lower for term in ['order', 'ruling', 'judgment', 'decree']):
        return "01_Court_Orders"
        
    # Default category for unmatched documents
    return "09_Uncategorized"

def organize_files(source_dir):
    """Organize files into categorized structure with metadata."""
    base_dir = os.path.join(os.path.dirname(source_dir), "Organized_Evidence")
    
    # Create main directory structure
    categories = [
        "01_Court_Orders",
        "02_Financial_Agreements", 
        "03_Mediation_Agreements",
        "04_Email_Threads",
        "05_Document_Attachments",
        "06_Legal_Correspondence",
        "07_Exhibits",
        "08_Created_Evidence",
        "09_Uncategorized"
    ]
    
    # Create directory structure
    for category in categories:
        os.makedirs(os.path.join(base_dir, "03_Processed", category), exist_ok=True)
    
    os.makedirs(os.path.join(base_dir, "01_Input"), exist_ok=True)
    os.makedirs(os.path.join(base_dir, "02_Processing"), exist_ok=True)
    os.makedirs(os.path.join(base_dir, "04_Metadata"), exist_ok=True)
    os.makedirs(os.path.join(base_dir, "05_Archive"), exist_ok=True)

    # Process files
    processed_files = []
    file_hashes = set()  # For deduplication

    print(f"Copying files from {source_dir} to input directory...")
    
    for filename in os.listdir(source_dir):
        source_path = os.path.join(source_dir, filename)
        if os.path.isfile(source_path):
            # Get file metadata
            metadata = get_file_metadata(source_path)
            
            # Check for duplicates
            if metadata["sha256_hash"] in file_hashes:
                continue
            file_hashes.add(metadata["sha256_hash"])
            
            # Determine category
            category = categorize_document(filename, metadata["file_type"])
            
            # Copy to processed directory under appropriate category
            dest_path = os.path.join(base_dir, "03_Processed", category, filename)
            shutil.copy2(source_path, dest_path)
            metadata["file_path"] = dest_path
            
            # Save individual metadata file
            metadata_filename = f"{os.path.splitext(filename)[0]}_metadata.json"
            metadata_path = os.path.join(base_dir, "04_Metadata", metadata_filename)
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            processed_files.append(metadata)
            
            # Archive original
            archive_path = os.path.join(base_dir, "05_Archive", filename)
            shutil.copy2(source_path, archive_path)

    # Save complete database
    db_path = os.path.join(base_dir, "04_Metadata", "asset_database.json")
    with open(db_path, 'w') as f:
        json.dump(processed_files, f, indent=2)

    print(f"Successfully processed {len(processed_files)} files:")
    for metadata in processed_files:
        print(f"- {metadata['file_name']}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python document_organizer.py <source_directory>")
        sys.exit(1)
        
    source_dir = sys.argv[1].strip('"')  # Remove quotes if present
    organize_files(source_dir)
