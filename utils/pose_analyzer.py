import numpy as np
import math

class PoseAnalyzer:
    """
    Analyze human pose keypoints to determine activities
    Uses YOLOv11 pose estimation keypoints (17 points)
    """
    
    def __init__(self):
        # Eye closure detection state (OPTIMIZED)
        self.eyes_closed_start_time = None
        self.eyes_closed_duration = 0.0
        self.eyes_closed_threshold = 5.0  # OPTIMIZED: Best threshold for safety
        
        # Looking down detection state (OPTIMIZED)
        self.looking_down_start_time = None
        self.looking_down_duration = 0.0
        self.looking_down_threshold = 5.0  # OPTIMIZED: Best threshold for safety
        
        # Detection sensitivity settings (OPTIMIZED for best accuracy)
        self.eye_confidence_threshold = 0.4  # Lower = more sensitive
        self.head_down_threshold = 20  # pixels - Lower = more sensitive
        self.warning_threshold = 2.0  # seconds - Show warning before alarm
        
        # YOLOv11 Pose keypoint indices
        self.KEYPOINT_DICT = {
            'nose': 0,
            'left_eye': 1,
            'right_eye': 2,
            'left_ear': 3,
            'right_ear': 4,
            'left_shoulder': 5,
            'right_shoulder': 6,
            'left_elbow': 7,
            'right_elbow': 8,
            'left_wrist': 9,
            'right_wrist': 10,
            'left_hip': 11,
            'right_hip': 12,
            'left_knee': 13,
            'right_knee': 14,
            'left_ankle': 15,
            'right_ankle': 16
        }
    
    def calculate_angle(self, point1, point2, point3):
        """Calculate angle between three points"""
        try:
            a = np.array(point1)
            b = np.array(point2)
            c = np.array(point3)
            
            ba = a - b
            bc = c - b
            
            cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
            angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
            
            return np.degrees(angle)
        except:
            return 0
    
    def get_keypoint(self, keypoints, name):
        """
        OPTIMIZED: Extract keypoint with relaxed confidence threshold
        Allows detection even with slightly lower quality keypoints
        """
        try:
            idx = self.KEYPOINT_DICT[name]
            if idx < len(keypoints):
                x, y = keypoints[idx][0], keypoints[idx][1]
                # Check if confidence is good (if available)
                if len(keypoints[idx]) > 2:
                    conf = keypoints[idx][2]
                    # OPTIMIZED: Lower threshold from 0.3 to 0.2 for better detection
                    if conf < 0.2:  # Low confidence
                        return None
                return [x, y]
            return None
        except:
            return None
    
    def calculate_body_orientation_angle(self, keypoints):
        """Calculate the angle of body orientation (for detecting turns)"""
        left_shoulder = self.get_keypoint(keypoints, 'left_shoulder')
        right_shoulder = self.get_keypoint(keypoints, 'right_shoulder')
        
        if left_shoulder and right_shoulder:
            # Calculate angle from horizontal
            dx = right_shoulder[0] - left_shoulder[0]
            dy = right_shoulder[1] - left_shoulder[1]
            angle = math.degrees(math.atan2(dy, dx))
            return angle
        return 0
    
    def is_sleeping(self, keypoints):
        """Detect if person is sleeping (horizontal position)"""
        # Check if shoulders and hips are roughly horizontal
        left_shoulder = self.get_keypoint(keypoints, 'left_shoulder')
        right_shoulder = self.get_keypoint(keypoints, 'right_shoulder')
        left_hip = self.get_keypoint(keypoints, 'left_hip')
        right_hip = self.get_keypoint(keypoints, 'right_hip')
        nose = self.get_keypoint(keypoints, 'nose')
        
        if not all([left_shoulder, right_shoulder, left_hip, nose]):
            return False, 0.0
        
        # Calculate body alignment angle
        shoulder_center_y = (left_shoulder[1] + right_shoulder[1]) / 2
        hip_center_y = (left_hip[1] + right_hip[1]) / 2 if left_hip and right_hip else shoulder_center_y
        
        # If nose is at similar height as shoulders (horizontal body)
        vertical_distance = abs(nose[1] - shoulder_center_y)
        body_height = abs(shoulder_center_y - hip_center_y)
        
        # Body is horizontal if vertical distance is small
        if body_height > 0:
            horizontal_ratio = vertical_distance / (body_height + 1)
            if horizontal_ratio > 1.5:  # Body is more horizontal than vertical
                confidence = min(0.95, horizontal_ratio / 2)
                return True, confidence
        
        return False, 0.0
    
    def detect_turn_direction(self, keypoints):
        """Detect if person is turning left or right"""
        left_shoulder = self.get_keypoint(keypoints, 'left_shoulder')
        right_shoulder = self.get_keypoint(keypoints, 'right_shoulder')
        left_hip = self.get_keypoint(keypoints, 'left_hip')
        right_hip = self.get_keypoint(keypoints, 'right_hip')
        nose = self.get_keypoint(keypoints, 'nose')
        
        if not all([left_shoulder, right_shoulder, nose]):
            return "forward", 0.0
        
        # Calculate shoulder width and distance from nose
        shoulder_midpoint_x = (left_shoulder[0] + right_shoulder[0]) / 2
        shoulder_width = abs(right_shoulder[0] - left_shoulder[0])
        
        if shoulder_width < 10:  # Too narrow, likely facing sideways
            # Determine which side based on visible keypoints
            if left_shoulder[0] > right_shoulder[0]:  # Left shoulder is more right
                return "right", 0.8
            else:
                return "left", 0.8
        
        # Check nose position relative to shoulders
        nose_offset = nose[0] - shoulder_midpoint_x
        offset_ratio = nose_offset / (shoulder_width / 2) if shoulder_width > 0 else 0
        
        # Turning right if nose is significantly to the right
        if offset_ratio > 0.3:
            confidence = min(0.9, abs(offset_ratio))
            return "right", confidence
        # Turning left if nose is significantly to the left
        elif offset_ratio < -0.3:
            confidence = min(0.9, abs(offset_ratio))
            return "left", confidence
        
        return "forward", 0.5
    
    def detect_posture(self, keypoints):
        """Detect sitting vs standing posture"""
        left_shoulder = self.get_keypoint(keypoints, 'left_shoulder')
        left_hip = self.get_keypoint(keypoints, 'left_hip')
        left_knee = self.get_keypoint(keypoints, 'left_knee')
        right_shoulder = self.get_keypoint(keypoints, 'right_shoulder')
        right_hip = self.get_keypoint(keypoints, 'right_hip')
        right_knee = self.get_keypoint(keypoints, 'right_knee')
        
        # Try left side first
        if left_shoulder and left_hip and left_knee:
            angle = self.calculate_angle(left_shoulder, left_hip, left_knee)
            if 70 < angle < 130:
                return "sitting", 0.8
            elif angle > 150:
                return "standing", 0.8
        
        # Try right side
        if right_shoulder and right_hip and right_knee:
            angle = self.calculate_angle(right_shoulder, right_hip, right_knee)
            if 70 < angle < 130:
                return "sitting", 0.8
            elif angle > 150:
                return "standing", 0.8
        
        return "unknown", 0.3
    
    def detect_head_down(self, keypoints):
        """
        OPTIMIZED: Detect if head is down with improved sensitivity
        Multiple methods for phone use, reading, or drowsiness detection
        """
        nose = self.get_keypoint(keypoints, 'nose')
        left_shoulder = self.get_keypoint(keypoints, 'left_shoulder')
        right_shoulder = self.get_keypoint(keypoints, 'right_shoulder')
        left_eye = self.get_keypoint(keypoints, 'left_eye')
        right_eye = self.get_keypoint(keypoints, 'right_eye')
        left_ear = self.get_keypoint(keypoints, 'left_ear')
        right_ear = self.get_keypoint(keypoints, 'right_ear')
        
        if not all([nose, left_shoulder, right_shoulder]):
            return False, 0.0
        
        head_down = False
        confidence_score = 0.0
        
        # Calculate shoulder center
        shoulder_y = (left_shoulder[1] + right_shoulder[1]) / 2
        shoulder_x = (left_shoulder[0] + right_shoulder[0]) / 2
        
        # METHOD 1: Nose below shoulder line (OPTIMIZED threshold)
        head_drop = nose[1] - shoulder_y
        
        # OPTIMIZED: More sensitive - was 30, now 20 pixels
        if head_drop > 20:
            head_down = True
            # Scale confidence with drop amount
            confidence_score += min(0.5, head_drop / 40)
        
        # METHOD 2: Eye position below nose (indicates downward gaze)
        if left_eye and right_eye:
            eye_midpoint_y = (left_eye[1] + right_eye[1]) / 2
            eye_nose_vertical = eye_midpoint_y - nose[1]
            
            # OPTIMIZED: If eyes are below nose level, head is tilted down
            if eye_nose_vertical > 5:
                head_down = True
                confidence_score += 0.25
        
        # METHOD 3: Ear-nose-shoulder angle (head tilt detection)
        if left_ear and right_ear:
            ear_midpoint_y = (left_ear[1] + right_ear[1]) / 2
            
            # In normal posture, ears should be above nose
            # When head is down, ears move closer to nose level
            ear_nose_distance = nose[1] - ear_midpoint_y
            
            # OPTIMIZED: Small distance = head tilted forward/down
            if ear_nose_distance > 15:  # Nose far below ears
                head_down = True
                confidence_score += 0.3
        
        # METHOD 4: Relative head position (nose far from shoulder center)
        if head_drop > 10:  # Any noticeable drop
            # Calculate if head is significantly forward/down
            head_forward_ratio = head_drop / (abs(nose[0] - shoulder_x) + 1)
            
            # OPTIMIZED: High ratio = head is down not just forward
            if head_forward_ratio > 0.5:
                head_down = True
                confidence_score += 0.2
        
        # Normalize confidence
        final_confidence = min(0.95, confidence_score)
        
        # Only return True if confidence is reasonable
        if head_down and final_confidence > 0.3:
            return True, final_confidence
        
        return False, 0.0
    
    def detect_eyes_closed(self, keypoints):
        """
        OPTIMIZED: Detect if eyes are closed with improved sensitivity
        Multiple detection methods for better accuracy
        """
        left_eye = self.get_keypoint(keypoints, 'left_eye')
        right_eye = self.get_keypoint(keypoints, 'right_eye')
        nose = self.get_keypoint(keypoints, 'nose')
        left_ear = self.get_keypoint(keypoints, 'left_ear')
        right_ear = self.get_keypoint(keypoints, 'right_ear')
        
        if not nose:
            return False, 0.0, 0.0
        
        eyes_closed = False
        confidence_score = 0.0
        detection_methods = []
        
        # METHOD 1: Check eye keypoint confidence (primary indicator)
        left_eye_conf = 0.0
        right_eye_conf = 0.0
        
        if len(keypoints[self.KEYPOINT_DICT['left_eye']]) > 2:
            left_eye_conf = keypoints[self.KEYPOINT_DICT['left_eye']][2]
        
        if len(keypoints[self.KEYPOINT_DICT['right_eye']]) > 2:
            right_eye_conf = keypoints[self.KEYPOINT_DICT['right_eye']][2]
        
        # Low confidence on both eyes = likely closed (OPTIMIZED threshold)
        if left_eye_conf < 0.4 and right_eye_conf < 0.4:
            eyes_closed = True
            confidence_score += 0.4
            detection_methods.append("low_confidence")
        
        # METHOD 2: Eye-nose vertical distance (closed eyes appear closer)
        if left_eye and right_eye and nose:
            eye_midpoint_y = (left_eye[1] + right_eye[1]) / 2
            eye_nose_distance = abs(eye_midpoint_y - nose[1])
            
            # OPTIMIZED: More sensitive threshold (was 15, now 20)
            if eye_nose_distance < 20:
                eyes_closed = True
                confidence_score += 0.3
                detection_methods.append("close_distance")
        
        # METHOD 3: Eye aspect ratio (distance between eyes vs face width)
        if left_eye and right_eye and left_ear and right_ear:
            eye_distance = abs(left_eye[0] - right_eye[0])
            face_width = abs(left_ear[0] - right_ear[0])
            
            if face_width > 10:  # Valid face width
                eye_ratio = eye_distance / face_width
                # OPTIMIZED: Closed eyes have smaller eye distance ratio
                if eye_ratio < 0.25:
                    eyes_closed = True
                    confidence_score += 0.2
                    detection_methods.append("eye_ratio")
        
        # METHOD 4: Eye visibility check (at least one eye should be visible)
        eyes_visible_count = 0
        if left_eye and left_eye_conf > 0.3:
            eyes_visible_count += 1
        if right_eye and right_eye_conf > 0.3:
            eyes_visible_count += 1
        
        # OPTIMIZED: If no eyes visible, definitely closed
        if eyes_visible_count == 0:
            eyes_closed = True
            confidence_score += 0.35
            detection_methods.append("no_eyes_visible")
        
        # Normalize confidence
        final_confidence = min(0.95, confidence_score)
        
        return eyes_closed, final_confidence, self.eyes_closed_duration
    
    def detect_eyes_on_road(self, keypoints):
        """Detect if driver is looking forward at the road"""
        nose = self.get_keypoint(keypoints, 'nose')
        left_eye = self.get_keypoint(keypoints, 'left_eye')
        right_eye = self.get_keypoint(keypoints, 'right_eye')
        left_shoulder = self.get_keypoint(keypoints, 'left_shoulder')
        right_shoulder = self.get_keypoint(keypoints, 'right_shoulder')
        
        if not all([nose, left_shoulder, right_shoulder]):
            return False, 0.0
        
        # Check if head is centered and upright
        shoulder_midpoint_x = (left_shoulder[0] + right_shoulder[0]) / 2
        shoulder_width = abs(right_shoulder[0] - left_shoulder[0])
        
        if shoulder_width < 10:
            return False, 0.0
        
        nose_offset = abs(nose[0] - shoulder_midpoint_x)
        offset_ratio = nose_offset / (shoulder_width / 2)
        
        # Head is centered and facing forward
        if offset_ratio < 0.3:
            # Check head is not down
            shoulder_y = (left_shoulder[1] + right_shoulder[1]) / 2
            head_position = shoulder_y - nose[1]
            
            if head_position > 20:  # Head is up
                confidence = 0.85
                return True, confidence
        
        return False, 0.0
    
    def update_eye_closure_time(self, eyes_closed, current_time):
        """Update eye closure duration tracking"""
        import time
        
        if eyes_closed:
            if self.eyes_closed_start_time is None:
                self.eyes_closed_start_time = current_time
            self.eyes_closed_duration = current_time - self.eyes_closed_start_time
        else:
            # Reset when eyes open
            self.eyes_closed_start_time = None
            self.eyes_closed_duration = 0.0
        
        return self.eyes_closed_duration
    
    def update_looking_down_time(self, looking_down, current_time):
        """Update looking down duration tracking"""
        import time
        
        if looking_down:
            if self.looking_down_start_time is None:
                self.looking_down_start_time = current_time
            self.looking_down_duration = current_time - self.looking_down_start_time
        else:
            # Reset when head is back up
            self.looking_down_start_time = None
            self.looking_down_duration = 0.0
        
        return self.looking_down_duration
    
    def analyze_activity(self, keypoints, current_time=None):
        """
        Optimized driver monitoring: Focus on eyes open/closed and head position
        ALARMS: Eyes closed > 5 sec OR Looking down > 5 sec
        Returns: (activity_name, confidence, details)
        """
        import time
        
        if current_time is None:
            current_time = time.time()
        
        if keypoints is None or len(keypoints) == 0:
            return "no_driver_detected", 0.0, {
                "alert_level": "CRITICAL",
                "eyes_closed_duration": 0.0,
                "looking_down_duration": 0.0,
                "trigger_alarm": False
            }
        
        # === STEP 1: Check Eye Status (MOST CRITICAL) ===
        eyes_closed, eye_closed_conf, _ = self.detect_eyes_closed(keypoints)
        eyes_closed_duration = self.update_eye_closure_time(eyes_closed, current_time)
        
        # === STEP 2: Check Head Position (SECOND CRITICAL) ===
        is_head_down, head_down_conf = self.detect_head_down(keypoints)
        looking_down_duration = self.update_looking_down_time(is_head_down, current_time)
        
        # === PRIORITY 1: EYES CLOSED > 5 SECONDS = CRITICAL ALARM ===
        if eyes_closed and eyes_closed_duration >= self.eyes_closed_threshold:
            return "sleeping_eyes_closed", 0.95, {
                "alert_level": "CRITICAL", 
                "danger": "HIGH",
                "eyes_closed_duration": eyes_closed_duration,
                "looking_down_duration": 0.0,
                "trigger_alarm": True,
                "alarm_reason": f"Eyes closed for {eyes_closed_duration:.1f}s"
            }
        
        # === PRIORITY 2: LOOKING DOWN > 5 SECONDS = CRITICAL ALARM ===
        if is_head_down and looking_down_duration >= self.looking_down_threshold:
            return "looking_down_phone", 0.95, {
                "alert_level": "CRITICAL", 
                "danger": "HIGH",
                "eyes_closed_duration": 0.0,
                "looking_down_duration": looking_down_duration,
                "trigger_alarm": True,
                "alarm_reason": f"Looking down for {looking_down_duration:.1f}s"
            }
        
        # === WARNING: Eyes closing (2-5 seconds) ===
        if eyes_closed and eyes_closed_duration > 2.0:
            return "drowsy_eyes_closing", 0.80, {
                "alert_level": "WARNING",
                "danger": "HIGH",
                "eyes_closed_duration": eyes_closed_duration,
                "looking_down_duration": 0.0,
                "trigger_alarm": False,
                "alarm_reason": f"Eyes closing... {eyes_closed_duration:.1f}s"
            }
        
        # === WARNING: Looking down (2-5 seconds) ===
        if is_head_down and looking_down_duration > 2.0:
            return "looking_down_warning", 0.80, {
                "alert_level": "WARNING",
                "danger": "HIGH",
                "eyes_closed_duration": 0.0,
                "looking_down_duration": looking_down_duration,
                "trigger_alarm": False,
                "alarm_reason": f"Looking down... {looking_down_duration:.1f}s"
            }
        
        # === Check for sleeping (horizontal body) ===
        is_sleep, sleep_conf = self.is_sleeping(keypoints)
        if is_sleep and sleep_conf > 0.6:
            return "sleeping_horizontal", 0.90, {
                "alert_level": "CRITICAL", 
                "danger": "HIGH",
                "eyes_closed_duration": 0.0,
                "looking_down_duration": 0.0,
                "trigger_alarm": True,
                "alarm_reason": "Body horizontal (sleeping)"
            }
        
        # === SAFE: Eyes on road (normal driving) ===
        eyes_on_road, eyes_conf = self.detect_eyes_on_road(keypoints)
        if eyes_on_road and eyes_conf > 0.6 and not eyes_closed:
            return "eyes_on_road", eyes_conf, {
                "alert_level": "SAFE", 
                "danger": "LOW",
                "eyes_closed_duration": 0.0,
                "looking_down_duration": 0.0,
                "trigger_alarm": False,
                "alarm_reason": "Eyes open, looking forward"
            }
        
        # === Check turn direction (minor distractions) ===
        turn_direction, turn_conf = self.detect_turn_direction(keypoints)
        
        if turn_direction == "left" and turn_conf > 0.5:
            return "looking_left", turn_conf, {
                "alert_level": "CAUTION", 
                "danger": "MEDIUM",
                "eyes_closed_duration": 0.0,
                "looking_down_duration": 0.0,
                "trigger_alarm": False,
                "alarm_reason": "Looking left"
            }
        elif turn_direction == "right" and turn_conf > 0.5:
            return "looking_right", turn_conf, {
                "alert_level": "CAUTION", 
                "danger": "MEDIUM",
                "eyes_closed_duration": 0.0,
                "looking_down_duration": 0.0,
                "trigger_alarm": False,
                "alarm_reason": "Looking right"
            }
        
        # === Default: Driver present, monitoring ===
        return "driver_detected", 0.6, {
            "alert_level": "SAFE", 
            "danger": "LOW",
            "eyes_closed_duration": 0.0,
            "looking_down_duration": 0.0,
            "trigger_alarm": False,
            "alarm_reason": "Driver detected"
        }

