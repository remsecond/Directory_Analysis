# Google Drive Integration Setup Guide

This guide will walk you through setting up the Google Drive integration for EvidenceAI.

## Prerequisites

1. A Google account with access to Google Drive
2. Node.js installed on your system
3. The EvidenceAI project cloned to your local machine

## Setup Steps

### 1. Create Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API for your project:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

### 2. Configure OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure the OAuth consent screen if prompted
4. Select "Desktop app" as the application type
5. Give your client ID a name (e.g., "EvidenceAI Desktop Client")
6. Click "Create"
7. Download the client credentials

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env` if you haven't already
2. Add your Google OAuth credentials to the `.env` file:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

### 4. Run Setup Script

1. Open a terminal in the project directory
2. Run the setup script:
   ```bash
   setup-google-drive.bat
   ```

The script will:
- Get an OAuth refresh token
- Verify the Drive setup
- Create the folder structure
- Display the folder IDs to add to your .env file

### 5. Update Environment Variables

Add the folder IDs to your `.env` file:
```
ROOT_FOLDER_ID=your_root_folder_id
INCOMING_FOLDER_ID=your_incoming_folder_id
PROCESSING_FOLDER_ID=your_processing_folder_id
COMPLETED_FOLDER_ID=your_completed_folder_id
ARCHIVE_FOLDER_ID=your_archive_folder_id
```

## Folder Structure

The integration creates the following folder structure in your Google Drive:

```
EvidenceAI/
├── Incoming/     # New documents are placed here
├── Processing/   # Documents being processed
├── Completed/    # Processed documents
└── Archive/      # Archived documents
```

## Testing the Integration

1. Run the integration test:
   ```bash
   node scripts/test-drive-integration.js
   ```

This will verify that all Drive operations are working correctly.

## Troubleshooting

### Invalid Credentials
- Verify your client ID and secret in the `.env` file
- Make sure you've completed the OAuth flow to get a refresh token

### Permission Errors
- Check that the Google Drive API is enabled
- Verify that your Google account has sufficient permissions
- Try running the OAuth flow again to get a new refresh token

### Folder Access Issues
- Verify the folder IDs in your `.env` file
- Check that your Google account has access to all folders
- Try recreating the folder structure using the setup script

## Additional Resources

- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 for Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
