/**
 * Local Video Recorder Service
 * Records video sessions and saves them to phone storage
 * Includes session logging and behavior tracking
 */

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

class LocalVideoRecorder {
  constructor() {
    this.isRecording = false;
    this.sessionStartTime = null;
    this.currentVideoUri = null;
    this.behaviorLog = [];
    this.sessionStats = {
      totalFrames: 0,
      alertsTriggered: 0,
      behaviorsDetected: {},
    };
  }

  /**
   * Start a new recording session
   */
  async startSession() {
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Media library permission not granted');
      }

      this.isRecording = true;
      this.sessionStartTime = Date.now();
      this.behaviorLog = [];
      this.sessionStats = {
        totalFrames: 0,
        alertsTriggered: 0,
        behaviorsDetected: {},
      };

      console.log('✅ Recording session started');
      return {
        success: true,
        sessionId: this.getSessionId(),
        startTime: new Date(this.sessionStartTime).toISOString(),
      };
    } catch (error) {
      console.error('❌ Failed to start session:', error);
      throw error;
    }
  }

  /**
   * Stop the recording session and save everything
   */
  async stopSession(videoUri) {
    if (!this.isRecording) {
      throw new Error('No active recording session');
    }

    try {
      this.isRecording = false;
      const sessionId = this.getSessionId();
      const duration = (Date.now() - this.sessionStartTime) / 1000;

      // Save video to gallery if provided
      let savedVideoUri = null;
      if (videoUri) {
        savedVideoUri = await this.saveVideoToGallery(videoUri);
      }

      // Save behavior log
      const logUri = await this.saveBehaviorLog(sessionId);

      // Save session summary
      const summaryUri = await this.saveSessionSummary(sessionId, duration, savedVideoUri, logUri);

      const result = {
        success: true,
        sessionId,
        duration: duration.toFixed(2),
        videoUri: savedVideoUri,
        logUri,
        summaryUri,
        stats: this.sessionStats,
      };

      console.log('✅ Recording session stopped and saved:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to stop session:', error);
      throw error;
    }
  }

  /**
   * Log a behavior detection
   */
  logBehavior(behaviorResult) {
    if (!this.isRecording) return;

    this.sessionStats.totalFrames++;

    const logEntry = {
      timestamp: Date.now(),
      relativeTime: ((Date.now() - this.sessionStartTime) / 1000).toFixed(2),
      activity: behaviorResult.activity,
      alertLevel: behaviorResult.alert_level,
      confidence: behaviorResult.confidence,
      details: behaviorResult.details,
    };

    this.behaviorLog.push(logEntry);

    // Update stats
    if (!this.sessionStats.behaviorsDetected[behaviorResult.activity]) {
      this.sessionStats.behaviorsDetected[behaviorResult.activity] = 0;
    }
    this.sessionStats.behaviorsDetected[behaviorResult.activity]++;

    if (behaviorResult.trigger_alarm) {
      this.sessionStats.alertsTriggered++;
    }

    // Keep only last 1000 entries to prevent memory issues
    if (this.behaviorLog.length > 1000) {
      this.behaviorLog.shift();
    }
  }

  /**
   * Save video to phone gallery
   */
  async saveVideoToGallery(videoUri) {
    try {
      const asset = await MediaLibrary.createAssetAsync(videoUri);
      
      // Create album if it doesn't exist
      const albumName = 'Driver Monitor';
      let album = await MediaLibrary.getAlbumAsync(albumName);
      
      if (album === null) {
        album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      console.log('✅ Video saved to gallery:', asset.uri);
      return asset.uri;
    } catch (error) {
      console.error('❌ Failed to save video:', error);
      throw error;
    }
  }

  /**
   * Save behavior log as JSON file
   */
  async saveBehaviorLog(sessionId) {
    try {
      const fileName = `behavior_log_${sessionId}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const logData = {
        sessionId,
        startTime: new Date(this.sessionStartTime).toISOString(),
        duration: ((Date.now() - this.sessionStartTime) / 1000).toFixed(2),
        totalEntries: this.behaviorLog.length,
        behaviors: this.behaviorLog,
      };

      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(logData, null, 2)
      );

      console.log('✅ Behavior log saved:', fileUri);
      return fileUri;
    } catch (error) {
      console.error('❌ Failed to save behavior log:', error);
      throw error;
    }
  }

  /**
   * Save session summary
   */
  async saveSessionSummary(sessionId, duration, videoUri, logUri) {
    try {
      const fileName = `session_summary_${sessionId}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const summary = {
        sessionId,
        startTime: new Date(this.sessionStartTime).toISOString(),
        endTime: new Date().toISOString(),
        duration: duration.toFixed(2),
        stats: {
          totalFrames: this.sessionStats.totalFrames,
          alertsTriggered: this.sessionStats.alertsTriggered,
          behaviorsDetected: this.sessionStats.behaviorsDetected,
          averageFPS: (this.sessionStats.totalFrames / duration).toFixed(2),
        },
        files: {
          video: videoUri,
          behaviorLog: logUri,
        },
      };

      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(summary, null, 2)
      );

      console.log('✅ Session summary saved:', fileUri);
      return fileUri;
    } catch (error) {
      console.error('❌ Failed to save summary:', error);
      throw error;
    }
  }

  /**
   * Get list of all saved sessions
   */
  async getSavedSessions() {
    try {
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      const summaryFiles = files.filter(f => f.startsWith('session_summary_'));
      
      const sessions = [];
      for (const file of summaryFiles) {
        const fileUri = `${FileSystem.documentDirectory}${file}`;
        const content = await FileSystem.readAsStringAsync(fileUri);
        sessions.push(JSON.parse(content));
      }

      return sessions.sort((a, b) => 
        new Date(b.startTime) - new Date(a.startTime)
      );
    } catch (error) {
      console.error('❌ Failed to load sessions:', error);
      return [];
    }
  }

  /**
   * Delete a session and all its files
   */
  async deleteSession(sessionId) {
    try {
      const files = [
        `behavior_log_${sessionId}.json`,
        `session_summary_${sessionId}.json`,
      ];

      for (const file of files) {
        const fileUri = `${FileSystem.documentDirectory}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(fileUri);
        }
      }

      console.log('✅ Session deleted:', sessionId);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete session:', error);
      throw error;
    }
  }

  /**
   * Get session ID based on timestamp
   */
  getSessionId() {
    const date = new Date(this.sessionStartTime);
    return date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  }

  /**
   * Get current session stats
   */
  getStats() {
    if (!this.isRecording) {
      return null;
    }

    return {
      ...this.sessionStats,
      duration: ((Date.now() - this.sessionStartTime) / 1000).toFixed(2),
      fps: (this.sessionStats.totalFrames / ((Date.now() - this.sessionStartTime) / 1000)).toFixed(2),
    };
  }

  /**
   * Check if currently recording
   */
  getIsRecording() {
    return this.isRecording;
  }
}

// Export singleton instance
export default new LocalVideoRecorder();

