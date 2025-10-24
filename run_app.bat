@echo off
echo ========================================
echo  Live Video Activity Monitor
echo  Starting application...
echo ========================================
echo.

REM Check if virtual environment exists
if exist venv\Scripts\activate.bat (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
)

echo Starting Streamlit application...
echo.
streamlit run app.py

pause





