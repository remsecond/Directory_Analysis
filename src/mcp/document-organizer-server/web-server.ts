import express from 'express';
import path from 'path';
import { AutoOrganizer } from './auto-organizer.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const organizer = new AutoOrganizer();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Web')));

// Create required directories
import fs from 'fs/promises';
const inputDir = path.join(process.cwd(), 'input', 'documents');
const outputDir = path.join(process.cwd(), 'output', 'organized');

async function ensureDirectories() {
    try {
        await fs.mkdir(inputDir, { recursive: true });
        await fs.mkdir(outputDir, { recursive: true });
    } catch (err) {
        console.error('Error creating directories:', err);
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Web', 'index.html'));
});

app.post('/organize', async (req, res) => {
    try {
        await ensureDirectories();
        
        const result = await organizer.organizeDocuments(
            inputDir,
            outputDir,
            true, // recursive
            true  // updateSheet
        );

        res.json(result);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to organize documents'
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Document organizer web interface running at http://localhost:${port}`);
    ensureDirectories();
});
