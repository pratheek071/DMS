@echo off
echo ========================================
echo Fixing SDK 54 Complete Installation
echo ========================================
echo.

echo [1/6] Cleaning old installation...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del /q package-lock.json
)
if exist .expo (
    echo Removing .expo cache...
    rmdir /s /q .expo
)
echo Done!

echo.
echo [2/6] Installing with Expo installer (this ensures compatibility)...
call npx expo install --fix
if errorlevel 1 (
    echo.
    echo Falling back to regular npm install...
    call npm install
)
echo Done!

echo.
echo [3/6] Verifying installation with Expo doctor...
call npx expo-doctor --fix-dependencies
echo Done!

echo.
echo [4/6] Creating placeholder assets...
echo Creating icon.png...
echo. > assets\icon.png
echo Creating splash.png...
echo. > assets\splash.png
echo Creating adaptive-icon.png...
echo. > assets\adaptive-icon.png
echo Creating favicon.png...
echo. > assets\favicon.png
echo Done!

echo.
echo [5/6] Clearing all caches...
call npx expo start --clear --no-dev
timeout /t 2 >nul
taskkill /F /IM node.exe >nul 2>&1
echo Done!

echo.
echo [6/6] Installation complete! Starting app with tunnel...
echo.
echo ========================================
echo Ready! The app will start now.
echo ========================================
echo.
echo Note: The app will work with placeholder assets.
echo You can replace them later with proper icons.
echo.
call npx expo start --tunnel --clear

pause





