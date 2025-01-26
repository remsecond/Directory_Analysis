import os
import shutil
from pathlib import Path
from datetime import datetime
import json

def ensure_directories(base_path):
    """Create necessary directories if they don't exist."""
    directories = ['correspondence', 'court', 'financial', 'misc', 'ofw', 'email']
    for directory in directories:
        Path(os.path.join(base_path, directory)).mkdir(exist_ok=True)

def analyze_pdf(filepath):
    """Use PDF processor MCP to analyze PDF content."""
    print(f"<use_mcp_tool>")
    print(f"<server_name>pdf-processor-server</server_name>")
    print(f"<tool_name>analyze_pdf</tool_name>")
    print(f"<arguments>")
    print(json.dumps({"filepath": filepath}, indent=2))
    print(f"</arguments>")
    print(f"</use_mcp_tool>")
    return True

def process_email(filepath):
    """Use email processor MCP to handle email files."""
    print(f"<use_mcp_tool>")
    print(f"<server_name>email-processor-server</server_name>")
    print(f"<tool_name>process_email</tool_name>")
    print(f"<arguments>")
    print(json.dumps({"filepath": filepath}, indent=2))
    print(f"</arguments>")
    print(f"</use_mcp_tool>")
    return True

def log_movement(filename, category):
    """Log file movement to Google Sheets via MCP."""
    print(f"<use_mcp_tool>")
    print(f"<server_name>google-sheets-server</server_name>")
    print(f"<tool_name>append_row</tool_name>")
    print(f"<arguments>")
    print(json.dumps({
        "values": [
            datetime.now().isoformat(),
            filename,
            category
        ]
    }, indent=2))
    print(f"</arguments>")
    print(f"</use_mcp_tool>")
    return True

def categorize_file(filename):
    """Determine the appropriate category for a file based on its name and content."""
    
    # Convert filename to lowercase for case-insensitive matching
    lower_filename = filename.lower()
    
    # OFW category
    if lower_filename.startswith('ofw_messages_report'):
        return 'ofw'
    
    # Correspondence category
    if any(keyword in lower_filename for keyword in ['trip', 'travel', 'permission', 'form']):
        return 'correspondence'
    
    # Court category
    if any(keyword in lower_filename for keyword in ['parenting plan', 'eval', 'agreement']):
        return 'court'
    
    # Financial category
    if any(keyword in lower_filename for keyword in ['cash', 'sbux', 'premera']):
        return 'financial'
    
    # Email category
    if 'email' in lower_filename or '.eml' in lower_filename:
        return 'email'
    
    # Misc category for images and other files
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
        return 'misc'
    
    # Default to misc for unrecognized files
    return 'misc'

def organize_files(input_path):
    """Organize files from the input directory into appropriate categories."""
    
    # Ensure all category directories exist
    ensure_directories(input_path)
    
    # Get all files in the input directory
    files = [f for f in os.listdir(input_path) if os.path.isfile(os.path.join(input_path, f))]
    
    # Skip README.md and other special files
    files = [f for f in files if f != 'README.md']
    
    for filename in files:
        source_path = os.path.join(input_path, filename)
        
        # Skip if it's a directory
        if os.path.isdir(source_path):
            continue
            
        # Use appropriate MCP processor based on file type
        if filename.lower().endswith('.pdf'):
            analyze_pdf(source_path)
        elif filename.lower().endswith('.eml'):
            process_email(source_path)
        
        # Determine category
        category = categorize_file(filename)
        
        # Create destination path
        dest_path = os.path.join(input_path, category, filename)
        
        # Move file to appropriate directory
        try:
            shutil.move(source_path, dest_path)
            print(f"Moved {filename} to {category}/")
            
            # Log movement to Google Sheets
            log_movement(filename, category)
            
        except Exception as e:
            print(f"Error moving {filename}: {str(e)}")

if __name__ == "__main__":
    # Use the input directory in the current working directory
    input_path = os.path.join(os.getcwd(), 'input')
    organize_files(input_path)
