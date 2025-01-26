@echo off
echo Installing required Python packages...
pip install watchdog google-api-python-client google-auth-httplib2 google-auth-oauthlib

echo.
echo Checking Google Sheets configuration...

if not exist google-token.json (
    echo Error: google-token.json not found
    echo Please run scripts/get-google-token.js first to set up Google authentication
    pause
    exit
)

if not exist .env (
    echo Creating .env file for Google Sheets configuration...
    echo SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here> .env
    echo.
    echo Please edit .env file with your Google Sheets spreadsheet ID
    echo then run this script again.
    pause
    exit
)

echo Loading Google Sheets configuration...
for /f "tokens=1,* delims==" %%a in (.env) do (
    if "%%a"=="SHEETS_SPREADSHEET_ID" set SHEETS_SPREADSHEET_ID=%%b
)

if "%SHEETS_SPREADSHEET_ID%"=="" (
    echo Error: SHEETS_SPREADSHEET_ID not found in .env
    pause
    exit
)

echo.
echo Creating required directories...
if not exist "documents\files" mkdir "documents\files"
if not exist "documents\db" mkdir "documents\db"

echo.
echo Starting document processor...
python src/document_processor_sheets.py
