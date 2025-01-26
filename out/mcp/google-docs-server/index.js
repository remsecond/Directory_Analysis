#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const googleapis_1 = require("googleapis");
const fs_1 = require("fs");
// Load Google credentials from config
const config = JSON.parse((0, fs_1.readFileSync)('../../config/google-auth-config.js', 'utf8'));
const auth = new googleapis_1.google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri);
auth.setCredentials({
    refresh_token: config.refreshToken
});
const drive = googleapis_1.google.drive({ version: 'v3', auth });
const docs = googleapis_1.google.docs({ version: 'v1', auth });
class GoogleDocsServer {
    constructor() {
        this.server = new index_js_1.Server({
            name: 'google-docs-server',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'create_and_pin_doc',
                    description: 'Create a Google Doc and pin it to the top of a folder',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            folderId: {
                                type: 'string',
                                description: 'Google Drive folder ID',
                            },
                            title: {
                                type: 'string',
                                description: 'Document title',
                            },
                            content: {
                                type: 'string',
                                description: 'Document content in markdown format',
                            },
                        },
                        required: ['folderId', 'title', 'content'],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            if (request.params.name !== 'create_and_pin_doc') {
                throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
            }
            const { folderId, title, content } = request.params.arguments;
            try {
                // Create the doc
                const doc = await docs.documents.create({
                    requestBody: {
                        title,
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
                // Move to folder
                await drive.files.update({
                    fileId: doc.data.documentId,
                    addParents: folderId,
                    fields: 'id, parents',
                });
                // Pin the doc (star it)
                await drive.files.update({
                    fileId: doc.data.documentId,
                    requestBody: {
                        starred: true,
                    },
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Created and pinned document: ${doc.data.documentId}`,
                        },
                    ],
                };
            }
            catch (error) {
                console.error(error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    async run() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error('Google Docs MCP server running on stdio');
    }
}
const server = new GoogleDocsServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map