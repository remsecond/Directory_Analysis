import { google } from 'googleapis';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create OAuth2 client with credentials from env
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth2callback'
);

// Load credentials from token file
const tokenData = JSON.parse(fs.readFileSync('google-token.json'));
oauth2Client.setCredentials(tokenData);

const drive = google.drive({ version: 'v3', auth: oauth2Client });
const docs = google.docs({ version: 'v1', auth: oauth2Client });

// Welcome doc content
const content = `# Welcome to EvidenceAI! 👋

## Just Drop Your Files Here
1. Drop files in the "1_Input" folder
2. We'll handle the rest automatically!

## Where to Find Things
📥 **New Files:** Drop in "1_Input" folder
📊 **Progress:** Check "Pipeline" sheet
📤 **Finished Files:** Look in "3_Complete" folder

## That's It!
No setup needed. No training required.
Just drop your files and we'll take care of everything.

Need help? Check your email - we'll let you know if anything needs attention.`;

async function createAndPinDoc() {
  try {
    // Create doc
    const doc = await docs.documents.create({
      requestBody: {
        title: 'START HERE - EvidenceAI',
      },
    });

    // Insert content
    await docs.documents.batchUpdate({
      documentId: doc.data.documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: content,
            },
          },
        ],
      },
    });

    // Move to root folder
    await drive.files.update({
      fileId: doc.data.documentId,
      addParents: 'root', // Place in root of My Drive
      fields: 'id, parents',
    });

    // Pin the doc
    await drive.files.update({
      fileId: doc.data.documentId,
      requestBody: {
        starred: true,
      },
    });

    console.log(`Created and pinned welcome document: ${doc.data.documentId}`);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
  }
}

createAndPinDoc();
