# Zapier Pipeline Setup Instructions

## Prerequisites
1. Zapier Premium account
2. Google Drive connected to Zapier
3. Google Sheets connected to Zapier
4. Access to the EvidenceAI Pipeline spreadsheet

## Initial Setup

1. Create the folder structure in Google Drive:
```
input/
├── email/
├── ofw/
└── attachments/

processing/
├── pdf/
├── spreadsheets/
├── attachments/
└── errors/
    ├── pdf/
    ├── spreadsheets/
    └── attachments/

processed/
├── Orders/
├── Mediation/
├── Reports/
└── Correspondence/
```

2. Set up the Google Sheet with three tabs:
- File Tracking
- Automation Logs
- Pipeline Config

## Zap Configuration Order

Configure the Zaps in this order to ensure proper pipeline flow:

1. File Detection & Logging
2. File Movement & Status Update
3. Error Handling
4. Success Processing

### 1. File Detection & Logging
- Trigger: New file in Google Drive folder
- Actions:
  1. Create row in File Tracking sheet
  2. Create row in Automation Logs sheet
- Key Features:
  - Automatic file type detection
  - Smart categorization
  - Date extraction
  - Tag generation

### 2. File Movement & Status Update
- Trigger: New row in File Tracking sheet with status "new"
- Actions:
  1. Move file to appropriate processing folder
  2. Update status in File Tracking
  3. Log operation in Automation Logs
- Key Features:
  - Type-based routing
  - Processing folder organization
  - Status tracking

### 3. Error Handling
- Trigger: Webhook from other Zaps
- Actions:
  1. Move file to error folder
  2. Update status in File Tracking
  3. Log error in Automation Logs
  4. Send email notification
- Key Features:
  - Centralized error management
  - Detailed error logging
  - Admin notifications

### 4. Success Processing
- Trigger: Updated row in File Tracking with status "processing"
- Actions:
  1. Calculate target path based on metadata
  2. Move file to final location
  3. Update status to complete
  4. Log completion
- Key Features:
  - Smart path calculation
  - Category-based organization
  - Date-based subfolder creation
  - Completion tracking

## Testing

Use the test files from test_data.json to verify:
1. File detection and categorization
2. Proper movement through stages
3. Error handling
4. Final organization structure

Example test file:
```json
{
  "name": "Email exchange with christinemoyer_hotmail.com after 2024-10-31 before 2025-01-12.pdf",
  "expected_path": "processed/Correspondence/2024/10"
}
```

## Maintenance

1. Monitor the Automation Logs sheet for:
   - Processing times
   - Error patterns
   - Success rates

2. Regularly check error folders for:
   - Unhandled file types
   - Naming pattern issues
   - Processing failures

3. Update Pipeline Config for:
   - New file types
   - Category changes
   - Path adjustments
