@echo off
echo ===============================================
echo WhatsApp Alert Feature - Installation Script
echo ===============================================
echo.

echo Step 1: Installing Python dependencies...
cd backend
pip install requests
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
echo [OK] Python dependencies installed
echo.

echo Step 2: Checking backend files...
if not exist "whatsapp_service.py" (
    echo ERROR: whatsapp_service.py not found!
    pause
    exit /b 1
)
if not exist "alert_manager.py" (
    echo ERROR: alert_manager.py not found!
    pause
    exit /b 1
)
echo [OK] Backend files exist
echo.

cd ..

echo Step 3: Checking mobile app files...
if not exist "DriverMonitorApp\src\context\AppContext.js" (
    echo ERROR: AppContext.js not found!
    pause
    exit /b 1
)
if not exist "DriverMonitorApp\src\screens\SettingsScreen.js" (
    echo ERROR: SettingsScreen.js not found!
    pause
    exit /b 1
)
echo [OK] Mobile app files exist
echo.

echo ===============================================
echo Installation Complete!
echo ===============================================
echo.
echo Next Steps:
echo.
echo 1. Owner: Setup CallMeBot
echo    - Add +34 644 24 39 05 to WhatsApp
echo    - Send: "I allow callmebot to send me messages"
echo    - Save the API key you receive
echo.
echo 2. Start the system:
echo    - Run: START_EVERYTHING.bat
echo.
echo 3. Configure in mobile app:
echo    - Go to Settings tab
echo    - Enable WhatsApp Alerts
echo    - Enter owner phone number (with country code)
echo    - Enter CallMeBot API key
echo    - Save settings
echo    - Send test message
echo.
echo 4. Read full guide:
echo    - Open: WHATSAPP_ALERT_SETUP.md
echo.
echo ===============================================
pause

