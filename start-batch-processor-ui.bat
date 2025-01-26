@echo off
echo Building and starting Batch Document Processor UI...

set DOTNET_PATH=C:\Program Files\dotnet\dotnet.exe

REM Build and run the Windows Forms app
cd src\BatchProcessorUI
"%DOTNET_PATH%" build
if %ERRORLEVEL% NEQ 0 (
    echo Error: Build failed
    pause
    exit /b 1
)

echo Starting application...
"%DOTNET_PATH%" run
cd ..\..
