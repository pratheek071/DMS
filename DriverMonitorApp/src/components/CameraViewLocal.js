/**
 * Local Camera View - On-Device Processing
 * No backend server required!
 * All ML inference runs on device using TensorFlow Lite
 */

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Text, Dimensions, Platform } from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import { ActivityIndicator } from 'react-native-paper';
import PoseDetectionService from '../services/PoseDetectionService';
import BehaviorAnalysisService from '../services/BehaviorAnalysisService';
import LocalVideoRecorder from '../services/LocalVideoRecorder';

const { width } = Dimensions.get('window');
const CAMERA_HEIGHT = width * 0.75; // 4:3 aspect ratio

export default function CameraViewLocal({
  isMonitoring,
  onFrameProcessed,
  onError,
}) {
  const cameraRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(null);
  const processingRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Initialize ML model on mount
  useEffect(() => {
    initializeModel();
  }, []);

  // Start/stop frame processing
  useEffect(() => {
    let intervalId;

    if (isMonitoring && modelLoaded) {
      // Process frames at 5 FPS (200ms interval)
      intervalId = setInterval(async () => {
        await captureAndProcessFrame();
      }, 200);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isMonitoring, modelLoaded]);

  /**
   * Initialize TensorFlow model
   */
  const initializeModel = async () => {
    try {
      setIsInitializing(true);
      console.log('🔄 Initializing pose detection model...');
      
      await PoseDetectionService.initialize();
      
      setModelLoaded(true);
      setIsInitializing(false);
      console.log('✅ Model ready! Processing can begin.');
    } catch (error) {
      console.error('❌ Model initialization failed:', error);
      setIsInitializing(false);
      if (onError) {
        onError('Failed to load ML model. Please restart the app.');
      }
    }
  };

  /**
   * Capture frame and process locally
   */
  const captureAndProcessFrame = async () => {
    // Prevent overlapping processing
    if (processingRef.current || !cameraRef.current) {
      return;
    }

    try {
      processingRef.current = true;
      setIsProcessing(true);

      // Capture photo from camera
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true, // Faster
      });

      // Store current frame for display
      setCurrentFrame(photo.uri);

      // 1. DETECT POSES (Local TensorFlow Lite)
      const poses = await PoseDetectionService.detectPose(photo.uri);

      // 2. ANALYZE BEHAVIOR (Local logic)
      const behaviorResult = BehaviorAnalysisService.analyzeBehavior(poses);

      // 3. LOG BEHAVIOR (if recording)
      if (LocalVideoRecorder.getIsRecording()) {
        LocalVideoRecorder.logBehavior(behaviorResult);
      }

      // 4. UPDATE UI (callback to parent)
      if (onFrameProcessed) {
        onFrameProcessed({
          ...behaviorResult,
          frameUri: photo.uri,
          poses: poses,
          timestamp: Date.now(),
        });
      }

    } catch (error) {
      console.error('❌ Frame processing error:', error);
      if (onError) {
        onError('Frame processing failed');
      }
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  // Handle camera permissions
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.statusText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Camera permission required</Text>
          <Text style={styles.overlaySubtext}>Please grant camera access to continue</Text>
        </View>
      </View>
    );
  }

  // Model still loading
  if (isInitializing) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1f77b4" />
          <Text style={styles.loadingText}>Loading ML Model...</Text>
          <Text style={styles.loadingSubtext}>First launch may take a moment</Text>
        </View>
      </View>
    );
  }

  // Model failed to load
  if (!modelLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ Failed to load ML model</Text>
          <Text style={styles.errorSubtext}>Please restart the app</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isMonitoring ? (
        // Preview mode
        <View style={styles.previewContainer}>
          <ExpoCameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
          />
          <View style={styles.overlayAbsolute}>
            <Text style={styles.overlayText}>✅ Ready to Monitor</Text>
            <Text style={styles.overlaySubtext}>100% Local Processing</Text>
            <Text style={styles.overlaySubtext}>No Internet Required</Text>
          </View>
        </View>
      ) : currentFrame ? (
        // Show processed frame
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: currentFrame }}
            style={styles.frameImage}
            resizeMode="contain"
          />
          {isProcessing && (
            <View style={styles.processingIndicator}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          )}
          <View style={styles.localBadge}>
            <Text style={styles.localBadgeText}>🔒 LOCAL</Text>
          </View>
        </View>
      ) : (
        // Waiting for first frame
        <View style={styles.previewContainer}>
          <ExpoCameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
          />
          <View style={styles.overlayAbsolute}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.overlayText}>Starting monitoring...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: CAMERA_HEIGHT,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  frameImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  overlaySubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  loadingSubtext: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  errorText: {
    color: '#ff5252',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  processingIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
  },
  localBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  localBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
});

