# System Workflows

## File Processing Flow

1. **File Arrival**
   - User drops file in 1_Input/
   - Zapier detects new file
   - Creates tracking entry
   - Checks for duplicates

2. **Processing Stage**
   - File moved to 2_Processing/
   - Status updated in tracking sheet
   - Format variants handled (PDF/DOCX)
   - Version tracking maintained

3. **Completion**
   - File moved to 3_Complete/
   - Status marked as done
   - Tracking updated
   - Notifications sent

## Error Handling

If any step fails:
1. File moved to _System/Errors/
2. Error logged in tracking sheet
3. Notification sent to admin
4. Manual intervention required

## File Organization

Files are organized by:
- Type (PDF, DOCX, etc.)
- Status (New, Processing, Complete)
- Version (if duplicates exist)

## Monitoring

Track system health through:
1. Processing Log sheet
2. Error notifications
3. File movement history

## Recovery

If errors occur:
1. Check error logs
2. Fix issue (wrong path, permissions, etc.)
3. Move file back to 1_Input/
4. System will reprocess

No servers or code to debug - just configuration to check.
