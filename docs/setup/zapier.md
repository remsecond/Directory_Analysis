# Zapier Setup Guide

## Prerequisites

1. Google Workspace setup completed (see google.md)
2. Zapier account with access to:
   - Google Drive integration
   - Google Sheets integration
   - Gmail integration

## Import Flows

Import these flows in order:

1. **File Detection** (zapier/flows/file_detection.json)
   - Monitors 1_Input folder
   - Creates tracking entries
   - Triggers file processing

2. **File Movement** (zapier/flows/file_movement.json)
   - Moves files between stages
   - Updates tracking status
   - Maintains organization

3. **Deduplication** (zapier/flows/deduplication_handler.json)
   - Checks for duplicates
   - Manages versions
   - Handles format variants

4. **Error Handling** (zapier/flows/error_handling.json)
   - Catches workflow errors
   - Sends notifications
   - Updates tracking

## Configuration

For each flow:

1. Connect your Google account
2. Update folder paths to match your Drive structure
3. Update sheet names to match your setup
4. Test with sample files
5. Enable when tested

## Testing

1. Drop a file in 1_Input/
2. Watch the tracking sheet
3. Verify file movement
4. Check error handling

## Maintenance

- Monitor the Processing Log sheet
- Check Error notifications
- Update paths if folders change

No coding needed - just configuration and monitoring.
