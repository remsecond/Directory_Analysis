@echo off
echo Starting Batch Document Processor Server...

REM Check if Python is installed
python --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed.
    echo Please install Python 3.7+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
call venv\Scripts\activate
pip install -r requirements.txt > nul 2>&1

REM Start the Flask server
echo Starting server on http://localhost:5000
start /B "" python src/batch_server.py

echo Server started successfully.
echo To stop the server, run stop-batch-processor.bat
