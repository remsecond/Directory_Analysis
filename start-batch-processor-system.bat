@echo off
echo Starting Batch Document Processing System...

REM Start the Python backend server
start "Batch Processor Server" cmd /c "start-batch-processor.bat"

REM Wait for the server to start
powershell -Command "Start-Sleep -Seconds 3"

REM Start the Windows Forms UI
start "Batch Processor UI" cmd /c "start-batch-processor-ui.bat"

echo System started.
echo Backend Server: http://localhost:5000
echo.
echo To stop the system:
echo 1. Close the UI window
echo 2. Run stop-batch-processor.bat to stop the server
