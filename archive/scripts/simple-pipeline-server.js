import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfProcessor from '../src/services/pdf-processor.js';
import googleSheets from '../src/services/google-sheets.js';
import { getLogger } from '../src/utils/logging.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logger = getLogger();

// Configure multer for file uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(process.cwd(), 'uploads'));
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Create Express app
const app = express();

// Enable CORS
app.use(cors());

// Process PDF endpoint
app.post('/process', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        logger.info('Processing file:', req.file.originalname);

        // Process PDF
        const startTime = Date.now();
        const result = await pdfProcessor.processPdf(req.file.path);
        const processingTime = ((Date.now() - startTime) / 1000).toFixed(3);

        // Create document ID
        const docId = `DOC-${Date.now()}`;

        // Track in Google Sheets
        await googleSheets.addDocument({
            id: docId,
            fileName: req.file.originalname,
            type: 'PDF',
            pages: result.statistics.paragraphs || 0,
            wordCount: result.statistics.words || 0,
            processingTime: `${processingTime}s`,
            outputLocation: req.file.path
        });

        // Update document status
        await googleSheets.updateStatus(docId, {
            status: 'Processed',
            stage: 'Complete',
            message: 'Document processed successfully'
        });

        // Send response
        res.json({
            status: 'success',
            id: docId,
            statistics: result.statistics,
            raw_content: {
                chunks: result.raw_content.chunks
            },
            processing_meta: {
                processingTime: `${processingTime}s`,
                timestamp: new Date().toISOString()
            }
        });

        logger.info('Processing complete:', docId);
    } catch (error) {
        logger.error('Processing error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Internal server error'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Server error:', err);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    logger.warn('404 Not Found:', req.url);
    res.status(404).json({
        status: 'error',
        message: 'Not found'
    });
});

// Start server
const port = 3002;
app.listen(port, () => {
    logger.info(`Pipeline server running on port ${port}`);
});
