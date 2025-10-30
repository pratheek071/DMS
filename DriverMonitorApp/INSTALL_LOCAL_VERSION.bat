@echo off
echo ===============================================
echo Driver Monitor - Local Version Installation
echo ===============================================
echo.
echo This will install all dependencies for on-device processing
echo.

cd /d "%~dp0"

echo Step 1: Installing npm packages...
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)

echo.
echo [OK] All packages installed successfully!
echo.

echo ===============================================
echo Installation Complete!
echo ===============================================
echo.
echo Next steps:
echo 1. Connect your Android phone via USB
echo 2. Enable USB debugging on your phone
echo 3. Run: START_LOCAL_APP.bat
echo.
echo OR for wireless mode:
echo 1. Make sure phone and PC are on same WiFi
echo 2. Run: START_LOCAL_APP.bat
echo 3. Scan QR code on your phone
echo.
echo ===============================================
pause

