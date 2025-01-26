// Use existing Google Drive integration
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Read credentials from existing files
const credentials = require('../credentials.json');
const token = require('../token.json');

const oauth2Client = new google.auth.OAuth2(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
);

oauth2Client.setCredentials(token);
const drive = google.drive({ version: 'v3', auth: oauth2Client });

async function createFolder(name, parentId = null) {
  try {
    const folder = await drive.files.create({
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : [],
      },
      fields: 'id, name',
    });
    console.log(`Created folder: ${name} (${folder.data.id})`);
    return folder.data.id;
  } catch (error) {
    console.error(`Error creating folder ${name}:`, error.message);
    throw error;
  }
}

async function createFolderStructure() {
  try {
    // Create root folder
    const rootId = await createFolder('EvidenceAI');
    console.log('\nRoot folder created successfully');

    // Create subfolders
    const folders = ['Incoming', 'Processing', 'Completed', 'Archive'];
    for (const folder of folders) {
      await createFolder(folder, rootId);
    }

    console.log('\nFolder structure created successfully!');
  } catch (error) {
    console.error('Failed to create folder structure:', error.message);
    process.exit(1);
  }
}

// Execute
createFolderStructure();
