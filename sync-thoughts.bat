@echo off
echo Starting new session analysis...
echo.
echo This script will:
echo 1. Sync latest documentation
echo 2. Analyze current state
echo 3. Generate next steps
echo.

echo Step 1: Getting latest documentation...
call sync-docs.bat
if errorlevel 1 goto error

echo.
echo Step 2: Analyzing documentation...
node scripts/analyze-docs.js > SESSION_SUMMARY.md
if errorlevel 1 goto error

echo.
echo Step 3: Generating next steps...
echo # Next Steps > NEXT_STEPS.md
echo. >> NEXT_STEPS.md
echo Generated from documentation analysis on %date% %time% >> NEXT_STEPS.md
echo. >> NEXT_STEPS.md
type SESSION_SUMMARY.md | findstr /B "- " >> NEXT_STEPS.md

echo.
echo Session context has been created:
echo - SESSION_SUMMARY.md: Current state analysis
echo - NEXT_STEPS.md: Suggested next actions
echo.
goto end

:error
echo.
echo Error occurred during session analysis
echo Please check the console output for details

:end
pause
