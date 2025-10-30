# 🚗 Driver Monitoring System - Local Processing Version

## ✨ **100% On-Device AI Processing**

This version runs **entirely on your phone** - no backend server required!

---

## 🎯 **Key Features**

✅ **100% Local Processing** - All AI runs on your phone  
✅ **Works Offline** - No internet connection needed  
✅ **Private & Secure** - No data sent to servers  
✅ **Fast & Efficient** - Lower latency than server version  
✅ **Easy Setup** - No backend configuration needed  
✅ **Saves to Phone** - Session logs stored locally  

---

## 🚀 **Quick Start**

### **1. Install Dependencies**

```bash
# On Windows
.\INSTALL_LOCAL_VERSION.bat

# On Mac/Linux
npm install
```

### **2. Start the App**

```bash
# On Windows
.\START_LOCAL_APP.bat

# On Mac/Linux
npm start
```

### **3. Run on Your Phone**

**Option A: Expo Go (Easiest)**
1. Install "Expo Go" app from Play Store/App Store
2. Scan the QR code shown in terminal
3. App will load on your phone

**Option B: USB Connection**
1. Connect phone via USB
2. Enable USB debugging
3. Press 'a' for Android or 'i' for iOS

---

## 📱 **How It Works**

### **Technical Architecture**

```
┌─────────────────────────────────────┐
│         YOUR PHONE ONLY             │
│                                     │
│  Camera → TensorFlow Lite           │
│            ↓                        │
│       Pose Detection                │
│            ↓                        │
│       Behavior Analysis             │
│            ↓                        │
│       Alert & Display               │
│            ↓                        │
│       Save to Phone Storage         │
│                                     │
│  NO SERVER • NO INTERNET NEEDED     │
└─────────────────────────────────────┘
```

### **ML Model: MoveNet SinglePose Lightning**

- **Type**: TensorFlow Lite optimized for mobile
- **Speed**: ~50-100ms per frame
- **Accuracy**: High precision pose detection
- **Size**: ~3 MB (lightweight)
- **Device**: Runs on CPU/GPU automatically

---

## 📊 **Performance**

| Metric | Server Version | **Local Version** |
|--------|---------------|-------------------|
| **Latency** | 500-700ms | **50-100ms** ⚡ |
| **FPS** | 2-5 FPS | **5-10 FPS** ⚡ |
| **Internet** | Required | **Not Required** ✅ |
| **Data Usage** | 250 KB/frame | **0 KB** ✅ |
| **Privacy** | Data sent out | **100% Local** ✅ |
| **Setup** | Need backend | **Just app** ✅ |

---

## 🎓 **Usage Guide**

### **1. Starting Monitoring**

1. Open app
2. Grant camera permissions
3. Wait for ML model to load (~5 seconds first time)
4. Press "Start Monitoring"
5. Position phone to capture driver's face

### **2. During Monitoring**

The app detects these behaviors:

- 🟢 **SAFE**: Eyes on road, normal driving
- 🟡 **CAUTION**: Looking left/right (mirror check)
- 🟠 **WARNING**: Eyes closing or looking down (2-5s)
- 🔴 **CRITICAL**: Eyes closed or looking down >5s → **ALARM!**

### **3. Stopping & Reviewing**

1. Press "Stop Monitoring"
2. Session summary shows:
   - Total duration
   - Frames processed
   - Alerts triggered
   - Behavior statistics
3. Session log saved to phone storage

---

## 💾 **Data Storage**

### **Where Files Are Saved**

All files are saved to your phone's internal storage:

```
Phone Storage/
├── Driver Monitor/           (Videos - if camera recording used)
└── App Documents/
    ├── behavior_log_YYYYMMDD-HHMMSS.json
    └── session_summary_YYYYMMDD-HHMMSS.json
```

### **Viewing Saved Sessions**

Session logs are saved as JSON files and can be viewed using any text editor or JSON viewer app.

Example session summary:
```json
{
  "sessionId": "2024-10-30T14-30-22",
  "duration": "125.30",
  "stats": {
    "totalFrames": 626,
    "alertsTriggered": 3,
    "behaviorsDetected": {
      "eyes_on_road": 580,
      "looking_left": 23,
      "drowsy_eyes_closing": 15,
      "sleeping_eyes_closed": 8
    }
  }
}
```

---

## ⚙️ **Settings**

### **Audio Alerts**

Toggle audio alerts on/off in Settings screen.

- **CRITICAL**: 3 loud beeps
- **WARNING**: 2 medium beeps

### **WhatsApp Alerts**

*Note: WhatsApp alerts are not available in local version.*  
*All processing happens offline - no external communication.*

---

## 🔧 **Troubleshooting**

### **App Won't Start**

```bash
# Clear cache and reinstall
npm install
npx expo start --clear
```

### **Model Loading Fails**

1. Check internet connection (first download only)
2. Clear app cache
3. Restart app
4. Ensure sufficient storage (~50 MB free)

### **Low FPS / Slow Processing**

1. Close other apps
2. Ensure phone is not in power-saving mode
3. Allow app to use GPU (check phone settings)

### **Camera Not Working**

1. Grant camera permissions in Settings
2. Restart app
3. Check if another app is using camera

---

## 📚 **Technical Details**

### **Dependencies**

```json
{
  "@tensorflow/tfjs": "^4.20.0",
  "@tensorflow/tfjs-react-native": "^1.0.0",
  "@tensorflow-models/pose-detection": "^2.1.3",
  "expo-camera": "~17.0.8",
  "expo-media-library": "~18.2.0",
  "expo-file-system": "~19.0.17"
}
```

### **Pose Detection Model**

- **Model**: MoveNet SinglePose Lightning
- **Input**: 192x192 RGB image
- **Output**: 17 keypoints (x, y, confidence)
- **Keypoints**: nose, eyes, ears, shoulders, elbows, wrists, hips, knees, ankles

### **Behavior Analysis Logic**

**Eyes Closed Detection:**
```javascript
if (leftEye.score < 0.35 || rightEye.score < 0.35) {
  // Eyes not visible = likely closed
  duration = trackDuration();
  if (duration > 5.0) triggerCriticalAlarm();
}
```

**Looking Down Detection:**
```javascript
if (nose.y > averageShoulderY + threshold) {
  // Nose below shoulders = looking down
  duration = trackDuration();
  if (duration > 5.0) triggerCriticalAlarm();
}
```

---

## 🆚 **Local vs Server Version**

| Feature | Local | Server |
|---------|-------|--------|
| **Internet Required** | ❌ No | ✅ Yes |
| **Setup Complexity** | ⭐ Easy | ⭐⭐⭐ Complex |
| **Latency** | ⚡ Fast (50-100ms) | 🐌 Slow (500-700ms) |
| **Privacy** | 🔒 100% Private | ⚠️ Data sent out |
| **WhatsApp Alerts** | ❌ No | ✅ Yes |
| **Scalability** | ✅ Unlimited | ⚠️ Server limited |
| **Cost** | ✅ Free | 💰 Server costs |

---

## 📖 **API Reference**

### **PoseDetectionService**

```javascript
import PoseDetectionService from './services/PoseDetectionService';

// Initialize model
await PoseDetectionService.initialize();

// Detect pose
const poses = await PoseDetectionService.detectPose(imageUri);
```

### **BehaviorAnalysisService**

```javascript
import BehaviorAnalysisService from './services/BehaviorAnalysisService';

// Analyze behavior
const result = BehaviorAnalysisService.analyzeBehavior(poses);

// result = {
//   activity: 'sleeping_eyes_closed',
//   confidence: 0.95,
//   alert_level: 'CRITICAL',
//   details: { ... },
//   trigger_alarm: true
// }
```

### **LocalVideoRecorder**

```javascript
import LocalVideoRecorder from './services/LocalVideoRecorder';

// Start session
await LocalVideoRecorder.startSession();

// Log behavior
LocalVideoRecorder.logBehavior(behaviorResult);

// Stop and save
const result = await LocalVideoRecorder.stopSession();
```

---

## 🔐 **Privacy & Security**

### **What Data Is Stored**

- ✅ Session logs (JSON files)
- ✅ Behavior statistics
- ✅ Timestamps
- ❌ No camera images stored by default
- ❌ No data sent to external servers
- ❌ No cloud sync

### **Data Access**

- All data stored in app's private storage
- Only accessible by the app
- Can be deleted at any time
- No external access

---

## 🎯 **Best Practices**

1. **Positioning**: Mount phone to capture driver's face clearly
2. **Lighting**: Ensure adequate lighting for face detection
3. **Angle**: Keep camera at eye level, facing driver
4. **Distance**: 30-50 cm from driver's face
5. **Stability**: Use a phone mount to prevent movement

---

## 🚧 **Known Limitations**

1. **First Launch**: Model download requires internet (~3 MB)
2. **Battery Usage**: ML processing is CPU intensive
3. **Device Compatibility**: Requires modern phone (2018+)
4. **No Cloud Sync**: Data stays on device only
5. **WhatsApp Alerts**: Not available in local version

---

## 🔄 **Updates & Maintenance**

### **Updating the App**

```bash
cd DriverMonitorApp
npm update
npx expo start --clear
```

### **Model Updates**

Models are cached after first download. To force update:

1. Clear app data
2. Restart app
3. Model will re-download

---

## 💡 **Tips & Tricks**

### **Improve Performance**

1. Close background apps
2. Disable battery saver mode
3. Use recent phone (2020+)
4. Allow GPU usage

### **Extend Battery Life**

1. Lower screen brightness
2. Use power bank
3. Enable battery saver after monitoring
4. Close app when not in use

### **Better Detection**

1. Good lighting is crucial
2. Keep face fully visible
3. Minimize head movement
4. Clean camera lens

---

## 📞 **Support**

### **Common Issues**

Check `TROUBLESHOOTING.md` for solutions to common problems.

### **Report Issues**

File issues on GitHub repository.

---

## 📜 **License**

MIT License - Free to use and modify.

---

## 🙏 **Credits**

- **TensorFlow.js** - On-device ML
- **MoveNet** - Pose detection model
- **Expo** - React Native framework
- **React Native** - Mobile app framework

---

**Built with ❤️ for Driver Safety**

🚗 **Stay Safe. Drive Alert. Monitor Locally.** 🚗

