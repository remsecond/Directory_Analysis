@echo off
REM Create input folder structure
mkdir input\email 2>nul
mkdir input\ofw 2>nul
mkdir input\attachments 2>nul
mkdir input\images 2>nul
mkdir input\spreadsheets 2>nul
mkdir input\documents 2>nul

REM Copy email-related files
echo Creating email files...
copy nul "input\email\Email exchange with christinemoyer_hotmail.com after 2024-10-31 before 2025-01-12.pdf"
copy nul "input\email\label Emails from christinemoyer@hotmail.com after 2024-10-31 before 2025-01-12.ods"

REM Copy OFW files
echo Creating OFW files...
copy nul "input\ofw\OFW_Messages_Report_2025-01-12_09-01-06.pdf"
copy nul "input\ofw\2024-04-03 Agreed Order appointing Parenting Evaluator (4858-2165-7268).pdf"

REM Copy attachment files
echo Creating attachment files...
copy nul "input\attachments\Adrian Ski Trip Form.pdf"
copy nul "input\attachments\Fidelity_Investment_Option_Summary_X05342840_Nov-05-2024.csv"
copy nul "input\attachments\Moyer Visitation Report_ 12-26-2024.docx"
copy nul "input\attachments\Mediation Signed Agreement.pdf"

REM Create additional test files for various formats
echo Creating additional test files...
copy nul "input\spreadsheets\Large Spreadsheet Analysis 2024.xlsx"
copy nul "input\images\Important Meeting Screenshot.png"
copy nul "input\documents\IM Messages Export 2024-01.pdf"
copy nul "input\spreadsheets\Monthly Budget Tracker.xlsx"
copy nul "input\images\Court Document Scan.jpg"
copy nul "input\documents\Meeting Minutes 2024-01-15.docx"

echo Test files created successfully.
echo.
echo Files ready for processing in:
echo - input\email
echo - input\ofw
echo - input\attachments
echo - input\images
echo - input\spreadsheets
echo - input\documents
