import cv2
import os
from datetime import datetime
import json
import pandas as pd

class VideoRecorder:
    """
    Handle video recording and activity logging
    """
    
    def __init__(self, output_dir="recordings"):
        self.output_dir = output_dir
        self.video_dir = os.path.join(output_dir, "videos")
        self.log_dir = os.path.join(output_dir, "logs")
        
        # Create directories if they don't exist
        os.makedirs(self.video_dir, exist_ok=True)
        os.makedirs(self.log_dir, exist_ok=True)
        
        self.video_writer = None
        self.current_session = None
        self.current_video_file = None  # Track current video filename
        self.activity_log = []
        self.session_start_time = None
        
    def start_recording(self, frame_width, frame_height, fps=20.0):
        """Start a new recording session"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.current_session = timestamp
        self.session_start_time = datetime.now()
        
        video_filename = os.path.join(self.video_dir, f"video_{timestamp}.mp4")
        self.current_video_file = video_filename  # Store for later download
        
        # Define codec and create VideoWriter object
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        self.video_writer = cv2.VideoWriter(
            video_filename,
            fourcc,
            fps,
            (frame_width, frame_height)
        )
        
        self.activity_log = []
        
        return video_filename
    
    def write_frame(self, frame):
        """Write a frame to the video file"""
        if self.video_writer is not None:
            self.video_writer.write(frame)
    
    def log_activity(self, activity, confidence, details=None):
        """Log detected activity with timestamp"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'elapsed_seconds': (datetime.now() - self.session_start_time).total_seconds() if self.session_start_time else 0,
            'activity': activity,
            'confidence': round(confidence, 3),
            'details': details or {}
        }
        self.activity_log.append(log_entry)
    
    def stop_recording(self):
        """Stop recording and save activity log - Returns video file path"""
        video_file = self.current_video_file
        
        if self.video_writer is not None:
            self.video_writer.release()
            self.video_writer = None
        
        if self.current_session and self.activity_log:
            # Save activity log as JSON
            log_filename = os.path.join(self.log_dir, f"activity_log_{self.current_session}.json")
            with open(log_filename, 'w') as f:
                json.dump(self.activity_log, f, indent=2)
            
            # Save as CSV for easy analysis
            csv_filename = os.path.join(self.log_dir, f"activity_log_{self.current_session}.csv")
            df = pd.DataFrame(self.activity_log)
            df.to_csv(csv_filename, index=False)
            
            # Generate summary
            summary = self.generate_session_summary()
            summary_filename = os.path.join(self.log_dir, f"summary_{self.current_session}.json")
            with open(summary_filename, 'w') as f:
                json.dump(summary, f, indent=2)
            
            # Return video file, log file, and summary
            return video_file, log_filename, summary_filename
        
        return video_file, None, None
    
    def generate_session_summary(self):
        """Generate summary statistics for the session"""
        if not self.activity_log:
            return {}
        
        df = pd.DataFrame(self.activity_log)
        
        # Calculate time spent in each activity
        activity_counts = df['activity'].value_counts().to_dict()
        
        # Calculate average confidence per activity
        avg_confidence = df.groupby('activity')['confidence'].mean().to_dict()
        
        # Session duration
        session_duration = (datetime.now() - self.session_start_time).total_seconds() if self.session_start_time else 0
        
        summary = {
            'session_id': self.current_session,
            'start_time': self.session_start_time.isoformat() if self.session_start_time else None,
            'end_time': datetime.now().isoformat(),
            'duration_seconds': round(session_duration, 2),
            'total_frames_logged': len(self.activity_log),
            'activity_counts': activity_counts,
            'average_confidence': {k: round(v, 3) for k, v in avg_confidence.items()},
            'unique_activities': list(activity_counts.keys())
        }
        
        return summary
    
    def is_recording(self):
        """Check if currently recording"""
        return self.video_writer is not None




