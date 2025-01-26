# Google OAuth Setup Guide

This guide walks you through setting up OAuth 2.0 credentials for the EvidenceAI Google Drive integration.

## Prerequisites

1. A Google account
2. Access to [Google Cloud Console](https://console.cloud.google.com/)
3. A Google Cloud project (created via `setup-google-project.js`)

## Step-by-Step Instructions

### 1. Configure OAuth Consent Screen

1. Go to the [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent) page
2. Select "External" user type (unless you're using Google Workspace)
3. Fill in the required information:
   - App name: "EvidenceAI"
   - User support email: Your email address
   - Developer contact information: Your email address
4. Click "Save and Continue"
5. On the Scopes page:
   - Add the following scopes:
     * `https://www.googleapis.com/auth/drive.file`
     * `https://www.googleapis.com/auth/drive.folders`
6. Click "Save and Continue"
7. Add your email address as a test user
8. Click "Save and Continue"

### 2. Create OAuth Client ID

1. Go to the [Credentials](https://console.cloud.google.com/apis/credentials) page
2. Click "Create Credentials" > "OAuth client ID"
3. Choose application type: "Desktop app"
4. Name: "EvidenceAI Desktop Client"
5. Click "Create"
6. Download the client configuration file (JSON)
7. Note the client ID and client secret

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env` if you haven't already
2. Add your OAuth credentials to the `.env` file:
   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

### 4. Get Refresh Token

1. Run the OAuth setup script:
   ```bash
   node scripts/get-oauth-token.js
   ```
2. Follow the browser prompts to authorize the application
3. Copy the refresh token from the console output
4. Add it to your `.env` file:
   ```
   GOOGLE_REFRESH_TOKEN=your_refresh_token_here
   ```

## Troubleshooting

### Invalid Client ID
- Verify that you've copied the correct client ID from the Google Cloud Console
- Make sure there are no extra spaces or characters in your .env file

### Authorization Error
- Check that you've enabled the Google Drive API
- Verify that you've added yourself as a test user
- Try clearing your browser cookies and cache

### Invalid Redirect URI
- Make sure you're using the correct OAuth client ID for a desktop application
- Verify that the redirect URI in the code matches the one in the Google Cloud Console

### Token Refresh Failed
- Your refresh token may have expired
- Run the OAuth setup script again to get a new refresh token

## Security Notes

1. Never commit your OAuth credentials to version control
2. Keep your client secret and refresh token secure
3. Use environment variables for sensitive information
4. Regularly rotate your refresh token for security

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [OAuth 2.0 for Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
