# EvidenceAI Pipeline Automation

A modular Zapier-based automation system for processing documents through the EvidenceAI pipeline.

## Flow Overview

1. **File Detection & Logging**
   - Monitors input folder for new files
   - Creates tracking entries
   - Logs file metadata
   
2. **File Movement & Status Update**
   - Moves files to processing
   - Updates tracking status
   - Maintains audit trail
   
3. **Error Handling**
   - Catches processing errors
   - Moves files to error folder
   - Updates status and logs
   - Sends notifications
   
4. **Success Processing**
   - Organizes completed files by date
   - Updates tracking status
   - Records processing metrics
   - Maintains audit logs

## Integration Points

- Google Drive: File storage and movement
- Google Sheets: Status tracking and logging
- Email: Error notifications
- Webhooks: Error handling triggers

## Modular Design Benefits

1. **Independent Components**
   - Each flow handles one responsibility
   - Flows can be modified without affecting others
   - Easy to test and debug

2. **Consistent Logging**
   - Every operation is logged
   - Full audit trail maintained
   - Performance metrics tracked

3. **Error Recovery**
   - Centralized error handling
   - Clear error notifications
   - Easy file recovery process

4. **Extensible Architecture**
   - New flows can be added easily
   - Existing flows can be enhanced
   - Modular helper functions

## Setup Requirements

1. Google Drive folders:
   - input/
   - processing/
   - processed/YYYY/MM/DD/
   - processing/errors/

2. Google Sheet with tabs:
   - File Tracking
   - Automation Logs
   - Pipeline Config

3. Zapier Premium account for:
   - Multi-step Zaps
   - Custom JavaScript
   - Webhooks
