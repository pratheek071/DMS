/**
 * Local Pose Detection Service
 * Runs TensorFlow Lite pose detection entirely on device
 * No backend server required!
 */

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as poseDetection from '@tensorflow-models/pose-detection';

class PoseDetectionService {
  constructor() {
    this.detector = null;
    this.isInitialized = false;
    this.isInitializing = false;
  }

  /**
   * Initialize TensorFlow and load pose detection model
   */
  async initialize() {
    if (this.isInitialized || this.isInitializing) {
      return this.detector;
    }

    try {
      this.isInitializing = true;
      console.log('🔄 Initializing TensorFlow...');

      // Wait for TensorFlow to be ready
      await tf.ready();
      console.log('✅ TensorFlow ready!');

      // Create pose detector with MoveNet (optimized for mobile)
      this.detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING, // Fastest
          enableSmoothing: true,
          minPoseScore: 0.25, // Lower threshold for better detection
        }
      );

      console.log('✅ Pose detector loaded!');
      this.isInitialized = true;
      this.isInitializing = false;
      return this.detector;
    } catch (error) {
      console.error('❌ Failed to initialize pose detector:', error);
      this.isInitializing = false;
      throw error;
    }
  }

  /**
   * Detect poses in an image
   * @param {string} imageUri - URI of the image
   * @returns {Promise<Array>} - Array of detected poses with keypoints
   */
  async detectPose(imageUri) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Decode image to tensor
      const imageTensor = await this.decodeImage(imageUri);
      
      // Run pose detection
      const poses = await this.detector.estimatePoses(imageTensor);
      
      // Clean up tensor to prevent memory leaks
      imageTensor.dispose();
      
      return poses;
    } catch (error) {
      console.error('❌ Pose detection error:', error);
      return [];
    }
  }

  /**
   * Decode image URI to TensorFlow tensor
   * @param {string} uri - Image URI
   * @returns {Promise<Tensor>} - TensorFlow tensor
   */
  async decodeImage(uri) {
    try {
      // Use fetch to get image as blob
      const response = await fetch(uri);
      const imageDataBlob = await response.blob();
      
      // Convert to array buffer
      const imageData = await imageDataBlob.arrayBuffer();
      const imageBuffer = new Uint8Array(imageData);
      
      // Decode JPEG to tensor
      const imageTensor = tf.node.decodeImage(imageBuffer, 3);
      
      return imageTensor;
    } catch (error) {
      console.error('❌ Image decode error:', error);
      throw error;
    }
  }

  /**
   * Get model info
   */
  getModelInfo() {
    return {
      initialized: this.isInitialized,
      model: 'MoveNet SinglePose Lightning',
      device: 'Mobile CPU/GPU',
      speed: 'Very Fast (~50-100ms)',
      accuracy: 'High',
    };
  }

  /**
   * Cleanup resources
   */
  dispose() {
    if (this.detector) {
      this.detector = null;
    }
    this.isInitialized = false;
  }
}

// Export singleton instance
export default new PoseDetectionService();

