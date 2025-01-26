@echo off
echo Starting Document Organization System...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.x and try again
    pause
    exit /b 1
)

REM Run the document organizer script with source directory
python src\document_organizer.py "C:\Users\robmo\OneDrive\Desktop\EVA CLeanup\Phase II Evidence\Mediation"

echo.
echo Processing complete. Press any key to exit...
pause >nul
