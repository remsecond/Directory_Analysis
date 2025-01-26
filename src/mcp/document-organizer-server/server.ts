import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import { AutoOrganizer } from './auto-organizer.js';

export class DocumentOrganizerServer {
  private server: Server;
  private organizer: AutoOrganizer;

  constructor() {
    this.server = new Server(
      {
        name: 'document-organizer',
        version: '0.1.0'
      },
      {
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
      }
    );

    this.organizer = new AutoOrganizer();
    this.setupRequestHandlers();
  }

  private setupRequestHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
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

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'organizeDocuments') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      const args = request.params.arguments;
      if (!this.validateOrganizeArgs(args)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Invalid arguments for organizeDocuments'
        );
      }

      try {
        const result = await this.organizer.organizeDocuments(
          args.sourcePath,
          args.targetPath,
          args.recursive,
          args.updateSheet
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error: any) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to organize documents: ${error?.message || 'Unknown error'}`
        );
      }
    });
  }

  private validateOrganizeArgs(args: any): args is {
    sourcePath: string;
    targetPath: string;
    recursive?: boolean;
    updateSheet?: boolean;
  } {
    return (
      typeof args === 'object' &&
      args !== null &&
      typeof args.sourcePath === 'string' &&
      typeof args.targetPath === 'string' &&
      (args.recursive === undefined || typeof args.recursive === 'boolean') &&
      (args.updateSheet === undefined || typeof args.updateSheet === 'boolean')
    );
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Document organizer server running on stdio');
  }

  async stop(): Promise<void> {
    await this.server.close();
  }
}
