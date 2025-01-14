import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Serve static files from Web directory
app.use(express.static(path.join(__dirname, '..', 'Web')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Serve mission-control.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Web', 'mission-control.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Web server running at http://localhost:${port}`);
});
