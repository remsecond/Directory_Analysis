@echo off
echo Documentation Sync Process Starting...
echo.
echo This script will:
echo 1. Consolidate documentation from all project directories
echo 2. Sync to GitHub repository
echo 3. Sync to Google Drive
echo.

REM Run consolidation script
echo Running documentation consolidation...
node ../scripts/consolidate-docs.js
if errorlevel 1 goto error

REM Run Python sync script
echo.
echo Syncing documentation to GitHub and Google Drive...
python ../scripts/sync_documentation.py
if errorlevel 1 goto error

echo.
echo Documentation sync completed successfully!
goto end

:error
echo.
echo Error occurred during sync process
echo Please check the sync_documentation.log file for details

:end
pause
