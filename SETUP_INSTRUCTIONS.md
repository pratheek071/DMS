# 📋 Complete Setup & Execution Instructions

## 🎯 System Requirements

- **Operating System**: Windows 10/11, macOS, or Linux
- **Python**: Version 3.8 or higher
- **RAM**: Minimum 4GB (8GB recommended)
- **Camera**: Webcam or external camera (for live monitoring)
- **Internet**: Required for initial model download (~6MB)

## 🔧 Step-by-Step Installation

### Step 1: Verify Python Installation

Open Command Prompt (Windows) or Terminal (Mac/Linux) and run:

```bash
python --version
```

You should see Python 3.8 or higher. If not, download from [python.org](https://www.python.org/downloads/)

### Step 2: Navigate to Project Directory

```bash
cd C:\Users\PratheekRaj(G10XIND)\PycharmProjects\FaceMonitor
```

### Step 3: (Optional) Create Virtual Environment

**Recommended to avoid package conflicts:**

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You'll see `(venv)` at the start of your command line when activated.

### Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

**What gets installed:**
- ✅ Streamlit (Web interface)
- ✅ Ultralytics (YOLOv11)
- ✅ OpenCV (Video processing)
- ✅ NumPy & Pandas (Data handling)
- ✅ Pillow (Image processing)

⏱️ Installation takes 2-5 minutes depending on internet speed.

### Step 5: Verify Installation

```bash
pip list
```

Check that all packages from requirements.txt are listed.

## 🚀 Running the Application

### Command to Start

```bash
streamlit run app.py
```

### What Happens Next:

1. **Terminal Output:**
   ```
   You can now view your Streamlit app in your browser.
   
   Local URL: http://localhost:8501
   Network URL: http://192.168.x.x:8501
   ```

2. **Browser Opens Automatically** to `http://localhost:8501`

3. **First Time Only**: YOLOv11 model downloads automatically (~6MB, 30 seconds)

4. **Application Loads** and you'll see the monitoring interface

## 🎮 Using the Application

### Initial Configuration

1. **Left Sidebar - Video Source:**
   - Select "Webcam" (default)
   - Or choose "Video File" and upload

2. **Camera Index:**
   - Start with 0 (default camera)
   - If not working, try 1 or 2

3. **Confidence Threshold:**
   - Default: 0.5
   - Lower (0.3): More detections, less accurate
   - Higher (0.7): Fewer detections, more accurate

4. **Recording FPS:**
   - Recommended: 20 FPS
   - Lower FPS = Smaller file size
   - Higher FPS = Smoother video

### Start Monitoring

1. Click **"▶️ Start Monitoring"** button
2. Allow camera access when browser prompts
3. Wait 2-3 seconds for model initialization
4. You'll see:
   - Live video feed with pose skeleton
   - Current activity label
   - Real-time confidence score
   - Frame counter
   - Recording status (🔴 RECORDING)

### Activities Detected

The system automatically detects:
- 😴 **Sleeping** - Horizontal body position
- ⬅️ **Turning Left** - Body/head turned left
- ➡️ **Turning Right** - Body/head turned right
- 🪑 **Sitting** - Seated posture
- 🧍 **Standing** - Upright position

### Stop Monitoring

1. Click **"⏹️ Stop Monitoring"** button
2. Session summary appears
3. Download options become available
4. Video and logs saved automatically

## 📁 Accessing Your Recordings

All files are saved in the `recordings/` folder:

```
FaceMonitor/
└── recordings/
    ├── videos/
    │   └── video_20231115_143022.mp4    ← Your recorded video
    └── logs/
        ├── activity_log_20231115_143022.csv     ← Activity log
        ├── activity_log_20231115_143022.json    ← Detailed log
        └── summary_20231115_143022.json         ← Session summary
```

### Opening Files:

**Video:**
- Double-click the .mp4 file
- Opens in default video player
- Shows annotated video with activity labels

**CSV Log:**
- Open in Excel, Google Sheets, or any spreadsheet software
- Columns: timestamp, activity, confidence, details

**JSON Files:**
- Open in text editor or JSON viewer
- Contains detailed metadata and statistics

## 📊 Understanding the Output

### Session Summary (summary_*.json)

```json
{
  "session_id": "20231115_143022",
  "duration_seconds": 125.3,
  "total_frames_logged": 2506,
  "activity_counts": {
    "standing": 1823,
    "sitting": 456,
    "turning_right": 127
  },
  "average_confidence": {
    "standing": 0.82,
    "sitting": 0.78,
    "turning_right": 0.71
  }
}
```

**Key Metrics:**
- **duration_seconds**: Total recording time
- **activity_counts**: Number of frames per activity
- **average_confidence**: Accuracy per activity

### Activity Log (activity_log_*.csv)

| Timestamp | Activity | Confidence | Details |
|-----------|----------|------------|---------|
| 2023-11-15 14:30:22 | standing | 0.82 | {"posture": "standing"} |
| 2023-11-15 14:30:23 | sitting | 0.78 | {"posture": "sitting"} |

## 🐛 Troubleshooting

### Issue: "Camera not found" or "Cannot open video source"

**Solutions:**
1. Change camera index in sidebar (try 0, 1, 2)
2. Close other apps using camera (Zoom, Teams, Skype)
3. Check camera permissions in Windows Settings
4. Restart the application

### Issue: "Module not found" errors

**Solution:**
```bash
pip install -r requirements.txt --upgrade --force-reinstall
```

### Issue: Slow performance / Low FPS

**Solutions:**
1. Lower recording FPS to 15
2. Increase confidence threshold to 0.6
3. Close other running applications
4. Use smaller video resolution

### Issue: Model download fails

**Solution:**
1. Check internet connection
2. Manually download model:
```bash
python -c "from ultralytics import YOLO; YOLO('yolo11n-pose.pt')"
```

### Issue: "Address already in use" (Port 8501)

**Solution:**
```bash
streamlit run app.py --server.port 8502
```

### Issue: Activities not detected accurately

**Solutions:**
1. Improve lighting conditions
2. Stand 3-6 feet from camera
3. Ensure full body visible in frame
4. Lower confidence threshold to 0.3-0.4
5. Avoid cluttered background

## 🎯 Best Practices

### For Optimal Detection:

1. **Lighting**: Bright, even lighting (avoid backlighting)
2. **Distance**: 3-6 feet from camera
3. **Framing**: Full body visible in frame
4. **Background**: Plain, uncluttered background
5. **Clothing**: Contrasting colors help detection

### For Better Recordings:

1. **FPS**: 20 FPS for smooth playback
2. **Duration**: Keep sessions under 10 minutes for manageable file sizes
3. **Storage**: Ensure enough disk space (approx. 100MB per minute)

## 🔄 Stopping the Application

### Normal Shutdown:
1. Click "⏹️ Stop Monitoring" in browser
2. Press `Ctrl + C` in terminal
3. Browser tab can be closed

### Force Stop:
- Press `Ctrl + C` twice in terminal
- Or close terminal window

## 🔄 Restarting the Application

```bash
streamlit run app.py
```

Browser opens automatically. Previous recordings remain saved.

## 📞 Need Help?

### Check These Resources:
1. **README.md** - Full documentation
2. **QUICKSTART.md** - Quick reference guide
3. **This file** - Complete setup instructions

### Common Commands:

```bash
# Install dependencies
pip install -r requirements.txt

# Start application
streamlit run app.py

# Check Python version
python --version

# List installed packages
pip list

# Activate virtual environment (Windows)
venv\Scripts\activate

# Activate virtual environment (Mac/Linux)
source venv/bin/activate

# Deactivate virtual environment
deactivate
```

## 🎉 You're All Set!

Run this command to start:

```bash
streamlit run app.py
```

Enjoy your live video activity monitoring system! 🚀

---

**Last Updated**: 2023
**Version**: 1.0





