@echo off
echo Stopping Text Processor Server...

taskkill /F /IM node.exe >nul 2>&1

echo Server stopped successfully.
