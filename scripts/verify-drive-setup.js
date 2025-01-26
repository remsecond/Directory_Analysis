const { google } = require('googleapis');
require('dotenv').config();

async function verifyDriveSetup() {
  try {
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    // Set credentials using refresh token
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    // Create Drive client
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Test folder creation
    console.log('Testing folder creation...');
    const testFolder = await drive.files.create({
      requestBody: {
        name: 'Test Folder',
        mimeType: 'application/vnd.google-apps.folder'
      },
      fields: 'id, name'
    });

    console.log('Successfully created test folder:', testFolder.data);

    // Delete test folder
    console.log('Cleaning up test folder...');
    await drive.files.delete({
      fileId: testFolder.data.id
    });

    console.log('\nGoogle Drive setup verification successful!');
    console.log('Your Google Drive integration is working correctly.');
    
  } catch (error) {
    console.error('Error verifying Google Drive setup:', error.message);
    if (error.message.includes('invalid_grant')) {
      console.log('\nTip: Your refresh token might be invalid or expired.');
      console.log('Try running the get-oauth-token.js script again to get a new refresh token.');
    }
    process.exit(1);
  }
}

verifyDriveSetup();
