@echo off
echo Installing required Python packages...
pip install PyPDF2 pdfkit

echo Checking for wkhtmltopdf...
where wkhtmltopdf >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo wkhtmltopdf not found. Please install it from: https://wkhtmltopdf.org/downloads.html
    echo After installing, add it to your PATH or place wkhtmltopdf.exe in this directory
    pause
    exit /b 1
)

echo Converting HTML table of contents to PDF and combining all exhibits...
python combine_pdfs.py

echo Process complete! Check the Combined folder for Complete_Exhibits_Package.pdf
pause
