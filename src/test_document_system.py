import os
import shutil
from datetime import datetime
import logging
from pyairtable import Table
import json

def setup_test_env():
    """Set up test environment"""
    print("\nSetting up test environment...")
    
    # Test credentials
    if not os.getenv('AIRTABLE_API_KEY') or not os.getenv('AIRTABLE_BASE_ID'):
        print("Error: Airtable credentials not found in environment")
        print("Please run start-doc-processor-v2.bat first to set up credentials")
        return False
        
    # Test directories
    required_dirs = [
        "input/email",
        "input/ofw",
        "documents/files",
        "documents/db"
    ]
    
    for dir_path in required_dirs:
        if not os.path.exists(dir_path):
            print(f"Error: Required directory missing: {dir_path}")
            return False
            
    print("Directory structure verified")
    return True

def create_test_files():
    """Create test files"""
    print("\nCreating test files...")
    
    # Test email
    email_content = """
From: test@example.com
Subject: Test Email
Date: Thu, 14 Jan 2024 10:00:00 -0800

This is a test email.
    """
    with open("input/email/test.eml", "w") as f:
        f.write(email_content)
    print("Created test email")
    
    # Test OFW export
    ofw_content = """
Record ID: TEST-001
Date: 2024-01-14
Type: Message
Content: Test OFW export
    """
    with open("input/ofw/test.txt", "w") as f:
        f.write(ofw_content)
    print("Created test OFW file")

def test_airtable_connection():
    """Test Airtable connection and tables"""
    print("\nTesting Airtable connection...")
    
    try:
        api_key = os.getenv('AIRTABLE_API_KEY')
        base_id = os.getenv('AIRTABLE_BASE_ID')
        
        # Test Documents table
        docs_table = Table(api_key, base_id, 'Documents')
        docs_table.first(formula="RECORD_ID() != ''")
        print("Documents table connection successful")
        
        # Test Relationships table
        rels_table = Table(api_key, base_id, 'Relationships')
        rels_table.first(formula="RECORD_ID() != ''")
        print("Relationships table connection successful")
        
        return True
        
    except Exception as e:
        print(f"Airtable connection error: {str(e)}")
        return False

def test_document_processing():
    """Test document processing pipeline"""
    print("\nTesting document processing...")
    
    try:
        # Wait for file processing
        print("Waiting for files to be processed...")
        import time
        time.sleep(5)
        
        # Check if files were moved
        if os.path.exists("input/email/test.eml") or os.path.exists("input/ofw/test.txt"):
            print("Error: Test files were not processed")
            return False
            
        # Check documents directory
        files = os.listdir("documents/files")
        if not files:
            print("Error: No files in documents directory")
            return False
            
        print(f"Found {len(files)} processed files")
        return True
        
    except Exception as e:
        print(f"Processing test error: {str(e)}")
        return False

def cleanup_test_files():
    """Clean up test files"""
    print("\nCleaning up test files...")
    
    try:
        # Remove test files if they exist
        if os.path.exists("input/email/test.eml"):
            os.remove("input/email/test.eml")
        if os.path.exists("input/ofw/test.txt"):
            os.remove("input/ofw/test.txt")
            
        print("Test files cleaned up")
        return True
        
    except Exception as e:
        print(f"Cleanup error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("Starting Document System Tests")
    print("=============================")
    
    # Run tests
    if not setup_test_env():
        print("\nTest environment setup failed")
        return
        
    if not test_airtable_connection():
        print("\nAirtable connection test failed")
        return
        
    create_test_files()
    
    if not test_document_processing():
        print("\nDocument processing test failed")
        cleanup_test_files()
        return
        
    cleanup_test_files()
    
    print("\nAll tests completed successfully!")

if __name__ == "__main__":
    main()
