@echo off
echo Moving PDF file to 02_Incoming folder...
move "%1" "02_Incoming\"
if errorlevel 1 (
    echo Error moving file
) else (
    echo File moved successfully
)
pause
