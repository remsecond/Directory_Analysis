export interface McpRequest<T = any> {
  jsonrpc: '2.0';
  method: string;
  params: T;
  id: number | string | null;
}

export interface McpResponse<T = any> {
  jsonrpc: '2.0';
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: number | string | null;
}

export interface ServerInfo {
  name: string;
  version: string;
}

export interface ServerCapabilities {
  tools: Record<string, unknown>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ListToolsResponse {
  tools: ToolDefinition[];
}

export interface CallToolRequest {
  name: string;
  arguments: Record<string, any>;
}

export interface CallToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

export class McpError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'McpError';
  }
}
