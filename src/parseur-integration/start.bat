@echo off
echo Starting Parseur Integration Server...

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is required but not installed.
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

:: Check if dependencies are installed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to install dependencies
        exit /b 1
    )
)

:: Check if .env file exists
if not exist .env (
    echo Error: .env file not found
    echo Please run setup.bat first to configure the integration
    exit /b 1
)

:: Start the server
node index.js
