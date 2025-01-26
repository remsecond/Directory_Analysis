@echo off
echo Installing required Python packages...
pip install python-magic-bin pathlib

echo Starting automatic document organization...
python src/document_organizer/auto_organizer.py input

echo Organization complete. Check logs for details.
