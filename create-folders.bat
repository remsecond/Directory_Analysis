@echo off
mkdir "02_Incoming"
mkdir "03_Processing"
mkdir "04_Completed"
mkdir "05_Metadata"
mkdir "06_Outputs"

python src/document_organizer.py "02_Incoming"
