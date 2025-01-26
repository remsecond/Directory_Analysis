@echo off
echo Setting up test files...

REM Create test files directory if it doesn't exist
if not exist "input" mkdir "input"

REM Create test email PDF
echo From: test@example.com > "input\test_email.pdf"
echo To: recipient@example.com >> "input\test_email.pdf"
echo Subject: Test Email >> "input\test_email.pdf"
echo Date: Thu, 14 Jan 2024 10:00:00 -0800 >> "input\test_email.pdf"
echo. >> "input\test_email.pdf"
echo This is a test email content to verify the email detection in PDF files. >> "input\test_email.pdf"

REM Create test document
echo This is a test document > "input\test_document.docx"

REM Create test spreadsheet
echo Column1,Column2,Column3 > "input\test_data.csv"
echo Value1,Value2,Value3 >> "input\test_data.csv"

REM Create test OFW export
echo OFW_Messages_Report > "input\OFW_Messages_Report.pdf"
echo Message content here >> "input\OFW_Messages_Report.pdf"

REM Create test duplicate files
echo Test content > "input\test_file.txt"
copy "input\test_file.txt" "input\test_file_copy.txt"

echo Test files created successfully.
echo You can now run analyze-folders.bat to test the organization system.
