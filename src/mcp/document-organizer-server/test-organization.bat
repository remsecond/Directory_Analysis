@echo off
echo Running document organization test...

:: Create test input files
echo Creating test files...
cd input\documents
echo Test content > test1.txt
echo Test content > test2.pdf
echo Test content > test1-v2.txt
copy test1.txt duplicate.txt
mkdir subfolder
echo Test content > subfolder\nested.docx
cd ..\..

:: Start the web server
echo Starting web server...
start /B cmd /c "npm run start:web"

:: Wait for server to start
timeout /t 5

:: Make the organization request
echo Organizing documents...
curl -X POST http://localhost:3000/organize ^
  -H "Content-Type: application/json" ^
  -d "{\"sourcePath\":\"input/documents\",\"targetPath\":\"output/organized\",\"recursive\":true}"

:: Display results
echo.
echo Test Results:
echo ------------
echo Input files:
dir /s /b input\documents
echo.
echo Organized files:
dir /s /b output\organized

:: Verify organization
echo.
echo Verifying organization...
if exist "output\organized\2024\01\documents\test1.txt" (
    echo [✓] Basic file organization
) else (
    echo [✗] Basic file organization failed
)

if exist "output\organized\2024\01\documents\test1-v2.txt" (
    echo [✓] Version handling
) else (
    echo [✗] Version handling failed
)

if exist "output\organized\2024\01\documents\test1.txt.metadata.json" (
    echo [✓] Metadata generation
) else (
    echo [✗] Metadata generation failed
)

:: Stop the server
echo.
echo Stopping server...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo Test complete!
