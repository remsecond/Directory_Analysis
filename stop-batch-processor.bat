@echo off
echo Stopping Batch Document Processor Server...

REM Find and kill Python process running batch_server.py
for /f "tokens=2" %%a in ('tasklist ^| findstr "python.exe"') do (
    taskkill /F /PID %%a 2>nul
)

echo Server stopped successfully.
