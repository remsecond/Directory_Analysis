@echo off
echo Updating asset database...
python src/asset_database.py
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Asset database updated successfully.
    echo Database location: 04_Metadata/asset_database.json
    echo.
) else (
    echo.
    echo Error updating asset database.
    echo Please check that Python is installed and all requirements are met.
    echo.
)
pause
