import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { config } from './config';
import { logger, logRequest, logResponse } from './utils/logger';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';

// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE, // Max file size in bytes
  },
  fileFilter: (req, file, cb) => {
    if (config.ALLOWED_FILE_TYPES === '*/*') {
      cb(null, true);
      return;
    }

    const allowedTypes = config.ALLOWED_FILE_TYPES.split(',').map((type) =>
      type.trim()
    );
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

// Error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error handling request:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        message: `File size cannot exceed ${config.MAX_FILE_SIZE} bytes`,
      });
    }
    return res.status(400).json({
      error: 'File upload error',
      message: err.message,
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: config.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
};

// Request logging middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  logRequest(req);

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logResponse(res, duration);
  });

  next();
};

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: false, // Disable CSP for file downloads
});

// CORS middleware
export const corsMiddleware = cors({
  origin: config.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'], // For file downloads
  credentials: true,
  maxAge: 600, // 10 minutes
});

// Compression middleware
export const compressionMiddleware = compression({
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter function from the module
    return compression.filter(req, res);
  },
  threshold: 0, // Compress all responses
});

// Request ID middleware
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  req.id = Math.random().toString(36).substring(2, 15);
  res.setHeader('X-Request-ID', req.id);
  next();
};

// Morgan logging middleware
export const morganMiddleware = morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

// Export all middleware
export const middleware = {
  errorHandler,
  requestLogger,
  securityHeaders,
  corsMiddleware,
  compressionMiddleware,
  requestId,
  morganMiddleware,
};

// Extend Express Request type to include id
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
