@echo off
echo Stopping EvidenceAI Mission Control...
echo.

REM Kill all node processes
echo Stopping servers...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo All servers stopped successfully!
echo.
exit /b 0
