# Klein PDF Generator

A VSCode extension for generating beautifully styled PDFs from various document formats.

## Features

- Convert documents to PDF with consistent styling
- Support for custom CSS stylesheets
- Handles various document formats including Markdown and HTML
- Clean, modern default styling based on GitHub's design

## Installation

1. Install the extension from the VSCode marketplace
2. Ensure you have the required dependencies:
   - Node.js
   - Puppeteer (installed automatically with the extension)

## Usage

1. Open a document in VSCode
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type "Generate PDF" and select the command
4. The PDF will be generated in the same directory as your source file

## Configuration

You can customize the PDF styling by:

1. Opening VSCode Settings (Ctrl+,)
2. Searching for "Klein PDF Generator"
3. Setting "Custom Stylesheet" to the path of your CSS file

The default stylesheet is located at:
`resources/style-template.css`

You can copy this file and modify it to create your own custom styles.

## Default Styling

The default stylesheet includes:

- Clean typography with system fonts
- GitHub-inspired markdown styling
- Proper handling of code blocks
- Responsive tables
- Print-optimized layout
- Special styling for different link types
- Support for dark/light mode printing

## Requirements

- Visual Studio Code 1.60.0 or newer
- Node.js 14.0.0 or newer

## License

MIT
