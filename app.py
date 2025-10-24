import streamlit as st
import cv2
import numpy as np
from datetime import datetime
import time
import os
import json
from models.activity_detector import ActivityDetector
from utils.video_recorder import VideoRecorder
from utils.audio_alert import AudioAlert

# Page configuration
st.set_page_config(
    page_title="Driver Monitoring System",
    page_icon="🚗",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better UI
st.markdown("""
    <style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 1rem;
    }
    .status-box {
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
    }
    .recording {
        background-color: #ffebee;
        border: 2px solid #f44336;
    }
    .stopped {
        background-color: #e8f5e9;
        border: 2px solid #4caf50;
    }
    .metric-card {
        background-color: #f5f5f5;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #1f77b4;
    }
    </style>
""", unsafe_allow_html=True)

# Initialize session state
if 'detector' not in st.session_state:
    st.session_state.detector = None
if 'recorder' not in st.session_state:
    st.session_state.recorder = VideoRecorder()
if 'audio_alert' not in st.session_state:
    st.session_state.audio_alert = AudioAlert()
if 'is_running' not in st.session_state:
    st.session_state.is_running = False
if 'activity_history' not in st.session_state:
    st.session_state.activity_history = []
if 'frame_count' not in st.session_state:
    st.session_state.frame_count = 0
if 'audio_enabled' not in st.session_state:
    st.session_state.audio_enabled = True

def initialize_detector(confidence_threshold):
    """Initialize the activity detector"""
    with st.spinner("🔄 Loading YOLOv11 model... This may take a minute on first run."):
        detector = ActivityDetector(
            model_name='yolo11n-pose.pt',
            confidence_threshold=confidence_threshold
        )
    return detector

def main():
    # Header
    st.markdown('<p class="main-header">🚗 Driver Monitoring System (DMS)</p>', unsafe_allow_html=True)
    st.markdown("### Real-time Driver Safety & Distraction Detection")
    st.markdown("---")
    
    # Sidebar configuration
    with st.sidebar:
        st.header("⚙️ Configuration")
        
        # Video source selection
        video_source = st.radio(
            "Select Video Source",
            ["Webcam", "Video File"],
            index=0
        )
        
        camera_index = 0
        uploaded_file = None
        
        if video_source == "Webcam":
            camera_index = st.number_input("Camera Index", min_value=0, max_value=5, value=0)
        else:
            uploaded_file = st.file_uploader("Upload Video File", type=['mp4', 'avi', 'mov'])
        
        # Model settings (OPTIMIZED)
        st.subheader("🤖 Model Settings")
        confidence_threshold = st.slider(
            "Detection Sensitivity",
            min_value=0.1,
            max_value=1.0,
            value=0.3,  # OPTIMIZED: Lower = more sensitive detection
            step=0.05,
            help="OPTIMIZED at 0.3 for best detection (lower = more sensitive)"
        )
        st.caption("✅ **Default (0.3)** - Optimized for accurate eye & head detection")
        
        # Recording settings
        st.subheader("📹 Recording Settings")
        fps = st.slider("Recording FPS", min_value=10, max_value=30, value=20)
        
        # Audio alert settings
        st.subheader("🔊 Audio Alerts")
        
        # Check if audio is available
        audio_available = st.session_state.audio_alert.is_available() if hasattr(st.session_state.audio_alert, 'is_available') else False
        
        if audio_available:
            # Show which audio backend is being used
            audio_backend = st.session_state.audio_alert.get_audio_backend() if hasattr(st.session_state.audio_alert, 'get_audio_backend') else "Unknown"
            
            st.session_state.audio_enabled = st.checkbox(
                "Enable Audio Alerts", 
                value=st.session_state.audio_enabled,
                help="Play beep sound for critical behaviors"
            )
            
            if st.session_state.audio_enabled:
                st.success(f"🔊 Audio alerts ACTIVE ({audio_backend})\n\n**Triggers:**\n- 👁️ Eyes closed > 5 sec → 🚨 3 BEEPS\n- 😴 Sleeping detected → 🚨 3 BEEPS\n- 📱 Looking down → 🚨 3 BEEPS")
            else:
                st.warning("🔇 Audio alerts disabled")
        else:
            st.error("❌ No audio system available")
            st.session_state.audio_enabled = False
        
        st.markdown("---")
        
        # Driver behaviors legend (OPTIMIZED)
        st.subheader("🎯 Monitored Behaviors")
        
        st.markdown("**🟢 SAFE:**")
        st.success("✅ **Eyes on Road** - Normal driving\n\n👁️ Eyes open, looking forward")
        
        st.markdown("**🟡 CAUTION:**")
        st.warning("⚠️ **Looking Left/Right** - Mirror check\n\n👀 Brief head turn (normal)")
        
        st.markdown("**🟠 WARNING (2-5 seconds):**")
        st.warning("⚠️ **Eyes closing...** 2-5 sec\n\n⚠️ **Looking down...** 2-5 sec\n\n⏱️ Alarm coming soon!")
        
        st.markdown("**🔴 CRITICAL (> 5 seconds):**")
        st.error("🚨 **Eyes Closed > 5s** → 🔊 BEEP BEEP BEEP\n\n🚨 **Looking Down > 5s** → 🔊 BEEP BEEP BEEP\n\n🚨 **Sleeping (horizontal)** → 🔊 BEEP BEEP BEEP")
        
        st.markdown("---")
        st.info("💡 **Tip:** Position camera to capture driver's face and upper body clearly.")
    
    # Main content area
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("📺 Live Driver Feed")
        video_placeholder = st.empty()
        alert_placeholder = st.empty()
        status_placeholder = st.empty()
    
    with col2:
        st.subheader("📈 Driver Status")
        current_behavior_placeholder = st.empty()
        alert_level_placeholder = st.empty()
        confidence_placeholder = st.empty()
        frame_count_placeholder = st.empty()
        recording_status_placeholder = st.empty()
        
        st.markdown("---")
        st.subheader("📝 Behavior Timeline")
        behavior_timeline_placeholder = st.empty()
    
    # Control buttons
    col_btn1, col_btn2, col_btn3 = st.columns(3)
    
    with col_btn1:
        start_button = st.button("▶️ Start Monitoring", type="primary")
    
    with col_btn2:
        stop_button = st.button("⏹️ Stop Monitoring", type="secondary")
    
    with col_btn3:
        if st.session_state.recorder.is_recording():
            if st.button("⏸️ Pause Recording"):
                st.session_state.recorder.stop_recording()
                st.success("Recording paused")
    
    # Start monitoring
    if start_button:
        st.session_state.is_running = True
        st.session_state.frame_count = 0
        st.session_state.activity_history = []
        
        # Initialize detector if not already done
        if st.session_state.detector is None:
            st.session_state.detector = initialize_detector(confidence_threshold)
        
        st.success("✅ Monitoring started!")
    
    # Stop monitoring
    if stop_button:
        st.session_state.is_running = False
        
        # Stop recording if active
        if st.session_state.recorder.is_recording():
            video_file, log_file, summary_file = st.session_state.recorder.stop_recording()
            
            if summary_file and os.path.exists(summary_file):
                with open(summary_file, 'r') as f:
                    summary = json.load(f)
                
                st.success("✅ Monitoring stopped! Session summary:")
                st.json(summary)
                
                # Provide VIDEO download button
                if video_file and os.path.exists(video_file):
                    with open(video_file, 'rb') as f:
                        video_bytes = f.read()
                        st.download_button(
                            label="🎥 Download Video Recording",
                            data=video_bytes,
                            file_name=os.path.basename(video_file),
                            mime="video/mp4",
                            help="Download the recorded video with all detections and annotations"
                        )
                    
                    # Show video info
                    file_size_mb = os.path.getsize(video_file) / (1024 * 1024)
                    st.info(f"📹 Video saved: `{os.path.basename(video_file)}`\n\n📊 Size: {file_size_mb:.2f} MB")
                else:
                    st.warning("⚠️ Video file not found. Recording may have failed.")
        else:
            st.info("Monitoring stopped")
    
    # Main monitoring loop
    if st.session_state.is_running:
        # Open video source
        if video_source == "Webcam":
            cap = cv2.VideoCapture(camera_index)
        else:
            if uploaded_file is not None:
                # Save uploaded file temporarily
                temp_file = "temp_video.mp4"
                with open(temp_file, 'wb') as f:
                    f.write(uploaded_file.read())
                cap = cv2.VideoCapture(temp_file)
            else:
                st.error("Please upload a video file")
                st.session_state.is_running = False
                return
        
        if not cap.isOpened():
            st.error("❌ Cannot open video source. Please check camera/file.")
            st.session_state.is_running = False
            return
        
        # Get video properties
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Start recording
        if not st.session_state.recorder.is_recording():
            video_file = st.session_state.recorder.start_recording(frame_width, frame_height, fps)
            st.info(f"📹 Recording started: {os.path.basename(video_file)}")
        
        # Process frames
        while st.session_state.is_running:
            ret, frame = cap.read()
            
            if not ret:
                st.warning("⚠️ End of video or cannot read frame")
                st.session_state.is_running = False
                break
            
            # Process frame with activity detector
            annotated_frame, activity, confidence, details = st.session_state.detector.process_frame(frame)
            
            # Record frame and log activity
            st.session_state.recorder.write_frame(annotated_frame)
            st.session_state.recorder.log_activity(activity, confidence, details)
            
            # Update statistics
            st.session_state.frame_count += 1
            st.session_state.activity_history.append({
                'frame': st.session_state.frame_count,
                'activity': activity,
                'confidence': confidence
            })
            
            # Keep only last 50 activities
            if len(st.session_state.activity_history) > 50:
                st.session_state.activity_history.pop(0)
            
            # Display frame
            video_placeholder.image(
                cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB),
                channels="RGB",
                use_column_width=True
            )
            
            # Update real-time stats (OPTIMIZED)
            behavior_display = activity.replace('_', ' ').title()
            alert_level = details.get('alert_level', 'SAFE')
            danger_level = details.get('danger', 'LOW')
            trigger_alarm = details.get('trigger_alarm', False)
            eyes_closed_duration = details.get('eyes_closed_duration', 0.0)
            looking_down_duration = details.get('looking_down_duration', 0.0)
            alarm_reason = details.get('alarm_reason', behavior_display)
            
            # Trigger audio alert if needed (BEEP BEEP BEEP!)
            if st.session_state.audio_enabled and trigger_alarm:
                if alert_level == "CRITICAL":
                    st.session_state.audio_alert.play_critical_alert()
                elif alert_level == "WARNING":
                    st.session_state.audio_alert.play_warning_alert()
            
            # Show critical alerts with duration info
            if alert_level == "CRITICAL":
                if eyes_closed_duration > 0:
                    alert_placeholder.error(f"🚨 **CRITICAL ALARM!**\n\n👁️ **Eyes closed for {eyes_closed_duration:.1f} seconds!**\n\n🔊 BEEP BEEP BEEP")
                elif looking_down_duration > 0:
                    alert_placeholder.error(f"🚨 **CRITICAL ALARM!**\n\n📱 **Looking down for {looking_down_duration:.1f} seconds!**\n\n🔊 BEEP BEEP BEEP")
                else:
                    alert_placeholder.error(f"🚨 **CRITICAL ALARM:** {behavior_display}\n\n🔊 BEEP BEEP BEEP")
            elif alert_level == "WARNING":
                if eyes_closed_duration > 0:
                    alert_placeholder.warning(f"⚠️ **WARNING:** Eyes closing...\n\n👁️ **{eyes_closed_duration:.1f}s** (Alarm at 5.0s)")
                elif looking_down_duration > 0:
                    alert_placeholder.warning(f"⚠️ **WARNING:** Looking down...\n\n📱 **{looking_down_duration:.1f}s** (Alarm at 5.0s)")
                else:
                    alert_placeholder.warning(f"⚠️ **WARNING:** {behavior_display}")
            elif alert_level == "SAFE":
                alert_placeholder.success(f"✅ **SAFE:** {alarm_reason}")
            else:
                alert_placeholder.info(f"ℹ️ {alarm_reason}")
            
            # Color code based on alert level
            behavior_colors = {
                'SAFE': '#00ff00',
                'CAUTION': '#ffff00', 
                'WARNING': '#ffa500',
                'CRITICAL': '#ff0000'
            }
            behavior_color = behavior_colors.get(alert_level, '#1f77b4')
            
            with current_behavior_placeholder.container():
                st.markdown(f"""
                    <div class="metric-card">
                        <h3>🎯 Current Behavior</h3>
                        <h2 style="color: {behavior_color};">{behavior_display}</h2>
                    </div>
                """, unsafe_allow_html=True)
            
            with alert_level_placeholder.container():
                alert_icons = {
                    'SAFE': '🟢',
                    'CAUTION': '🟡',
                    'WARNING': '🟠',
                    'CRITICAL': '🔴'
                }
                icon = alert_icons.get(alert_level, '⚪')
                
                # Add duration info if applicable
                if eyes_closed_duration > 0:
                    st.metric("Alert Level", f"{icon} {alert_level}", delta=f"👁️ Eyes: {eyes_closed_duration:.1f}s")
                elif looking_down_duration > 0:
                    st.metric("Alert Level", f"{icon} {alert_level}", delta=f"📱 Down: {looking_down_duration:.1f}s")
                else:
                    st.metric("Alert Level", f"{icon} {alert_level}")
            
            with confidence_placeholder.container():
                st.metric("Confidence", f"{confidence:.2%}")
            
            with frame_count_placeholder.container():
                st.metric("Frames Processed", st.session_state.frame_count)
            
            with recording_status_placeholder.container():
                st.markdown("""
                    <div class="status-box recording">
                        <strong>🔴 RECORDING</strong>
                    </div>
                """, unsafe_allow_html=True)
            
            # Update behavior timeline
            if st.session_state.activity_history:
                timeline_text = "**Recent Behaviors:**\n\n"
                for item in reversed(st.session_state.activity_history[-10:]):
                    behavior_name = item['activity'].replace('_', ' ').title()
                    
                    # Add emoji based on behavior
                    if 'eyes_on_road' in item['activity']:
                        emoji = '✅'
                    elif 'eyes_closed' in item['activity'] or 'sleeping' in item['activity'] or 'looking_down' in item['activity']:
                        emoji = '🚨'
                    elif 'drowsy' in item['activity'] or ('looking' in item['activity'] and 'distracted' in item['activity']):
                        emoji = '⚠️'
                    else:
                        emoji = 'ℹ️'
                    
                    timeline_text += f"{emoji} **{behavior_name}** ({item['confidence']:.2f})\n\n"
                behavior_timeline_placeholder.markdown(timeline_text)
            
            # Small delay to control frame rate
            time.sleep(0.03)  # ~30 FPS display
        
        # Cleanup
        cap.release()
        
        # Stop recording
        if st.session_state.recorder.is_recording():
            log_file, csv_file, summary_file = st.session_state.recorder.stop_recording()
            
            if summary_file and os.path.exists(summary_file):
                with open(summary_file, 'r') as f:
                    summary = json.load(f)
                
                st.success("✅ Session completed!")
                st.subheader("📊 Session Summary")
                
                col_summary1, col_summary2 = st.columns(2)
                
                with col_summary1:
                    st.json({
                        "Duration": f"{summary['duration_seconds']:.2f} seconds",
                        "Total Frames": summary['total_frames_logged'],
                        "Activities Detected": len(summary['unique_activities'])
                    })
                
                with col_summary2:
                    st.write("**Activity Distribution:**")
                    st.json(summary['activity_counts'])

if __name__ == "__main__":
    main()

