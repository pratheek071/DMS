import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Text, Dimensions } from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import { ActivityIndicator } from 'react-native-paper';
import { ApiService } from '../services/ApiService';

const { width } = Dimensions.get('window');
const CAMERA_HEIGHT = width * 0.75; // 4:3 aspect ratio

export default function CameraView({
  isMonitoring,
  serverUrl,
  onFrameProcessed,
  annotatedFrame,
}) {
  const cameraRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    let intervalId;

    if (isMonitoring) {
      // Capture and process frames every 200ms (5 FPS)
      // Adjust this based on your server capacity and network speed
      intervalId = setInterval(async () => {
        await captureAndProcessFrame();
      }, 200);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isMonitoring, serverUrl]);

  const captureAndProcessFrame = async () => {
    // Prevent overlapping requests
    if (processingRef.current || !cameraRef.current) {
      return;
    }

    try {
      processingRef.current = true;
      setIsProcessing(true);

      // Capture photo from camera (SDK 54 API)
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      // Send to backend for processing
      const result = await ApiService.processFrame(serverUrl, photo.base64);

      // Update parent component with results
      if (onFrameProcessed) {
        onFrameProcessed(result);
      }
    } catch (error) {
      console.error('Error processing frame:', error);
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

  return (
    <View style={styles.container}>
      {!isMonitoring ? (
        <View style={styles.previewContainer}>
          <ExpoCameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
          />
          <View style={styles.overlayAbsolute}>
            <Text style={styles.overlayText}>Ready to Monitor</Text>
            <Text style={styles.overlaySubtext}>Press "Start Monitoring" to begin</Text>
          </View>
        </View>
      ) : annotatedFrame ? (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: annotatedFrame }}
            style={styles.annotatedImage}
            resizeMode="contain"
          />
          {isProcessing && (
            <View style={styles.processingIndicator}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <ExpoCameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
          />
          <View style={styles.overlayAbsolute}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.overlayText}>Processing...</Text>
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
  annotatedImage: {
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
  },
  overlaySubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
  },
  processingIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
});


