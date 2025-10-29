@echo off
echo ==========================================
echo   STARTING BACKEND WITH PUBLIC ACCESS
echo ==========================================
echo.
echo This will:
echo   1. Install ngrok (if needed)
echo   2. Start backend server
echo   3. Create public URL for your phone
echo.
echo ==========================================
echo.

echo Step 1: Installing ngrok...
npm install -g ngrok
echo.

echo Step 2: Starting backend with ngrok...
echo.
python start_server_public.py

pause




