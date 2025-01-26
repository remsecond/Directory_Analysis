import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile(path.join(projectRoot, 'browser-test.html'), 'utf8', (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading test page');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`Test server running at http://localhost:${port}`);
});
