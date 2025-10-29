#!/bin/bash
echo "========================================"
echo "Driver Monitoring System - Backend Server"
echo "========================================"
echo ""
echo "Installing/Updating dependencies..."
pip install -r requirements.txt
echo ""
echo "Starting FastAPI server..."
echo ""
echo "Server will be available at:"
echo "  Local: http://localhost:8000"
echo "  Network: http://YOUR_LOCAL_IP:8000"
echo ""
echo "Find your local IP:"
echo "  - Linux/Mac: Run 'ifconfig' or 'ip addr'"
echo "  - Look for inet address (e.g., 192.168.1.100)"
echo ""
echo "Use the network IP in your React Native app!"
echo ""
python server.py






