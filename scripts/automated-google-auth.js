import { google } from 'googleapis';
import fs from 'fs';
import { getLogger } from '../src/utils/logging.js';
import { spawn } from 'child_process';

const logger = getLogger();

import { googleConfig } from '../config/google-auth-config.js';

// Create OAuth client from config
const oauth2Client = new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirectUri
);

/**
 * Automate Google OAuth process
 */
async function automateGoogleAuth() {
    try {
        // Generate auth URL
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: googleConfig.scopes,
            login_hint: googleConfig.email,
            prompt: 'consent' // Force consent screen
        });

        logger.info('Starting automated authentication');
        logger.info('Please complete the authentication in the browser window that will open.');
        logger.info('After authenticating, copy the code from the browser and paste it here.');

        // Launch Firefox directly
        spawn('C:\\Program Files\\Mozilla Firefox\\firefox.exe', [authUrl], {
            detached: true,
            stdio: 'ignore'
        });

        // Since we can't automate the browser interaction anymore,
        // we'll need to prompt the user to manually complete the process
        process.stdout.write('Please enter the authorization code: ');

        // Read the code from stdin
        const code = await new Promise(resolve => {
            process.stdin.once('data', data => {
                resolve(data.toString().trim());
            });
        });

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);

        // Save tokens with timestamp
        const tokenData = {
            ...tokens,
            created_at: new Date().toISOString()
        };
        
        fs.writeFileSync('google-token.json', JSON.stringify(tokenData, null, 2));
        logger.info('Token stored to google-token.json');

        return tokenData;
    } catch (error) {
        logger.error('Error during automated authentication:', error);
        throw error;
    }
}

// Run automation
automateGoogleAuth().catch(error => {
    console.error('Authentication failed:', error);
    process.exit(1);
});
