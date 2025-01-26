@echo off
echo Setting up development environment...

REM Install package in development mode
pip install -e .

REM Set PYTHONPATH to include the current directory
set PYTHONPATH=%CD%;%PYTHONPATH%

echo Development environment setup complete.
