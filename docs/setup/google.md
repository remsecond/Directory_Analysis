# Google Workspace Setup

## Drive Structure

Create this folder structure in Google Drive:

```
EvidenceAI/
├── 1_Input/           # Where new files land
├── 2_Processing/      # Active processing
├── 3_Complete/        # Finished items
└── _System/          # System files
    ├── Templates/    # Document templates
    ├── Archive/      # Old versions
    └── Logs/        # Processing logs
```

## Sheets Setup

Create a new Google Sheet called "EvidenceAI Pipeline" with these tabs:

1. **File Tracking**
   - File ID
   - Name
   - Location (Input/Processing/Complete)
   - Status
   - Last Updated
   - Error Details
   - File Type
   - File Size
   - Processing Duration
   - Tags

2. **Processing Log**
   - Timestamp
   - Operation
   - Status
   - Details
   - Duration
   - Error (if any)

3. **System Config**
   - Setting Name
   - Value
   - Last Updated
   - Description

## Access Setup

1. Create a dedicated Google account for the system
2. Share all folders with this account
3. Connect this account to Zapier

## Next Steps

Once this is set up:
1. Import Zapier workflows
2. Test with sample files
3. Enable automation

No custom code needed - just Google Workspace configuration.
