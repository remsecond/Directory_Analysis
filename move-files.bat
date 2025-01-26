@echo off
setlocal enabledelayedexpansion
echo Starting file organization...

:: Create output directories
if not exist "output\documents" mkdir "output\documents"
if not exist "output\images" mkdir "output\images"
if not exist "output\spreadsheets" mkdir "output\spreadsheets"
if not exist "output\emails" mkdir "output\emails"
if not exist "output\other" mkdir "output\other"

:: Move files based on extension
echo Moving files...
for %%F in (input\*.*) do (
    echo Processing: %%~nxF
    if /I "%%~xF"==".pdf" (
        echo %%~nF | findstr /i /c:"OFW_Messages_Report" /c:"Email exchange" >nul
        if !errorlevel! equ 0 (
            move "%%F" "output\emails\" >nul
        ) else (
            move "%%F" "output\documents\" >nul
        )
    ) else if /I "%%~xF"==".doc" (
        move "%%F" "output\documents\" >nul
    ) else if /I "%%~xF"==".docx" (
        move "%%F" "output\documents\" >nul
    ) else if /I "%%~xF"==".jpg" (
        move "%%F" "output\images\" >nul
    ) else if /I "%%~xF"==".png" (
        move "%%F" "output\images\" >nul
    ) else if /I "%%~xF"==".gif" (
        move "%%F" "output\images\" >nul
    ) else if /I "%%~xF"==".xls" (
        move "%%F" "output\spreadsheets\" >nul
    ) else if /I "%%~xF"==".xlsx" (
        move "%%F" "output\spreadsheets\" >nul
    ) else if /I "%%~xF"==".csv" (
        move "%%F" "output\spreadsheets\" >nul
    ) else if /I "%%~xF"==".eml" (
        move "%%F" "output\emails\" >nul
    ) else if /I "%%~xF"==".msg" (
        move "%%F" "output\emails\" >nul
    ) else (
        move "%%F" "output\other\" >nul
    )
)

echo.
echo Files have been organized by type in the output folder
echo Done!
