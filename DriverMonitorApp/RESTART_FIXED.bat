@echo off
echo ========================================
echo   RESTARTING WITH FIX
echo ========================================
echo.
echo Stopping current server...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting with corrected configuration...
echo.

call npx expo start --tunnel --clear

pause





