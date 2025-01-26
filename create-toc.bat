@echo off
echo Installing required Python packages...
pip install PyPDF2 reportlab

echo Creating table of contents and combining PDFs...
python analyze_pdf.py
pause
