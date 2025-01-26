"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const auto_organizer_js_1 = require("./auto-organizer.js");
const url_1 = require("url");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
const app = (0, express_1.default)();
const port = 3000;
const organizer = new auto_organizer_js_1.AutoOrganizer();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'Web')));
// Create required directories
const promises_1 = __importDefault(require("fs/promises"));
const inputDir = path_1.default.join(process.cwd(), 'input', 'documents');
const outputDir = path_1.default.join(process.cwd(), 'output', 'organized');
async function ensureDirectories() {
    try {
        await promises_1.default.mkdir(inputDir, { recursive: true });
        await promises_1.default.mkdir(outputDir, { recursive: true });
    }
    catch (err) {
        console.error('Error creating directories:', err);
    }
}
// Routes
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'Web', 'index.html'));
});
app.post('/organize', async (req, res) => {
    try {
        await ensureDirectories();
        const result = await organizer.organizeDocuments(inputDir, outputDir, true, // recursive
        true // updateSheet
        );
        res.json(result);
    }
    catch (error) {
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
//# sourceMappingURL=web-server.js.map