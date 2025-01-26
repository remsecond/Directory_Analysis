import { spawn } from 'child_process';
import { DocumentConverter } from './documentConverter';

export class PDFGenerator {
    private converter: DocumentConverter;

    constructor() {
        this.converter = new DocumentConverter();
    }

    async generatePDF(inputFile: string): Promise<void> {
        let htmlFile: string | null = null;
        
        try {
            // Convert to HTML first
            htmlFile = await this.converter.convertToHTML(inputFile);
            const outputFile = inputFile.replace(/\.\w+$/, '.pdf');

            // Generate PDF with wkhtmltopdf
            await new Promise<void>((resolve, reject) => {
                const options = [
                    '--enable-external-links',
                    '--enable-internal-links',
                    '--javascript-delay', '1000',
                    htmlFile!,
                    outputFile
                ] as string[];

                const pdfProcess = spawn('wkhtmltopdf', options);

                pdfProcess.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error('PDF generation failed'));
                    }
                });
            });
        } finally {
            // Cleanup temporary files
            if (htmlFile) {
                await this.converter.cleanup(htmlFile);
            }
        }
    }
}
