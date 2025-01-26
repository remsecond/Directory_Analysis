# Zapier Workflows

The entire system runs on Zapier workflows - no custom code needed.

## Core Flows

1. File Detection (file_detection.json)
- Monitors Google Drive for new files
- Logs to tracking sheet
- Triggers file movement

2. File Movement (file_movement.json)
- Moves files through processing stages
- Updates tracking status
- Handles file organization

3. Deduplication (deduplication_handler.json)
- Checks for duplicate files
- Manages file versions
- Handles format variants (PDF/DOCX)

4. Error Handling (error_handling.json)
- Catches workflow errors
- Notifies appropriate users
- Logs issues for tracking

## Setup

1. Import each .json file into Zapier
2. Configure account connections:
   - Google Drive
   - Google Sheets
   - Gmail (for notifications)
3. Enable flows in order (1-4)

No servers, no infrastructure, just workflows connecting services.
