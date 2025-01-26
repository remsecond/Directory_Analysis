@echo off
echo Installing required Python packages...
pip install watchdog

echo.
echo Starting document processor...
python src/document_processor.py
