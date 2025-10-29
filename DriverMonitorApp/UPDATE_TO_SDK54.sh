#!/bin/bash

echo "========================================"
echo "Updating Driver Monitor App to SDK 54"
echo "========================================"
echo ""
echo "This will:"
echo "1. Remove old dependencies"
echo "2. Install SDK 54 packages"
echo "3. Clear all caches"
echo "4. Start fresh development server"
echo ""
read -p "Press Enter to continue, or Ctrl+C to cancel..."

echo ""
echo "[1/5] Removing old dependencies..."
rm -rf node_modules package-lock.json
echo "Done!"

echo ""
echo "[2/5] Installing SDK 54 dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo "Done!"

echo ""
echo "[3/5] Checking for issues..."
npx expo-doctor
echo "Done!"

echo ""
echo "[4/5] Clearing all caches..."
rm -rf .expo
echo "Done!"

echo ""
echo "[5/5] Starting development server..."
echo ""
echo "========================================"
echo "Update Complete! SDK 54 is ready!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Update Expo Go app on your phone"
echo "2. Scan the QR code"
echo "3. Test all features"
echo ""
echo "Starting server..."
echo ""
npx expo start --clear





