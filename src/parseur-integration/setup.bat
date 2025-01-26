@echo off
echo Setting up Parseur Integration...

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is required but not installed.
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

:: Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

:: Check for existing .env file
if exist .env (
    echo Found existing .env file
    set /p CONTINUE="Do you want to reconfigure? (y/N) "
    if /i not "%CONTINUE%"=="y" (
        echo Setup cancelled
        exit /b 0
    )
)

:: Get Parseur API key
set /p PARSEUR_API_KEY="Enter your Parseur API key: "
if "%PARSEUR_API_KEY%"=="" (
    echo Error: Parseur API key is required
    exit /b 1
)

:: Get Google Sheets ID
set /p GOOGLE_SHEETS_ID="Enter your Google Sheets ID for tracking: "
if "%GOOGLE_SHEETS_ID%"=="" (
    echo Error: Google Sheets ID is required
    exit /b 1
)

:: Create .env file
echo Creating .env file...
(
    echo PARSEUR_API_KEY=%PARSEUR_API_KEY%
    echo GOOGLE_SHEETS_ID=%GOOGLE_SHEETS_ID%
) > .env

:: Set up Parseur mailboxes
echo Setting up Parseur mailboxes...
node setup-mailboxes.js
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to set up Parseur mailboxes
    exit /b 1
)

:: Create test Zap in Zapier
echo.
echo Next steps:
echo 1. Go to Zapier and create a new Zap
echo 2. Use the configuration from zapier_flows/parseur_integration.json
echo 3. Test the integration with a sample document
echo.
echo Setup complete! You can now start the integration server with:
echo   start.bat
echo.
echo For more information, see the README.md file.
