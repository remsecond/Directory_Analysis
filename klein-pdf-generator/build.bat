@echo off
echo Building Klein PDF Generator...

:: Install dependencies
call npm install

:: Compile TypeScript
call npm run compile

echo Build complete!
