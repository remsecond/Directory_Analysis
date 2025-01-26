@echo off
REM Create test users
set USER1=moyer_christine
set USER2=moyer_adrian
set USER3=evaluator_smith

REM Create base directories
mkdir "users\%USER1%\input\email" 2>nul
mkdir "users\%USER1%\input\ofw" 2>nul
mkdir "users\%USER1%\input\attachments" 2>nul
mkdir "users\%USER1%\input\images" 2>nul
mkdir "users\%USER1%\input\spreadsheets" 2>nul
mkdir "users\%USER1%\input\documents" 2>nul

mkdir "users\%USER2%\input\email" 2>nul
mkdir "users\%USER2%\input\ofw" 2>nul
mkdir "users\%USER2%\input\attachments" 2>nul
mkdir "users\%USER2%\input\images" 2>nul
mkdir "users\%USER2%\input\spreadsheets" 2>nul
mkdir "users\%USER2%\input\documents" 2>nul

mkdir "users\%USER3%\input\email" 2>nul
mkdir "users\%USER3%\input\ofw" 2>nul
mkdir "users\%USER3%\input\attachments" 2>nul
mkdir "users\%USER3%\input\images" 2>nul
mkdir "users\%USER3%\input\spreadsheets" 2>nul
mkdir "users\%USER3%\input\documents" 2>nul

REM Create test files for User 1 (Christine)
echo Creating files for %USER1%...
copy nul "users\%USER1%\input\email\Email exchange with adrianmoyer@hotmail.com after 2024-10-31 before 2025-01-12.pdf"
copy nul "users\%USER1%\input\ofw\OFW_Messages_Report_2025-01-12_09-01-06.pdf"
copy nul "users\%USER1%\input\attachments\Adrian Ski Trip Form.pdf"
copy nul "users\%USER1%\input\spreadsheets\Monthly Budget January 2025.xlsx"
copy nul "users\%USER1%\input\documents\Parenting Plan Draft 2025-01-10.docx"

REM Create test files for User 2 (Adrian)
echo Creating files for %USER2%...
copy nul "users\%USER2%\input\email\Email exchange with christinemoyer@hotmail.com after 2024-10-31 before 2025-01-12.pdf"
copy nul "users\%USER2%\input\ofw\OFW_Response_2025-01-13_10-15-22.pdf"
copy nul "users\%USER2%\input\attachments\School Schedule Spring 2025.pdf"
copy nul "users\%USER2%\input\spreadsheets\Expense Report 2024-Q4.xlsx"
copy nul "users\%USER2%\input\documents\Response to Parenting Plan 2025-01-11.docx"

REM Create test files for User 3 (Evaluator)
echo Creating files for %USER3%...
copy nul "users\%USER3%\input\documents\Evaluation Report Draft 2025-01-14.docx"
copy nul "users\%USER3%\input\attachments\Interview Notes Moyer Case.pdf"
copy nul "users\%USER3%\input\spreadsheets\Assessment Scores 2025-01.xlsx"
copy nul "users\%USER3%\input\images\Home Visit Photos.jpg"

REM Create processing directories
mkdir "users\%USER1%\processing\current" 2>nul
mkdir "users\%USER1%\processing\errors" 2>nul
mkdir "users\%USER1%\processing\history\2025\01\02" 2>nul

mkdir "users\%USER2%\processing\current" 2>nul
mkdir "users\%USER2%\processing\errors" 2>nul
mkdir "users\%USER2%\processing\history\2025\01\02" 2>nul

mkdir "users\%USER3%\processing\current" 2>nul
mkdir "users\%USER3%\processing\errors" 2>nul
mkdir "users\%USER3%\processing\history\2025\01\02" 2>nul

REM Create processed directories with categorization
mkdir "users\%USER1%\processed\2025\01\02\Orders" 2>nul
mkdir "users\%USER1%\processed\2025\01\02\Mediation" 2>nul
mkdir "users\%USER1%\processed\2025\01\02\Reports" 2>nul
mkdir "users\%USER1%\processed\2025\01\02\Correspondence" 2>nul

mkdir "users\%USER2%\processed\2025\01\02\Orders" 2>nul
mkdir "users\%USER2%\processed\2025\01\02\Mediation" 2>nul
mkdir "users\%USER2%\processed\2025\01\02\Reports" 2>nul
mkdir "users\%USER2%\processed\2025\01\02\Correspondence" 2>nul

mkdir "users\%USER3%\processed\2025\01\02\Orders" 2>nul
mkdir "users\%USER3%\processed\2025\01\02\Mediation" 2>nul
mkdir "users\%USER3%\processed\2025\01\02\Reports" 2>nul
mkdir "users\%USER3%\processed\2025\01\02\Correspondence" 2>nul

echo.
echo Test environment created with multiple users and files
echo.
echo User directories:
echo - users\%USER1%
echo - users\%USER2%
echo - users\%USER3%
echo.
echo Each user has:
echo - Input folders for different file types
echo - Processing folders with current/errors/history
echo - Processed folders with categorization
echo - Test files in various formats
