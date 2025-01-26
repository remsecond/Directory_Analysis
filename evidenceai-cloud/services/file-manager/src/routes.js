"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
const storage_1 = require("./storage");
const middleware_1 = require("./middleware");
const logger_1 = require("./utils/logger");
const setupRoutes = (router) => {
    // Health check endpoint
    router.get('/health', (req, res) => {
        res.json({ status: 'ok' });
    });
    // List all files
    router.get('/api/v1/files', async (req, res) => {
        try {
            const files = await (0, storage_1.listFiles)();
            res.json({ files });
        }
        catch (error) {
            (0, logger_1.logError)(error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to list files',
            });
        }
    });
    // Upload file with optional metadata
    router.post('/api/v1/files', middleware_1.upload.single('file'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: 'Bad request',
                    message: 'No file provided',
                });
            }
            let metadata = {};
            if (req.body.metadata) {
                try {
                    metadata = JSON.parse(req.body.metadata);
                }
                catch (error) {
                    return res.status(400).json({
                        error: 'Bad request',
                        message: 'Invalid metadata format',
                    });
                }
            }
            const objectName = await (0, storage_1.uploadFile)(req.file, metadata);
            res.status(201).json({
                message: 'File uploaded successfully',
                objectName,
            });
        }
        catch (error) {
            (0, logger_1.logError)(error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to upload file',
            });
        }
    });
    // Download file
    router.get('/api/v1/files/:objectName', async (req, res) => {
        try {
            const stream = await (0, storage_1.downloadFile)(req.params.objectName);
            res.setHeader('Content-Disposition', `attachment; filename=${req.params.objectName}`);
            stream.pipe(res);
        }
        catch (error) {
            (0, logger_1.logError)(error);
            res.status(404).json({
                error: 'Not found',
                message: 'File not found',
            });
        }
    });
    // Delete file
    router.delete('/api/v1/files/:objectName', async (req, res) => {
        try {
            await (0, storage_1.deleteFile)(req.params.objectName);
            res.json({
                message: 'File deleted successfully',
            });
        }
        catch (error) {
            (0, logger_1.logError)(error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to delete file',
            });
        }
    });
    // Get file metadata
    router.get('/api/v1/files/:objectName/metadata', async (req, res) => {
        try {
            const metadata = await (0, storage_1.getFileMetadata)(req.params.objectName);
            res.json({ metadata });
        }
        catch (error) {
            (0, logger_1.logError)(error);
            res.status(404).json({
                error: 'Not found',
                message: 'File not found',
            });
        }
    });
    // Update file metadata
    router.put('/api/v1/files/:objectName/metadata', async (req, res) => {
        try {
            if (!req.body || typeof req.body !== 'object') {
                return res.status(400).json({
                    error: 'Bad request',
                    message: 'Invalid metadata format',
                });
            }
            await (0, storage_1.updateFileMetadata)(req.params.objectName, req.body);
            res.json({
                message: 'Metadata updated successfully',
            });
        }
        catch (error) {
            (0, logger_1.logError)(error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to update metadata',
            });
        }
    });
    // Error handling for undefined routes
    router.use((req, res) => {
        res.status(404).json({
            error: 'Not found',
            message: 'Route not found',
        });
    });
    return router;
};
exports.setupRoutes = setupRoutes;
//# sourceMappingURL=routes.js.map