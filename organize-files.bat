@echo off
echo Starting document organization pipeline...

:: Create required directories if they don't exist
if not exist input\documents mkdir input\documents
if not exist output\organized mkdir output\organized

:: Run the organization process
python src/document_processor.py --input input/documents --output output/organized

echo Organization complete! Check output\organized for the organized files.
