#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_js_1 = require("./server.js");
async function main() {
    const server = new server_js_1.DocumentOrganizerServer();
    // Handle shutdown gracefully
    process.on('SIGINT', async () => {
        console.error('Shutting down...');
        await server.stop();
        process.exit(0);
    });
    process.on('SIGTERM', async () => {
        console.error('Shutting down...');
        await server.stop();
        process.exit(0);
    });
    try {
        await server.start();
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map