@echo off
echo ========================================
echo   FIXING DRIVER MONITOR APP NOW
echo ========================================
echo.

echo Step 1: Stopping any running Metro servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Cleaning old installation...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json
if exist .expo rmdir /s /q .expo

echo Step 3: Installing with legacy peer deps (ignores version conflicts)...
call npm install --legacy-peer-deps

echo.
echo ========================================
echo   INSTALLATION COMPLETE!
echo ========================================
echo.
echo Starting app in tunnel mode...
echo.
call npx expo start --tunnel --clear

pause





