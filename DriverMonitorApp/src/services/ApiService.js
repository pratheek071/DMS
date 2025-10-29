import axios from 'axios';

export class ApiService {
  /**
   * Check server health and status
   */
  static async healthCheck(serverUrl) {
    try {
      const response = await axios.get(`${serverUrl}/health`, {
        timeout: 5000,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  /**
   * Process a single frame
   */
  static async processFrame(serverUrl, base64Image) {
    try {
      // Convert base64 to blob for multipart upload
      const formData = new FormData();
      
      // Create a blob from base64
      const response = await fetch(`data:image/jpeg;base64,${base64Image}`);
      const blob = await response.blob();
      
      formData.append('file', {
        uri: `data:image/jpeg;base64,${base64Image}`,
        type: 'image/jpeg',
        name: 'frame.jpg',
      });

      const result = await axios.post(
        `${serverUrl}/api/process-frame`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 10000,
        }
      );

      return result.data;
    } catch (error) {
      console.error('API Error:', error.message);
      throw new Error(`Frame processing failed: ${error.message}`);
    }
  }

  /**
   * Start recording session
   */
  static async startRecording(serverUrl) {
    try {
      const response = await axios.post(`${serverUrl}/api/start-recording`);
      return response.data;
    } catch (error) {
      throw new Error(`Start recording failed: ${error.message}`);
    }
  }

  /**
   * Stop recording session
   */
  static async stopRecording(serverUrl) {
    try {
      const response = await axios.post(`${serverUrl}/api/stop-recording`);
      return response.data;
    } catch (error) {
      throw new Error(`Stop recording failed: ${error.message}`);
    }
  }

  /**
   * Get recording status
   */
  static async getRecordingStatus(serverUrl) {
    try {
      const response = await axios.get(`${serverUrl}/api/recording-status`);
      return response.data;
    } catch (error) {
      throw new Error(`Get recording status failed: ${error.message}`);
    }
  }

  /**
   * Get active sessions
   */
  static async getActiveSessions(serverUrl) {
    try {
      const response = await axios.get(`${serverUrl}/api/sessions`);
      return response.data;
    } catch (error) {
      throw new Error(`Get sessions failed: ${error.message}`);
    }
  }

  /**
   * Notify backend that alarm was triggered
   */
  static async notifyAlarmTriggered(serverUrl, details) {
    try {
      const response = await axios.post(`${serverUrl}/api/alert/triggered`, details);
      return response.data;
    } catch (error) {
      console.error('Failed to notify alarm:', error);
      throw error;
    }
  }

  /**
   * Notify backend that driver responded to alarm
   */
  static async notifyDriverResponded(serverUrl) {
    try {
      const response = await axios.post(`${serverUrl}/api/alert/responded`);
      return response.data;
    } catch (error) {
      console.error('Failed to notify response:', error);
      throw error;
    }
  }

  /**
   * Check if alert timeout has been reached
   */
  static async checkAlertTimeout(serverUrl) {
    try {
      const response = await axios.post(`${serverUrl}/api/alert/check-timeout`);
      return response.data;
    } catch (error) {
      console.error('Failed to check timeout:', error);
      throw error;
    }
  }

  /**
   * Get alert status
   */
  static async getAlertStatus(serverUrl) {
    try {
      const response = await axios.get(`${serverUrl}/api/alert/status`);
      return response.data;
    } catch (error) {
      throw new Error(`Get alert status failed: ${error.message}`);
    }
  }
}






