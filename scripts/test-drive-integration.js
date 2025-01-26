const DriveStorageManager = require('../src/services/drive-storage-manager');

async function testDriveIntegration() {
  try {
    console.log('Testing Google Drive integration...\n');
    
    const driveManager = new DriveStorageManager();
    
    // Test folder creation
    console.log('1. Testing folder creation...');
    const testFolder = await driveManager.createFolder('Test Folder');
    console.log(`Created folder: ${testFolder.name} (${testFolder.id})`);

    // Test file upload
    console.log('\n2. Testing file upload...');
    // Create a test file
    const fs = require('fs');
    const testFilePath = 'test-file.txt';
    fs.writeFileSync(testFilePath, 'This is a test file');
    
    const uploadedFile = await driveManager.uploadFile(testFilePath, 'test.txt', testFolder.id);
    console.log(`Uploaded file: ${uploadedFile.name} (${uploadedFile.id})`);

    // Test file listing
    console.log('\n3. Testing file listing...');
    const files = await driveManager.listFiles(testFolder.id);
    console.log('Files in test folder:');
    files.forEach(file => {
      console.log(`- ${file.name} (${file.id})`);
    });

    // Test file search
    console.log('\n4. Testing file search...');
    const searchResults = await driveManager.searchFiles(`name contains 'test'`);
    console.log('Search results:');
    searchResults.forEach(file => {
      console.log(`- ${file.name} (${file.id})`);
    });

    // Cleanup
    console.log('\n5. Cleaning up...');
    await driveManager.deleteFile(uploadedFile.id);
    await driveManager.deleteFile(testFolder.id);
    fs.unlinkSync(testFilePath);
    console.log('Cleanup completed');

    // Test folder structure
    console.log('\n6. Testing folder structure...');
    const structure = await driveManager.getFolderStructure();
    console.log('Current folder structure:');
    Object.entries(structure).forEach(([key, value]) => {
      console.log(`- ${key}: ${value}`);
    });

    console.log('\nAll tests completed successfully!');
    
  } catch (error) {
    console.error('Error during testing:', error.message);
    process.exit(1);
  }
}

testDriveIntegration();
