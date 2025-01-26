@echo off
echo Starting folder analysis...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

REM Check if required directories exist
if not exist "input" (
    echo Creating input directory...
    mkdir "input"
)

if not exist "output" (
    echo Creating output directory...
    mkdir "output"
)

if not exist "docs" (
    echo Creating docs directory...
    mkdir "docs"
)

if not exist "config" (
    echo Creating config directory...
    mkdir "config"
)

REM Check if config file exists
if not exist "config\file_rules.json" (
    echo Error: config\file_rules.json not found
    echo Please ensure the configuration file is in place
    pause
    exit /b 1
)

REM Run the analysis script
echo Running folder analysis...
python src/analyze_origin_folder.py

if errorlevel 1 (
    echo.
    echo Error: Analysis failed
    pause
    exit /b 1
)

echo.
echo Opening analysis reports...

REM Try to open reports with default program
start "" "docs\folder_analysis_report.json"
timeout /t 2 >nul
start "" "docs\folder_analysis_details.json"

echo.
echo Analysis complete. Press any key to exit...
pause >nul
