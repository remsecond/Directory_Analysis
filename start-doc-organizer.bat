@echo off
title Document Organizer
echo Starting Document Organizer...

REM Ensure Python package structure
if not exist "src\document_organizer\__init__.py" (
    echo Creating Python package structure...
    mkdir "src\document_organizer" 2>nul
    type nul > "src\document_organizer\__init__.py"
)

REM Create incoming directory if it doesn't exist
if not exist "input" mkdir "input"

echo Choose organizer version:
echo 1. Basic (file name based categorization)
echo 2. Enhanced (with PDF analysis, email processing, and movement logging)
choice /c 12 /n /m "Enter choice (1 or 2): "

if errorlevel 2 (
    echo Running enhanced version with MCP capabilities...
    python -c "from src.document_organizer.main import main; main(enhanced=True)"
) else (
    echo Running basic version...
    python -c "from src.document_organizer.main import main; main(enhanced=False)"
)

echo Document organizer is watching input folder.
echo Drop files directly into input folder to have them automatically organized.
echo Press Ctrl+C to stop watching.

:watch_loop
REM Check if any files exist in input folder (excluding directories and README.md)
dir /b "input\*.pdf" "input\*.png" "input\*.jpg" "input\*.eml" "input\*.ods" > nul 2>&1
if errorlevel 1 (
    timeout /t 5 /nobreak > nul
    goto watch_loop
)

REM Process any files found
echo.
echo New files detected, processing...
if "%errorlevel%"=="2" (
    python -c "from src.document_organizer.main import main; main(enhanced=True)"
) else (
    python -c "from src.document_organizer.main import main; main(enhanced=False)"
)
echo Processing complete.
echo.
echo Watching for more files...

goto watch_loop
