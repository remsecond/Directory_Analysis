@echo off
title Setting up Google Drive folders
echo Setting up Google Drive folder structure...

:: Check if .env file exists
if not exist .env (
  echo Creating .env file from .env.example...
  copy .env.example .env
  echo Please update the .env file with your Google credentials before running setup.
  pause
  exit /b 1
)

:: Run the setup script
echo Creating folder structure in Google Drive...
node scripts/simple-drive-setup.js

if errorlevel 1 (
  echo Failed to create folder structure
  pause
  exit /b 1
)

pause
