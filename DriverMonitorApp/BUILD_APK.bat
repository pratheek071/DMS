@echo off
echo ==========================================
echo   BUILDING APK FOR DISTRIBUTION
echo ==========================================
echo.
echo IMPORTANT: Before building, update the default URL!
echo.
echo 1. Open: DriverMonitorApp\src\context\AppContext.js
echo 2. Line 6: Change the URL to your ngrok URL
echo 3. Save the file
echo.
echo Example:
echo   const [serverUrl, setServerUrl] = useState('https://your-ngrok-url.ngrok-free.app');
echo.
echo ==========================================
echo.
pause
echo.
echo Building APK...
echo This will take 10-15 minutes...
echo.
npx eas build -p android --profile preview
echo.
echo ==========================================
echo   BUILD COMPLETE!
echo ==========================================
echo.
echo Download the APK from the link shown above.
echo Share this APK with anyone - it will work without WiFi setup!
echo.
pause



