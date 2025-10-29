# 🚀 Quick Start Guide - Driver Monitoring System (React Native)

Get up and running in 5 minutes!

## 📋 What You Need

- **Computer**: Windows/Mac/Linux with Python 3.8+
- **Phone**: Android or iPhone with camera
- **Network**: Both on same WiFi

## ⚡ Quick Setup (5 Steps)

### Step 1: Clone/Download Project

```bash
cd FaceMonitor
```

### Step 2: Start Backend Server

**Windows:**
```bash
cd backend
pip install -r requirements.txt
python server.py
```

**Mac/Linux:**
```bash
cd backend
pip3 install -r requirements.txt
python3 server.py
```

✅ You should see: "Model loaded successfully!"

### Step 3: Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig
```
Look for "inet" address (e.g., 192.168.1.100)

📝 **Write down your IP!** Example: `192.168.1.100`

### Step 4: Install Mobile App

**Open new terminal:**
```bash
cd DriverMonitorApp
npm install
npm start
```

✅ You should see a QR code!

### Step 5: Run on Phone

1. **Install Expo Go** on your phone (Play Store/App Store)
2. **Scan QR code** from terminal
3. App opens → Tap **Settings** (⚙️)
4. Enter: `http://YOUR_IP:8000` (e.g., `http://192.168.1.100:8000`)
5. Tap **"Test Connection"**
6. ✅ Connected! Go back and tap **"Start Monitoring"**

## 🎉 You're Done!

The app is now monitoring! You'll see:
- Live camera feed
- Real-time behavior detection
- Alerts for dangerous behaviors
- Audio warnings for critical events

## 🎯 Key Features

- **🟢 SAFE**: Eyes on road
- **🟡 CAUTION**: Looking left/right
- **🟠 WARNING**: Eyes closing or looking down
- **🔴 CRITICAL**: Eyes closed > 5s or looking down > 5s (BEEP BEEP BEEP!)

## 🐛 Not Working?

### Can't connect to backend?
- ✅ Both devices on **same WiFi**?
- ✅ Backend server **still running**?
- ✅ Firewall **not blocking** port 8000?
- ✅ IP address **correct**?

### Camera not working?
- ✅ **Grant camera permission** in phone settings
- ✅ **Restart** Expo Go app

### App is slow?
- ✅ **Check WiFi speed** (need good connection)
- ✅ **Close other apps** on phone
- ✅ **Move closer** to WiFi router

## 📚 Need More Help?

See detailed guides:
- `REACT_NATIVE_SETUP.md` - Complete setup instructions
- `PROJECT_STRUCTURE.md` - Project architecture
- `DriverMonitorApp/README.md` - Mobile app details

## 💡 Pro Tips

1. **Use phone stand** for stable positioning
2. **Keep phone charged** (camera drains battery)
3. **Good lighting** improves detection accuracy
4. **Position camera** to capture full face

## 🔄 Restart Everything

If something goes wrong:

1. **Stop backend**: Press `Ctrl+C` in backend terminal
2. **Stop app**: Press `Ctrl+C` in app terminal
3. **Close Expo Go** on phone
4. **Start over** from Step 2

## 📱 Building Standalone APK (Optional)

Want an installable APK?

```bash
cd DriverMonitorApp
npm install -g eas-cli
eas build --platform android
```

Follow the prompts and download your APK when ready!

## ⚙️ Advanced Settings

In the app's Settings screen:

- **Confidence Threshold**: Adjust detection sensitivity
  - 20% = High (more detections)
  - 30% = Default (balanced)
  - 50% = Low (fewer detections)

- **Audio Alerts**: Toggle sound on/off

## 🎓 Understanding the System

```
[Phone Camera] → [Captures Frame] → [Sends to Backend]
                                          ↓
                                    [YOLOv11 AI]
                                          ↓
                                   [Detects Pose]
                                          ↓
                                   [Analyzes Behavior]
                                          ↓
[Displays Result] ← [Receives Result] ← [Returns Data]
      ↓
[Plays Alert if Critical]
```

## 🚀 Next Steps

Once you're comfortable:

1. **Test different positions** to find optimal angle
2. **Try different lighting** conditions
3. **Adjust settings** to fine-tune detection
4. **Review session statistics** after monitoring
5. **Check recordings** in `recordings/` folder

## 🎯 Use Cases

- **Driver training**: Monitor novice drivers
- **Fleet management**: Ensure driver safety
- **Research**: Study driver behavior patterns
- **Personal use**: Stay alert on long drives

## ⚠️ Safety Notice

This is a **monitoring and alert system**, not a substitute for:
- ✋ Responsible driving
- ✋ Adequate rest before driving
- ✋ Following traffic laws
- ✋ Professional medical advice

**Always prioritize safe driving practices!**

## 📞 Support

- GitHub Issues: Report bugs and request features
- Documentation: Read the detailed guides
- Community: Share your experiences

---

**Happy Monitoring! 🚗 Stay Safe! ✨**






