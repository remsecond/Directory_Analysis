@echo off
cd /d %~dp0
powershell -Command "Get-Process BatchProcessorUI -ErrorAction SilentlyContinue | Stop-Process -Force"
cd src\BatchProcessorUI
"C:\Program Files\dotnet\dotnet.exe" build
if %ERRORLEVEL% EQU 0 (
    "C:\Program Files\dotnet\dotnet.exe" run
)
cd ..\..
