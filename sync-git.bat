@echo off
echo Full Git Sync Process Starting...
echo.
echo This script will:
echo 1. Commit all changes to GitHub
echo 2. Run sync-docs to handle documentation
echo.

echo Step 1: Committing all changes to GitHub...
node scripts/sync-git.js
if errorlevel 1 goto error

echo.
echo Step 2: Running sync-docs...
call sync-docs.bat
if errorlevel 1 goto error

echo.
echo All changes have been:
echo - Committed to GitHub
echo - Documentation consolidated and synced
echo.
goto end

:error
echo.
echo Error occurred during sync process
echo Please check the console output for details

:end
pause
