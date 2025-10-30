@echo off
echo ===============================================
echo Driver Monitor - Local Version
echo ===============================================
echo.
echo Starting app with 100%% local processing...
echo No backend server required!
echo.

cd /d "%~dp0"

echo Starting Expo...
echo.
echo Options will appear in terminal:
echo - Press 'a' for Android
echo - Press 'i' for iOS
echo - Press 'w' for web
echo - Scan QR code with Expo Go app
echo.

call npx expo start --clear

pause

