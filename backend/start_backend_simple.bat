@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   DRIVER MONITOR - BACKEND SERVER
echo ========================================
echo.

echo Step 1: Finding your IP address...
echo.

REM Get the IPv4 address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "ip=%%a"
    set "ip=!ip:~1!"
    echo ✅ Your IP Address: !ip!
    echo.
    echo 📱 USE THIS IN YOUR APP:
    echo    http://!ip!:8000
    echo.
)

echo ========================================
echo.
echo Step 2: Starting FastAPI server...
echo.
echo Keep this window open while using the app!
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

python server.py

pause




