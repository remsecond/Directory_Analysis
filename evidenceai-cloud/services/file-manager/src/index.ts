import express from 'express';
import { config } from './config';
import { middleware } from './middleware';
import { setupRoutes } from './routes';
import { initializeBucket } from './storage';
import { logger } from './utils/logger';

const app = express();

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middleware.requestId);
app.use(middleware.morganMiddleware);
app.use(middleware.corsMiddleware);
app.use(middleware.securityHeaders);
app.use(middleware.compressionMiddleware);
app.use(middleware.requestLogger);

// Setup routes
const router = express.Router();
setupRoutes(router);
app.use(router);

// Error handling middleware should be last
app.use(middleware.errorHandler);

// Initialize server
const startServer = async () => {
  try {
    // Initialize MinIO bucket
    await initializeBucket();

    // Start server
    app.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`, {
        port: config.PORT,
        env: config.NODE_ENV,
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection:', error);
  process.exit(1);
});

// Start server
if (require.main === module) {
  startServer();
}

// Export for testing
export { app, startServer };
