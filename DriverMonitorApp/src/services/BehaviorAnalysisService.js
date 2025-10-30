/**
 * Behavior Analysis Service
 * Analyzes pose keypoints to detect dangerous driving behaviors
 * Replaces backend pose analyzer - runs entirely on device!
 */

class BehaviorAnalysisService {
  constructor() {
    // Duration trackers
    this.eyesClosedStartTime = null;
    this.lookingDownStartTime = null;
    this.lookingAwayStartTime = null;
    
    // Thresholds
    this.WARNING_THRESHOLD = 2.0; // seconds
    this.CRITICAL_THRESHOLD = 5.0; // seconds
    
    // Last known state
    this.lastActivity = 'SAFE';
  }

  /**
   * Analyze poses and determine driver behavior
   * @param {Array} poses - Detected poses from TensorFlow
   * @returns {Object} - Behavior analysis result
   */
  analyzeBehavior(poses) {
    if (!poses || poses.length === 0) {
      return this.createResult('no_driver_detected', 0, 'CAUTION', {
        message: 'No driver detected in frame',
      });
    }

    const pose = poses[0]; // Assume single person (driver)
    const keypoints = pose.keypoints;
    
    // Check confidence - if too low, can't analyze
    if (pose.score < 0.25) {
      return this.createResult('low_confidence', pose.score, 'CAUTION', {
        message: 'Driver detection confidence too low',
      });
    }

    // Extract key facial points
    const nose = this.getKeypoint(keypoints, 'nose');
    const leftEye = this.getKeypoint(keypoints, 'left_eye');
    const rightEye = this.getKeypoint(keypoints, 'right_eye');
    const leftEar = this.getKeypoint(keypoints, 'left_ear');
    const rightEar = this.getKeypoint(keypoints, 'right_ear');
    const leftShoulder = this.getKeypoint(keypoints, 'left_shoulder');
    const rightShoulder = this.getKeypoint(keypoints, 'right_shoulder');

    // 1. CHECK: Eyes Closed (low eye confidence = eyes not visible/closed)
    const eyesClosed = this.checkEyesClosed(leftEye, rightEye);
    if (eyesClosed) {
      return this.handleEyesClosed(pose.score);
    }

    // 2. CHECK: Looking Down (nose below shoulders)
    const lookingDown = this.checkLookingDown(nose, leftShoulder, rightShoulder);
    if (lookingDown) {
      return this.handleLookingDown(pose.score);
    }

    // 3. CHECK: Looking Away (head turned significantly)
    const lookingAway = this.checkLookingAway(leftEye, rightEye, leftEar, rightEar);
    if (lookingAway.isAway) {
      return this.handleLookingAway(lookingAway.direction, pose.score);
    }

    // 4. SAFE: Normal driving
    this.resetDurationTrackers();
    this.lastActivity = 'SAFE';
    return this.createResult('eyes_on_road', pose.score, 'SAFE', {
      message: 'Driver is alert and focused',
      eyes_closed_duration: 0,
      looking_down_duration: 0,
    });
  }

  /**
   * Get specific keypoint by name
   */
  getKeypoint(keypoints, name) {
    return keypoints.find(kp => kp.name === name);
  }

  /**
   * Check if eyes are closed (low confidence = not visible)
   */
  checkEyesClosed(leftEye, rightEye) {
    if (!leftEye || !rightEye) return true; // Can't see eyes = assume closed
    
    const EYE_CONFIDENCE_THRESHOLD = 0.35;
    return leftEye.score < EYE_CONFIDENCE_THRESHOLD || 
           rightEye.score < EYE_CONFIDENCE_THRESHOLD;
  }

  /**
   * Check if looking down
   */
  checkLookingDown(nose, leftShoulder, rightShoulder) {
    if (!nose || !leftShoulder || !rightShoulder) return false;
    
    // Average shoulder Y position
    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    
    // If nose is significantly below shoulders, looking down
    const LOOKING_DOWN_THRESHOLD = 50; // pixels
    return nose.y > (avgShoulderY + LOOKING_DOWN_THRESHOLD);
  }

  /**
   * Check if looking away (left/right)
   */
  checkLookingAway(leftEye, rightEye, leftEar, rightEar) {
    if (!leftEye || !rightEye) {
      return { isAway: false, direction: null };
    }

    const eyeDistance = Math.abs(leftEye.x - rightEye.x);
    const LOOKING_AWAY_THRESHOLD = 0.3; // Relative threshold

    // Check left ear visibility
    if (leftEar && leftEar.score > 0.4 && rightEar && rightEar.score < 0.3) {
      if (leftEar.x < leftEye.x - eyeDistance * LOOKING_AWAY_THRESHOLD) {
        return { isAway: true, direction: 'left' };
      }
    }

    // Check right ear visibility
    if (rightEar && rightEar.score > 0.4 && leftEar && leftEar.score < 0.3) {
      if (rightEar.x > rightEye.x + eyeDistance * LOOKING_AWAY_THRESHOLD) {
        return { isAway: true, direction: 'right' };
      }
    }

    return { isAway: false, direction: null };
  }

  /**
   * Handle eyes closed behavior with duration tracking
   */
  handleEyesClosed(confidence) {
    const currentTime = Date.now();
    
    if (!this.eyesClosedStartTime) {
      this.eyesClosedStartTime = currentTime;
    }

    const duration = (currentTime - this.eyesClosedStartTime) / 1000;

    if (duration >= this.CRITICAL_THRESHOLD) {
      this.lastActivity = 'CRITICAL_EYES_CLOSED';
      return this.createResult('sleeping_eyes_closed', confidence, 'CRITICAL', {
        message: `CRITICAL: Eyes closed for ${duration.toFixed(1)}s!`,
        eyes_closed_duration: duration,
        trigger_alarm: true,
        alarm_reason: `Eyes closed for ${duration.toFixed(1)} seconds - WAKE UP!`,
      });
    } else if (duration >= this.WARNING_THRESHOLD) {
      this.lastActivity = 'WARNING_EYES_CLOSING';
      return this.createResult('drowsy_eyes_closing', confidence, 'WARNING', {
        message: `WARNING: Eyes closing for ${duration.toFixed(1)}s`,
        eyes_closed_duration: duration,
        trigger_alarm: false,
        alarm_reason: `Eyes closing - ${(this.CRITICAL_THRESHOLD - duration).toFixed(1)}s until alarm`,
      });
    } else {
      return this.createResult('drowsy_eyes_closing', confidence, 'CAUTION', {
        message: 'Eyes closing...',
        eyes_closed_duration: duration,
        trigger_alarm: false,
      });
    }
  }

  /**
   * Handle looking down behavior with duration tracking
   */
  handleLookingDown(confidence) {
    const currentTime = Date.now();
    
    if (!this.lookingDownStartTime) {
      this.lookingDownStartTime = currentTime;
    }

    const duration = (currentTime - this.lookingDownStartTime) / 1000;

    if (duration >= this.CRITICAL_THRESHOLD) {
      this.lastActivity = 'CRITICAL_LOOKING_DOWN';
      return this.createResult('looking_down_phone', confidence, 'CRITICAL', {
        message: `CRITICAL: Looking down for ${duration.toFixed(1)}s!`,
        looking_down_duration: duration,
        trigger_alarm: true,
        alarm_reason: `Looking down for ${duration.toFixed(1)} seconds - Eyes on road!`,
      });
    } else if (duration >= this.WARNING_THRESHOLD) {
      this.lastActivity = 'WARNING_LOOKING_DOWN';
      return this.createResult('looking_down_warning', confidence, 'WARNING', {
        message: `WARNING: Looking down for ${duration.toFixed(1)}s`,
        looking_down_duration: duration,
        trigger_alarm: false,
        alarm_reason: `Looking down - ${(this.CRITICAL_THRESHOLD - duration).toFixed(1)}s until alarm`,
      });
    } else {
      return this.createResult('looking_down_warning', confidence, 'CAUTION', {
        message: 'Looking down...',
        looking_down_duration: duration,
        trigger_alarm: false,
      });
    }
  }

  /**
   * Handle looking away behavior
   */
  handleLookingAway(direction, confidence) {
    const currentTime = Date.now();
    
    if (!this.lookingAwayStartTime) {
      this.lookingAwayStartTime = currentTime;
    }

    const duration = (currentTime - this.lookingAwayStartTime) / 1000;
    const activity = direction === 'left' ? 'looking_left' : 'looking_right';

    // Looking away is generally CAUTION (mirror check is normal)
    if (duration > 3.0) {
      return this.createResult(activity, confidence, 'WARNING', {
        message: `Looking ${direction} for ${duration.toFixed(1)}s`,
        looking_away_duration: duration,
        trigger_alarm: false,
      });
    } else {
      return this.createResult(activity, confidence, 'CAUTION', {
        message: `Checking ${direction} mirror`,
        looking_away_duration: duration,
        trigger_alarm: false,
      });
    }
  }

  /**
   * Reset all duration trackers
   */
  resetDurationTrackers() {
    this.eyesClosedStartTime = null;
    this.lookingDownStartTime = null;
    this.lookingAwayStartTime = null;
  }

  /**
   * Create standardized result object
   */
  createResult(activity, confidence, alertLevel, details = {}) {
    return {
      activity,
      confidence,
      alert_level: alertLevel,
      details: {
        ...details,
        timestamp: new Date().toISOString(),
      },
      trigger_alarm: details.trigger_alarm || false,
    };
  }

  /**
   * Get current state
   */
  getState() {
    return {
      lastActivity: this.lastActivity,
      eyesClosedDuration: this.eyesClosedStartTime 
        ? (Date.now() - this.eyesClosedStartTime) / 1000 
        : 0,
      lookingDownDuration: this.lookingDownStartTime 
        ? (Date.now() - this.lookingDownStartTime) / 1000 
        : 0,
    };
  }

  /**
   * Reset service
   */
  reset() {
    this.resetDurationTrackers();
    this.lastActivity = 'SAFE';
  }
}

// Export singleton instance
export default new BehaviorAnalysisService();

