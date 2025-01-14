import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

class SheetsUpdater {
    constructor() {
        try {
            const tokenData = JSON.parse(fs.readFileSync('google-token.json'));
            const oauth2Client = new google.auth.OAuth2();
            oauth2Client.setCredentials(tokenData);
            this.sheets = google.sheets({ version: 'v4', auth: oauth2Client });
            this.spreadsheetId = process.env.GOOGLE_SHEET_ID;
        } catch (error) {
            console.error('Failed to initialize Google Sheets:', error);
        }
    }

    async updateProcessingRecord(result, fileName) {
        if (!this.sheets || !this.spreadsheetId) {
            console.warn('Google Sheets not configured, skipping update');
            return;
        }

        try {
            const docId = `DOC-${Date.now()}`;
            const values = [[
                docId,
                fileName,
                'TXT',
                new Date().toISOString(),
                result.status,
                'N/A', // pages not applicable for text files
                result.statistics.words,
                result.processing_meta.processing_time,
                result.destination || 'N/A',
                result.status === 'error' ? result.message : ''
            ]];

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: 'Document Tracking!A:J',
                valueInputOption: 'RAW',
                requestBody: { values }
            });

            // Update processing status
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: 'Processing Status!A:E',
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[
                        docId,
                        'Text Processing',
                        new Date().toISOString(),
                        new Date().toISOString(),
                        result.status === 'success' ? 'Completed' : 'Failed'
                    ]]
                }
            });

            console.log('Updated Google Sheets record for:', fileName);
        } catch (error) {
            console.error('Failed to update Google Sheets:', error);
        }
    }
}

const sheetsUpdater = new SheetsUpdater();
export default sheetsUpdater;
