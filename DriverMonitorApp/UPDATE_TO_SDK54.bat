@echo off
echo ========================================
echo Updating Driver Monitor App to SDK 54
echo ========================================
echo.
echo This will:
echo 1. Remove old dependencies
echo 2. Install SDK 54 packages
echo 3. Clear all caches
echo 4. Start fresh development server
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo [1/5] Removing old dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo Done!

echo.
echo [2/5] Installing SDK 54 dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo Done!

echo.
echo [3/5] Checking for issues...
call npx expo-doctor
echo Done!

echo.
echo [4/5] Clearing all caches...
if exist .expo rmdir /s /q .expo
echo Done!

echo.
echo [5/5] Starting development server...
echo.
echo ========================================
echo Update Complete! SDK 54 is ready!
echo ========================================
echo.
echo Next steps:
echo 1. Update Expo Go app on your phone
echo 2. Scan the QR code
echo 3. Test all features
echo.
echo Starting server...
echo.
call npx expo start --clear

pause





