@echo off
echo Testing PDF Styling System
echo.

REM Open test file in default browser
echo Opening test file in browser...
start "" "style-test.html"

echo.
echo Test file opened. Please:
echo 1. Review the styling in the browser
echo 2. Use browser's print function (Ctrl+P) to generate PDF
echo 3. Check the PDF output for:
echo    - Correct typography and layout
echo    - Link styling and indicators
echo    - Code block formatting
echo    - Table layouts
echo    - Print-specific optimizations
echo.
echo Press any key to exit...
pause >nul
