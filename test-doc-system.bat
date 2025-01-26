@echo off
echo Testing Document Processing System
echo ================================

REM Check if document processor is running
tasklist /FI "IMAGENAME eq python.exe" /FI "WINDOWTITLE eq Document Processor*" 2>NUL | find /I /N "python.exe" >NUL
if "%ERRORLEVEL%"=="1" (
    echo Document processor not running
    echo Starting document processor...
    start "Document Processor" cmd /c start-doc-processor-v2.bat
    timeout /t 5 /nobreak >nul
)

echo.
echo Running tests...
python src/test_document_system.py

echo.
echo Test run complete
pause
