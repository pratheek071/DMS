# Driver Monitoring System - React Native Setup Guide

Complete guide to set up and run the Driver Monitoring System with React Native mobile app.

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Prerequisites](#prerequisites)
3. [Backend Setup](#backend-setup)
4. [Mobile App Setup](#mobile-app-setup)
5. [Running the Application](#running-the-application)
6. [Configuration](#configuration)
7. [Troubleshooting](#troubleshooting)

## 🏗️ System Architecture

The system consists of two main components:

1. **Backend Server (Python/FastAPI)**
   - Runs on your computer
   - Handles ML processing with YOLOv11
   - Exposes REST API endpoints
   - Port: 8000

2. **Mobile App (React Native/Expo)**
   - Runs on Android device
   - Captures camera frames
   - Sends frames to backend
   - Displays results and alerts

## 📦 Prerequisites

### For Backend (Computer)

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **pip** - Python package manager (included with Python)
- **Git** - Version control
- **At least 4GB RAM** (8GB recommended for optimal performance)

### For Mobile App (Computer)

- **Node.js 14+** - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager (included with Node.js)
- **Expo CLI** - React Native framework

### For Mobile App (Phone)

- **Android 5.0+** or **iOS 11+**
- **Expo Go app** - Download from Play Store/App Store
- **Same WiFi network** as your computer

## 🖥️ Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Python Dependencies

**Windows:**
```bash
pip install -r requirements.txt
```

**Mac/Linux:**
```bash
pip3 install -r requirements.txt
```

This will install:
- FastAPI - Web framework
- Ultralytics - YOLOv11 model
- OpenCV - Image processing
- PyTorch - Deep learning framework
- And other dependencies

### Step 3: Download YOLOv11 Model

The model will be automatically downloaded on first run. It's about 6MB.

### Step 4: Start the Backend Server

**Windows:**
```bash
start_server.bat
```

**Mac/Linux:**
```bash
chmod +x start_server.sh
./start_server.sh
```

Or manually:
```bash
python server.py
```

### Step 5: Verify Backend is Running

You should see:
```
🚀 Starting Driver Monitoring System Backend...
📡 Server will be available at: http://0.0.0.0:8000
✅ Model loaded successfully!
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Open browser and go to: `http://localhost:8000`

You should see:
```json
{
  "status": "running",
  "service": "Driver Monitoring System API",
  "version": "1.0.0",
  "model_loaded": true
}
```

### Step 6: Find Your Local IP Address

You need your computer's local IP address to connect from the mobile app.

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```
Look for "inet" address (e.g., 192.168.1.100)

**Example:** `192.168.1.100`

**Note:** The server URL will be: `http://192.168.1.100:8000`

## 📱 Mobile App Setup

### Step 1: Navigate to App Directory

```bash
cd DriverMonitorApp
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React Native
- Expo Camera
- React Native Paper (UI components)
- Axios (HTTP client)
- And more

### Step 3: Install Expo CLI (if not already installed)

```bash
npm install -g expo-cli
```

### Step 4: Install Expo Go on Your Phone

- **Android**: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)

## 🚀 Running the Application

### Start the Backend Server

```bash
cd backend
python server.py
```

Keep this terminal window open!

### Start the Mobile App Development Server

Open a **new terminal window**:

```bash
cd DriverMonitorApp
npm start
```

You'll see a QR code in the terminal and a web page will open.

### Open on Your Phone

1. **Make sure your phone and computer are on the same WiFi network**
2. Open **Expo Go** app on your phone
3. **Android**: Tap "Scan QR Code" and scan the QR code from terminal
4. **iOS**: Open Camera app and scan the QR code

The app will build and launch on your phone!

## ⚙️ Configuration

### First Time Setup

1. **Launch the app** on your phone
2. Tap the **Settings icon** (⚙️) in the top right
3. **Enter Server URL**: `http://YOUR_IP:8000`
   - Replace `YOUR_IP` with your computer's IP address
   - Example: `http://192.168.1.100:8000`
4. Tap **"Test Connection"**
5. If successful, you'll see "Connected successfully!" ✅

### Settings Options

- **Server URL**: Backend server address
- **Audio Alerts**: Enable/disable sound alerts
- **Confidence Threshold**: Detection sensitivity
  - 20% = High sensitivity (more detections)
  - 30% = Optimal (recommended)
  - 50% = Low sensitivity (fewer detections)

## 🎮 Using the App

### Start Monitoring

1. **Grant Camera Permission** when prompted
2. Tap **"Start Monitoring"** button
3. Position phone to capture driver's face
4. The app will start detecting behaviors in real-time

### Understanding Alerts

The app displays different alert levels:

- **🟢 SAFE** - Eyes on road, normal driving
- **🟡 CAUTION** - Looking left/right (mirror checks)
- **🟠 WARNING** - Eyes closing or looking down (2-5 seconds)
- **🔴 CRITICAL** - Eyes closed or looking down > 5 seconds
  - Triggers audio alarm: 🔊 BEEP BEEP BEEP

### Stop Monitoring

1. Tap **"Stop Monitoring"** button
2. View session summary:
   - Duration
   - Frames processed
   - Alerts triggered

## 🐛 Troubleshooting

### Backend Issues

#### "Model failed to load"
```bash
# Delete cached model and retry
rm -rf ~/.cache/ultralytics
python server.py
```

#### "Port 8000 already in use"
```bash
# Find and kill process on port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:8000 | xargs kill -9
```

#### "Module not found"
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Mobile App Issues

#### "Cannot connect to backend"

1. **Check same WiFi**: Both devices must be on same network
2. **Check firewall**: Disable firewall or allow port 8000
3. **Verify backend is running**: Check terminal for errors
4. **Test in browser**: Open `http://YOUR_IP:8000` on phone browser
5. **Try different network**: Some public WiFi blocks device-to-device communication

#### "Camera permission denied"

1. Open phone **Settings**
2. Go to **Apps** → **Expo Go**
3. Enable **Camera permission**
4. Restart the app

#### "Expo Go connection failed"

```bash
# Clear cache and restart
expo start -c
```

#### "App is slow/laggy"

1. **Reduce frame rate**: Edit `CameraView.js`, increase interval from 200ms to 500ms
2. **Close other apps**: Free up phone resources
3. **Check network speed**: Use speed test app
4. **Lower camera quality**: Edit quality parameter in CameraView

#### "Audio alerts not working"

1. **Check phone volume**: Increase media volume
2. **Check app settings**: Enable audio alerts
3. **Check phone permissions**: Allow audio for Expo Go
4. **Test with headphones**: Some devices require headphones for app audio

### Network Troubleshooting

#### Finding Your IP Address Issues

**Windows:**
```bash
# Try multiple methods
ipconfig
ipconfig /all
```

**Mac/Linux:**
```bash
# Try multiple methods
ifconfig
ip addr show
hostname -I
```

**Look for addresses starting with:**
- `192.168.x.x` (most common)
- `10.x.x.x`
- `172.16.x.x` to `172.31.x.x`

#### "Firewall Blocking Connection"

**Windows:**
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add Python (python.exe)
4. Allow both Private and Public networks

**Mac:**
1. System Preferences → Security & Privacy → Firewall
2. Firewall Options
3. Add Python to allowed apps

**Linux:**
```bash
# Ubuntu/Debian
sudo ufw allow 8000

# Fedora/CentOS
sudo firewall-cmd --add-port=8000/tcp --permanent
sudo firewall-cmd --reload
```

## 📊 Performance Optimization

### Backend Optimization

1. **Use GPU if available**: Install CUDA-enabled PyTorch
2. **Adjust confidence threshold**: Lower = more detections but slower
3. **Reduce image quality**: Less data to process

### Mobile App Optimization

1. **Adjust frame capture rate** in `CameraView.js`:
```javascript
// Line ~30
intervalId = setInterval(async () => {
  await captureAndProcessFrame();
}, 500); // Increase from 200 to 500 for slower processing
```

2. **Reduce camera quality** in `CameraView.js`:
```javascript
// Line ~45
const photo = await cameraRef.current.takePictureAsync({
  quality: 0.5, // Reduce from 0.7 to 0.5
  base64: true,
  skipProcessing: true,
});
```

## 🔒 Security Notes

- **Local Network Only**: This setup is for local network use only
- **No Authentication**: The API has no authentication (add if deploying publicly)
- **Firewall**: Keep firewall enabled and only allow trusted networks
- **Privacy**: Camera data is processed locally, not sent to cloud

## 🚀 Production Deployment

### For Production Use:

1. **Deploy backend to cloud** (AWS, Google Cloud, Azure)
2. **Use HTTPS** for secure communication
3. **Add authentication** (API keys, OAuth)
4. **Build standalone APK** instead of using Expo Go
5. **Implement data encryption**
6. **Add rate limiting**
7. **Use production-grade database** for logging

### Building Production APK:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build --platform android --profile production

# Download and install APK on device
```

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [YOLOv11 Documentation](https://docs.ultralytics.com/)

## 💡 Tips

1. **Keep phone charged**: Continuous camera use drains battery
2. **Use phone stand**: For stable positioning during monitoring
3. **Good lighting**: Improves detection accuracy
4. **WiFi strength**: Strong WiFi ensures smooth operation
5. **Regular updates**: Keep dependencies updated for best performance

## ⚠️ Known Limitations

- Requires active network connection
- Processing speed depends on network latency
- Backend must be accessible on local network
- High battery consumption during monitoring
- Cannot run in background (Android limitation)

## 🆘 Getting Help

If you encounter issues:

1. Check this guide thoroughly
2. Review error messages in terminal
3. Check backend server logs
4. Try on different network
5. Test with different phone
6. Create GitHub issue with:
   - Error message
   - Steps to reproduce
   - System information
   - Screenshots

---

**Happy Monitoring! 🚗✨**






