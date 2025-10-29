@echo off
echo ========================================
echo   STARTING BACKEND SERVER
echo ========================================
echo.

cd backend

echo Step 1: Checking if Python is installed...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH!
    echo Please install Python from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo Step 2: Installing Python dependencies...
echo (This may take a few minutes on first run)
echo.
pip install -r requirements.txt

echo.
echo Step 3: Finding your computer's IP address...
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP:~1!
    echo Found IP: !IP!
)

echo.
echo ========================================
echo   STARTING SERVER
echo ========================================
echo.
echo Your backend URL will be: http://YOUR_IP:8000
echo Use this URL in your mobile app Settings!
echo.
echo Starting server...
echo.

python server.py

pause




