@echo off
echo Starting new development session...
echo.
echo This script will:
echo 1. Sync documentation
echo 2. Analyze current state
echo 3. Create session summary
echo.

node scripts/sync-session.js
if errorlevel 1 goto error

echo.
echo Session initialized successfully!
echo You can find the session summary in the session_logs directory.
goto end

:error
echo.
echo Error occurred during session initialization
echo Please check the console output for details

:end
pause
