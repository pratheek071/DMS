from ultralytics import YOLO
import numpy as np
import cv2
from utils.pose_analyzer import PoseAnalyzer

class ActivityDetector:
    """
    Main activity detection class using YOLOv11 pose estimation
    """
    
    def __init__(self, model_name='yolo11n-pose.pt', confidence_threshold=0.3):
        """
        Initialize the activity detector with OPTIMIZED settings
        
        Args:
            model_name: YOLOv11 pose model (default: yolo11n-pose.pt - fast & accurate)
            confidence_threshold: OPTIMIZED to 0.3 (was 0.5) for better detection
        """
        self.model = YOLO(model_name)
        # OPTIMIZED: Lower confidence threshold for better detection
        self.confidence_threshold = confidence_threshold
        self.pose_analyzer = PoseAnalyzer()
        
        # Driver monitoring color mapping for visualization (OPTIMIZED)
        self.activity_colors = {
            'eyes_on_road': (0, 255, 0),                    # Green - SAFE (eyes open, forward)
            'sleeping_eyes_closed': (0, 0, 255),            # Red - CRITICAL (eyes closed > 5s)
            'drowsy_eyes_closing': (0, 100, 255),           # Orange-Red - WARNING (eyes closing 2-5s)
            'sleeping_horizontal': (0, 0, 255),             # Red - CRITICAL (body horizontal)
            'looking_down_phone': (0, 0, 255),              # Red - CRITICAL (looking down > 5s)
            'looking_down_warning': (0, 165, 255),          # Orange - WARNING (looking down 2-5s)
            'looking_left': (0, 200, 255),                  # Yellow-Orange - CAUTION (checking mirrors)
            'looking_right': (0, 200, 255),                 # Yellow-Orange - CAUTION (checking blind spot)
            'driver_detected': (0, 255, 255),               # Yellow - SAFE (monitoring)
            'no_driver_detected': (200, 200, 200)           # Gray - ALERT
        }
        
        # Alert level icons
        self.alert_icons = {
            'SAFE': '✅',
            'CAUTION': '⚠️',
            'WARNING': '⚠️',
            'CRITICAL': '🚨'
        }
    
    def process_frame(self, frame):
        """
        Process a single frame and detect activities
        
        Args:
            frame: Input frame (BGR format)
            
        Returns:
            annotated_frame: Frame with annotations
            activity: Detected activity
            confidence: Confidence score
            details: Additional details
        """
        # Run YOLOv11 pose estimation
        results = self.model(frame, conf=self.confidence_threshold, verbose=False)
        
        activity = "no_person"
        confidence = 0.0
        details = {}
        
        # Process results
        if len(results) > 0 and results[0].keypoints is not None:
            result = results[0]
            
            # Check if person detected
            if len(result.keypoints.data) > 0:
                # Get keypoints for the first person (can be extended for multiple people)
                keypoints = result.keypoints.data[0].cpu().numpy()
                
                # Analyze activity (with time for eye closure tracking)
                import time
                current_time = time.time()
                activity, confidence, details = self.pose_analyzer.analyze_activity(keypoints, current_time)
                
                # Annotate frame
                annotated_frame = self.annotate_frame(frame.copy(), result, activity, confidence, details)
            else:
                annotated_frame = frame.copy()
                self.draw_status(annotated_frame, "No Driver Detected", (200, 200, 200), "CAUTION")
        else:
            annotated_frame = frame.copy()
            self.draw_status(annotated_frame, "No Driver Detected", (200, 200, 200), "CAUTION")
        
        return annotated_frame, activity, confidence, details
    
    def annotate_frame(self, frame, result, activity, confidence, details):
        """
        Draw annotations on the frame
        
        Args:
            frame: Input frame
            result: YOLO result object
            activity: Detected activity
            confidence: Confidence score
            details: Additional details dictionary
            
        Returns:
            annotated_frame: Frame with annotations
        """
        # Draw pose keypoints and skeleton
        if result.keypoints is not None and len(result.keypoints.data) > 0:
            annotated_frame = result.plot()
        else:
            annotated_frame = frame
        
        # Get activity color and alert level
        color = self.activity_colors.get(activity, (255, 255, 255))
        alert_level = details.get('alert_level', 'SAFE')
        
        # Draw bounding box if available
        if result.boxes is not None and len(result.boxes) > 0:
            box = result.boxes[0]
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 3)
        
        # Draw activity label with alert level
        activity_text = activity.replace('_', ' ').title()
        self.draw_status(annotated_frame, f"{activity_text} ({confidence:.2%})", color, alert_level)
        
        return annotated_frame
    
    def draw_status(self, frame, text, color, alert_level="SAFE"):
        """Draw status text on frame with alert level"""
        # Add semi-transparent background
        overlay = frame.copy()
        
        # Color-code background based on alert level
        bg_colors = {
            'SAFE': (0, 100, 0),      # Dark green
            'CAUTION': (100, 100, 0),  # Dark yellow
            'WARNING': (0, 100, 150),  # Dark orange
            'CRITICAL': (0, 0, 150)    # Dark red
        }
        bg_color = bg_colors.get(alert_level, (0, 0, 0))
        
        cv2.rectangle(overlay, (10, 10), (650, 80), bg_color, -1)
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
        
        # Draw alert icon and text
        icon = self.alert_icons.get(alert_level, '')
        display_text = f"{icon} {text}"
        
        cv2.putText(frame, display_text, (20, 55), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1.0, color, 2, cv2.LINE_AA)
    
    def get_activity_color(self, activity):
        """Get color for activity"""
        return self.activity_colors.get(activity, (255, 255, 255))

