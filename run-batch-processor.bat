@echo off
"C:\Program Files\dotnet\dotnet.exe" build src\BatchProcessorUI\BatchProcessorUI.csproj
if %ERRORLEVEL% NEQ 0 (
    echo Error: Build failed
    pause
    exit /b 1
)

echo Starting application...
"C:\Program Files\dotnet\dotnet.exe" run --project src\BatchProcessorUI\BatchProcessorUI.csproj
