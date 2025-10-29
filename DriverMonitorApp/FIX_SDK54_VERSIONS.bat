@echo off
echo ========================================
echo Fixing SDK 54 Package Versions
echo ========================================
echo.
echo This will install the correct package versions for SDK 54
echo.

echo [1/4] Removing old node_modules...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo Done!

echo.
echo [2/4] Installing correct SDK 54 packages...
call npm install
if errorlevel 1 (
    echo ERROR: Installation failed
    pause
    exit /b 1
)
echo Done!

echo.
echo [3/4] Running Expo doctor to verify...
call npx expo-doctor
echo Done!

echo.
echo [4/4] Clearing cache...
if exist .expo rmdir /s /q .expo
echo Done!

echo.
echo ========================================
echo SDK 54 Packages Fixed!
echo ========================================
echo.
echo Starting app with correct versions...
echo.
call npx expo start --clear --tunnel

pause





