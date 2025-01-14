import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import textProcessor from './src/services/text-processor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use relative paths
const uploadsDir = path.join(__dirname, 'uploads');
const processedDir = path.join(__dirname, 'processed');

// Create Express app
const app = express();

// Ensure directories exist
[uploadsDir, processedDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Add CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Status endpoint
app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        uploads_dir: uploadsDir,
        processed_dir: processedDir,
        supported_formats: ['txt']
    });
});

// Configure multer for file uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/plain') {
            cb(null, true);
        } else {
            cb(new Error('Only text files are supported at this time'));
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Process files endpoint
app.post('/process', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        console.log('Processing file:', req.file.originalname);
        const startTime = Date.now();

        // Process the file
        const result = await textProcessor.process(req.file.path);

        if (result.status === 'error') {
            throw new Error(result.message);
        }

        // Copy processed file to processed directory
        const destPath = path.join(processedDir, req.file.originalname);
        fs.copyFileSync(req.file.path, destPath);
        console.log(`Copied ${req.file.originalname} to ${destPath}`);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Add processing time to result
        result.processing_meta.processing_time = `${((Date.now() - startTime) / 1000).toFixed(3)}s`;

        res.json({
            ...result,
            destination: destPath
        });
        console.log('Processing complete');
    } catch (error) {
        console.error('Processing error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Internal server error',
            processing_meta: {
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            }
        });
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Uploads directory: ${uploadsDir}`);
    console.log(`Processed directory: ${processedDir}`);
});
