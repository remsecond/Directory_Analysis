const { google } = require('googleapis');
require('dotenv').config();

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);
auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth });

async function createFolders() {
  try {
    console.log('Creating root folder...');
    const root = await drive.files.create({
      requestBody: {
        name: 'EvidenceAI',
        mimeType: 'application/vnd.google-apps.folder'
      }
    });
    
    console.log('Root folder created:', root.data.id);
    
    const folders = ['Incoming', 'Processing', 'Completed', 'Archive'];
    for (const name of folders) {
      console.log(`Creating ${name} folder...`);
      const folder = await drive.files.create({
        requestBody: {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [root.data.id]
        }
      });
      console.log(`${name} folder created:`, folder.data.id);
    }

    console.log('\nFolder structure created successfully!');
    console.log('\nAdd these folder IDs to your .env file:');
    console.log(`ROOT_FOLDER_ID=${root.data.id}`);
  } catch (error) {
    console.error('Error creating folders:', error.message);
    process.exit(1);
  }
}

createFolders();
