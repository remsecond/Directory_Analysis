"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentOrganizerServer = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const auto_organizer_js_1 = require("./auto-organizer.js");
class DocumentOrganizerServer {
    constructor() {
        this.server = new index_js_1.Server({
            name: 'document-organizer',
            version: '0.1.0'
        }, {
            capabilities: {
                tools: {
                    organizeDocuments: {
                        description: 'Organize documents into a structured folder hierarchy',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                sourcePath: {
                                    type: 'string',
                                    description: 'Source directory containing documents to organize'
                                },
                                targetPath: {
                                    type: 'string',
                                    description: 'Target directory for organized documents'
                                },
                                recursive: {
                                    type: 'boolean',
                                    description: 'Whether to recursively process subdirectories',
                                    default: false
                                },
                                updateSheet: {
                                    type: 'boolean',
                                    description: 'Whether to update Google Sheet with document metadata',
                                    default: true
                                }
                            },
                            required: ['sourcePath', 'targetPath']
                        }
                    }
                }
            }
        });
        this.organizer = new auto_organizer_js_1.AutoOrganizer();
        this.setupRequestHandlers();
    }
    setupRequestHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'organizeDocuments',
                    description: 'Organize documents into a structured folder hierarchy',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            sourcePath: {
                                type: 'string',
                                description: 'Source directory containing documents to organize'
                            },
                            targetPath: {
                                type: 'string',
                                description: 'Target directory for organized documents'
                            },
                            recursive: {
                                type: 'boolean',
                                description: 'Whether to recursively process subdirectories',
                                default: false
                            },
                            updateSheet: {
                                type: 'boolean',
                                description: 'Whether to update Google Sheet with document metadata',
                                default: true
                            }
                        },
                        required: ['sourcePath', 'targetPath']
                    }
                }
            ]
        }));
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            if (request.params.name !== 'organizeDocuments') {
                throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
            }
            const args = request.params.arguments;
            if (!this.validateOrganizeArgs(args)) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Invalid arguments for organizeDocuments');
            }
            try {
                const result = await this.organizer.organizeDocuments(args.sourcePath, args.targetPath, args.recursive, args.updateSheet);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            }
            catch (error) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Failed to organize documents: ${error?.message || 'Unknown error'}`);
            }
        });
    }
    validateOrganizeArgs(args) {
        return (typeof args === 'object' &&
            args !== null &&
            typeof args.sourcePath === 'string' &&
            typeof args.targetPath === 'string' &&
            (args.recursive === undefined || typeof args.recursive === 'boolean') &&
            (args.updateSheet === undefined || typeof args.updateSheet === 'boolean'));
    }
    async start() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error('Document organizer server running on stdio');
    }
    async stop() {
        await this.server.close();
    }
}
exports.DocumentOrganizerServer = DocumentOrganizerServer;
//# sourceMappingURL=server.js.map