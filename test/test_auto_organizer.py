import os
import shutil
import unittest
from pathlib import Path
from src.document_organizer.auto_organizer import AutoOrganizer

class TestAutoOrganizer(unittest.TestCase):
    def setUp(self):
        """Set up test environment"""
        self.test_dir = Path("test/test_files")
        self.test_dir.mkdir(exist_ok=True)
        
        # Create test files
        (self.test_dir / "test.pdf").touch()
        (self.test_dir / "test.png").touch()
        (self.test_dir / "test.ods").touch()
        (self.test_dir / "test.eml").touch()
        
        self.organizer = AutoOrganizer(str(self.test_dir))

    def tearDown(self):
        """Clean up test environment"""
        if self.test_dir.exists():
            shutil.rmtree(self.test_dir)

    def test_directory_creation(self):
        """Test if directories are created correctly"""
        self.organizer.create_directory_structure()
        
        # Check main directories
        self.assertTrue((self.test_dir.parent / "documents").exists())
        self.assertTrue((self.test_dir.parent / "images").exists())
        self.assertTrue((self.test_dir.parent / "email").exists())
        self.assertTrue((self.test_dir.parent / "ofw").exists())
        
        # Check subdirectories
        self.assertTrue((self.test_dir.parent / "documents" / "forms").exists())
        self.assertTrue((self.test_dir.parent / "documents" / "records").exists())
        self.assertTrue((self.test_dir.parent / "documents" / "attachments").exists())

    def test_file_organization(self):
        """Test if files are organized correctly"""
        result = self.organizer.organize_files()
        
        # Verify success
        self.assertTrue(result['success'])
        self.assertEqual(result['processed'], 4)  # Should process all test files
        
        # Check file locations
        self.assertTrue((self.test_dir.parent / "documents" / "forms" / "test.pdf").exists())
        self.assertTrue((self.test_dir.parent / "images" / "test.png").exists())
        self.assertTrue((self.test_dir.parent / "documents" / "records" / "test.ods").exists())
        self.assertTrue((self.test_dir.parent / "email" / "test.eml").exists())

    def test_duplicate_handling(self):
        """Test duplicate file handling"""
        # Create duplicate files
        (self.test_dir / "test2.pdf").write_bytes((self.test_dir / "test.pdf").read_bytes())
        
        result = self.organizer.organize_files()
        self.assertEqual(len(self.organizer.duplicates), 1)  # Should find one set of duplicates

    def test_error_handling(self):
        """Test error handling for invalid files"""
        # Create an unreadable file
        bad_file = self.test_dir / "bad.pdf"
        bad_file.touch()
        os.chmod(str(bad_file), 0o000)  # Remove all permissions
        
        result = self.organizer.organize_files()
        self.assertTrue(result['success'])  # Should complete despite error
        
        # Cleanup
        os.chmod(str(bad_file), 0o666)  # Restore permissions for cleanup

if __name__ == '__main__':
    unittest.main()
