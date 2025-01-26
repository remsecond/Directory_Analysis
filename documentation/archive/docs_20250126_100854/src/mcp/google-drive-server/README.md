# Google Drive MCP Server

This MCP server provides tools for interacting with Google Drive, including creating folders, listing files, and managing the folder structure for EvidenceAI.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
LOG_LEVEL=info
```

3. Build the TypeScript files:
```bash
npm run build
```

## Available Tools

### create_folder
Creates a new folder in Google Drive.
- Parameters:
  - name: Name of the folder to create
  - parentId: (optional) ID of the parent folder

### list_files
Lists files and folders in a Drive folder.
- Parameters:
  - folderId: ID of the folder to list contents from
  - pageSize: (optional) Number of items to return

### get_file_info
Gets metadata about a file or folder.
- Parameters:
  - fileId: ID of the file or folder

## Scripts

- `setup.bat`: Creates the initial folder structure in Google Drive
- `start.bat`: Starts the MCP server
- `stop.bat`: Stops the MCP server

## Folder Structure

The server creates the following folder structure in Google Drive:

```
EvidenceAI/
├── Incoming/
├── Processing/
├── Completed/
├── ErrorLogs/
├── Documentation/
│   ├── EvidenceAI White Paper/
│   ├── EvidenceAI Test Sheet/
│   └── Other docs/
├── Metadata/
└── Outputs/
