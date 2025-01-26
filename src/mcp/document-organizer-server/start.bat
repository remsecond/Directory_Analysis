@echo off
echo Starting document organizer server...

:: Check if build exists
if not exist build\server.js (
    echo Server not built. Building now...
    call build.bat
)

:: Start the server
echo Starting server...
node build\server.js %*

if errorlevel 1 (
    echo Failed to start server
    exit /b 1
) else (
    echo Server started successfully
    exit /b 0
)
