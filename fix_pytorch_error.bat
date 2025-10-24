@echo off
echo ========================================
echo  Fixing PyTorch DLL Error
echo ========================================
echo.

echo Step 1: Uninstalling current PyTorch...
pip uninstall -y torch torchvision

echo.
echo Step 2: Installing compatible PyTorch version...
pip install torch==2.1.0 torchvision==0.16.0

echo.
echo Step 3: Verifying installation...
python -c "import torch; print('PyTorch version:', torch.__version__); print('CUDA available:', torch.cuda.is_available())"

echo.
echo ========================================
echo  Fix Complete!
echo  Now run: streamlit run app.py
echo ========================================
echo.

pause





