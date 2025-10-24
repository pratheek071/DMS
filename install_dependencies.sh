#!/bin/bash

echo "========================================"
echo " Installing Dependencies"
echo " This may take 2-5 minutes..."
echo "========================================"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
python -m pip install --upgrade pip

# Install requirements
echo "Installing required packages..."
pip install -r requirements.txt

echo ""
echo "========================================"
echo " Installation Complete!"
echo " Run './run_app.sh' to start the app"
echo "========================================"
echo ""





