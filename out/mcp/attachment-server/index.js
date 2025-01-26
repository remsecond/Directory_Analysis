#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const promises_1 = __importDefault(require("fs/promises"));
class AttachmentServer {
    constructor() {
        this.server = new index_js_1.Server({
            name: 'attachment-server',
            version: '0.1.0',
        }, {
            capabilities: {
                resources: {},
                tools: {},
            },
        });
        this.baseDir = process.env.ATTACHMENT_DIR || 'processed/attachments';
        this.setupToolHandlers();
        this.setupResourceHandlers();
        // Error handling
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
                    name: 'get_attachment_info',
                    description: 'Get metadata for an attachment',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            hash: {
                                type: 'string',
                                description: 'Attachment hash',
                            },
                        },
                        required: ['hash'],
                    },
                },
                {
                    name: 'get_storage_stats',
                    description: 'Get attachment storage statistics',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'find_duplicates',
                    description: 'Find duplicate attachments',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            minReferences: {
                                type: 'number',
                                description: 'Minimum number of references',
                                default: 2,
                            },
                        },
                    },
                },
            ],
        }));
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            // Lazy load attachment store
            if (!this.attachmentStore) {
                this.attachmentStore = (await Promise.resolve().then(() => __importStar(require('../../simple-pdf-processor/src/services/attachment-store.js')))).default;
                await this.attachmentStore.init();
            }
            switch (request.params.name) {
                case 'get_attachment_info':
                    return this.handleGetAttachmentInfo(request.params.arguments);
                case 'get_storage_stats':
                    return this.handleGetStorageStats();
                case 'find_duplicates':
                    return this.handleFindDuplicates(request.params.arguments);
                default:
                    throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
            }
        });
    }
    setupResourceHandlers() {
        this.server.setRequestHandler(types_js_1.ListResourcesRequestSchema, async () => ({
            resources: [
                {
                    uri: 'attachment://stats/current',
                    name: 'Current Storage Statistics',
                    mimeType: 'application/json',
                    description: 'Current attachment storage statistics',
                },
            ],
        }));
        this.server.setRequestHandler(types_js_1.ListResourceTemplatesRequestSchema, async () => ({
            resourceTemplates: [
                {
                    uriTemplate: 'attachment://{hash}/info',
                    name: 'Attachment Information',
                    mimeType: 'application/json',
                    description: 'Metadata for a specific attachment',
                },
                {
                    uriTemplate: 'attachment://{hash}/content',
                    name: 'Attachment Content',
                    description: 'Raw content of a specific attachment',
                },
            ],
        }));
        this.server.setRequestHandler(types_js_1.ReadResourceRequestSchema, async (request) => {
            // Lazy load attachment store
            if (!this.attachmentStore) {
                this.attachmentStore = (await Promise.resolve().then(() => __importStar(require('../../simple-pdf-processor/src/services/attachment-store.js')))).default;
                await this.attachmentStore.init();
            }
            const { uri } = request.params;
            // Handle static resources
            if (uri === 'attachment://stats/current') {
                const stats = await this.attachmentStore.getStats();
                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify(stats, null, 2),
                        },
                    ],
                };
            }
            // Handle dynamic resources
            const infoMatch = uri.match(/^attachment:\/\/([^/]+)\/info$/);
            if (infoMatch) {
                const hash = infoMatch[1];
                const info = await this.attachmentStore.getAttachmentInfo(hash);
                if (!info) {
                    throw new types_js_1.McpError(types_js_1.ErrorCode.NotFound, `Attachment not found: ${hash}`);
                }
                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify(info, null, 2),
                        },
                    ],
                };
            }
            const contentMatch = uri.match(/^attachment:\/\/([^/]+)\/content$/);
            if (contentMatch) {
                const hash = contentMatch[1];
                const info = await this.attachmentStore.getAttachmentInfo(hash);
                if (!info) {
                    throw new types_js_1.McpError(types_js_1.ErrorCode.NotFound, `Attachment not found: ${hash}`);
                }
                const content = await promises_1.default.readFile(info.path, 'utf8');
                return {
                    contents: [
                        {
                            uri,
                            text: content,
                        },
                    ],
                };
            }
            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, `Invalid URI format: ${uri}`);
        });
    }
    async handleGetAttachmentInfo(args) {
        const info = await this.attachmentStore.getAttachmentInfo(args.hash);
        if (!info) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Attachment not found: ${args.hash}`,
                    },
                ],
                isError: true,
            };
        }
        const refs = await this.attachmentStore.getReferences(args.hash);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        ...info,
                        references: refs,
                    }, null, 2),
                },
            ],
        };
    }
    async handleGetStorageStats() {
        const stats = await this.attachmentStore.getStats();
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(stats, null, 2),
                },
            ],
        };
    }
    async handleFindDuplicates(args) {
        const minRefs = args?.minReferences || 2;
        const metadata = await this.attachmentStore.loadMetadata();
        const duplicates = Object.entries(metadata.references)
            .filter(([_, refs]) => refs.length >= minRefs)
            .map(([hash, refs]) => ({
            hash,
            info: metadata.attachments[hash],
            references: refs,
        }));
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(duplicates, null, 2),
                },
            ],
        };
    }
    async run() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error('Attachment MCP server running on stdio');
    }
}
const server = new AttachmentServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map