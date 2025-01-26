# Initial File Filter Zap Setup

This document explains how to set up the "01 – Initial File Sort from Incoming" Zap that filters incompatible files from the incoming folder.

## Purpose

This Zap watches for new files in the "02_Incoming" folder and automatically moves incompatible files (spreadsheets, forms, presentations, images, audio, and video) to the "Other_Files" folder. This keeps the main processing queue clean and focused on documents that can be processed by our system.

## Prerequisites

1. Zapier Premium account (required for Code by Zapier and Path steps)
2. Google Drive connected to Zapier
3. Google Sheets connected to Zapier
4. Access to the following Google Drive folders:
   - "02_Incoming" (ID: 1KgKsJvWXT63mPlv67vu9-LrdMyo44ThQ)
   - "Other_Files" (ID: 10fnMQLgbPD_Y9Lfu46o70HeBUHH3EYMD)

## Setup Steps

1. Create a New Zap
   - Go to Zapier dashboard
   - Click "Create Zap"
   - Name it "01 – Initial File Sort from Incoming"

2. Configure Trigger
   - App: Google Drive
   - Event: New File in Folder
   - Folder: Select "02_Incoming"
   - Include Subfolders: No

3. Add Code Step
   - App: Code by Zapier
   - Event: Run JavaScript
   - Input Data:
     - Set variable name: file
     - Value: Select "File" from the trigger step
   - Code: Copy the JavaScript code that checks file types (from initial_file_filter.json)

4. Add Path Step
   - App: Path by Zapier
   - Add two paths:
     1. "Move to Other Files" when isIncompatible is true
     2. "Keep in Incoming" when isIncompatible is false

5. Add Move File Action (only under "Move to Other Files" path)
   - App: Google Drive
   - Action: Move File
   - File: Select "File ID" from trigger
   - Destination: Select "Other_Files" folder

6. Add Logging Action
   - App: Google Sheets
   - Action: Create Spreadsheet Row
   - Spreadsheet: Select your automation log sheet
   - Configure row data as specified in the JSON

## Testing

Test the Zap with different file types:

1. Compatible Files (should stay in "02_Incoming"):
   - PDF documents
   - Text files
   - Google Docs

2. Incompatible Files (should move to "Other_Files"):
   - Google Sheets
   - Google Forms
   - Google Slides
   - Images (PNG, JPG, etc.)
   - Audio files
   - Video files

## Monitoring

Monitor the automation logs in Google Sheets to:
- Track file movements
- Verify correct file type detection
- Identify any errors or issues
- Monitor processing times

## Troubleshooting

Common issues and solutions:

1. File Not Moving
   - Verify folder IDs are correct
   - Check file permissions
   - Review Path conditions

2. Type Detection Issues
   - Check mimeType in the Code step output
   - Verify incompatibleTypes array includes all needed types

3. Logging Errors
   - Verify Google Sheets permissions
   - Check column names match exactly

## Maintenance

1. Regularly review the Other_Files folder to:
   - Identify new file types that should be handled
   - Verify correct file sorting
   - Clean up processed files

2. Update incompatible file types as needed in the Code step

3. Monitor Zap usage and performance in Zapier dashboard
