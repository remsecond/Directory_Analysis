"use strict";
/// <reference types="node" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheetsService = void 0;
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
class GoogleSheetsService {
    constructor() {
        const credentials = this.loadCredentials();
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
        this.sheets = googleapis_1.google.sheets({ version: 'v4', auth });
        this.spreadsheetId = process.env.GOOGLE_SHEET_ID || '';
        if (!this.spreadsheetId) {
            throw new Error('GOOGLE_SHEET_ID environment variable is required');
        }
    }
    loadCredentials() {
        try {
            return JSON.parse(fs_1.default.readFileSync('google-credentials.json', 'utf8'));
        }
        catch (error) {
            throw new Error('Failed to load Google credentials: ' + error);
        }
    }
    async getProcessingQueue(status, limit = 10) {
        try {
            // Get both Document Tracking and Processing Status data
            const [trackingResponse, statusResponse] = await Promise.all([
                this.sheets.spreadsheets.values.get({
                    spreadsheetId: this.spreadsheetId,
                    range: 'Document Tracking!A2:J'
                }),
                this.sheets.spreadsheets.values.get({
                    spreadsheetId: this.spreadsheetId,
                    range: 'Processing Status!A2:E'
                })
            ]);
            const trackingRows = trackingResponse.data.values || [];
            const statusRows = statusResponse.data.values || [];
            // Create a map of document metadata from tracking sheet
            const documentMetadata = new Map();
            trackingRows.forEach((row) => {
                documentMetadata.set(row[0], {
                    fileName: row[1],
                    type: row[2],
                    pages: row[5] ? parseInt(row[5], 10) : undefined,
                    wordCount: row[6] ? parseInt(row[6], 10) : undefined,
                    processingTime: row[7],
                    outputLocation: row[8],
                    notes: row[9]
                });
            });
            // Build queue items from status sheet with metadata from tracking sheet
            let queue = statusRows.map((row) => {
                const documentId = row[0];
                const metadata = {
                    ...documentMetadata.get(documentId),
                    currentStage: row[1],
                    estimatedCompletion: row[3],
                    statusMessage: row[4]
                };
                return {
                    documentId,
                    status: row[2],
                    metadata,
                    addedDate: new Date().toISOString()
                };
            });
            // Filter by status if provided
            if (status) {
                queue = queue.filter((item) => item.status === status);
            }
            // Sort by most recent first and apply limit
            queue.sort((a, b) => b.addedDate.localeCompare(a.addedDate));
            return queue.slice(0, limit);
        }
        catch (error) {
            console.error('Failed to get processing queue:', error);
            throw error;
        }
    }
    async updateDocumentStatus(documentId, status, metadata) {
        try {
            // Update Document Tracking sheet
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: 'Document Tracking!A:J',
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[
                            documentId,
                            metadata?.fileName || '',
                            metadata?.type || '',
                            new Date().toISOString(),
                            status,
                            metadata?.pages || '',
                            metadata?.wordCount || '',
                            metadata?.processingTime || '',
                            metadata?.outputLocation || '',
                            metadata?.notes || ''
                        ]]
                }
            });
            // Update Processing Status sheet
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: 'Processing Status!A:E',
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[
                            documentId,
                            metadata?.currentStage || 'Processing',
                            new Date().toISOString(),
                            metadata?.estimatedCompletion || '',
                            metadata?.statusMessage || `Status updated to ${status}`
                        ]]
                }
            });
        }
        catch (error) {
            console.error('Failed to update document status:', error);
            throw error;
        }
    }
    async createTrackingSheet(title) {
        try {
            const response = await this.sheets.spreadsheets.create({
                requestBody: {
                    properties: {
                        title
                    },
                    sheets: [
                        {
                            properties: {
                                title: 'Document Tracking',
                                gridProperties: {
                                    frozenRowCount: 1
                                }
                            }
                        },
                        {
                            properties: {
                                title: 'Processing Status',
                                gridProperties: {
                                    frozenRowCount: 1
                                }
                            }
                        }
                    ]
                }
            });
            const spreadsheetId = response.data.spreadsheetId;
            // Set up headers
            await this.sheets.spreadsheets.values.batchUpdate({
                spreadsheetId,
                requestBody: {
                    valueInputOption: 'RAW',
                    data: [
                        {
                            range: 'Document Tracking!A1:J1',
                            values: [[
                                    'Document ID',
                                    'File Name',
                                    'Type',
                                    'Last Updated',
                                    'Status',
                                    'Pages',
                                    'Word Count',
                                    'Processing Time',
                                    'Output Location',
                                    'Notes'
                                ]]
                        },
                        {
                            range: 'Processing Status!A1:E1',
                            values: [[
                                    'Document ID',
                                    'Current Stage',
                                    'Status',
                                    'Estimated Completion',
                                    'Status Message'
                                ]]
                        }
                    ]
                }
            });
            return spreadsheetId;
        }
        catch (error) {
            console.error('Failed to create tracking sheet:', error);
            throw error;
        }
    }
}
exports.GoogleSheetsService = GoogleSheetsService;
//# sourceMappingURL=index.js.map