@echo off
set "SCRIPT_DIR=%~dp0"
set "TARGET=%SCRIPT_DIR%select-folder.bat"
set "SHORTCUT=%USERPROFILE%\Desktop\Select Folder.lnk"

powershell -Command "$WS = New-Object -ComObject WScript.Shell; $shortcut = $WS.CreateShortcut('%SHORTCUT%'); $shortcut.TargetPath = '%TARGET%'; $shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $shortcut.Save()"

if exist "%SHORTCUT%" (
  echo Shortcut created successfully at: %SHORTCUT%
) else (
  echo Failed to create shortcut.
  exit /b 1
)
