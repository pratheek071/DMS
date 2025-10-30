/**
 * Monitoring Screen - Local Processing Version
 * 100% on-device processing - NO BACKEND REQUIRED!
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import CameraViewLocal from '../components/CameraViewLocal';
import StatusCard from '../components/StatusCard';
import AlertBanner from '../components/AlertBanner';
import { useAppContext } from '../context/AppContext';
import { AudioService } from '../services/AudioService';
import LocalVideoRecorder from '../services/LocalVideoRecorder';

const { width, height } = Dimensions.get('window');

export default function MonitoringScreenLocal({ onNavigate }) {
  const {
    isMonitoring,
    setIsMonitoring,
    audioEnabled,
    whatsappEnabled,
    sessionStats,
    updateStats,
    resetSession,
  } = useAppContext();

  const [currentActivity, setCurrentActivity] = useState('no_driver_detected');
  const [alertLevel, setAlertLevel] = useState('SAFE');
  const [confidence, setConfidence] = useState(0);
  const [details, setDetails] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);

  const startTimeRef = useRef(null);
  const statsIntervalRef = useRef(null);
  const alarmActiveRef = useRef(false);

  // Keep screen awake when monitoring
  useEffect(() => {
    if (isMonitoring) {
      activateKeepAwakeAsync();
    } else {
      deactivateKeepAwake();
    }
    
    return () => {
      deactivateKeepAwake();
    };
  }, [isMonitoring]);

  const startMonitoring = async () => {
    try {
      // Start video recording session
      await LocalVideoRecorder.startSession();
      setIsRecording(true);

      // Reset session stats
      setIsMonitoring(true);
      resetSession();
      startTimeRef.current = Date.now();

      // Update duration every second
      statsIntervalRef.current = setInterval(() => {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        updateStats('duration', duration);
      }, 1000);

      Alert.alert(
        '✅ Monitoring Started',
        '100% Local Processing\nNo internet required!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      Alert.alert('Error', 'Failed to start monitoring. Please try again.');
    }
  };

  const stopMonitoring = async () => {
    try {
      setIsMonitoring(false);
      
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }

      // Stop recording and save
      if (isRecording) {
        // Note: Video recording with camera is complex, so we'll save logs only
        const result = await LocalVideoRecorder.stopSession(null);
        setIsRecording(false);

        Alert.alert(
          '✅ Session Saved',
          `Duration: ${formatDuration(sessionStats.duration)}\n` +
          `Frames: ${sessionStats.framesProcessed}\n` +
          `Alerts: ${sessionStats.alertsTriggered}\n\n` +
          `Session log saved to phone storage.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
      Alert.alert('Error', 'Failed to save session properly.');
    }
  };

  const handleFrameProcessed = async (result) => {
    setCurrentActivity(result.activity);
    setAlertLevel(result.alert_level);
    setConfidence(result.confidence);
    setDetails(result.details || {});

    // Update stats
    updateStats('framesProcessed', sessionStats.framesProcessed + 1);

    // Handle driver response (cancel alarm)
    if (alarmActiveRef.current && (result.alert_level === 'SAFE' || result.activity === 'eyes_on_road')) {
      console.log('✅ Driver responded - cancelling alarm');
      alarmActiveRef.current = false;
    }

    // Trigger audio alert if needed
    if (audioEnabled && result.trigger_alarm) {
      if (result.alert_level === 'CRITICAL') {
        AudioService.playCriticalAlert();
        updateStats('alertsTriggered', sessionStats.alertsTriggered + 1);
        alarmActiveRef.current = true;

        // WhatsApp alert logic (if enabled)
        if (whatsappEnabled && !alarmActiveRef.current) {
          // TODO: Implement WhatsApp alert for local version
          // Could use device's share API or notification system
        }
      } else if (result.alert_level === 'WARNING') {
        AudioService.playWarningAlert();
      }
    }
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    Alert.alert('Error', errorMessage);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getActivityDisplay = () => {
    return currentActivity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAlertColor = () => {
    switch (alertLevel) {
      case 'SAFE':
        return '#4caf50';
      case 'CAUTION':
        return '#ff9800';
      case 'WARNING':
        return '#ff5722';
      case 'CRITICAL':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getAlertIcon = () => {
    switch (alertLevel) {
      case 'SAFE':
        return '✅';
      case 'CAUTION':
        return '⚠️';
      case 'WARNING':
        return '⚠️';
      case 'CRITICAL':
        return '🚨';
      default:
        return 'ℹ️';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Title style={styles.title}>🚗 Driver Monitor</Title>
          <Text style={styles.subtitle}>🔒 100% Local Processing</Text>
        </View>
        <IconButton
          icon="cog"
          size={24}
          onPress={() => onNavigate('settings')}
        />
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>📱 On-Device</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>🚫 No Internet Needed</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Camera Feed */}
        <Card style={styles.cameraCard}>
          <Card.Content>
            <CameraViewLocal
              isMonitoring={isMonitoring}
              onFrameProcessed={handleFrameProcessed}
              onError={handleError}
            />
          </Card.Content>
        </Card>

        {/* Alert Banner */}
        {isMonitoring && (
          <AlertBanner
            alertLevel={alertLevel}
            activity={getActivityDisplay()}
            details={details}
            icon={getAlertIcon()}
          />
        )}

        {/* Status Cards */}
        {isMonitoring && (
          <View style={styles.statusContainer}>
            <StatusCard
              title="Current Behavior"
              value={getActivityDisplay()}
              color={getAlertColor()}
              icon="eye"
            />
            <StatusCard
              title="Alert Level"
              value={`${getAlertIcon()} ${alertLevel}`}
              color={getAlertColor()}
              icon="alert"
            />
            <StatusCard
              title="Confidence"
              value={`${(confidence * 100).toFixed(1)}%`}
              color="#1f77b4"
              icon="percent"
            />
            <StatusCard
              title="Duration"
              value={formatDuration(sessionStats.duration)}
              color="#1f77b4"
              icon="clock"
            />
            <StatusCard
              title="Frames"
              value={sessionStats.framesProcessed}
              color="#1f77b4"
              icon="image"
            />
            <StatusCard
              title="Alerts"
              value={sessionStats.alertsTriggered}
              color="#f44336"
              icon="bell"
            />
          </View>
        )}

        {/* Additional Info */}
        {isMonitoring && details && (
          <Card style={styles.infoCard}>
            <Card.Content>
              <Title>Detection Details</Title>
              {details.eyes_closed_duration > 0 && (
                <Paragraph>👁️ Eyes Closed: {details.eyes_closed_duration.toFixed(1)}s</Paragraph>
              )}
              {details.looking_down_duration > 0 && (
                <Paragraph>📱 Looking Down: {details.looking_down_duration.toFixed(1)}s</Paragraph>
              )}
              {details.message && (
                <Paragraph>ℹ️ {details.message}</Paragraph>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Behavior Guide */}
        {!isMonitoring && (
          <Card style={styles.guideCard}>
            <Card.Content>
              <Title>🎯 Monitored Behaviors</Title>
              <View style={styles.behaviorItem}>
                <Text style={styles.behaviorTitle}>🟢 SAFE:</Text>
                <Text style={styles.behaviorDesc}>Eyes on road - Normal driving</Text>
              </View>
              <View style={styles.behaviorItem}>
                <Text style={styles.behaviorTitle}>🟡 CAUTION:</Text>
                <Text style={styles.behaviorDesc}>Looking left/right - Mirror check</Text>
              </View>
              <View style={styles.behaviorItem}>
                <Text style={styles.behaviorTitle}>🟠 WARNING:</Text>
                <Text style={styles.behaviorDesc}>Eyes closing or looking down (2-5s)</Text>
              </View>
              <View style={styles.behaviorItem}>
                <Text style={styles.behaviorTitle}>🔴 CRITICAL:</Text>
                <Text style={styles.behaviorDesc}>Eyes closed or looking down &gt; 5s - ALARM!</Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Local Processing Info */}
        {!isMonitoring && (
          <Card style={styles.infoCard}>
            <Card.Content>
              <Title>✨ Features</Title>
              <Paragraph>✅ 100% Local Processing</Paragraph>
              <Paragraph>✅ Works Offline</Paragraph>
              <Paragraph>✅ No Data Sent to Server</Paragraph>
              <Paragraph>✅ Fast & Private</Paragraph>
              <Paragraph>✅ Saves Sessions to Phone</Paragraph>
              <Paragraph>✅ No Internet Required</Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Control Buttons */}
      <View style={styles.controls}>
        {!isMonitoring ? (
          <Button
            mode="contained"
            onPress={startMonitoring}
            style={styles.startButton}
            icon="play"
          >
            Start Monitoring
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={stopMonitoring}
            style={styles.stopButton}
            icon="stop"
            buttonColor="#f44336"
          >
            Stop Monitoring
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 8,
    gap: 8,
  },
  statusBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  cameraCard: {
    margin: 16,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
  },
  guideCard: {
    margin: 16,
  },
  behaviorItem: {
    marginTop: 12,
  },
  behaviorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  behaviorDesc: {
    fontSize: 14,
    color: '#666',
  },
  controls: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  startButton: {
    paddingVertical: 8,
  },
  stopButton: {
    paddingVertical: 8,
  },
});

