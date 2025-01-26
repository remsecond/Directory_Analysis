"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_js_1 = require("./logger.js");
dotenv_1.default.config();
const logger = (0, logger_js_1.createLogger)('test-drive');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, ROOT_FOLDER_ID, } = process.env;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN || !ROOT_FOLDER_ID) {
    logger.error('Missing required environment variables');
    process.exit(1);
}
// Since we've checked ROOT_FOLDER_ID is not null/undefined above, we can safely assert it as string
const rootFolderId = ROOT_FOLDER_ID;
const oauth2Client = new googleapis_1.google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
oauth2Client.setCredentials({
    refresh_token: GOOGLE_REFRESH_TOKEN
});
const drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
async function testDrive() {
    try {
        // Test listing files in root folder
        logger.info('Testing list files...');
        const listResponse = await drive.files.list({
            q: `'${rootFolderId}' in parents`,
            pageSize: 10,
            fields: 'files(id, name, mimeType)',
        });
        logger.info('Files in root folder:', listResponse.data);
        // Test creating a test folder
        logger.info('Testing folder creation...');
        const createParams = {
            requestBody: {
                name: 'Test Folder',
                mimeType: 'application/vnd.google-apps.folder',
                parents: [rootFolderId],
            },
            fields: 'id, name, mimeType, parents',
        };
        const testFolder = await drive.files.create(createParams);
        const folderId = testFolder.data.id;
        if (!folderId) {
            throw new Error('Failed to get folder ID from response');
        }
        logger.info('Created test folder:', testFolder.data);
        // Test getting folder info
        logger.info('Testing get file info...');
        const folderInfo = await drive.files.get({
            fileId: folderId,
            fields: '*',
        });
        logger.info('Test folder info:', folderInfo.data);
        // Clean up by deleting test folder
        logger.info('Cleaning up...');
        await drive.files.delete({
            fileId: folderId,
        });
        logger.info('Test folder deleted');
        logger.info('All tests passed successfully!');
    }
    catch (error) {
        logger.error('Test failed:', error);
        process.exit(1);
    }
}
testDrive();
//# sourceMappingURL=test-drive.js.map