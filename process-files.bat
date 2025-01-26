@echo off
echo Processing files through the pipeline...
echo.
echo This script will:
echo 1. Copy files from Input to Processing (preserving originals)
echo 2. Copy files to appropriate category folders in Completed
echo 3. Create backup copies in Archive
echo 4. Update the asset database
echo.

python src/file_migrator.py
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Files processed successfully.
    echo Running asset database update...
    echo.
    call update-asset-db.bat
) else (
    echo.
    echo Error processing files.
    echo Please check that Python is installed and all requirements are met.
    echo.
)
pause
