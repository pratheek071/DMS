@echo off
echo ========================================
echo   STARTING APP - TUNNEL MODE (RETRY)
echo   (Works across different networks)
echo ========================================
echo.
echo This mode is slower but works when phone/laptop
echo are on DIFFERENT WiFi networks.
echo.
echo Attempting tunnel connection with timeout extension...
echo.

REM Set longer timeout for ngrok
set EXPO_TUNNEL_TIMEOUT=60000

call npx expo start --tunnel --clear

pause





