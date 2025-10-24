#!/bin/bash

echo "========================================"
echo " Live Video Activity Monitor"
echo " Starting application..."
echo "========================================"
echo ""

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

echo "Starting Streamlit application..."
echo ""
streamlit run app.py





