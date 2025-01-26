"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFGenerator = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs/promises"));
class PDFGenerator {
    constructor() {
        // Set appropriate path based on operating system
        this.wkhtmltopdfPath = this.getWkhtmltopdfPath();
    }
    getWkhtmltopdfPath() {
        switch (os.platform()) {
            case 'win32':
                return 'C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe';
            case 'darwin':
                return '/usr/local/bin/wkhtmltopdf';
            default:
                return 'wkhtmltopdf';
        }
    }
    async createTempHtmlFile(content) {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'klein-'));
        const htmlPath = path.join(tempDir, 'temp.html');
        await fs.writeFile(htmlPath, content, 'utf8');
        return htmlPath;
    }
    async generatePDF(content, outputPath) {
        try {
            // Create temporary HTML file
            const htmlPath = await this.createTempHtmlFile(this.wrapContentWithHtml(content));
            return new Promise((resolve, reject) => {
                const pdfProcess = (0, child_process_1.spawn)(this.wkhtmltopdfPath, [
                    '--enable-local-file-access',
                    '--enable-external-links',
                    '--enable-internal-links',
                    '--javascript-delay', '1000',
                    '--no-stop-slow-scripts',
                    htmlPath,
                    outputPath
                ]);
                let errorOutput = '';
                pdfProcess.stderr.on('data', (data) => {
                    errorOutput += data.toString();
                });
                pdfProcess.on('close', async (code) => {
                    // Clean up temporary file
                    await fs.unlink(htmlPath);
                    await fs.rmdir(path.dirname(htmlPath));
                    if (code === 0) {
                        resolve();
                    }
                    else {
                        reject(new Error(`PDF generation failed: ${errorOutput}`));
                    }
                });
                pdfProcess.on('error', (err) => {
                    reject(new Error(`Failed to start PDF generation: ${err.message}`));
                });
            });
        }
        catch (error) {
            throw new Error(`PDF generation failed: ${error?.message || 'Unknown error'}`);
        }
    }
    wrapContentWithHtml(content) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', sans-serif;
                        line-height: 1.6;
                        padding: 2em;
                    }
                    a {
                        color: #0366d6;
                        text-decoration: none;
                    }
                    pre {
                        background-color: #f6f8fa;
                        padding: 16px;
                        border-radius: 3px;
                        overflow-x: auto;
                    }
                    code {
                        font-family: 'Courier New', Courier, monospace;
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `;
    }
}
exports.PDFGenerator = PDFGenerator;
//# sourceMappingURL=pdfGeneration.js.map