@echo off
echo ===============================================
echo Driver Monitor - LOCAL VERSION
echo ===============================================
echo.
echo 100%% On-Device Processing - No Backend Needed!
echo.

cd /d "%~dp0"
cd DriverMonitorApp

echo Checking if dependencies are installed...
echo.

if not exist "node_modules\" (
    echo Dependencies not found! Installing...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Installation failed!
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencies installed!
    echo.
)

echo Starting local version...
echo.
echo Features:
echo - 100%% Local Processing
echo - No Backend Server Required
echo - Works Offline
echo - 5-7x Faster than server version
echo.
echo Scan QR code with Expo Go app on your phone!
echo.

call npx expo start --clear

pause

