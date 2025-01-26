# File Manager Service

A microservice for managing file storage and metadata using MinIO as the storage backend.

## Features

- File upload with metadata support
- File download
- File deletion
- File listing
- Metadata management (get/update)
- Health check endpoint
- Comprehensive error handling
- Request logging
- CORS support
- Compression
- Security headers

## Prerequisites

- Node.js 18 or higher
- MinIO server running locally or accessible
- TypeScript 5.x
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd evidenceai-cloud/services/file-manager
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the environment variables in `.env` with your configuration.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment (development/test/production) | development |
| CORS_ORIGIN | CORS allowed origin | * |
| MINIO_ENDPOINT | MinIO server endpoint | localhost |
| MINIO_PORT | MinIO server port | 9000 |
| MINIO_USE_SSL | Use SSL for MinIO connection | false |
| MINIO_ACCESS_KEY | MinIO access key | - |
| MINIO_SECRET_KEY | MinIO secret key | - |
| MINIO_BUCKET | MinIO bucket name | files |
| LOG_LEVEL | Logging level | info |
| MAX_FILE_SIZE | Maximum file size in bytes | 52428800 (50MB) |
| ALLOWED_FILE_TYPES | Allowed MIME types | */* |

## API Endpoints

### Health Check
- `GET /health`
  - Returns server health status

### File Operations
- `POST /api/v1/files`
  - Upload a file with optional metadata
  - Multipart form data with 'file' field and optional 'metadata' field (JSON string)

- `GET /api/v1/files`
  - List all files

- `GET /api/v1/files/:objectName`
  - Download a specific file

- `DELETE /api/v1/files/:objectName`
  - Delete a specific file

### Metadata Operations
- `GET /api/v1/files/:objectName/metadata`
  - Get metadata for a specific file

- `PUT /api/v1/files/:objectName/metadata`
  - Update metadata for a specific file
  - Request body: JSON object with metadata key-value pairs

## Development

Start the development server:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

Run linting:
```bash
npm run lint
```

Build for production:
```bash
npm run build
```

## Testing

The service includes comprehensive tests using Jest and Supertest. Tests cover:
- API endpoints
- File operations
- Metadata operations
- Error handling
- Edge cases

Run tests with coverage:
```bash
npm run test:coverage
```

## Error Handling

The service includes robust error handling for:
- File size limits
- Invalid file types
- Missing files
- Invalid metadata
- Storage service errors
- Network errors

## Logging

Uses Winston for structured logging with:
- Console output in development
- File output in production
- Request/response logging
- Error logging with stack traces
- Custom log levels

## Security

- Helmet for security headers
- CORS configuration
- File type validation
- Size limits
- Request validation
- Error message sanitization in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
