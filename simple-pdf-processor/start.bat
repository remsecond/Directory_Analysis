@echo off
echo Starting Text Processor Server...

REM Check if Node.js is installed
powershell -Command "if (-not (Get-Command node -ErrorAction SilentlyContinue)) { exit 1 }"
if errorlevel 1 (
    echo Error: Node.js is required but not found.
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Create required directories
if not exist "uploads" mkdir uploads
if not exist "processed" mkdir processed

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Start server
echo Starting server...
node server.js
