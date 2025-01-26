declare module '@modelcontextprotocol/sdk/client/index.js' {
  export function use_mcp_tool(
    serverName: string,
    toolName: string,
    args: Record<string, any>
  ): Promise<any>;
}

declare module '@modelcontextprotocol/sdk/server/index.js' {
  export class Server {
    constructor(
      info: { name: string; version: string },
      config: { capabilities: { tools: Record<string, any> } }
    );

    setRequestHandler(schema: any, handler: (request: any) => Promise<any>): void;
    connect(transport: any): Promise<void>;
    close(): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/server/stdio.js' {
  export class StdioServerTransport {
    constructor();
  }
}

declare module '@modelcontextprotocol/sdk/types.js' {
  export const CallToolRequestSchema: any;
  export const ListToolsRequestSchema: any;
  export const ErrorCode: {
    InvalidRequest: string;
    MethodNotFound: string;
    InvalidParams: string;
    InternalError: string;
  };
  export class McpError extends Error {
    constructor(code: string, message: string);
  }
}
