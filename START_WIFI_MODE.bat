@echo off
echo ==========================================
echo   DRIVER MONITOR - WIFI MODE
echo ==========================================
echo.
echo This will start your backend for local WiFi access.
echo Both phone and laptop must be on SAME WiFi!
echo.
echo ==========================================
echo   YOUR IP ADDRESS:
echo ==========================================
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set "ip=%%a"
    set "ip=!ip:~1!"
    echo    IP: !ip!
    echo.
    echo    Use this URL in your phone app:
    echo    http://!ip!:8000
    echo.
)

echo ==========================================
echo.
pause
echo.
echo Starting backend server...
echo.
cd backend
python server.py

pause


