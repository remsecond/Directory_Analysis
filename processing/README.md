# Processing Folder

Active processing stage for documents in the EvidenceAI pipeline.

## Structure
- `processing/` - Main processing directory
  - `errors/` - Files that encountered processing issues

## Processing Flow
1. Files arrive from input folder
2. Processing status logged in metadata
3. Files processed according to type
4. Successful files move to processed folder
5. Failed files move to errors folder

## Error Handling
If a file moves to `errors/`:
1. Check metadata/validation for error details
2. Fix issues if possible
3. Move fixed files back to input folder
4. Monitor reprocessing in metadata logs

## Best Practices
- Don't manually add files here
- Check metadata logs for processing status
- Use error folder for troubleshooting
- Keep folder clean of temporary files
