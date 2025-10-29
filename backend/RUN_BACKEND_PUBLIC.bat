@echo off
echo ==========================================
echo   STARTING BACKEND WITH PUBLIC URL
echo ==========================================
echo.
echo Starting ngrok tunnel in background...
start /B cmd /c "ngrok http 8000"
echo.
echo Waiting 5 seconds for ngrok to start...
timeout /t 5 /nobreak >nul
echo.
echo ==========================================
echo   NGROK DASHBOARD: http://localhost:4040
echo ==========================================
echo   Open http://localhost:4040 to see your public URL!
echo   Copy the "Forwarding" URL (https://xxxx.ngrok.io)
echo   Use that URL in your mobile app settings
echo ==========================================
echo.
echo Starting backend server...
echo.
python server.py

pause




