@echo off
echo ========================================
echo  Installing pygame for Audio Alerts
echo ========================================
echo.

echo Method 1: Try direct install with retry...
pip install pygame==2.5.2 --default-timeout=100 --retries 5

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ pygame installed successfully!
    goto :test
)

echo.
echo Method 1 failed. Trying Method 2: Download from mirror...
pip install pygame==2.5.2 --index-url https://pypi.tuna.tsinghua.edu.cn/simple

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ pygame installed successfully!
    goto :test
)

echo.
echo Method 2 failed. Trying Method 3: Use cache...
pip install --no-index --find-links=https://files.pythonhosted.org/packages/ pygame

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ All methods failed. 
    echo.
    echo Manual steps:
    echo 1. Download pygame wheel from: https://www.lfd.uci.edu/~gohlke/pythonlibs/#pygame
    echo 2. Run: pip install downloaded_file.whl
    pause
    exit /b 1
)

:test
echo.
echo Testing pygame installation...
python -c "import pygame; print('✅ pygame works!')"

echo.
echo ========================================
echo  Installation Complete!
echo  Run: streamlit run app.py
echo ========================================
echo.

pause




