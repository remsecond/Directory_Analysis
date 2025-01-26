import { spawn } from 'child_process';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';

export class DocumentConverter {
    private async convertOfficeToHTML(inputFile: string): Promise<string> {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'klein-'));
        const tempHtml = path.join(tempDir, 'temp.html');
        
        return new Promise((resolve, reject) => {
            const soffice = spawn('soffice', [
                '--headless',
                '--convert-to', 'html',
                '--outdir', tempDir,
                inputFile
            ]);

            soffice.on('close', (code) => {
                if (code === 0) {
                    resolve(tempHtml);
                } else {
                    reject(new Error('Conversion failed'));
                }
            });
        });
    }

    private async convertPDFToHTML(inputFile: string): Promise<string> {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'klein-'));
        const tempHtml = path.join(tempDir, 'temp.html');
        
        return new Promise((resolve, reject) => {
            const pdf2html = spawn('pdf2htmlEX', [
                '--zoom', '1.3',
                '--dest-dir', tempDir,
                inputFile
            ]);

            pdf2html.on('close', (code) => {
                if (code === 0) {
                    resolve(tempHtml);
                } else {
                    reject(new Error('PDF conversion failed'));
                }
            });
        });
    }

    async convertToHTML(inputFile: string): Promise<string> {
        const ext = path.extname(inputFile).toLowerCase();
        
        try {
            switch (ext) {
                case '.pdf':
                    return await this.convertPDFToHTML(inputFile);
                case '.doc':
                case '.docx':
                case '.ppt':
                case '.pptx':
                    return await this.convertOfficeToHTML(inputFile);
                default:
                    throw new Error(`Unsupported file type: ${ext}`);
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Conversion failed: ${error.message}`);
            }
            throw new Error('Conversion failed with unknown error');
        }
    }

    async cleanup(tempFile: string): Promise<void> {
        try {
            await fs.unlink(tempFile);
            await fs.rmdir(path.dirname(tempFile));
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }
}
