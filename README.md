# Batch Document Processor

A Windows desktop application for processing documents in batches with smart folder analysis and change detection.

## Features

- Process entire folders of documents in one go
- Smart change detection to avoid reprocessing unchanged files
- Preview changes before processing
- Progress tracking and status updates
- Selective file processing
- Processing history tracking
- Native Windows interface with folder browser

## Prerequisites

1. Python 3.7 or higher
   - Download from: https://www.python.org/downloads/
   - Make sure to check "Add Python to PATH" during installation

2. .NET 6.0 SDK
   - Download from: https://dotnet.microsoft.com/download/dotnet/6.0
   - Required for the Windows Forms UI

## Installation

1. Clone or download this repository
2. Open a command prompt in the repository directory
3. Create a Python virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```
4. Build the Windows Forms UI:
   ```
   cd src\BatchProcessorUI
   dotnet build
   cd ..\..
   ```

## Running the Application

### Option 1: All-in-One Startup
Run `start-batch-processor-system.bat` to start both the backend server and UI.

### Option 2: Manual Startup
1. Start the backend server:
   ```
   start-batch-processor.bat
   ```
2. In a new window, start the UI:
   ```
   start-batch-processor-ui.bat
   ```

## Stopping the Application

1. Close the UI window
2. Run `stop-batch-processor.bat` to stop the backend server

## Troubleshooting

### Backend Server Issues
- If you see "Address already in use":
  1. Run `stop-batch-processor.bat`
  2. Try starting again
  3. If problem persists, manually kill Python processes

### UI Issues
- If the UI shows "Connection refused":
  1. Make sure the backend server is running
  2. Check if http://localhost:5000 is accessible
  3. Try restarting both components

### Python Environment Issues
- If you see "python not found":
  1. Verify Python is in your PATH
  2. Try running with full path: `C:\Python3x\python.exe -m venv venv`

### .NET Issues
- If you see "dotnet not found":
  1. Verify .NET 6.0 SDK is installed
  2. Try repairing/reinstalling the .NET SDK

## Usage Guide

1. Launch the application using `start-batch-processor-system.bat`

2. Using the Interface:
   - Click "Browse Folder" to select a folder
   - The system will analyze the folder and show:
     * Last processing time
     * New files detected
     * Modified files
     * Total size and count
   
3. Processing Options:
   - "Process All": Process every file
   - "Process Changes": Only process new/modified files
   - Progress bar shows current status
   - Recent folders are saved for quick access

4. Best Practices:
   - Start with a small folder to test
   - Use "Process Changes" for incremental updates
   - Keep the folder browser window open for reference
   - Check the status messages for any issues

## Technical Details

### Architecture

1. **Windows Forms UI** (.NET 6.0)
   - Native Windows interface
   - Folder browser integration
   - Async operations for responsiveness
   - Progress tracking
   - Recent folders management

2. **Python Backend**
   - Flask REST API
   - SQLite database for history
   - File system operations
   - Change detection
   - Progress streaming

3. **Communication**
   - HTTP/JSON for commands
   - Server-Sent Events for progress
   - Local ports: 5000

### Data Storage

- Recent folders: `recent_folders.json`
- Processing history: `documents/db/documents.db`
- Temporary files: `temp/`

### System Requirements

- Windows 10/11
- Python 3.7+
- .NET 6.0 SDK
- 4GB RAM recommended
- SSD recommended for large folders

## License

MIT License - See LICENSE file for details
