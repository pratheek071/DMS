"""
FastAPI Backend Server for Driver Monitoring System
Handles ML processing with YOLOv11 pose estimation
"""
from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import cv2
import numpy as np
import base64
import json
import time
from typing import Dict, List
import asyncio
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from models.activity_detector import ActivityDetector
from utils.video_recorder import VideoRecorder
from utils.audio_alert import AudioAlert
from whatsapp_service import whatsapp_service
from alert_manager import AlertManager

app = FastAPI(title="Driver Monitoring System API")

# Enable CORS for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your React Native app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
detector = None
recorder = VideoRecorder()
audio_alert = AudioAlert()
alert_manager = AlertManager(whatsapp_service)
active_sessions: Dict[str, Dict] = {}

@app.on_event("startup")
async def startup_event():
    """Initialize the detector on startup"""
    global detector
    print("🔄 Loading YOLOv11 model...")
    detector = ActivityDetector(
        model_name='yolo11n-pose.pt',
        confidence_threshold=0.3
    )
    print("✅ Model loaded successfully!")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "service": "Driver Monitoring System API",
        "version": "1.0.0",
        "model_loaded": detector is not None
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "detector_loaded": detector is not None,
        "audio_available": audio_alert.is_available(),
        "audio_backend": audio_alert.get_audio_backend() if audio_alert.is_available() else "None",
        "active_sessions": len(active_sessions)
    }

@app.post("/api/process-frame")
async def process_frame(file: UploadFile = File(...)):
    """
    Process a single frame from mobile camera
    Returns annotated frame and detection results
    """
    try:
        # Read image from upload
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return JSONResponse(
                status_code=400,
                content={"error": "Invalid image format"}
            )
        
        # Process frame with detector
        current_time = time.time()
        annotated_frame, activity, confidence, details = detector.process_frame(frame)
        
        # Encode annotated frame to base64
        _, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # Prepare response
        response = {
            "success": True,
            "timestamp": current_time,
            "activity": activity,
            "confidence": float(confidence),
            "details": details,
            "annotated_frame": f"data:image/jpeg;base64,{img_base64}",
            "alert_level": details.get('alert_level', 'SAFE'),
            "trigger_alarm": details.get('trigger_alarm', False),
            "eyes_closed_duration": details.get('eyes_closed_duration', 0.0),
            "looking_down_duration": details.get('looking_down_duration', 0.0)
        }
        
        return response
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Processing error: {str(e)}"}
        )

@app.websocket("/ws/monitor")
async def websocket_monitor(websocket: WebSocket):
    """
    WebSocket endpoint for real-time frame processing
    More efficient than REST API for continuous monitoring
    """
    await websocket.accept()
    session_id = f"session_{int(time.time())}"
    active_sessions[session_id] = {
        "start_time": time.time(),
        "frames_processed": 0
    }
    
    print(f"📱 New monitoring session: {session_id}")
    
    try:
        while True:
            # Receive frame data from React Native
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "frame":
                # Decode base64 frame
                img_data = base64.b64decode(message["data"].split(",")[1] if "," in message["data"] else message["data"])
                nparr = np.frombuffer(img_data, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if frame is not None:
                    # Process frame
                    annotated_frame, activity, confidence, details = detector.process_frame(frame)
                    
                    # Encode result
                    _, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                    img_base64 = base64.b64encode(buffer).decode('utf-8')
                    
                    # Send response
                    response = {
                        "type": "result",
                        "timestamp": time.time(),
                        "activity": activity,
                        "confidence": float(confidence),
                        "details": details,
                        "annotated_frame": f"data:image/jpeg;base64,{img_base64}",
                        "alert_level": details.get('alert_level', 'SAFE'),
                        "trigger_alarm": details.get('trigger_alarm', False)
                    }
                    
                    await websocket.send_json(response)
                    
                    # Update session stats
                    active_sessions[session_id]["frames_processed"] += 1
            
            elif message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
                
    except WebSocketDisconnect:
        print(f"📱 Session disconnected: {session_id}")
        del active_sessions[session_id]
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        await websocket.close()
        if session_id in active_sessions:
            del active_sessions[session_id]

@app.post("/api/start-recording")
async def start_recording():
    """Start video recording session"""
    try:
        if not recorder.is_recording():
            # We'll get dimensions from first frame
            video_file = recorder.start_recording(640, 480, fps=20)
            return {
                "success": True,
                "message": "Recording started",
                "video_file": video_file
            }
        else:
            return {
                "success": False,
                "message": "Already recording"
            }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/api/stop-recording")
async def stop_recording():
    """Stop video recording and get summary"""
    try:
        if recorder.is_recording():
            video_file, log_file, summary_file = recorder.stop_recording()
            
            summary = {}
            if summary_file and os.path.exists(summary_file):
                with open(summary_file, 'r') as f:
                    summary = json.load(f)
            
            return {
                "success": True,
                "message": "Recording stopped",
                "video_file": video_file,
                "log_file": log_file,
                "summary": summary
            }
        else:
            return {
                "success": False,
                "message": "Not recording"
            }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/api/recording-status")
async def recording_status():
    """Check if currently recording"""
    return {
        "is_recording": recorder.is_recording()
    }

@app.post("/api/trigger-alert")
async def trigger_alert(alert_type: str = "critical"):
    """
    Manually trigger an audio alert
    (The mobile app will handle its own alerts, this is for backend testing)
    """
    try:
        if alert_type == "critical":
            audio_alert.play_critical_alert()
        elif alert_type == "warning":
            audio_alert.play_warning_alert()
        
        return {
            "success": True,
            "message": f"{alert_type} alert triggered"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/api/sessions")
async def get_active_sessions():
    """Get list of active monitoring sessions"""
    return {
        "active_sessions": len(active_sessions),
        "sessions": active_sessions
    }

@app.post("/api/whatsapp/configure")
async def configure_whatsapp(config: dict):
    """
    Configure WhatsApp alert settings
    
    Body:
        {
            "owner_phone": "+919876543210",
            "api_key": "123456",
            "enabled": true
        }
    """
    try:
        owner_phone = config.get("owner_phone", "")
        api_key = config.get("api_key", "")
        enabled = config.get("enabled", True)
        
        if not owner_phone or not api_key:
            return JSONResponse(
                status_code=400,
                content={"error": "owner_phone and api_key are required"}
            )
        
        whatsapp_service.configure(owner_phone, api_key, enabled)
        
        return {
            "success": True,
            "message": "WhatsApp service configured successfully",
            "status": whatsapp_service.get_status()
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/api/whatsapp/status")
async def whatsapp_status():
    """Get WhatsApp service status"""
    return whatsapp_service.get_status()

@app.post("/api/whatsapp/test")
async def test_whatsapp():
    """Send a test WhatsApp message"""
    try:
        result = alert_manager.force_send_alert()
        if result["success"]:
            return {
                "success": True,
                "message": "Test message sent successfully!",
                "details": result
            }
        else:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": result.get("error", "Failed to send test message")
                }
            )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/api/alert/triggered")
async def alarm_triggered(details: dict):
    """
    Called when alarm is triggered on mobile app
    Starts 10-second countdown for WhatsApp alert
    
    Body:
        {
            "activity": "EYES_CLOSED",
            "confidence": 0.95,
            "duration": 6.2,
            "alert_level": "CRITICAL"
        }
    """
    try:
        alert_manager.on_alarm_triggered(details)
        return {
            "success": True,
            "message": "Alarm registered, monitoring for driver response",
            "status": alert_manager.get_status()
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/api/alert/responded")
async def driver_responded():
    """Called when driver responds to alarm (eyes open, etc.)"""
    try:
        alert_manager.on_driver_response()
        return {
            "success": True,
            "message": "Driver response registered",
            "status": alert_manager.get_status()
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/api/alert/status")
async def get_alert_status():
    """Get current alert manager status"""
    return alert_manager.get_status()

@app.get("/api/alert/history")
async def get_alert_history():
    """Get alert history"""
    return {
        "history": alert_manager.get_history(limit=20)
    }

@app.post("/api/alert/check-timeout")
async def check_alert_timeout():
    """
    Check if alert timeout has been reached
    Mobile app should call this periodically during alarm
    """
    try:
        result = alert_manager.check_timeout()
        if result:
            return {
                "success": True,
                "whatsapp_sent": True,
                "result": result,
                "status": alert_manager.get_status()
            }
        else:
            return {
                "success": True,
                "whatsapp_sent": False,
                "status": alert_manager.get_status()
            }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Driver Monitoring System Backend...")
    print("📡 Server will be available at: http://0.0.0.0:8000")
    print("📱 For mobile access, use your computer's local IP address")
    print("   Example: http://192.168.1.100:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")






