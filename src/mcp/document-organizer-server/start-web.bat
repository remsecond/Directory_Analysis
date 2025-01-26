@echo off
echo Starting document organizer web interface...

:: Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

:: Build the project
echo Building project...
call npm run build

:: Create required directories
echo Creating directories...
if not exist input\documents mkdir input\documents
if not exist output\organized mkdir output\organized

:: Start the web server
echo Starting web server...
call npm run start

if errorlevel 1 (
    echo Failed to start web interface
    exit /b 1
) else (
    echo Web interface started successfully at http://localhost:3000
    echo Place documents in: input\documents
    echo Organized files will be in: output\organized
    exit /b 0
)
