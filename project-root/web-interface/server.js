const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB max file size
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use(express.json());

// Create uploads and output directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');

async function ensureDirectories() {
    try {
        await fs.mkdir(uploadsDir, { recursive: true });
        await fs.mkdir(outputDir, { recursive: true });
    } catch (err) {
        console.error('Error creating directories:', err);
    }
}

ensureDirectories();

// Routes
app.post('/convert', async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: 'No files were uploaded.' });
        }

        const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
        const styleTemplate = req.body.styleTemplate || 'default';
        const results = [];

        for (const file of files) {
            const uploadPath = path.join(uploadsDir, file.name);
            const outputPath = path.join(outputDir, `${path.parse(file.name).name}.pdf`);

            // Save uploaded file
            await file.mv(uploadPath);

            // Read file content
            const content = await fs.readFile(uploadPath, 'utf8');

            // Convert to PDF using Puppeteer
            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            // Get stylesheet content
            const stylePath = path.join(__dirname, 'styles', 'style-template.css');
            const stylesheet = await fs.readFile(stylePath, 'utf8');

            // Inject content and stylesheet
            await page.setContent(`
                <style>${stylesheet}</style>
                ${content}
            `);

            // Generate PDF
            await page.pdf({
                path: outputPath,
                format: 'A4',
                margin: {
                    top: '2cm',
                    right: '2cm',
                    bottom: '2cm',
                    left: '2cm'
                },
                printBackground: true
            });

            await browser.close();

            // Clean up uploaded file
            await fs.unlink(uploadPath);

            results.push({
                originalName: file.name,
                outputPath: outputPath,
                success: true
            });
        }

        res.json({
            message: 'Files converted successfully',
            results
        });

    } catch (err) {
        console.error('Error during conversion:', err);
        res.status(500).json({
            error: 'Error converting files',
            details: err.message
        });
    }
});

// Serve the converted PDF
app.get('/download/:filename', async (req, res) => {
    const filePath = path.join(outputDir, req.params.filename);
    try {
        await fs.access(filePath);
        res.download(filePath);
    } catch (err) {
        res.status(404).json({ error: 'File not found' });
    }
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
