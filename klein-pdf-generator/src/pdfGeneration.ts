import * as puppeteer from 'puppeteer';
import { getStylesheet } from './stylesheetHelper';
import { getConfig } from './config';

export async function generatePDF(inputHtml: string, outputPath: string): Promise<void> {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        const stylesheet = await getStylesheet();
        
        // Inject stylesheet into HTML
        const htmlWithStyles = `
            <style>${stylesheet}</style>
            ${inputHtml}
        `;
        
        await page.setContent(htmlWithStyles, {
            waitUntil: 'networkidle0'
        });
        
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
    } finally {
        await browser.close();
    }
}
