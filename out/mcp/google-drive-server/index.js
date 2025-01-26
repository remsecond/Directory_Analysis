#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const googleapis_1 = require("googleapis");
const logger_js_1 = require("./logger.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const logger = (0, logger_js_1.createLogger)('google-drive-server');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, ROOT_FOLDER_ID, } = process.env;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN || !ROOT_FOLDER_ID) {
    logger.error('Missing required environment variables');
    process.exit(1);
}
const oauth2Client = new googleapis_1.google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
oauth2Client.setCredentials({
    refresh_token: GOOGLE_REFRESH_TOKEN
});
const drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
class GoogleDriveServer {
    constructor() {
        this.server = new index_js_1.Server({
            name: 'google-drive-server',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.server.onerror = (error) => logger.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'create_folder',
                    description: 'Create a new folder in Google Drive',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'Name of the folder to create',
                            },
                            parentId: {
                                type: 'string',
                                description: 'ID of the parent folder (optional)',
                            },
                        },
                        required: ['name'],
                    },
                },
                {
                    name: 'list_files',
                    description: 'List files and folders in a Drive folder',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            folderId: {
                                type: 'string',
                                description: 'ID of the folder to list contents from',
                            },
                            pageSize: {
                                type: 'number',
                                description: 'Number of items to return (optional)',
                            },
                        },
                        required: ['folderId'],
                    },
                },
                {
                    name: 'get_file_info',
                    description: 'Get metadata about a file or folder',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            fileId: {
                                type: 'string',
                                description: 'ID of the file or folder',
                            },
                        },
                        required: ['fileId'],
                    },
                },
                {
                    name: 'move_file',
                    description: 'Move a file to a different folder',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            fileId: {
                                type: 'string',
                                description: 'ID of the file to move',
                            },
                            destinationFolderId: {
                                type: 'string',
                                description: 'ID of the destination folder',
                            },
                        },
                        required: ['fileId', 'destinationFolderId'],
                    },
                },
                {
                    name: 'watch_folder',
                    description: 'Watch a folder for new files and filter incompatible ones',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            folderId: {
                                type: 'string',
                                description: 'ID of the folder to watch',
                            },
                            destinationFolderId: {
                                type: 'string',
                                description: 'ID of the folder to move incompatible files to',
                            },
                            intervalSeconds: {
                                type: 'number',
                                description: 'How often to check for new files (in seconds)',
                                default: 30,
                            },
                        },
                        required: ['folderId', 'destinationFolderId'],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            switch (request.params.name) {
                case 'create_folder':
                    return this.handleCreateFolder(request.params.arguments);
                case 'list_files':
                    return this.handleListFiles(request.params.arguments);
                case 'get_file_info':
                    return this.handleGetFileInfo(request.params.arguments);
                case 'move_file':
                    return this.handleMoveFile(request.params.arguments);
                case 'watch_folder':
                    return this.handleWatchFolder(request.params.arguments);
                default:
                    throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
            }
        });
    }
    async handleCreateFolder(args) {
        try {
            if (!args.name || typeof args.name !== 'string') {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Invalid folder name');
            }
            const fileMetadata = {
                name: args.name,
                mimeType: 'application/vnd.google-apps.folder',
                parents: args.parentId ? [args.parentId] : [ROOT_FOLDER_ID],
            };
            const folder = await drive.files.create({
                requestBody: fileMetadata,
                fields: 'id, name, mimeType, parents',
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(folder.data, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            logger.error('Failed to create folder:', error);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to create folder: ${error}`,
                    },
                ],
                isError: true,
            };
        }
    }
    async handleListFiles(args) {
        try {
            if (!args.folderId || typeof args.folderId !== 'string') {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Invalid folder ID');
            }
            const response = await drive.files.list({
                q: `'${args.folderId}' in parents`,
                pageSize: args.pageSize || 100,
                fields: 'files(id, name, mimeType)',
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(response.data, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            logger.error('Failed to list files:', error);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to list files: ${error}`,
                    },
                ],
                isError: true,
            };
        }
    }
    async handleGetFileInfo(args) {
        try {
            if (!args.fileId || typeof args.fileId !== 'string') {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Invalid file ID');
            }
            const response = await drive.files.get({
                fileId: args.fileId,
                fields: '*',
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(response.data, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            logger.error('Failed to get file info:', error);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to get file info: ${error}`,
                    },
                ],
                isError: true,
            };
        }
    }
    async handleMoveFile(args) {
        try {
            if (!args.fileId || typeof args.fileId !== 'string') {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Invalid file ID');
            }
            if (!args.destinationFolderId || typeof args.destinationFolderId !== 'string') {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Invalid destination folder ID');
            }
            // Get the file's current parents
            const file = await drive.files.get({
                fileId: args.fileId,
                fields: 'parents',
            });
            // Move the file to the new folder
            const response = await drive.files.update({
                fileId: args.fileId,
                removeParents: file.data.parents?.join(','),
                addParents: args.destinationFolderId,
                fields: 'id, name, parents',
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(response.data, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            logger.error('Failed to move file:', error);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to move file: ${error}`,
                    },
                ],
                isError: true,
            };
        }
    }
    isIncompatibleFile(mimeType) {
        const incompatibleTypes = [
            'application/vnd.google-apps.spreadsheet',
            'application/vnd.google-apps.form',
            'application/vnd.google-apps.presentation',
            'video/',
            'audio/',
            'image/'
        ];
        return incompatibleTypes.some(type => mimeType.startsWith(type));
    }
    async handleWatchFolder(args) {
        try {
            if (!args.folderId || typeof args.folderId !== 'string') {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Invalid folder ID');
            }
            if (!args.destinationFolderId || typeof args.destinationFolderId !== 'string') {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Invalid destination folder ID');
            }
            const intervalSeconds = args.intervalSeconds || 30;
            let lastCheckTime = new Date().toISOString();
            const checkForNewFiles = async () => {
                try {
                    // List files created after last check
                    const response = await drive.files.list({
                        q: `'${args.folderId}' in parents and modifiedTime > '${lastCheckTime}'`,
                        fields: 'files(id, name, mimeType, modifiedTime)',
                    });
                    const files = response.data.files || [];
                    lastCheckTime = new Date().toISOString();
                    for (const file of files) {
                        if (this.isIncompatibleFile(file.mimeType)) {
                            await this.handleMoveFile({
                                fileId: file.id,
                                destinationFolderId: args.destinationFolderId,
                            });
                            logger.info(`Moved incompatible file ${file.name} to Other_Files`);
                        }
                    }
                }
                catch (error) {
                    logger.error('Error checking for new files:', error);
                }
            };
            // Initial check
            await checkForNewFiles();
            // Set up interval for continuous checking
            const intervalId = setInterval(checkForNewFiles, intervalSeconds * 1000);
            // Clean up interval on server close
            this.server.onclose = () => {
                clearInterval(intervalId);
            };
            return {
                content: [
                    {
                        type: 'text',
                        text: `Started watching folder ${args.folderId} for new files. Checking every ${intervalSeconds} seconds.`,
                    },
                ],
            };
        }
        catch (error) {
            logger.error('Failed to start folder watch:', error);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to start folder watch: ${error}`,
                    },
                ],
                isError: true,
            };
        }
    }
    async run() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        logger.info('Google Drive MCP server running on stdio');
    }
}
const server = new GoogleDriveServer();
server.run().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map