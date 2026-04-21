@echo off
echo ===============================================
echo    Restarting Anocab Backend Server
echo ===============================================
echo.

echo Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting backend server...
cd backend
start cmd /k "node server.js"

echo.
echo ===============================================
echo Backend server is starting in a new window
echo ===============================================
echo.
pause
