"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConfig = exports.createTestFiles = exports.getFileContent = exports.fileExists = exports.wait = exports.generateRandomContent = exports.createTestFile = void 0;
const config_1 = require("../config");
const storage_1 = require("../storage");
// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.MINIO_BUCKET = 'test-bucket';
// Setup function to run before all tests
beforeAll(async () => {
    const minioClient = (0, storage_1.getMinioClient)();
    try {
        // Create test bucket if it doesn't exist
        const bucketExists = await minioClient.bucketExists(config_1.config.MINIO_BUCKET);
        if (!bucketExists) {
            await minioClient.makeBucket(config_1.config.MINIO_BUCKET, 'us-east-1');
        }
    }
    catch (error) {
        console.error('Error setting up test environment:', error);
        throw error;
    }
});
// Cleanup function to run after all tests
afterAll(async () => {
    const minioClient = (0, storage_1.getMinioClient)();
    try {
        // Remove all objects from test bucket
        const objectsList = await minioClient.listObjects(config_1.config.MINIO_BUCKET, '', true);
        for await (const obj of objectsList) {
            if (obj.name) {
                await minioClient.removeObject(config_1.config.MINIO_BUCKET, obj.name);
            }
        }
        // Remove test bucket
        await minioClient.removeBucket(config_1.config.MINIO_BUCKET);
    }
    catch (error) {
        console.error('Error cleaning up test environment:', error);
        throw error;
    }
});
// Reset mocks before each test
beforeEach(() => {
    jest.resetAllMocks();
});
// Global test timeout
jest.setTimeout(30000);
// Mock console methods to reduce noise in test output
global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
// Helper function to create test files
const createTestFile = (name, content) => ({
    fieldname: 'file',
    originalname: name,
    encoding: '7bit',
    mimetype: 'text/plain',
    buffer: Buffer.from(content),
    size: Buffer.from(content).length,
    destination: '',
    filename: name,
    path: '',
    stream: null,
});
exports.createTestFile = createTestFile;
// Helper function to generate random file content
const generateRandomContent = (size = 1024) => {
    return Array(size)
        .fill(0)
        .map(() => Math.random().toString(36).charAt(2))
        .join('');
};
exports.generateRandomContent = generateRandomContent;
// Helper function to wait for a specified time
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
exports.wait = wait;
// Helper function to check if a file exists in MinIO
const fileExists = async (objectName) => {
    const minioClient = (0, storage_1.getMinioClient)();
    try {
        await minioClient.statObject(config_1.config.MINIO_BUCKET, objectName);
        return true;
    }
    catch (error) {
        return false;
    }
};
exports.fileExists = fileExists;
// Helper function to get file content from MinIO
const getFileContent = async (objectName) => {
    const minioClient = (0, storage_1.getMinioClient)();
    const stream = await minioClient.getObject(config_1.config.MINIO_BUCKET, objectName);
    return new Promise((resolve, reject) => {
        let content = '';
        stream.on('data', (chunk) => {
            content += chunk;
        });
        stream.on('end', () => {
            resolve(content);
        });
        stream.on('error', (error) => {
            reject(error);
        });
    });
};
exports.getFileContent = getFileContent;
// Helper function to create multiple test files
const createTestFiles = (count) => {
    return Array(count)
        .fill(0)
        .map((_, index) => {
        const content = (0, exports.generateRandomContent)();
        return (0, exports.createTestFile)(`test-file-${index + 1}.txt`, content);
    });
};
exports.createTestFiles = createTestFiles;
// Export test configuration
exports.testConfig = {
    MINIO_BUCKET: config_1.config.MINIO_BUCKET,
    MAX_FILE_SIZE: 1024 * 1024, // 1MB
    ALLOWED_FILE_TYPES: ['text/plain', 'application/json'],
};
//# sourceMappingURL=setup.js.map