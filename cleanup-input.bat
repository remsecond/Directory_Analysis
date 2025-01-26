@echo off
echo This script will clear the 01_Input directory after successful processing.
echo All files should already be:
echo - Categorized in 03_Completed/[Category]/
echo - Backed up in 05_Archive/
echo - Tracked in the metadata database
echo.
echo Are you sure you want to clear 01_Input/? 
echo Press Ctrl+C to cancel, or
pause

echo.
echo Clearing 01_Input directory...
del /Q "01_Input\*.*"
echo.
echo Input directory cleared. Ready for next batch of files.
echo.
pause
