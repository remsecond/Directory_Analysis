@echo off
echo Checking for duplicate files before processing...
echo This will compare files in 01_Input/ against the existing database
echo.

python src/check_duplicates.py
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Duplicate check complete.
    echo If no duplicates were found, you can proceed with process-files.bat
    echo If duplicates were found, consider removing them from Input first.
    echo.
) else (
    echo.
    echo Error checking for duplicates.
    echo Please check that Python is installed and all requirements are met.
    echo.
)
pause
