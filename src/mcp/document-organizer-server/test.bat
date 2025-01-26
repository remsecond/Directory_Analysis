@echo off
echo Installing dependencies...
call npm install

echo Running tests...
call npm test

if errorlevel 1 (
    echo Tests failed
    exit /b 1
) else (
    echo All tests passed
    exit /b 0
)
