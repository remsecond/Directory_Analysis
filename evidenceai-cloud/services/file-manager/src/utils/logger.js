"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logResponse = exports.logRequest = exports.logError = exports.createChildLogger = exports.stream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const config_1 = require("../config");
// Define log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
// Create logger instance
exports.logger = winston_1.default.createLogger({
    level: config_1.config.LOG_LEVEL,
    format: logFormat,
    defaultMeta: { service: 'file-manager' },
    transports: [
        // Write all logs to console
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
        }),
    ],
});
// Add file transports in production
if (config_1.config.NODE_ENV === 'production') {
    exports.logger.add(new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }));
    exports.logger.add(new winston_1.default.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }));
}
// Create a stream object for Morgan
exports.stream = {
    write: (message) => {
        exports.logger.info(message.trim());
    },
};
// Export a function to create child loggers with additional context
const createChildLogger = (context) => {
    return exports.logger.child(context);
};
exports.createChildLogger = createChildLogger;
// Export helper functions for common logging patterns
const logError = (error, context) => {
    const logContext = {
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
        },
        ...context,
    };
    exports.logger.error(error.message, logContext);
};
exports.logError = logError;
const logRequest = (req, context) => {
    const logContext = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        query: req.query,
        params: req.params,
        body: req.body,
        ...context,
    };
    exports.logger.info('Incoming request', logContext);
};
exports.logRequest = logRequest;
const logResponse = (res, responseTime, context) => {
    const logContext = {
        statusCode: res.statusCode,
        responseTime,
        ...context,
    };
    exports.logger.info('Outgoing response', logContext);
};
exports.logResponse = logResponse;
// Export default logger instance
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map