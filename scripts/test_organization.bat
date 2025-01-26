@echo off
echo Starting organization system test...
echo.

REM Clean up any existing files
echo Cleaning up previous test files...
if exist "input\*" del /Q "input\*"
if exist "output\*" del /Q /S "output\*"
if exist "docs\folder_analysis_report.json" del "docs\folder_analysis_report.json"
if exist "docs\folder_analysis_details.json" del "docs\folder_analysis_details.json"

REM Setup test files
echo Setting up test files...
call scripts\setup_test_files.bat
if errorlevel 1 (
    echo Error: Failed to set up test files
    pause
    exit /b 1
)

REM Run folder analysis
echo.
echo Running folder analysis...
call analyze-folders.bat
if errorlevel 1 (
    echo Error: Folder analysis failed
    pause
    exit /b 1
)

REM Verify results
echo.
echo Verifying results...

REM Check if output folders were created
if not exist "output\email" (
    echo Error: Email folder not created
    set error=1
)
if not exist "output\documents" (
    echo Error: Documents folder not created
    set error=1
)
if not exist "output\spreadsheets" (
    echo Error: Spreadsheets folder not created
    set error=1
)

REM Check if files were moved correctly
if not exist "output\email\test_email.pdf" (
    echo Error: Email PDF not moved correctly
    set error=1
)
if not exist "output\email\OFW_Messages_Report.pdf" (
    echo Error: OFW report not moved correctly
    set error=1
)
if not exist "output\documents\test_document.docx" (
    echo Error: Document not moved correctly
    set error=1
)
if not exist "output\spreadsheets\test_data.csv" (
    echo Error: Spreadsheet not moved correctly
    set error=1
)

REM Check if duplicate handling worked
if exist "output\documents\test_file.txt" (
    if exist "output\documents\test_file_copy.txt" (
        echo Error: Duplicate file not handled correctly
        set error=1
    )
)

if defined error (
    echo.
    echo Test failed! Some files were not organized correctly.
    pause
    exit /b 1
) else (
    echo.
    echo Test completed successfully!
    echo All files were organized correctly.
)

echo.
echo You can check the analysis reports in the docs folder:
echo - docs\folder_analysis_report.json
echo - docs\folder_analysis_details.json
echo.
pause
