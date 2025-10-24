# 🎥 Live Video Activity Monitor

A real-time video monitoring application that detects and tracks human activities using YOLOv11 pose estimation. Built with Streamlit for an intuitive web interface.

## 🌟 Features

- **Real-time Activity Detection**: Monitors live video feed and detects activities
- **Activity Recognition**: 
  - 😴 Sleeping (horizontal body position)
  - ⬅️ Turning Left
  - ➡️ Turning Right  
  - 🪑 Sitting
  - 🧍 Standing
- **Video Recording**: Automatically records video with activity annotations
- **Activity Logging**: Saves detailed activity logs in JSON and CSV formats
- **Session Statistics**: Generates comprehensive reports after each session
- **Live Dashboard**: Beautiful Streamlit interface with real-time updates
- **Multiple Sources**: Support for webcam and video file input

## 🛠️ Technology Stack

- **AI Model**: YOLOv11 Pose Estimation (Ultralytics)
- **Frontend**: Streamlit
- **Video Processing**: OpenCV
- **Data Analysis**: Pandas, NumPy
- **Deep Learning**: PyTorch (via Ultralytics)

## 📋 Requirements

- Python 3.8+
- Webcam (for live monitoring) or video files
- 4GB+ RAM recommended
- GPU optional (for faster processing)

## 🚀 Installation & Usage

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Run the Application

```bash
streamlit run app.py
```

### Step 3: Access the Application

The application will automatically open in your default web browser at:
```
http://localhost:8501
```

## 📖 How to Use

1. **Configure Settings** (in sidebar):
   - Select video source (Webcam or Video File)
   - Adjust confidence threshold
   - Set recording FPS

2. **Start Monitoring**:
   - Click "▶️ Start Monitoring" button
   - The system will begin processing video feed
   - Activities will be detected and displayed in real-time

3. **View Results**:
   - Watch live video feed with activity annotations
   - Monitor real-time statistics
   - View activity timeline

4. **Stop & Review**:
   - Click "⏹️ Stop Monitoring"
   - Download activity logs (CSV format)
   - Review session summary

## 📁 Output Files

All recordings and logs are saved in the `recordings/` directory:

```
recordings/
├── videos/
│   └── video_YYYYMMDD_HHMMSS.mp4
└── logs/
    ├── activity_log_YYYYMMDD_HHMMSS.json
    ├── activity_log_YYYYMMDD_HHMMSS.csv
    └── summary_YYYYMMDD_HHMMSS.json
```

## 🎯 Activity Detection Logic

The system uses YOLOv11 pose estimation to detect 17 body keypoints:
- Nose, Eyes, Ears
- Shoulders, Elbows, Wrists
- Hips, Knees, Ankles

Activities are determined by analyzing:
- **Body orientation angles**
- **Joint positions and angles**
- **Posture alignment**
- **Movement patterns**

## ⚙️ Configuration Options

### Model Settings
- **Confidence Threshold**: Adjust sensitivity of person detection (0.1 - 1.0)
- **Model**: Uses YOLOv11n-pose (nano) by default for speed

### Recording Settings
- **FPS**: Set recording frame rate (10-30 FPS)
- **Resolution**: Automatically matches input source

## 🐛 Troubleshooting

### Camera Not Working
- Check camera index (try 0, 1, 2)
- Ensure camera permissions are granted
- Try closing other applications using the camera

### Model Download Issues
- First run downloads YOLOv11 model (~6MB)
- Ensure stable internet connection
- Model is cached after first download

### Performance Issues
- Lower the FPS in recording settings
- Increase confidence threshold
- Use GPU if available

## 📊 Example Session Summary

```json
{
  "session_id": "20231115_143022",
  "duration_seconds": 125.3,
  "total_frames_logged": 2506,
  "activity_counts": {
    "standing": 1823,
    "sitting": 456,
    "turning_right": 127,
    "sleeping": 100
  },
  "average_confidence": {
    "standing": 0.82,
    "sitting": 0.78,
    "turning_right": 0.71,
    "sleeping": 0.85
  }
}
```

## 🔒 Privacy Note

This application processes video locally on your machine. No data is sent to external servers.

## 📝 License

MIT License - Feel free to use and modify for your needs.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the configuration options
3. Ensure all dependencies are correctly installed

## 🚀 Future Enhancements

- [ ] Multi-person tracking
- [ ] Custom activity definitions
- [ ] Export to multiple formats
- [ ] Advanced analytics dashboard
- [ ] Mobile app support

---

**Built with ❤️ using YOLOv11 and Streamlit**





