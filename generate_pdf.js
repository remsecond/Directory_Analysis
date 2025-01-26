const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Get absolute path to the HTML file
    const htmlPath = path.resolve(__dirname, 'test-stylesheet.html');
    const fileUrl = `file://${htmlPath}`;
    
    // Load the HTML file
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    await page.pdf({
      path: 'test-output.pdf',
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    console.log('PDF generated successfully: test-output.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
})();
