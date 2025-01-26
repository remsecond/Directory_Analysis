# Text Processor

A simple text file processor with a web interface for analyzing and chunking text content.

## Features

- Upload and process text files
- Analyze text content (word count, chunk analysis)
- Web interface with drag-and-drop support
- Real-time processing status
- Automatic file organization

## Requirements

- Node.js 16.0.0 or higher
- Modern web browser (Chrome, Firefox, Edge)

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Run `npm install` to install dependencies (or use the start script which will install dependencies automatically)

## Usage

### Starting the Server

Run `start.bat` to start the server. This script will:
- Check for Node.js installation
- Install dependencies if needed
- Create required directories
- Start the server on port 3002

### Using the Web Interface

1. Open a web browser and navigate to `http://localhost:3002`
2. Drag and drop a text file onto the upload area or click to select a file
3. The file will be processed automatically
4. View the processing results in the interface

### Stopping the Server

Run `stop.bat` to stop the server cleanly.

## Directory Structure

- `/uploads` - Temporary storage for uploaded files
- `/processed` - Storage for processed files
- `/src/services` - Core processing logic
- `/test` - Test files and test cases

## API Endpoints

- `GET /health` - Server health check
- `GET /status` - Server status and configuration
- `POST /process` - Process a text file

## Testing

A sample test file is provided in `/test/test.txt`. You can use this to verify the system is working correctly.

## Limitations

- Currently supports text files (.txt) only
- Maximum file size: 50MB
- Single file processing at a time

## Error Handling

The system includes comprehensive error handling:
- Pre-start checks for requirements
- File type validation
- Size limit enforcement
- Processing error recovery
- Clean shutdown support

## Troubleshooting

1. If the server won't start:
   - Check if port 3002 is already in use
   - Verify Node.js is installed
   - Check for error messages in the console

2. If file processing fails:
   - Verify the file is a valid text file
   - Check file size is under 50MB
   - Look for error messages in the web interface

3. If the web interface is unresponsive:
   - Check server status in the interface
   - Verify the server is running
   - Check browser console for errors
