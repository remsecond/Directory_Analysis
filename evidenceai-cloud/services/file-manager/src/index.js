"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const routes_1 = require("./routes");
const storage_1 = require("./storage");
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
exports.app = app;
// Apply middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(middleware_1.middleware.requestId);
app.use(middleware_1.middleware.morganMiddleware);
app.use(middleware_1.middleware.corsMiddleware);
app.use(middleware_1.middleware.securityHeaders);
app.use(middleware_1.middleware.compressionMiddleware);
app.use(middleware_1.middleware.requestLogger);
// Setup routes
const router = express_1.default.Router();
(0, routes_1.setupRoutes)(router);
app.use(router);
// Error handling middleware should be last
app.use(middleware_1.middleware.errorHandler);
// Initialize server
const startServer = async () => {
    try {
        // Initialize MinIO bucket
        await (0, storage_1.initializeBucket)();
        // Start server
        app.listen(config_1.config.PORT, () => {
            logger_1.logger.info(`Server running on port ${config_1.config.PORT}`, {
                port: config_1.config.PORT,
                env: config_1.config.NODE_ENV,
            });
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
exports.startServer = startServer;
// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (error) => {
    logger_1.logger.error('Unhandled rejection:', error);
    process.exit(1);
});
// Start server
if (require.main === module) {
    startServer();
}
//# sourceMappingURL=index.js.map