@echo off
echo Running feature flag verification tests...
set PYTHONPATH=%CD%;%PYTHONPATH%
python scripts/verify-feature-flags.py
if errorlevel 1 (
    echo Feature flag verification failed!
    exit /b 1
)
echo Feature flag verification completed successfully.
