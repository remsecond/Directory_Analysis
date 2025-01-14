@echo off
echo Creating new experimental project...

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is required but not installed.
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

:: Make scripts directory executable
node scripts/create-experimental-project.js

if %ERRORLEVEL% neq 0 (
    echo Failed to create experimental project.
    echo Please check the error message above.
    exit /b 1
)

echo.
echo Project created successfully!
echo Remember:
echo - Keep your project isolated from core
echo - Use feature flags for integration
echo - Follow the experimental project guidelines
echo.
echo See docs/EXPERIMENTAL_PROJECT_TEMPLATE.md for more details.
