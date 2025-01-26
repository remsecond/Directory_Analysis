@echo off
if "%~1"=="" (
    echo Usage: %0 folder_path
    echo Example: %0 "C:\Users\username\Documents\files"
    exit /b 1
)

python src/file_prepend.py "%~1"
