@echo off
setlocal enabledelayedexpansion

echo Documentation Synchronization Tool
echo ================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed. Please install Python 3.x from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo Error: Git is not installed. Please install Git from https://git-scm.com/downloads
    pause
    exit /b 1
)

REM Check if required packages are installed
pip show google-api-python-client >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install google-api-python-client google-auth-oauthlib google-auth-httplib2
)

REM Check if credentials.json exists
if not exist scripts\credentials.json (
    echo Error: credentials.json not found in scripts directory.
    echo Please follow these steps to set up Google Drive API:
    echo 1. Go to https://console.cloud.google.com/
    echo 2. Create a new project or select an existing one
    echo 3. Enable the Google Drive API
    echo 4. Create OAuth 2.0 credentials
    echo 5. Download the credentials and save as scripts\credentials.json
    pause
    exit /b 1
)

REM Initialize Git repository if not already initialized
cd documentation
if not exist .git (
    echo Initializing Git repository for documentation...
    git init
    git add .gitignore
    git commit -m "Initial commit: Add .gitignore"
)

REM Get current branch name
for /f "tokens=* USEBACKQ" %%F in (`git branch --show-current`) do set BRANCH=%%F

REM Check if we need to create a feature branch
set FEATURE_BRANCH=feature/doc-update-%date:~10,4%%date:~4,2%%date:~7,2%
echo Current branch: %BRANCH%
echo.

:BRANCH_PROMPT
set /p CREATE_BRANCH="Create new feature branch %FEATURE_BRANCH%? (Y/N): "
if /i "%CREATE_BRANCH%"=="Y" (
    git checkout -b %FEATURE_BRANCH%
    if errorlevel 1 (
        echo Error: Failed to create feature branch
        pause
        exit /b 1
    )
    echo Created and switched to new branch: %FEATURE_BRANCH%
) else if /i "%CREATE_BRANCH%"=="N" (
    echo Continuing with current branch: %BRANCH%
) else (
    echo Please enter Y or N
    goto BRANCH_PROMPT
)
echo.

REM Run the sync script
cd ..
echo Running documentation synchronization...
python scripts\sync_documentation.py
if errorlevel 1 (
    echo Error: Synchronization failed
    pause
    exit /b 1
)

REM Return to documentation directory for Git operations
cd documentation

REM Stage changes
git add .
git status

:COMMIT_PROMPT
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "!COMMIT_MSG!"=="" set COMMIT_MSG="Update documentation: %date%"

REM Commit changes
git commit -m !COMMIT_MSG!
if errorlevel 1 (
    echo No changes to commit
) else (
    echo Changes committed successfully
)

:PUSH_PROMPT
set /p PUSH="Push changes to remote? (Y/N): "
if /i "%PUSH%"=="Y" (
    git push origin %BRANCH%
    if errorlevel 1 (
        echo Error: Failed to push changes
        pause
        exit /b 1
    )
    echo Changes pushed successfully
) else if /i "%PUSH%"=="N" (
    echo Changes not pushed. You can push them later using: git push origin %BRANCH%
) else (
    echo Please enter Y or N
    goto PUSH_PROMPT
)

REM Return to original directory
cd ..

echo.
echo Documentation synchronization complete.
echo Check sync_documentation.log for details.
echo.
echo Next steps:
echo 1. Review the changes in the documentation directory
echo 2. If using a feature branch, create a pull request when ready
echo 3. Check the Google Drive folder for synchronized files
echo.
pause
