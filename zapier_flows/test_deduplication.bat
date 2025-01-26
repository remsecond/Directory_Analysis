@echo off
REM Test deduplication scenarios with multiple users and file formats

REM Create test users and base structure if not exists
call multi_user_test.bat

REM Test Case 1: Same file uploaded multiple times
echo Testing duplicate file uploads...
copy "users\moyer_christine\input\attachments\Adrian Ski Trip Form.pdf" "users\moyer_christine\input\attachments\Adrian Ski Trip Form (1).pdf"
copy "users\moyer_christine\input\attachments\Adrian Ski Trip Form.pdf" "users\moyer_christine\input\attachments\Adrian Ski Trip Form (2).pdf"

REM Test Case 2: Same content in different formats (Word and PDF)
echo Testing multi-format variants...
copy nul "users\moyer_christine\input\documents\Parenting Plan Draft 2025-01-10.docx"
copy nul "users\moyer_christine\input\documents\Parenting Plan Draft 2025-01-10.pdf"

REM Test Case 3: Spreadsheet formats
echo Testing spreadsheet variants...
copy nul "users\moyer_christine\input\spreadsheets\Monthly Budget January 2025.xlsx"
copy nul "users\moyer_christine\input\spreadsheets\Monthly Budget January 2025.csv"

REM Create version history structure
mkdir "users\moyer_christine\versions" 2>nul
mkdir "users\moyer_christine\duplicates\2025\01" 2>nul

echo.
echo Test files created for deduplication scenarios:
echo.
echo Scenario 1 - Multiple uploads:
echo - Adrian Ski Trip Form.pdf
echo - Adrian Ski Trip Form (1).pdf
echo - Adrian Ski Trip Form (2).pdf
echo.
echo Scenario 2 - Format variants:
echo - Parenting Plan Draft 2025-01-10.docx
echo - Parenting Plan Draft 2025-01-10.pdf
echo.
echo Scenario 3 - Spreadsheet variants:
echo - Monthly Budget January 2025.xlsx
echo - Monthly Budget January 2025.csv
echo.
echo Version tracking folders created:
echo - users\moyer_christine\versions
echo - users\moyer_christine\duplicates\2025\01
