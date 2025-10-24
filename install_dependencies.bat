@echo off
echo ========================================
echo  Installing Dependencies
echo  This may take 2-5 minutes...
echo ========================================
echo.

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo Installing required packages...
pip install -r requirements.txt

echo.
echo ========================================
echo  Installation Complete!
echo  Run 'run_app.bat' to start the app
echo ========================================
echo.

pause





