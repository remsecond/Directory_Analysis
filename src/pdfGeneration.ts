import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';
import { PDFGeneratorConfig } from './config';

export class PDFGenerator {
    private readonly wkhtmltopdfPath: string;

    constructor() {
        this.wkhtmltopdfPath = this.getWkhtmltopdfPath();
    }

    private getWkhtmltopdfPath(): string {
        switch (os.platform()) {
            case 'win32':
                return 'C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe';
            case 'darwin':
                return '/usr/local/bin/wkhtmltopdf';
            default:
                return 'wkhtmltopdf';
        }
    }

    private async createTempHtmlFile(content: string, config: PDFGeneratorConfig): Promise<string> {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'klein-'));
        const htmlPath = path.join(tempDir, 'temp.html');
        
        let customCss = '';
        if (config.customStylesheet) {
            try {
                customCss = await fs.readFile(config.customStylesheet, 'utf8');
            } catch (error) {
                console.warn(`Failed to read custom stylesheet: ${error}`);
            }
        }

        const htmlContent = this.wrapContentWithHtml(content, customCss);
        await fs.writeFile(htmlPath, htmlContent, 'utf8');
        return htmlPath;
    }

    async generatePDF(content: string, outputPath: string, config: PDFGeneratorConfig): Promise<void> {
        try {
            const htmlPath = await this.createTempHtmlFile(content, config);

            return new Promise((resolve, reject) => {
                const pdfProcess = spawn(this.wkhtmltopdfPath, [
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
                    } else {
                        reject(new Error(`PDF generation failed: ${errorOutput}`));
                    }
                });

                pdfProcess.on('error', (err) => {
                    reject(new Error(`Failed to start PDF generation: ${err.message}`));
                });
            });
        } catch (error: any) {
            throw new Error(`PDF generation failed: ${error?.message || 'Unknown error'}`);
        }
    }

    private wrapContentWithHtml(content: string, customCss: string = ''): string {
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
                    ${customCss}
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `;
    }
}
