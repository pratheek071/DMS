# 🔧 Troubleshooting Guide - Driver Monitor App

## 🚨 Common Issues and Solutions

### Issue: "I/O Exception" During QR Code Scanning

This error occurs when Expo Go cannot connect to the development server.

#### Quick Fixes (Try These First):

### ✅ Solution 1: Use Tunnel Connection

**This is the EASIEST solution and works across different networks!**

```bash
cd DriverMonitorApp
npm start -- --tunnel
```

This creates a secure tunnel that works anywhere!

### ✅ Solution 2: Use LAN with Correct IP

```bash
cd DriverMonitorApp
npm start -- --lan
```

Then manually enter your IP in Expo Go:
- Android: Shake device → "Enter URL manually"
- iOS: Scan QR code or enter URL

### ✅ Solution 3: Clear Expo Cache

```bash
cd DriverMonitorApp
npm start -- --clear
```

### ✅ Solution 4: Check Network Connection

Make sure both devices are on same WiFi:

**On Computer:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

**On Phone:**
- Settings → WiFi → Check connected network
- Must match computer's network!

### ✅ Solution 5: Disable Firewall (Temporarily)

**Windows:**
1. Search "Windows Defender Firewall"
2. Turn off temporarily
3. Try scanning again
4. Re-enable after testing

**Mac:**
1. System Preferences → Security & Privacy
2. Firewall → Turn off temporarily
3. Try scanning again

### ✅ Solution 6: Use Different Connection Method

Instead of QR code, try:

**Android:**
1. Open Expo Go app
2. Tap "Enter URL manually"
3. Type: `exp://YOUR_IP:19000`

**iOS:**
1. Open Camera app
2. Scan QR code
3. Or open Expo Go → Enter URL manually

### ✅ Solution 7: Restart Everything

```bash
# Stop all running processes (Ctrl+C)
# Then restart in order:

# 1. Clear npm cache
cd DriverMonitorApp
npm cache clean --force

# 2. Remove node_modules
rmdir /s node_modules  # Windows
rm -rf node_modules    # Mac/Linux

# 3. Reinstall
npm install

# 4. Start fresh
npm start
```

### ✅ Solution 8: Use Metro Bundler Directly

```bash
cd DriverMonitorApp
npx expo start --localhost
```

Then use "Tunnel" option in the web UI that opens.

---

## 🌐 Working Across Different Networks

If you want the app to work even when laptop and phone are on different networks:

### Option 1: Use Expo Tunnel (Recommended)

```bash
npm start -- --tunnel
```

This creates a secure tunnel through Expo's servers!

### Option 2: Use Ngrok for Backend

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok (in separate terminal)
ngrok http 8000

# You'll get a URL like: https://abc123.ngrok.io
# Use this URL in your mobile app settings!
```

---

## 📱 Expo Go Connection Methods

### Method 1: LAN (Same WiFi - Fastest)
```bash
npm start -- --lan
```
✅ Fast, ❌ Requires same WiFi

### Method 2: Tunnel (Different Networks - Slower)
```bash
npm start -- --tunnel
```
✅ Works anywhere, ❌ Slower

### Method 3: Localhost (Testing Only)
```bash
npm start -- --localhost
```
✅ Testing, ❌ Phone can't connect

---

## 🔍 Debugging Steps

### Step 1: Check Expo CLI Version
```bash
expo --version
```
Should be: 49.0.0 or higher

Update if needed:
```bash
npm install -g expo-cli
```

### Step 2: Check Port Availability
```bash
# Check if port 19000 is in use
netstat -ano | findstr :19000  # Windows
lsof -i :19000                 # Mac/Linux
```

If port is busy, kill the process or use different port:
```bash
npm start -- --port 19001
```

### Step 3: Check Node Version
```bash
node --version
```
Should be: v14.0.0 or higher

### Step 4: Verify Package Installation
```bash
cd DriverMonitorApp
npm list expo
```

---

## 🔥 Nuclear Option (Complete Reset)

If nothing works, do a complete reset:

```bash
# 1. Stop all processes (Ctrl+C everywhere)

# 2. Clear Expo cache
cd DriverMonitorApp
npx expo start --clear

# 3. Delete everything and start fresh
cd ..
rmdir /s /q DriverMonitorApp\node_modules     # Windows
rm -rf DriverMonitorApp/node_modules          # Mac/Linux

cd DriverMonitorApp
npm install

# 4. Start with tunnel
npm start -- --tunnel

# 5. On phone: Delete Expo Go app and reinstall
```

---

## 📞 Still Not Working?

### Create a Log File

```bash
cd DriverMonitorApp
npm start -- --tunnel > expo-log.txt 2>&1
```

Share the `expo-log.txt` file for more help.

### Alternative: Use Development Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Create development build
npx expo install expo-dev-client
eas build --platform android --profile development
```

This creates a standalone app that doesn't need Expo Go!

---

## ✅ Success Checklist

- [ ] Same WiFi network (for LAN mode)
- [ ] Firewall disabled or allowing connections
- [ ] Expo CLI up to date
- [ ] Node.js v14+ installed
- [ ] Port 19000 not in use
- [ ] Expo Go app updated
- [ ] Dependencies installed (`npm install`)
- [ ] Cache cleared (`--clear`)

---

## 🎯 Recommended Solution

**For immediate testing:**
```bash
cd DriverMonitorApp
npm start -- --tunnel
```

**For production:**
Build a standalone APK (see below)

---

## 📱 Building Standalone APK (Bypass Expo Go)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build APK
eas build --platform android --profile preview

# Wait for build (5-10 minutes)
# Download APK and install directly on phone
```

This completely bypasses Expo Go and the scanning issue!





