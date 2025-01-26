@echo off
echo Building document organizer server...

:: Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

:: Build TypeScript files
echo Compiling TypeScript...
call npx tsc

:: Make the server executable
echo Making server executable...
copy /Y build\index.js build\server.js
echo @echo off > build\start.bat
echo node server.js %* >> build\start.bat

echo Build complete.
echo Run 'build\start.bat' to start the server.
