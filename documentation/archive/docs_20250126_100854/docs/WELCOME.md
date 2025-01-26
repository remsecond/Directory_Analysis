# Welcome to EvidenceAI

## The Simple Approach

EvidenceAI uses existing services instead of custom code:
- Google Drive for storage
- Google Sheets for tracking
- Zapier for automation
- Gmail for notifications

No servers. No infrastructure. Just services working together.

## How It Works

1. Drop files in Google Drive's 1_Input folder
2. Zapier automatically:
   - Detects new files
   - Checks for duplicates
   - Updates tracking sheet
   - Moves files through stages
   - Sends notifications

## Key Features

- Automatic file organization
- Version tracking
- Format handling (PDF/DOCX)
- Error notifications
- Progress tracking

## Getting Started

1. [Set up Google Workspace](setup/google.md)
2. [Configure Zapier flows](setup/zapier.md)
3. [Review workflows](workflows/README.md)

## Configuration

All system behavior is defined in config/:
- file-patterns.json: Naming and organization rules
- sheets-setup.json: Tracking sheet structure

## Need Help?

Check:
1. Processing Log sheet for history
2. Error notifications for issues
3. System Config sheet for settings

No code to debug - just configuration to check.
