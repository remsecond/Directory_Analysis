"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env file
dotenv_1.default.config();
// Default configuration values
const defaultConfig = {
    NODE_ENV: 'development',
    PORT: 3000,
    CORS_ORIGIN: '*',
    MINIO_ENDPOINT: 'localhost',
    MINIO_PORT: 9000,
    MINIO_USE_SSL: false,
    MINIO_ACCESS_KEY: 'minioadmin',
    MINIO_SECRET_KEY: 'minioadmin',
    MINIO_BUCKET: 'files',
    MAX_FILE_SIZE: 52428800, // 50MB
    ALLOWED_FILE_TYPES: '*/*',
    LOG_LEVEL: 'info',
    LOG_DIR: path_1.default.join(process.cwd(), 'logs'),
};
// Load configuration from environment variables
exports.config = {
    NODE_ENV: process.env.NODE_ENV || defaultConfig.NODE_ENV,
    PORT: parseInt(process.env.PORT || String(defaultConfig.PORT), 10),
    CORS_ORIGIN: process.env.CORS_ORIGIN || defaultConfig.CORS_ORIGIN,
    MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || defaultConfig.MINIO_ENDPOINT,
    MINIO_PORT: parseInt(process.env.MINIO_PORT || String(defaultConfig.MINIO_PORT), 10),
    MINIO_USE_SSL: process.env.MINIO_USE_SSL === 'true' || defaultConfig.MINIO_USE_SSL,
    MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY || defaultConfig.MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY || defaultConfig.MINIO_SECRET_KEY,
    MINIO_BUCKET: process.env.MINIO_BUCKET || defaultConfig.MINIO_BUCKET,
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || String(defaultConfig.MAX_FILE_SIZE), 10),
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || defaultConfig.ALLOWED_FILE_TYPES,
    LOG_LEVEL: process.env.LOG_LEVEL || defaultConfig.LOG_LEVEL,
    LOG_DIR: process.env.LOG_DIR || defaultConfig.LOG_DIR,
};
// Validate required configuration
const validateConfig = () => {
    const requiredEnvVars = [
        'MINIO_ACCESS_KEY',
        'MINIO_SECRET_KEY',
        'MINIO_BUCKET',
    ];
    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar] && !defaultConfig[envVar]);
    if (missingEnvVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }
    // Validate port number
    if (isNaN(exports.config.PORT) || exports.config.PORT <= 0) {
        throw new Error('Invalid PORT configuration');
    }
    // Validate MinIO port
    if (isNaN(exports.config.MINIO_PORT) || exports.config.MINIO_PORT <= 0) {
        throw new Error('Invalid MINIO_PORT configuration');
    }
    // Validate max file size
    if (isNaN(exports.config.MAX_FILE_SIZE) || exports.config.MAX_FILE_SIZE <= 0) {
        throw new Error('Invalid MAX_FILE_SIZE configuration');
    }
};
// Run validation
validateConfig();
exports.default = exports.config;
//# sourceMappingURL=config.js.map