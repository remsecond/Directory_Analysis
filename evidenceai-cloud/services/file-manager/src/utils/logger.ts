import winston from 'winston';
import { config } from '../config';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'file-manager' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Add file transports in production
if (config.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Export a function to create child loggers with additional context
export const createChildLogger = (context: Record<string, unknown>) => {
  return logger.child(context);
};

// Export helper functions for common logging patterns
export const logError = (error: Error, context?: Record<string, unknown>) => {
  const logContext = {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  };
  logger.error(error.message, logContext);
};

export const logRequest = (req: any, context?: Record<string, unknown>) => {
  const logContext = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    params: req.params,
    body: req.body,
    ...context,
  };
  logger.info('Incoming request', logContext);
};

export const logResponse = (
  res: any,
  responseTime: number,
  context?: Record<string, unknown>
) => {
  const logContext = {
    statusCode: res.statusCode,
    responseTime,
    ...context,
  };
  logger.info('Outgoing response', logContext);
};

// Export default logger instance
export default logger;
