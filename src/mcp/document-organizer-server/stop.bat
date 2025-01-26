@echo off
echo Stopping document organizer server...

:: Find and kill the Node.js process running the server
for /f "tokens=2" %%a in ('tasklist ^| findstr "node.exe"') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo Server stopped
exit /b 0
