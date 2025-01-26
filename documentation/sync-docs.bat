@echo off
echo Documentation Sync Process Starting...
echo.
echo WHEN TO RUN THIS SCRIPT:
echo Run this script at the end of each work session when you have:
echo - Made documentation changes
echo - Created new documentation files
echo - Updated existing documentation
echo - Want to make documentation available to LLMs
echo.
echo This script will:
echo 1. Consolidate documentation from all project directories
echo 2. Sync to GitHub repository
echo 3. Sync to Google Drive
echo.
echo Note: This is a session-end task. Run it once you're done making
echo       documentation changes and want to make them available.
echo.

node ../scripts/sync-all-docs.js
if errorlevel 1 goto error

goto end

:error
echo.
echo Error occurred during sync process
echo Please check the console output for details

:end
pause
