const { google } = require('googleapis');
const http = require('http');
const open = require('open');
require('dotenv').config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env file');
  process.exit(1);
}

// OAuth 2.0 configuration
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'http://localhost:3000/oauth2callback'
);

// Generate authentication URL
const scopes = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.folders'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent' // Force to get refresh token
});

// Create a local server to receive the OAuth callback
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const code = url.searchParams.get('code');

    if (code) {
      // Exchange the code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      
      console.log('\nRefresh Token:', tokens.refresh_token);
      console.log('\nAdd this refresh token to your .env file as GOOGLE_REFRESH_TOKEN\n');
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Authorization successful!</h1><p>You can close this window.</p>');
      
      setTimeout(() => process.exit(0), 1000);
    } else {
      res.writeHead(400);
      res.end('No authorization code received');
    }
  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500);
    res.end('Error processing authorization');
  }
});

// Start the server and open the auth URL
server.listen(3000, () => {
  console.log('Opening browser for Google authorization...');
  console.log('Please complete the authentication in the browser window.');
  open(authUrl).catch(console.error);
});
