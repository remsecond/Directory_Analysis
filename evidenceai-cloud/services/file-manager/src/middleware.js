"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.middleware = exports.morganMiddleware = exports.requestId = exports.compressionMiddleware = exports.corsMiddleware = exports.securityHeaders = exports.requestLogger = exports.errorHandler = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
// Configure multer for file uploads
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: config_1.config.MAX_FILE_SIZE, // Max file size in bytes
    },
    fileFilter: (req, file, cb) => {
        if (config_1.config.ALLOWED_FILE_TYPES === '*/*') {
            cb(null, true);
            return;
        }
        const allowedTypes = config_1.config.ALLOWED_FILE_TYPES.split(',').map((type) => type.trim());
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`File type ${file.mimetype} is not allowed`));
        }
    },
});
// Error handling middleware
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error('Error handling request:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                error: 'File too large',
                message: `File size cannot exceed ${config_1.config.MAX_FILE_SIZE} bytes`,
            });
        }
        return res.status(400).json({
            error: 'File upload error',
            message: err.message,
        });
    }
    res.status(500).json({
        error: 'Internal server error',
        message: config_1.config.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    });
};
exports.errorHandler = errorHandler;
// Request logging middleware
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    (0, logger_1.logRequest)(req);
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        (0, logger_1.logResponse)(res, duration);
    });
    next();
};
exports.requestLogger = requestLogger;
// Security headers middleware
exports.securityHeaders = (0, helmet_1.default)({
    contentSecurityPolicy: false, // Disable CSP for file downloads
});
// CORS middleware
exports.corsMiddleware = (0, cors_1.default)({
    origin: config_1.config.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'], // For file downloads
    credentials: true,
    maxAge: 600, // 10 minutes
});
// Compression middleware
exports.compressionMiddleware = (0, compression_1.default)({
    filter: (req, res) => {
        // Don't compress responses with this request header
        if (req.headers['x-no-compression']) {
            return false;
        }
        // Use compression filter function from the module
        return compression_1.default.filter(req, res);
    },
    threshold: 0, // Compress all responses
});
// Request ID middleware
const requestId = (req, res, next) => {
    req.id = Math.random().toString(36).substring(2, 15);
    res.setHeader('X-Request-ID', req.id);
    next();
};
exports.requestId = requestId;
// Morgan logging middleware
exports.morganMiddleware = (0, morgan_1.default)('combined', {
    stream: {
        write: (message) => logger_1.logger.info(message.trim()),
    },
});
// Export all middleware
exports.middleware = {
    errorHandler: exports.errorHandler,
    requestLogger: exports.requestLogger,
    securityHeaders: exports.securityHeaders,
    corsMiddleware: exports.corsMiddleware,
    compressionMiddleware: exports.compressionMiddleware,
    requestId: exports.requestId,
    morganMiddleware: exports.morganMiddleware,
};
//# sourceMappingURL=middleware.js.map