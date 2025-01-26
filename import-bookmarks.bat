@echo off
echo Opening Edge to import bookmarks...
start msedge --profile-directory="Default" "edge://settings/importData"
echo.
echo Please follow these steps:
echo 1. Select "Import from file"
echo 2. Navigate to: %CD%\bookmarks.html
echo 3. Click "Open" to import
echo.
echo After importing, press Ctrl+Shift+O to open the bookmarks manager
echo Arrange the folders in this order:
echo - NotebookLM
echo - AI Drive
echo - AskYourPDF
echo - Other Tools
echo.
pause
