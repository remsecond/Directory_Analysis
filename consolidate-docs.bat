@echo off
echo Consolidating documentation into a single location...
node scripts/consolidate-docs.js
echo.
echo Documentation has been consolidated into the 'documentation' directory.
echo Opening documentation in default browser...
start documentation/README.md
pause
