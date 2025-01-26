@echo off
setlocal EnableDelayedExpansion

:: Colors for output
set "GREEN=[32m"
set "YELLOW=[33m"
set "RED=[31m"
set "NC=[0m"

:: Function to check if MinIO is running
:check_minio
echo %YELLOW%Checking MinIO server...%NC%
netstat -an | findstr ":9000" > nul
if %ERRORLEVEL% == 0 (
    echo %GREEN%MinIO server is running%NC%
    exit /b 0
) else (
    echo %RED%MinIO server is not running%NC%
    exit /b 1
)

:: Function to start MinIO if not running
:start_minio
call :check_minio
if %ERRORLEVEL% == 1 (
    echo %YELLOW%Starting MinIO server...%NC%
    start /B minio.exe server data
    timeout /t 5 /nobreak > nul
    call :check_minio
    if !ERRORLEVEL! == 0 (
        echo %GREEN%MinIO server started successfully%NC%
    ) else (
        echo %RED%Failed to start MinIO server%NC%
        exit /b 1
    )
)
exit /b 0

:: Function to check environment variables
:check_env
echo %YELLOW%Checking environment variables...%NC%
if not exist .env (
    echo %YELLOW%Creating .env file from .env.example...%NC%
    copy .env.example .env > nul
    echo %GREEN%.env file created%NC%
)
exit /b 0

:: Function to install dependencies
:install_deps
echo %YELLOW%Installing dependencies...%NC%
call npm install
echo %GREEN%Dependencies installed%NC%
exit /b 0

:: Function to run tests
:run_tests
echo %YELLOW%Running tests...%NC%
call npm test
exit /b 0

:: Function to start development server
:start_dev
echo %YELLOW%Starting development server...%NC%
call npm run dev
exit /b 0

:: Main script
echo %GREEN%=== File Manager Development Setup ===%NC%

:: Parse command line arguments
if "%1"=="test" (
    call :check_env
    call :start_minio
    call :run_tests
) else if "%1"=="install" (
    call :install_deps
) else if "%1"=="clean" (
    echo %YELLOW%Cleaning up...%NC%
    if exist node_modules rmdir /s /q node_modules
    if exist dist rmdir /s /q dist
    if exist coverage rmdir /s /q coverage
    echo %GREEN%Clean up complete%NC%
) else (
    call :check_env
    call :start_minio
    call :start_dev
)

:: Handle Ctrl+C
:cleanup
echo %YELLOW%Shutting down...%NC%
endlocal
exit /b 0
