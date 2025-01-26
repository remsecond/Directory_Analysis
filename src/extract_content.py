from docx import Document
import json
import hashlib
import os
from datetime import datetime

def get_file_hash(file_path):
    """Calculate SHA256 hash of a file"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def extract_metadata(docx_path):
    """Extract metadata and content from a Word document"""
    try:
        print(f"Processing document: {docx_path}")
        doc = Document(docx_path)
        
        # Extract text content
        content = []
        for para in doc.paragraphs:
            if para.text.strip():  # Only include non-empty paragraphs
                content.append(para.text.strip())
        
        # Get file info
        file_stats = os.stat(docx_path)
        
        metadata = {
            "file_name": os.path.basename(docx_path),
            "file_path": os.path.abspath(docx_path),
            "file_type": "docx",
            "sha256_hash": get_file_hash(docx_path),
            "date_modified": datetime.fromtimestamp(file_stats.st_mtime).isoformat(),
            "tags": [],
            "ocr_text": None,
            "summary": None,
            "content": content
        }
        
        # Save metadata to JSON
        output_path = os.path.join("docs", "asset_database.json")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump([metadata], f, indent=2, ensure_ascii=False)
            
        print(f"Metadata saved to: {output_path}")
        print(f"Content extracted: {len(content)} paragraphs")
                    
    except Exception as e:
        print(f"Error: {str(e)}")
        raise

if __name__ == '__main__':
    extract_metadata('docs/Master_File_with_Pointers.docx')
