const { google } = require('googleapis');
require('dotenv').config();

async function createFolder(drive, name, parentId = null) {
  const folderMetadata = {
    name: name,
    mimeType: 'application/vnd.google-apps.folder'
  };
  
  if (parentId) {
    folderMetadata.parents = [parentId];
  }

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id, name'
  });

  console.log(`Created folder: ${name} (${folder.data.id})`);
  return folder.data.id;
}

async function setupGoogleDrive() {
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

    console.log('Setting up Google Drive folder structure...');

    // Create root folder
    const rootFolderId = await createFolder(drive, 'EvidenceAI');

    // Create main subfolders
    const incomingId = await createFolder(drive, 'Incoming', rootFolderId);
    const processingId = await createFolder(drive, 'Processing', rootFolderId);
    const completedId = await createFolder(drive, 'Completed', rootFolderId);
    const archiveId = await createFolder(drive, 'Archive', rootFolderId);

    // Update .env file with folder IDs
    const folderIds = {
      ROOT_FOLDER_ID: rootFolderId,
      INCOMING_FOLDER_ID: incomingId,
      PROCESSING_FOLDER_ID: processingId,
      COMPLETED_FOLDER_ID: completedId,
      ARCHIVE_FOLDER_ID: archiveId
    };

    console.log('\nFolder structure created successfully!');
    console.log('\nAdd these folder IDs to your .env file:');
    Object.entries(folderIds).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });

  } catch (error) {
    console.error('Error setting up Google Drive:', error.message);
    if (error.message.includes('invalid_grant')) {
      console.log('\nTip: Your refresh token might be invalid or expired.');
      console.log('Try running the get-oauth-token.js script again to get a new refresh token.');
    }
    process.exit(1);
  }
}

setupGoogleDrive();
