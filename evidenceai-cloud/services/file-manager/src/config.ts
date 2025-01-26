import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

interface Config {
  // Server configuration
  NODE_ENV: string;
  PORT: number;
  CORS_ORIGIN: string;

  // MinIO configuration
  MINIO_ENDPOINT: string;
  MINIO_PORT: number;
  MINIO_USE_SSL: boolean;
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
  MINIO_BUCKET: string;

  // File upload configuration
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string;

  // Logging configuration
  LOG_LEVEL: string;
  LOG_DIR: string;
}

// Default configuration values
const defaultConfig: Config = {
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
  LOG_DIR: path.join(process.cwd(), 'logs'),
};

// Load configuration from environment variables
export const config: Config = {
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

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar] && !defaultConfig[envVar as keyof Config]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }

  // Validate port number
  if (isNaN(config.PORT) || config.PORT <= 0) {
    throw new Error('Invalid PORT configuration');
  }

  // Validate MinIO port
  if (isNaN(config.MINIO_PORT) || config.MINIO_PORT <= 0) {
    throw new Error('Invalid MINIO_PORT configuration');
  }

  // Validate max file size
  if (isNaN(config.MAX_FILE_SIZE) || config.MAX_FILE_SIZE <= 0) {
    throw new Error('Invalid MAX_FILE_SIZE configuration');
  }
};

// Run validation
validateConfig();

export default config;
