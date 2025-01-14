@echo off
echo Starting EvidenceAI Mission Control...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is required but not found.
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Kill any existing node processes
echo Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to install dependencies
        exit /b 1
    )
)

REM Create required directories
echo Creating directories...
if not exist "input" mkdir input
if not exist "input\email" mkdir input\email
if not exist "input\ofw" mkdir input\ofw
if not exist "processed" mkdir processed
if not exist "processed\pipeline" mkdir processed\pipeline

REM Set ports
set PDF_PROCESSOR_PORT=3002
set WEB_PORT=3001

REM Check if ports are available
echo Checking ports...
netstat -ano | findstr ":%PDF_PROCESSOR_PORT%" >nul
if %ERRORLEVEL% EQU 0 (
    echo Error: Port %PDF_PROCESSOR_PORT% is already in use
    exit /b 1
)
netstat -ano | findstr ":%WEB_PORT%" >nul
if %ERRORLEVEL% EQU 0 (
    echo Error: Port %WEB_PORT% is already in use
    exit /b 1
)

REM Start PDF processor server
echo Starting PDF processor server on port %PDF_PROCESSOR_PORT%...
cd simple-pdf-processor
start "PDF Processor" cmd /c "set PORT=%PDF_PROCESSOR_PORT% && node server.js"
cd ..

REM Wait for server to start
timeout /t 2 /nobreak >nul

REM Check if PDF processor server is running
curl -s http://localhost:%PDF_PROCESSOR_PORT%/health >nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to start PDF processor server
    goto :error
)

REM Start web server
echo Starting web server on port %WEB_PORT%...
start "Web Server" cmd /c "set PORT=%WEB_PORT% && node src/index.js"

REM Wait for web server to start
timeout /t 2 /nobreak >nul

REM Open Mission Control in default browser
echo Opening Mission Control...
start http://localhost:%WEB_PORT%/mission-control.html

echo.
echo Mission Control started successfully!
echo.
echo Servers running:
echo - PDF Processor: http://localhost:%PDF_PROCESSOR_PORT%
echo - Web Server: http://localhost:%WEB_PORT%
echo.
echo Press Ctrl+C in the server windows to stop the servers.
echo.
exit /b 0

:error
echo.
echo Startup failed! Check error messages above.
echo.
taskkill /F /IM node.exe >nul 2>&1
exit /b 1
