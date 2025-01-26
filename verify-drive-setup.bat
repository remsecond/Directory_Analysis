@echo off
echo Setting up and verifying Google Drive folder structure...

REM Check for required environment variables
if not defined GOOGLE_CLIENT_ID (
    echo Error: GOOGLE_CLIENT_ID environment variable not set
    exit /b 1
)
if not defined GOOGLE_CLIENT_SECRET (
    echo Error: GOOGLE_CLIENT_SECRET environment variable not set
    exit /b 1
)
if not defined GOOGLE_REFRESH_TOKEN (
    echo Error: GOOGLE_REFRESH_TOKEN environment variable not set
    exit /b 1
)

REM Run verification script
node scripts/verify-drive-setup.js
if errorlevel 1 (
    echo Verification failed. Please check the logs for details.
    exit /b 1
)

echo.
echo Google Drive folder structure setup and verification completed successfully!
echo The following folders have been created and verified:
echo.
echo Input:
echo   - Documents (for general documents)
echo   - Emails (for email exports)
echo   - Attachments (for email attachments)
echo   - OFW (for OFW message exports)
echo   - Images (for image files)
echo   - PDF (for PDF documents)
echo   - Spreadsheets (for spreadsheet files)
echo.
echo Processing:
echo   - Extraction (content extraction workspace)
echo   - Analysis (analysis workspace)
echo   - Validation (validation workspace)
echo   - Temporary (temporary processing files)
echo.
echo Output:
echo   - Reports (generated reports)
echo   - Summaries (document summaries)
echo   - Timelines (generated timelines)
echo   - Evidence (processed evidence files)
echo   - Metadata (extracted metadata)
echo.
echo System:
echo   - Logs (processing logs)
echo   - Errors (error reports)
echo   - Configuration (system configuration)
echo   - Backup (backup files)
echo.
echo Archive:
echo   - Completed (processed documents)
echo   - Deprecated (outdated files)
echo.
echo The folder structure is now ready for use with the document processing pipeline.
