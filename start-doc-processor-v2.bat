@echo off
echo Installing required Python packages...
pip install watchdog pyairtable

echo.
echo Checking Airtable configuration...

if not exist .env (
    echo Creating .env file for Airtable configuration...
    echo AIRTABLE_API_KEY=your_api_key_here> .env
    echo AIRTABLE_BASE_ID=your_base_id_here>> .env
    echo.
    echo Please edit .env file with your Airtable credentials
    echo then run this script again.
    pause
    exit
)

echo Loading Airtable configuration...
for /f "tokens=1,* delims==" %%a in (.env) do (
    if "%%a"=="AIRTABLE_API_KEY" set AIRTABLE_API_KEY=%%b
    if "%%a"=="AIRTABLE_BASE_ID" set AIRTABLE_BASE_ID=%%b
)

if "%AIRTABLE_API_KEY%"=="" (
    echo Error: AIRTABLE_API_KEY not found in .env
    pause
    exit
)

if "%AIRTABLE_BASE_ID%"=="" (
    echo Error: AIRTABLE_BASE_ID not found in .env
    pause
    exit
)

echo.
echo Starting document processor...
python src/document_processor_v2.py
