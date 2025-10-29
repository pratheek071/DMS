@echo off
echo ==========================================
echo   STARTING COMPLETE SYSTEM
echo ==========================================
echo.
echo This will open 2 terminals:
echo   1. Backend Server (with your IP)
echo   2. Mobile App (Expo Metro)
echo.
echo KEEP BOTH WINDOWS OPEN!
echo ==========================================
echo.

REM Get IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set "ip=%%a"
    set "ip=!ip:~1!"
    goto :found_ip
)

:found_ip
echo.
echo ==========================================
echo   YOUR SERVER URL:
echo ==========================================
echo.
echo     http://!ip!:8000
echo.
echo   Enter this URL in your phone app:
echo   Settings ^> Server URL ^> http://!ip!:8000
echo.
echo ==========================================
echo.
pause

REM Start backend in new window
echo Starting Backend Server...
start "BACKEND SERVER - Keep Open!" cmd /k "cd /d %~dp0backend && python server.py"

REM Wait for backend to start
echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start Expo in new window
echo Starting Mobile App...
start "MOBILE APP - Keep Open!" cmd /k "cd /d %~dp0DriverMonitorApp && npx expo start"

echo.
echo ==========================================
echo   BOTH SERVICES STARTED!
echo ==========================================
echo.
echo NEXT STEPS:
echo   1. Scan QR code from Mobile App window
echo   2. In phone app, go to Settings
echo   3. Enter: http://!ip!:8000
echo   4. Test Connection
echo   5. Start Monitoring!
echo.
echo Close this window when done.
echo ==========================================
pause


