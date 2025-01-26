"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
const storage_1 = require("../storage");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../config");
describe('File Manager API', () => {
    const minioClient = (0, storage_1.getMinioClient)();
    const testFilePath = path_1.default.join(__dirname, 'fixtures', 'test.txt');
    const testFileContent = 'Test file content';
    beforeAll(async () => {
        // Create test file
        if (!fs_1.default.existsSync(path_1.default.dirname(testFilePath))) {
            fs_1.default.mkdirSync(path_1.default.dirname(testFilePath), { recursive: true });
        }
        fs_1.default.writeFileSync(testFilePath, testFileContent);
        // Ensure test bucket exists
        const bucketExists = await minioClient.bucketExists(config_1.config.MINIO_BUCKET);
        if (!bucketExists) {
            await minioClient.makeBucket(config_1.config.MINIO_BUCKET, 'us-east-1');
        }
    });
    afterAll(async () => {
        // Clean up test file
        if (fs_1.default.existsSync(testFilePath)) {
            fs_1.default.unlinkSync(testFilePath);
        }
        // Clean up test bucket
        const objectsList = await minioClient.listObjects(config_1.config.MINIO_BUCKET, '', true);
        for await (const obj of objectsList) {
            if (obj.name) {
                await minioClient.removeObject(config_1.config.MINIO_BUCKET, obj.name);
            }
        }
    });
    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await (0, supertest_1.default)(index_1.app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ status: 'ok' });
        });
    });
    describe('POST /api/v1/files', () => {
        it('should upload a file successfully', async () => {
            const response = await (0, supertest_1.default)(index_1.app)
                .post('/api/v1/files')
                .attach('file', testFilePath)
                .field('metadata', JSON.stringify({ test: 'value' }));
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('objectName');
            expect(response.body).toHaveProperty('message', 'File uploaded successfully');
        });
        it('should return 400 when no file is provided', async () => {
            const response = await (0, supertest_1.default)(index_1.app).post('/api/v1/files');
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Bad request');
            expect(response.body).toHaveProperty('message', 'No file provided');
        });
    });
    describe('GET /api/v1/files', () => {
        it('should list files', async () => {
            // Upload a test file first
            const uploadResponse = await (0, supertest_1.default)(index_1.app)
                .post('/api/v1/files')
                .attach('file', testFilePath);
            const response = await (0, supertest_1.default)(index_1.app).get('/api/v1/files');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('files');
            expect(Array.isArray(response.body.files)).toBe(true);
            expect(response.body.files.length).toBeGreaterThan(0);
        });
    });
    describe('GET /api/v1/files/:objectName', () => {
        it('should download a file', async () => {
            // Upload a test file first
            const uploadResponse = await (0, supertest_1.default)(index_1.app)
                .post('/api/v1/files')
                .attach('file', testFilePath);
            const objectName = uploadResponse.body.objectName;
            const response = await (0, supertest_1.default)(index_1.app).get(`/api/v1/files/${objectName}`);
            expect(response.status).toBe(200);
            expect(response.text).toBe(testFileContent);
        });
        it('should return 404 for non-existent file', async () => {
            const response = await (0, supertest_1.default)(index_1.app).get('/api/v1/files/nonexistent');
            expect(response.status).toBe(404);
        });
    });
    describe('DELETE /api/v1/files/:objectName', () => {
        it('should delete a file', async () => {
            // Upload a test file first
            const uploadResponse = await (0, supertest_1.default)(index_1.app)
                .post('/api/v1/files')
                .attach('file', testFilePath);
            const objectName = uploadResponse.body.objectName;
            const response = await (0, supertest_1.default)(index_1.app).delete(`/api/v1/files/${objectName}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'File deleted successfully');
        });
    });
    describe('GET /api/v1/files/:objectName/metadata', () => {
        it('should get file metadata', async () => {
            // Upload a test file with metadata
            const metadata = { test: 'value' };
            const uploadResponse = await (0, supertest_1.default)(index_1.app)
                .post('/api/v1/files')
                .attach('file', testFilePath)
                .field('metadata', JSON.stringify(metadata));
            const objectName = uploadResponse.body.objectName;
            const response = await (0, supertest_1.default)(index_1.app).get(`/api/v1/files/${objectName}/metadata`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('metadata');
            expect(response.body.metadata).toHaveProperty('test', 'value');
        });
    });
    describe('PUT /api/v1/files/:objectName/metadata', () => {
        it('should update file metadata', async () => {
            // Upload a test file first
            const uploadResponse = await (0, supertest_1.default)(index_1.app)
                .post('/api/v1/files')
                .attach('file', testFilePath);
            const objectName = uploadResponse.body.objectName;
            const newMetadata = { test: 'updated' };
            const response = await (0, supertest_1.default)(index_1.app)
                .put(`/api/v1/files/${objectName}/metadata`)
                .send(newMetadata);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Metadata updated successfully');
            // Verify metadata was updated
            const metadataResponse = await (0, supertest_1.default)(index_1.app).get(`/api/v1/files/${objectName}/metadata`);
            expect(metadataResponse.body.metadata).toHaveProperty('test', 'updated');
        });
    });
});
//# sourceMappingURL=routes.test.js.map