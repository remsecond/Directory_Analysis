@echo off
echo Creating folder structure...

REM Create input directories
mkdir input\email 2>nul
mkdir input\ofw 2>nul
mkdir input\documents\forms 2>nul
mkdir input\documents\records 2>nul
mkdir input\documents\attachments 2>nul
mkdir input\images 2>nul
mkdir input\temp 2>nul

REM Create processed directories
mkdir processed\archive 2>nul
mkdir processed\documents 2>nul
mkdir processed\images 2>nul

echo Moving files to appropriate directories...

REM Move PDF files to forms directory
move input\*.pdf input\documents\forms\ 2>nul

REM Move image files to images directory
move input\*.png input\images\ 2>nul

REM Move spreadsheet files to records directory
move input\*.ods input\documents\records\ 2>nul

echo Folder organization complete.
echo.
echo New structure created:
echo.
tree /F input
echo.
tree /F processed
