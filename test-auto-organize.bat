@echo off
echo Running auto-organizer tests...

REM Install test dependencies
pip install pytest python-magic-bin pathlib

REM Run tests
python -m pytest test/test_auto_organizer.py -v

echo.
if %ERRORLEVEL% EQU 0 (
    echo All tests passed! The auto-organizer is ready to use.
    echo Run auto-organize.bat to organize your files.
) else (
    echo Tests failed. Please check the output above for details.
)
