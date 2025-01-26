"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const logger_js_1 = require("./logger.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const logger = (0, logger_js_1.createLogger)('setup-folders');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, } = process.env;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    logger.error('Missing required environment variables');
    process.exit(1);
}
const oauth2Client = new googleapis_1.google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
oauth2Client.setCredentials({
    refresh_token: GOOGLE_REFRESH_TOKEN
});
const drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
async function createFolder(name, parentId) {
    try {
        const fileMetadata = {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId ? [parentId] : undefined
        };
        const folder = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id'
        });
        if (!folder.data.id) {
            throw new Error('Failed to get folder ID from response');
        }
        logger.info(`Created folder: ${name}`);
        return folder.data.id;
    }
    catch (error) {
        logger.error(`Failed to create folder ${name}:`, error);
        throw error;
    }
}
async function setupFolderStructure() {
    try {
        // Create root folder
        const rootId = await createFolder('EvidenceAI');
        // Create main folders
        const incomingId = await createFolder('Incoming', rootId);
        const processingId = await createFolder('Processing', rootId);
        const completedId = await createFolder('Completed', rootId);
        const errorLogsId = await createFolder('ErrorLogs', rootId);
        const metadataId = await createFolder('Metadata', rootId);
        const outputsId = await createFolder('Outputs', rootId);
        // Create Documentation folder and its subfolders
        const docsId = await createFolder('Documentation', rootId);
        await createFolder('EvidenceAI White Paper', docsId);
        await createFolder('EvidenceAI Test Sheet', docsId);
        await createFolder('Other docs', docsId);
        // Save folder IDs to environment
        logger.info('Folder structure created successfully');
        logger.info('Please add these folder IDs to your .env file:');
        logger.info(`ROOT_FOLDER_ID=${rootId}`);
        logger.info(`INCOMING_FOLDER_ID=${incomingId}`);
        logger.info(`PROCESSING_FOLDER_ID=${processingId}`);
        logger.info(`COMPLETED_FOLDER_ID=${completedId}`);
        logger.info(`ERROR_LOGS_FOLDER_ID=${errorLogsId}`);
        logger.info(`METADATA_FOLDER_ID=${metadataId}`);
        logger.info(`OUTPUTS_FOLDER_ID=${outputsId}`);
        logger.info(`DOCUMENTATION_FOLDER_ID=${docsId}`);
    }
    catch (error) {
        logger.error('Failed to set up folder structure:', error);
        process.exit(1);
    }
}
setupFolderStructure();
//# sourceMappingURL=setup-folders.js.map