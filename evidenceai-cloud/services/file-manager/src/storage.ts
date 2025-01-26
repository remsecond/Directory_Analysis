import { Client as MinioClient } from 'minio';
import { config } from './config';
import { logger } from './utils/logger';
import crypto from 'crypto';
import { Readable } from 'stream';

// Initialize MinIO client
const minioClient = new MinioClient({
  endPoint: config.MINIO_ENDPOINT,
  port: config.MINIO_PORT,
  useSSL: config.MINIO_USE_SSL,
  accessKey: config.MINIO_ACCESS_KEY,
  secretKey: config.MINIO_SECRET_KEY,
});

// Helper function to generate unique object name
const generateObjectName = (originalName: string): string => {
  const timestamp = Date.now();
  const hash = crypto
    .createHash('md5')
    .update(`${originalName}${timestamp}`)
    .digest('hex');
  const extension = originalName.split('.').pop();
  return `${hash}${extension ? `.${extension}` : ''}`;
};

// List all files in the bucket
export const listFiles = async () => {
  try {
    const objects: any[] = [];
    const stream = minioClient.listObjects(config.MINIO_BUCKET, '', true);

    for await (const obj of stream) {
      // Get object metadata
      const stat = await minioClient.statObject(
        config.MINIO_BUCKET,
        obj.name
      );

      objects.push({
        name: obj.name,
        size: obj.size,
        lastModified: obj.lastModified,
        metadata: stat.metaData,
      });
    }

    return objects;
  } catch (error) {
    logger.error('Error listing files:', error);
    throw error;
  }
};

// Upload a file to MinIO
export const uploadFile = async (
  file: Express.Multer.File,
  metadata?: Record<string, string>
) => {
  try {
    const objectName = generateObjectName(file.originalname);
    const metaData = {
      'Content-Type': file.mimetype,
      'Original-Name': file.originalname,
      ...metadata,
    };

    await minioClient.putObject(
      config.MINIO_BUCKET,
      objectName,
      file.buffer,
      file.size,
      metaData
    );

    logger.info('File uploaded successfully:', {
      objectName,
      originalName: file.originalname,
      size: file.size,
      metadata: metaData,
    });

    return objectName;
  } catch (error) {
    logger.error('Error uploading file:', error);
    throw error;
  }
};

// Download a file from MinIO
export const downloadFile = async (objectName: string): Promise<Readable> => {
  try {
    // Check if object exists
    await minioClient.statObject(config.MINIO_BUCKET, objectName);
    return await minioClient.getObject(config.MINIO_BUCKET, objectName);
  } catch (error) {
    logger.error('Error downloading file:', error);
    throw error;
  }
};

// Delete a file from MinIO
export const deleteFile = async (objectName: string): Promise<void> => {
  try {
    await minioClient.removeObject(config.MINIO_BUCKET, objectName);
    logger.info('File deleted successfully:', { objectName });
  } catch (error) {
    logger.error('Error deleting file:', error);
    throw error;
  }
};

// Get file metadata
export const getFileMetadata = async (objectName: string) => {
  try {
    const stat = await minioClient.statObject(
      config.MINIO_BUCKET,
      objectName
    );
    return stat.metaData;
  } catch (error) {
    logger.error('Error getting file metadata:', error);
    throw error;
  }
};

// Update file metadata
export const updateFileMetadata = async (
  objectName: string,
  metadata: Record<string, string>
) => {
  try {
    // Get current object
    const stat = await minioClient.statObject(
      config.MINIO_BUCKET,
      objectName
    );

    // Copy object to itself with new metadata
    const copyConditions = new (minioClient as any).CopyConditions();
    await minioClient.copyObject(
      config.MINIO_BUCKET,
      objectName,
      `${config.MINIO_BUCKET}/${objectName}`,
      copyConditions,
      {
        ...stat.metaData,
        ...metadata,
      }
    );

    logger.info('File metadata updated successfully:', {
      objectName,
      metadata,
    });
  } catch (error) {
    logger.error('Error updating file metadata:', error);
    throw error;
  }
};

// Initialize bucket if it doesn't exist
export const initializeBucket = async () => {
  try {
    const bucketExists = await minioClient.bucketExists(config.MINIO_BUCKET);
    if (!bucketExists) {
      await minioClient.makeBucket(config.MINIO_BUCKET, 'us-east-1');
      logger.info('Bucket created successfully:', { bucket: config.MINIO_BUCKET });
    }
  } catch (error) {
    logger.error('Error initializing bucket:', error);
    throw error;
  }
};

// Export MinIO client for testing
export const getMinioClient = () => minioClient;
