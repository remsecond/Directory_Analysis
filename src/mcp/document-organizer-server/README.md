# Document Organizer MCP Server

An MCP server that provides document organization capabilities through a structured folder hierarchy.

## Features

- Organizes documents into year/month/type folder structure
- Detects and handles duplicate files
- Tracks document versions
- Updates Google Sheets with document metadata
- Supports recursive directory processing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the server:
```bash
./build.bat
```

## Usage

The server provides the following MCP tool:

### organizeDocuments

Organizes documents from a source directory into a structured target directory.

Parameters:
- `sourcePath` (required): Source directory containing documents to organize
- `targetPath` (required): Target directory for organized documents
- `recursive` (optional): Whether to recursively process subdirectories (default: false)
- `updateSheet` (optional): Whether to update Google Sheet with document metadata (default: true)

Example:
```typescript
const result = await use_mcp_tool('document-organizer', 'organizeDocuments', {
  sourcePath: '/path/to/source',
  targetPath: '/path/to/target',
  recursive: true
});
```

## Folder Structure

Documents are organized into the following structure:
```
target/
  ├── 2024/
  │   ├── 01/
  │   │   ├── documents/
  │   │   │   ├── report.pdf
  │   │   │   └── report.pdf.metadata.json
  │   │   ├── images/
  │   │   └── spreadsheets/
  │   └── 02/
  └── 2023/
```

## File Types

The server organizes files into the following categories:
- documents (.pdf, .doc, .docx, .txt, .rtf)
- images (.jpg, .jpeg, .png, .gif, .bmp)
- spreadsheets (.xls, .xlsx, .csv)
- presentations (.ppt, .pptx)
- archives (.zip, .rar, .7z)
- code (.js, .ts, .py, .java, .cpp, .cs)
- other (any unrecognized extension)

## Metadata

Each organized file has an associated metadata JSON file containing:
- Original file hash
- Creation date
- Modification date
- Original filename
- Version information

## Development

Run tests:
```bash
npm test
```

## License

MIT
