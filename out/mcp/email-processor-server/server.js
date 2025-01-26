"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const index_js_1 = __importDefault(require("./index.js"));
class EmailProcessorServer extends events_1.EventEmitter {
    constructor() {
        super();
        this.processor = new index_js_1.default();
        this.setupHandlers();
    }
    setupHandlers() {
        process.on('message', async (message) => {
            if (message.type === 'processEmail') {
                const response = await this.handleProcessEmail(message.args);
                if (process.send) {
                    process.send(response);
                }
            }
        });
        process.on('SIGINT', () => {
            this.cleanup();
            process.exit(0);
        });
    }
    async handleProcessEmail(args) {
        try {
            if (!args.filePath || !args.format) {
                return {
                    success: false,
                    error: 'filePath and format are required parameters',
                };
            }
            const result = await this.processor.processEmailFile(args.filePath, args.format, args.options);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }
    cleanup() {
        // Cleanup resources if needed
        this.removeAllListeners();
    }
    async start() {
        // Server startup logic
        console.log('Email Processor server started');
    }
}
// Start the server
const server = new EmailProcessorServer();
server.start().catch(console.error);
//# sourceMappingURL=server.js.map