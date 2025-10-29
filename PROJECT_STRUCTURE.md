# Driver Monitoring System - Complete Project Structure

## 📁 Project Overview

```
FaceMonitor/
├── backend/                    # Python FastAPI Backend Server
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── start_server.bat       # Windows startup script
│   └── start_server.sh        # Unix/Mac startup script
│
├── DriverMonitorApp/          # React Native Mobile Application
│   ├── App.js                 # Main app entry point
│   ├── app.json               # Expo configuration
│   ├── package.json           # NPM dependencies
│   ├── babel.config.js        # Babel configuration
│   ├── README.md              # Mobile app documentation
│   └── src/
│       ├── components/        # Reusable UI components
│       │   ├── AlertBanner.js # Alert display with animations
│       │   ├── CameraView.js  # Camera capture & frame processing
│       │   └── StatusCard.js  # Metric display cards
│       ├── context/           # React Context (state management)
│       │   └── AppContext.js  # Global app state
│       ├── screens/           # App screens/pages
│       │   ├── MonitoringScreen.js # Main monitoring interface
│       │   └── SettingsScreen.js   # Configuration screen
│       └── services/          # Service layers
│           ├── ApiService.js  # Backend API communication
│           └── AudioService.js # Audio alert handling
│
├── models/                    # ML Models (shared with backend)
│   ├── __init__.py
│   └── activity_detector.py  # YOLOv11 pose detection wrapper
│
├── utils/                     # Utilities (shared with backend)
│   ├── __init__.py
│   ├── audio_alert.py        # Audio alert generation (backend)
│   ├── pose_analyzer.py      # Pose analysis algorithms
│   └── video_recorder.py     # Video recording handler
│
├── recordings/                # Video recordings & logs
│   ├── videos/               # Recorded video files
│   └── logs/                 # Activity logs (JSON/CSV)
│
├── app.py                    # OLD: Original Streamlit app (deprecated)
├── requirements.txt          # OLD: Original Python dependencies
├── README.md                 # Original project README
├── REACT_NATIVE_SETUP.md    # NEW: Complete setup guide
└── PROJECT_STRUCTURE.md     # This file
```

## 🔄 Migration from Streamlit to React Native

### What Changed?

#### ✅ Migrated Components

| Original (Streamlit) | New (React Native) | Purpose |
|---------------------|-------------------|---------|
| `app.py` | `backend/server.py` | Main application logic |
| - | `DriverMonitorApp/` | New mobile frontend |
| Streamlit UI | React Native Components | User interface |
| `st.camera_input()` | `expo-camera` | Camera access |
| Streamlit state | React Context | State management |

#### 🔄 Architecture Changes

**Before (Streamlit):**
```
[Streamlit App] → [Camera] → [ML Models] → [Display]
     (All in Python on Computer)
```

**After (React Native + FastAPI):**
```
[Mobile App] → [Camera] → [Send Frame] → [Backend API] → [ML Models]
     ↑                                              ↓
     └────────[Receive Results & Display]──────────┘
```

## 🎯 Key Files Explained

### Backend Files

#### `backend/server.py`
- FastAPI web server
- REST API endpoints
- WebSocket support for real-time processing
- Handles ML model inference
- Manages recording sessions

**Key Endpoints:**
- `GET /` - Health check
- `GET /health` - Detailed health status
- `POST /api/process-frame` - Process single frame
- `WebSocket /ws/monitor` - Real-time monitoring
- `POST /api/start-recording` - Start recording
- `POST /api/stop-recording` - Stop recording

#### `backend/requirements.txt`
Python dependencies for backend:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `ultralytics` - YOLOv11
- `opencv-python` - Image processing
- `torch` - PyTorch (ML framework)

### Mobile App Files

#### `DriverMonitorApp/App.js`
- Root component
- Navigation setup
- Theme configuration
- App state provider

#### `DriverMonitorApp/app.json`
- Expo configuration
- Android permissions
- App metadata
- Build settings

#### `DriverMonitorApp/package.json`
NPM dependencies:
- `expo` - Development framework
- `react-native` - Mobile framework
- `expo-camera` - Camera access
- `react-native-paper` - UI components
- `axios` - HTTP client

### Component Files

#### `src/screens/MonitoringScreen.js`
Main monitoring interface with:
- Live camera feed
- Real-time detection display
- Alert banners
- Statistics cards
- Start/Stop controls

#### `src/screens/SettingsScreen.js`
Configuration interface with:
- Server URL input
- Connection testing
- Audio settings
- Detection threshold
- Help instructions

#### `src/components/CameraView.js`
Camera handling:
- Camera permission requests
- Frame capture (5 FPS)
- Base64 encoding
- API communication
- Annotated frame display

#### `src/components/StatusCard.js`
Reusable metric card:
- Icon + label + value
- Color coding
- Responsive layout

#### `src/components/AlertBanner.js`
Alert display with:
- Animated pulsing for warnings
- Color-coded by severity
- Duration tracking
- Detailed information

### Service Files

#### `src/services/ApiService.js`
Backend communication:
- Health check
- Frame processing
- Recording control
- Session management
- Error handling

#### `src/services/AudioService.js`
Audio alert system:
- Critical alert (3 beeps)
- Warning alert (1 beep)
- Cooldown management
- Volume control

### Context Files

#### `src/context/AppContext.js`
Global state management:
- Server URL
- Monitoring status
- Audio enabled
- Confidence threshold
- Session statistics

### Shared Files (Backend & Models)

#### `models/activity_detector.py`
YOLOv11 wrapper:
- Model initialization
- Frame processing
- Pose detection
- Activity classification
- Annotation drawing

#### `utils/pose_analyzer.py`
Pose analysis algorithms:
- Eye closure detection
- Head down detection
- Turn direction detection
- Sleeping detection
- Duration tracking
- Alert level determination

#### `utils/video_recorder.py`
Video recording:
- Session management
- Frame writing
- Activity logging
- Summary generation
- CSV export

#### `utils/audio_alert.py`
Backend audio (for testing):
- Beep generation
- Critical alerts
- Warning alerts
- Audio backend detection

## 📊 Data Flow

### Monitoring Flow

```
1. User presses "Start Monitoring"
   ↓
2. CameraView captures frame (every 200ms)
   ↓
3. Frame encoded to Base64
   ↓
4. ApiService.processFrame() sends to backend
   ↓
5. Backend server.py receives frame
   ↓
6. ActivityDetector processes with YOLOv11
   ↓
7. PoseAnalyzer analyzes keypoints
   ↓
8. Results sent back to mobile app
   ↓
9. MonitoringScreen updates UI
   ↓
10. AlertBanner shows status
   ↓
11. AudioService plays alert if needed
   ↓
12. Stats updated in StatusCards
```

### Recording Flow

```
1. User starts monitoring
   ↓
2. Backend starts VideoRecorder
   ↓
3. Each processed frame saved
   ↓
4. Activities logged with timestamps
   ↓
5. User stops monitoring
   ↓
6. VideoRecorder stops
   ↓
7. Summary generated
   ↓
8. Files saved to recordings/
```

## 🔧 Configuration Files

### `babel.config.js`
Babel transpiler configuration for React Native.

### `.gitignore`
Excludes:
- `node_modules/`
- `.expo/`
- Build artifacts
- Temporary files

## 📦 Dependencies Summary

### Backend (Python)
- **FastAPI**: Web framework
- **Uvicorn**: ASGI server
- **Ultralytics**: YOLOv11 model
- **OpenCV**: Image processing
- **PyTorch**: Deep learning
- **NumPy**: Numerical computing
- **Pandas**: Data analysis

### Mobile App (JavaScript/React Native)
- **Expo**: Development platform
- **React Native**: Mobile framework
- **expo-camera**: Camera API
- **expo-av**: Audio/video
- **React Native Paper**: UI components
- **Axios**: HTTP client
- **React Navigation**: Navigation (future)

## 🚀 Build & Run Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
python server.py
```

### Mobile App
```bash
cd DriverMonitorApp
npm install
npm start
```

## 📁 Output Files

### Recordings Directory
```
recordings/
├── videos/
│   └── video_20241028_153045.mp4
└── logs/
    ├── activity_log_20241028_153045.json
    ├── activity_log_20241028_153045.csv
    └── summary_20241028_153045.json
```

### Log File Format (JSON)
```json
{
  "timestamp": "2024-10-28T15:30:45.123",
  "elapsed_seconds": 12.5,
  "activity": "eyes_on_road",
  "confidence": 0.87,
  "details": {
    "alert_level": "SAFE",
    "eyes_closed_duration": 0.0,
    "looking_down_duration": 0.0
  }
}
```

### Summary File Format (JSON)
```json
{
  "session_id": "20241028_153045",
  "start_time": "2024-10-28T15:30:45",
  "end_time": "2024-10-28T15:35:20",
  "duration_seconds": 275.5,
  "total_frames_logged": 1377,
  "activity_counts": {
    "eyes_on_road": 1200,
    "looking_left": 100,
    "drowsy_eyes_closing": 50,
    "sleeping_eyes_closed": 27
  },
  "unique_activities": ["eyes_on_road", "looking_left", "drowsy_eyes_closing", "sleeping_eyes_closed"]
}
```

## 🔐 Security Considerations

- No authentication (local network only)
- No encryption (HTTP, not HTTPS)
- Camera permissions required
- Network permissions required
- File system access for recordings

**For Production:**
- Add authentication (JWT tokens)
- Use HTTPS/TLS
- Implement rate limiting
- Add input validation
- Use secure storage

## 🎨 UI Component Hierarchy

```
App
└── AppProvider (Context)
    ├── MonitoringScreen
    │   ├── Header
    │   ├── ConnectionBar
    │   ├── CameraView
    │   ├── AlertBanner
    │   ├── StatusCards (6x)
    │   ├── InfoCard
    │   ├── GuideCard
    │   └── Controls
    └── SettingsScreen
        ├── Header
        ├── ServerConfigCard
        ├── AudioSettingsCard
        ├── DetectionSettingsCard
        ├── AboutCard
        └── ResetButton
```

## 📱 Supported Platforms

### Current
- ✅ Android 5.0+ (via Expo Go)
- ✅ Android 5.0+ (standalone APK)

### Planned
- 🔄 iOS 11+ (requires Mac for build)
- 🔄 Web version (limited functionality)

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Migrated from Streamlit to React Native
- ✅ FastAPI backend server
- ✅ Mobile camera integration
- ✅ Real-time monitoring
- ✅ Audio alerts
- ✅ Session statistics
- ✅ Settings management

### v0.x (Legacy - Streamlit)
- Python-only implementation
- Desktop application
- Webcam integration
- Video recording

---

**Note**: This structure represents the complete migrated project. The old Streamlit files (`app.py`, etc.) are kept for reference but are no longer used in the React Native version.






