@echo off
echo ==========================================
echo   DRIVER MONITOR - PUBLIC MODE
echo ==========================================
echo.
echo This will start your backend with public access via ngrok.
echo.
echo REQUIREMENTS:
echo   1. Ngrok account (sign up at ngrok.com)
echo   2. Auth token configured (run this ONCE):
echo      npx ngrok config add-authtoken YOUR_TOKEN
echo.
echo ==========================================
echo.
echo Opening TWO terminals:
echo   Terminal 1: Ngrok tunnel
echo   Terminal 2: Backend server
echo.
echo Keep BOTH terminals open!
echo ==========================================
echo.
pause
echo.
echo Starting ngrok tunnel...
start "NGROK TUNNEL" cmd /k "cd backend && npx ngrok http 8000"
echo.
echo Waiting 5 seconds for ngrok to start...
timeout /t 5 /nobreak >nul
echo.
echo Starting backend server...
start "BACKEND SERVER" cmd /k "cd backend && python server.py"
echo.
echo ==========================================
echo   BOTH SERVICES STARTED!
echo ==========================================
echo.
echo NEXT STEPS:
echo   1. Check the NGROK TUNNEL window
echo   2. Copy the URL (https://xxxx.ngrok-free.app)
echo   3. Open your phone app
echo   4. Go to Settings
echo   5. Enter the ngrok URL
echo   6. Test connection
echo   7. Start monitoring!
echo.
echo ==========================================
echo   NGROK DASHBOARD: http://localhost:4040
echo ==========================================
echo   Open in browser to see traffic and URL
echo.
pause



