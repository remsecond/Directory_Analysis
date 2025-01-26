"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpError = void 0;
class McpError extends Error {
    constructor(code, message, data) {
        super(message);
        this.code = code;
        this.data = data;
        this.name = 'McpError';
    }
}
exports.McpError = McpError;
//# sourceMappingURL=types.js.map