# PDF Converter Web Interface

A web interface for converting various document formats to PDF with customizable styling.

## Features

- Drag-and-drop file upload
- Support for multiple file formats (.doc, .docx, .md, .txt, .html)
- Customizable style templates
- Real-time conversion status
- Downloadable PDF output

## Setup

1. Make sure you have Node.js installed on your system
2. Clone this repository
3. Run `start.bat` to install dependencies and start the server
4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Drag and drop files into the upload area or click "Choose Files"
2. Select a style template from the dropdown menu
3. Click "Convert to PDF" to start the conversion
4. Once complete, download links will appear for each converted file

## Style Templates

- Default (GitHub Style): Clean, modern style based on GitHub's markdown rendering
- Minimal: Simple, distraction-free layout
- Academic: Formal style suitable for academic documents

## Development

The project uses the following technologies:
- Express.js for the server
- Puppeteer for PDF generation
- HTML5 File API for drag-and-drop functionality

To modify the styles, edit the CSS files in the `../vscode-extension/resources` directory.
