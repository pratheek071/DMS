# Migration Notes: Streamlit → React Native

## 📝 Overview

This document outlines the complete migration from the original Streamlit desktop application to a React Native mobile solution.

## 🔄 What Changed

### Architecture

**Before (Streamlit):**
- Monolithic Python application
- Runs on desktop/laptop
- Uses webcam
- All processing in single process

**After (React Native + FastAPI):**
- Distributed client-server architecture
- Mobile app + backend server
- Uses phone camera
- Processing split between devices

### Technology Stack

| Component | Before | After |
|-----------|--------|-------|
| Frontend | Streamlit (Python) | React Native (JavaScript) |
| Backend | Integrated | FastAPI (Python) |
| UI Framework | Streamlit | React Native Paper |
| Camera | OpenCV VideoCapture | Expo Camera |
| State Management | Streamlit session_state | React Context |
| Communication | Direct function calls | REST API / WebSocket |
| Deployment | Desktop app | Mobile app + Server |

## 📦 File Changes

### Deprecated Files (Old System)

These files are **no longer used** in the React Native version:

```
❌ app.py                    # Old Streamlit main app
❌ requirements.txt          # Old Python dependencies (root)
❌ install_dependencies.bat  # Old installation scripts
❌ install_dependencies.sh
❌ install_pygame.bat
❌ fix_pytorch_error.bat
❌ run_app.bat              # Old run scripts
❌ run_app.sh
❌ SETUP_INSTRUCTIONS.md    # Old setup guide
```

### New Files (React Native System)

```
✅ backend/
   ├── server.py           # NEW: FastAPI backend
   ├── requirements.txt    # NEW: Backend dependencies
   ├── start_server.bat    # NEW: Server startup scripts
   └── start_server.sh

✅ DriverMonitorApp/        # NEW: Entire mobile app
   ├── App.js
   ├── package.json
   ├── app.json
   └── src/
       ├── components/
       ├── screens/
       ├── services/
       └── context/

✅ QUICK_START.md          # NEW: Quick start guide
✅ REACT_NATIVE_SETUP.md   # NEW: Complete setup guide
✅ PROJECT_STRUCTURE.md    # NEW: Architecture docs
✅ README_REACT_NATIVE.md  # NEW: Main README
```

### Preserved Files (Still Used)

These files are **still used** by the backend:

```
✅ models/
   ├── activity_detector.py  # Used by backend server
   └── __init__.py

✅ utils/
   ├── pose_analyzer.py      # Used by backend server
   ├── video_recorder.py     # Used by backend server
   ├── audio_alert.py        # Used by backend server
   └── __init__.py

✅ recordings/               # Output directory
```

## 🔀 Code Migration

### UI Components

| Streamlit | React Native | Purpose |
|-----------|--------------|---------|
| `st.camera_input()` | `<Camera>` from expo-camera | Camera access |
| `st.image()` | `<Image>` component | Display images |
| `st.button()` | `<Button>` from react-native-paper | Buttons |
| `st.metric()` | `<StatusCard>` custom component | Metrics |
| `st.error()` | `<AlertBanner>` custom component | Alerts |
| `st.sidebar` | `<SettingsScreen>` | Configuration |
| `st.columns()` | `<View style={flexDirection: 'row'}>` | Layout |

### State Management

**Before (Streamlit):**
```python
if 'detector' not in st.session_state:
    st.session_state.detector = None

st.session_state.is_running = True
```

**After (React Native):**
```javascript
const { 
  isMonitoring, 
  setIsMonitoring 
} = useAppContext();

setIsMonitoring(true);
```

### Frame Processing

**Before (Streamlit):**
```python
# Direct processing in same process
ret, frame = cap.read()
annotated_frame, activity, confidence, details = detector.process_frame(frame)
st.image(annotated_frame)
```

**After (React Native):**
```javascript
// Capture on mobile
const photo = await camera.takePictureAsync({ base64: true });

// Send to backend
const result = await ApiService.processFrame(serverUrl, photo.base64);

// Display result
<Image source={{ uri: result.annotated_frame }} />
```

### Audio Alerts

**Before (Streamlit):**
```python
# Direct audio playback
audio_alert.play_critical_alert()
```

**After (React Native):**
```javascript
// Mobile audio service
if (audioEnabled && result.trigger_alarm) {
  AudioService.playCriticalAlert();
}
```

## 🏗️ Architecture Changes

### Data Flow

**Before:**
```
Camera → Process → Display → Alert
   (all in same app)
```

**After:**
```
Mobile Camera → Capture Frame → Send to Backend
                                      ↓
                                   Process
                                      ↓
Mobile Display ← Receive Result ← Return
     ↓
  Alert
```

### Communication Protocol

**New API Endpoints:**

```
POST /api/process-frame        # Process single frame
WebSocket /ws/monitor          # Real-time processing
POST /api/start-recording      # Start recording
POST /api/stop-recording       # Stop recording
GET /health                    # Health check
```

## 🎨 UI/UX Changes

### Screen Structure

**Before (Streamlit):**
- Single page with sidebar
- Scrollable content
- Auto-refresh on state change

**After (React Native):**
- Multiple screens (Monitoring, Settings)
- Tab/stack navigation
- Manual refresh via pull-to-refresh

### Layout

**Before:**
```
┌─────────────────────────┐
│   Sidebar   │   Main    │
│             │           │
│  Settings   │  Camera   │
│             │  Stats    │
│  Legend     │  Controls │
└─────────────────────────┘
```

**After:**
```
┌───────────────┐
│    Header     │
├───────────────┤
│    Camera     │
├───────────────┤
│    Alerts     │
├───────────────┤
│    Stats      │
├───────────────┤
│   Controls    │
└───────────────┘
```

## 🔧 Configuration Changes

### Settings Location

**Before:**
- Streamlit sidebar
- Settings persist in session only
- No permanent storage

**After:**
- Dedicated Settings screen
- Settings persist in React Context
- Can be saved to AsyncStorage (future)

### Environment Variables

**Before:**
```python
# Hardcoded in app.py
confidence_threshold = 0.3
```

**After:**
```javascript
// Backend: backend/server.py
detector = ActivityDetector(confidence_threshold=0.3)

// Mobile: Context
const [confidenceThreshold, setConfidenceThreshold] = useState(0.3);
```

## 📊 Feature Comparison

| Feature | Streamlit | React Native | Notes |
|---------|-----------|--------------|-------|
| Camera Access | ✅ Webcam | ✅ Front/Back | Mobile has better flexibility |
| Real-time Processing | ✅ Direct | ✅ API | Network latency added |
| Video Recording | ✅ Local | ✅ Backend | Backend handles recording |
| Audio Alerts | ✅ pygame/winsound | ✅ expo-av | Better mobile integration |
| Annotations | ✅ OpenCV | ✅ OpenCV (backend) | Same quality |
| Session Stats | ✅ Live | ✅ Live | Similar functionality |
| Export Data | ✅ Download | ✅ Backend files | Need file transfer for mobile |
| Offline Mode | ✅ Yes | ❌ No | Requires backend connection |
| Multi-device | ❌ No | ✅ Yes | Multiple phones can connect |
| Portability | ❌ Desktop only | ✅ Mobile anywhere | Major advantage |

## 🚀 Performance Impact

### Processing Speed

- **Before**: ~30 FPS processing
- **After**: ~5 FPS (limited by network)
- **Reason**: Network latency + base64 encoding overhead

### Resource Usage

**Before (Desktop):**
- CPU: 30-50%
- RAM: 500MB
- GPU: Optional

**After (Split):**

Backend:
- CPU: 40-60%
- RAM: 500MB
- GPU: Optional

Mobile:
- CPU: 10-20%
- RAM: 150MB
- Battery: High drain

### Network Requirements

- **Bandwidth**: ~500KB/s per device
- **Latency**: <100ms recommended
- **Connection**: Same local network required

## 🐛 Known Issues & Workarounds

### Issue 1: Network Latency

**Problem**: Slow frame processing due to network delay

**Workaround:**
- Reduce frame rate (increase interval)
- Use WiFi 5GHz
- Move closer to router
- Reduce image quality

### Issue 2: Battery Drain

**Problem**: Continuous camera use drains battery fast

**Workaround:**
- Keep phone charged
- Reduce screen brightness
- Close background apps
- Use power saving mode when not monitoring

### Issue 3: Firewall Blocking

**Problem**: Can't connect to backend

**Workaround:**
- Disable firewall temporarily
- Add exception for port 8000
- Use mobile hotspot as alternative
- Check router settings

### Issue 4: Expo Go Limitations

**Problem**: Some features limited in Expo Go

**Workaround:**
- Build standalone APK for full features
- Use development build
- Test on actual device, not simulator

## 🔮 Future Improvements

### Short Term (v1.1)
- [ ] WebSocket for lower latency
- [ ] Compressed image transfer
- [ ] Offline mode with on-device ML
- [ ] Better error handling

### Medium Term (v1.2)
- [ ] Cloud backend deployment
- [ ] Multiple backend support
- [ ] Background processing
- [ ] Push notifications

### Long Term (v2.0)
- [ ] On-device TensorFlow Lite
- [ ] Complete offline operation
- [ ] Advanced analytics
- [ ] Fleet management dashboard

## 📈 Migration Benefits

### Advantages

✅ **Mobile Portability**: Use anywhere, not limited to desktop
✅ **Better Camera**: Phone cameras often better than webcams
✅ **Flexibility**: Can position phone more easily
✅ **Multi-device**: Multiple phones can connect to same backend
✅ **Scalability**: Backend can handle multiple clients
✅ **Modern UI**: Better user experience with mobile design

### Disadvantages

❌ **Network Dependency**: Requires WiFi connection
❌ **Lower FPS**: Network latency reduces frame rate
❌ **Battery Drain**: Continuous camera use
❌ **Complexity**: More components to set up
❌ **Deployment**: Need to maintain two systems

## 📋 Migration Checklist

If you're migrating your own fork:

- [ ] Set up backend server
- [ ] Configure network/firewall
- [ ] Install mobile dependencies
- [ ] Update API endpoints
- [ ] Test camera permissions
- [ ] Verify model loading
- [ ] Test alert system
- [ ] Configure recording
- [ ] Test on real device
- [ ] Build APK
- [ ] Document custom changes

## 🤔 Decision Factors

### When to Use Streamlit Version

- Desktop/laptop deployment
- No mobile device available
- Offline processing required
- Simple setup preferred
- Single-user system

### When to Use React Native Version

- Mobile deployment needed
- Better camera positioning required
- Multiple devices to connect
- Modern mobile UI preferred
- Future scalability important

## 📚 Learning Resources

### For Backend Development
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Ultralytics YOLOv11 Docs](https://docs.ultralytics.com/)
- [OpenCV Python Tutorial](https://docs.opencv.org/master/d6/d00/tutorial_py_root.html)

### For Mobile Development
- [React Native Docs](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/)

## 💡 Tips for Developers

1. **Test locally first**: Use localhost before deploying
2. **Monitor logs**: Check both backend and mobile logs
3. **Network tools**: Use Postman to test API
4. **Gradual migration**: Test each component separately
5. **Keep fallbacks**: Maintain Streamlit version during transition
6. **Document changes**: Note custom modifications
7. **Version control**: Use git branches for migration

## 🎓 Lessons Learned

1. **Network is critical**: WiFi quality greatly affects performance
2. **Mobile cameras vary**: Test on multiple devices
3. **Battery management**: Optimize for power efficiency
4. **Error handling**: More failure points need better handling
5. **User feedback**: Mobile users expect fast, responsive UI

---

**Migration completed**: October 2024  
**Maintained by**: [Your Name]  
**Questions**: See documentation or open GitHub issue






