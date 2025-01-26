@echo off
echo Setting up Google Drive integration...

echo.
echo Step 1: Getting OAuth token...
node scripts/get-oauth-token.js
if errorlevel 1 (
    echo Failed to get OAuth token
    exit /b 1
)

echo.
echo Step 2: Verifying Drive setup...
node scripts/verify-drive-setup.js
if errorlevel 1 (
    echo Failed to verify Drive setup
    exit /b 1
)

echo.
echo Step 3: Creating folder structure...
node src/google-drive-setup.js
if errorlevel 1 (
    echo Failed to create folder structure
    exit /b 1
)

echo.
echo Google Drive setup completed successfully!
echo Please add the folder IDs to your .env file as shown above.
pause
