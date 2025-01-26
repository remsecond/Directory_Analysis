import { config } from '../config';
import { getMinioClient } from '../storage';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.MINIO_BUCKET = 'test-bucket';

// Setup function to run before all tests
beforeAll(async () => {
  const minioClient = getMinioClient();

  try {
    // Create test bucket if it doesn't exist
    const bucketExists = await minioClient.bucketExists(config.MINIO_BUCKET);
    if (!bucketExists) {
      await minioClient.makeBucket(config.MINIO_BUCKET, 'us-east-1');
    }
  } catch (error) {
    console.error('Error setting up test environment:', error);
    throw error;
  }
});

// Cleanup function to run after all tests
afterAll(async () => {
  const minioClient = getMinioClient();

  try {
    // Remove all objects from test bucket
    const objectsList = await minioClient.listObjects(config.MINIO_BUCKET, '', true);
    for await (const obj of objectsList) {
      if (obj.name) {
        await minioClient.removeObject(config.MINIO_BUCKET, obj.name);
      }
    }

    // Remove test bucket
    await minioClient.removeBucket(config.MINIO_BUCKET);
  } catch (error) {
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
export const createTestFile = (name: string, content: string): Express.Multer.File => ({
  fieldname: 'file',
  originalname: name,
  encoding: '7bit',
  mimetype: 'text/plain',
  buffer: Buffer.from(content),
  size: Buffer.from(content).length,
  destination: '',
  filename: name,
  path: '',
  stream: null as any,
});

// Helper function to generate random file content
export const generateRandomContent = (size: number = 1024): string => {
  return Array(size)
    .fill(0)
    .map(() => Math.random().toString(36).charAt(2))
    .join('');
};

// Helper function to wait for a specified time
export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to check if a file exists in MinIO
export const fileExists = async (objectName: string): Promise<boolean> => {
  const minioClient = getMinioClient();
  try {
    await minioClient.statObject(config.MINIO_BUCKET, objectName);
    return true;
  } catch (error) {
    return false;
  }
};

// Helper function to get file content from MinIO
export const getFileContent = async (objectName: string): Promise<string> => {
  const minioClient = getMinioClient();
  const stream = await minioClient.getObject(config.MINIO_BUCKET, objectName);
  
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

// Helper function to create multiple test files
export const createTestFiles = (count: number): Express.Multer.File[] => {
  return Array(count)
    .fill(0)
    .map((_, index) => {
      const content = generateRandomContent();
      return createTestFile(`test-file-${index + 1}.txt`, content);
    });
};

// Export test configuration
export const testConfig = {
  MINIO_BUCKET: config.MINIO_BUCKET,
  MAX_FILE_SIZE: 1024 * 1024, // 1MB
  ALLOWED_FILE_TYPES: ['text/plain', 'application/json'],
};
