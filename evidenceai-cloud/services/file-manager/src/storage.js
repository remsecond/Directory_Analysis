"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMinioClient = exports.initializeBucket = exports.updateFileMetadata = exports.getFileMetadata = exports.deleteFile = exports.downloadFile = exports.uploadFile = exports.listFiles = void 0;
const minio_1 = require("minio");
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const crypto_1 = __importDefault(require("crypto"));
// Initialize MinIO client
const minioClient = new minio_1.Client({
    endPoint: config_1.config.MINIO_ENDPOINT,
    port: config_1.config.MINIO_PORT,
    useSSL: config_1.config.MINIO_USE_SSL,
    accessKey: config_1.config.MINIO_ACCESS_KEY,
    secretKey: config_1.config.MINIO_SECRET_KEY,
});
// Helper function to generate unique object name
const generateObjectName = (originalName) => {
    const timestamp = Date.now();
    const hash = crypto_1.default
        .createHash('md5')
        .update(`${originalName}${timestamp}`)
        .digest('hex');
    const extension = originalName.split('.').pop();
    return `${hash}${extension ? `.${extension}` : ''}`;
};
// List all files in the bucket
const listFiles = async () => {
    try {
        const objects = [];
        const stream = minioClient.listObjects(config_1.config.MINIO_BUCKET, '', true);
        for await (const obj of stream) {
            // Get object metadata
            const stat = await minioClient.statObject(config_1.config.MINIO_BUCKET, obj.name);
            objects.push({
                name: obj.name,
                size: obj.size,
                lastModified: obj.lastModified,
                metadata: stat.metaData,
            });
        }
        return objects;
    }
    catch (error) {
        logger_1.logger.error('Error listing files:', error);
        throw error;
    }
};
exports.listFiles = listFiles;
// Upload a file to MinIO
const uploadFile = async (file, metadata) => {
    try {
        const objectName = generateObjectName(file.originalname);
        const metaData = {
            'Content-Type': file.mimetype,
            'Original-Name': file.originalname,
            ...metadata,
        };
        await minioClient.putObject(config_1.config.MINIO_BUCKET, objectName, file.buffer, file.size, metaData);
        logger_1.logger.info('File uploaded successfully:', {
            objectName,
            originalName: file.originalname,
            size: file.size,
            metadata: metaData,
        });
        return objectName;
    }
    catch (error) {
        logger_1.logger.error('Error uploading file:', error);
        throw error;
    }
};
exports.uploadFile = uploadFile;
// Download a file from MinIO
const downloadFile = async (objectName) => {
    try {
        // Check if object exists
        await minioClient.statObject(config_1.config.MINIO_BUCKET, objectName);
        return await minioClient.getObject(config_1.config.MINIO_BUCKET, objectName);
    }
    catch (error) {
        logger_1.logger.error('Error downloading file:', error);
        throw error;
    }
};
exports.downloadFile = downloadFile;
// Delete a file from MinIO
const deleteFile = async (objectName) => {
    try {
        await minioClient.removeObject(config_1.config.MINIO_BUCKET, objectName);
        logger_1.logger.info('File deleted successfully:', { objectName });
    }
    catch (error) {
        logger_1.logger.error('Error deleting file:', error);
        throw error;
    }
};
exports.deleteFile = deleteFile;
// Get file metadata
const getFileMetadata = async (objectName) => {
    try {
        const stat = await minioClient.statObject(config_1.config.MINIO_BUCKET, objectName);
        return stat.metaData;
    }
    catch (error) {
        logger_1.logger.error('Error getting file metadata:', error);
        throw error;
    }
};
exports.getFileMetadata = getFileMetadata;
// Update file metadata
const updateFileMetadata = async (objectName, metadata) => {
    try {
        // Get current object
        const stat = await minioClient.statObject(config_1.config.MINIO_BUCKET, objectName);
        // Copy object to itself with new metadata
        const copyConditions = new minioClient.CopyConditions();
        await minioClient.copyObject(config_1.config.MINIO_BUCKET, objectName, `${config_1.config.MINIO_BUCKET}/${objectName}`, copyConditions, {
            ...stat.metaData,
            ...metadata,
        });
        logger_1.logger.info('File metadata updated successfully:', {
            objectName,
            metadata,
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating file metadata:', error);
        throw error;
    }
};
exports.updateFileMetadata = updateFileMetadata;
// Initialize bucket if it doesn't exist
const initializeBucket = async () => {
    try {
        const bucketExists = await minioClient.bucketExists(config_1.config.MINIO_BUCKET);
        if (!bucketExists) {
            await minioClient.makeBucket(config_1.config.MINIO_BUCKET, 'us-east-1');
            logger_1.logger.info('Bucket created successfully:', { bucket: config_1.config.MINIO_BUCKET });
        }
    }
    catch (error) {
        logger_1.logger.error('Error initializing bucket:', error);
        throw error;
    }
};
exports.initializeBucket = initializeBucket;
// Export MinIO client for testing
const getMinioClient = () => minioClient;
exports.getMinioClient = getMinioClient;
//# sourceMappingURL=storage.js.map