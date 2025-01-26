@echo off
echo Opening documentation...

REM Try to open with default browser
start "" "docs/README.md"

REM If that fails, try VS Code
if errorlevel 1 (
    echo Opening in VS Code instead...
    code docs/README.md
)

echo.
echo Documentation Structure:
echo.
echo Core Documentation:
echo - docs/USER_STORIES.md
echo - docs/WORKFLOW.md
echo - docs/WORKFLOW_SEQUENCE.md
echo - docs/IMPLEMENTATION_STEPS.md
echo.
echo Technical Setup:
echo - docs/GOOGLE_SHEETS_SETUP.md
echo - docs/CURRENT_ARCHITECTURE.md
echo - docs/DATABASE_STRATEGY.md
echo.
echo Press any key to close...
pause > nul
