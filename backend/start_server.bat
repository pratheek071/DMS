@echo off
echo ==========================================
echo   STARTING BACKEND SERVER
echo ==========================================
echo.

echo Finding your IP address...
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set ip=%%a
    echo Your IP Address: %%a
    echo.
    echo USE THIS URL IN YOUR APP:
    echo    http:%%a:8000
    echo.
)

echo ==========================================
echo.
echo Starting FastAPI server...
echo Keep this window open!
echo Press Ctrl+C to stop
echo.

python server.py

pause



