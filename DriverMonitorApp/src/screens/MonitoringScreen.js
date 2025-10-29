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
  Chip,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { useCameraPermissions } from 'expo-camera';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import CameraView from '../components/CameraView';
import StatusCard from '../components/StatusCard';
import AlertBanner from '../components/AlertBanner';
import { useAppContext } from '../context/AppContext';
import { ApiService } from '../services/ApiService';
import { AudioService } from '../services/AudioService';

const { width, height } = Dimensions.get('window');

export default function MonitoringScreen({ onNavigate }) {
  const {
    serverUrl,
    isMonitoring,
    setIsMonitoring,
    audioEnabled,
    whatsappEnabled,
    sessionStats,
    updateStats,
    resetSession,
  } = useAppContext();

  const [permission, requestPermission] = useCameraPermissions();
  const [isConnected, setIsConnected] = useState(false);
  const [currentActivity, setCurrentActivity] = useState('no_driver_detected');
  const [alertLevel, setAlertLevel] = useState('SAFE');
  const [confidence, setConfidence] = useState(0);
  const [details, setDetails] = useState({});
  const [annotatedFrame, setAnnotatedFrame] = useState(null);
  const [whatsappSent, setWhatsappSent] = useState(false);

  const startTimeRef = useRef(null);
  const statsIntervalRef = useRef(null);
  const alarmActiveRef = useRef(false);
  const timeoutCheckIntervalRef = useRef(null);

  // Camera permission is now handled by the hook
  const hasPermission = permission?.granted;

  useEffect(() => {
    // Check server connection
    checkServerConnection();
  }, [serverUrl]);

  // Keep screen awake when monitoring (SDK 54 way)
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

  const checkServerConnection = async () => {
    try {
      const response = await ApiService.healthCheck(serverUrl);
      setIsConnected(response.status === 'healthy');
    } catch (error) {
      setIsConnected(false);
    }
  };

  const startMonitoring = () => {
    if (!isConnected) {
      Alert.alert(
        'Server Not Connected',
        'Please check your server URL in settings and ensure the backend is running.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsMonitoring(true);
    resetSession();
    startTimeRef.current = Date.now();

    // Update duration every second
    statsIntervalRef.current = setInterval(() => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      updateStats('duration', duration);
    }, 1000);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }
    if (timeoutCheckIntervalRef.current) {
      clearInterval(timeoutCheckIntervalRef.current);
      timeoutCheckIntervalRef.current = null;
    }
    alarmActiveRef.current = false;
    setWhatsappSent(false);

    Alert.alert(
      'Session Completed',
      `Duration: ${formatDuration(sessionStats.duration)}\nFrames: ${sessionStats.framesProcessed}\nAlerts: ${sessionStats.alertsTriggered}`,
      [{ text: 'OK' }]
    );
  };

  const handleFrameProcessed = async (result) => {
    setCurrentActivity(result.activity);
    setAlertLevel(result.alert_level);
    setConfidence(result.confidence);
    setDetails(result.details);
    setAnnotatedFrame(result.annotated_frame);

    // Update stats
    updateStats('framesProcessed', sessionStats.framesProcessed + 1);

    // Check if driver returned to safe state (cancel alert)
    if (alarmActiveRef.current && (result.alert_level === 'SAFE' || result.activity === 'ACTIVE')) {
      console.log('Driver responded - cancelling WhatsApp alert');
      alarmActiveRef.current = false;
      setWhatsappSent(false);
      
      // Notify backend that driver responded
      if (whatsappEnabled) {
        try {
          await ApiService.notifyDriverResponded(serverUrl);
        } catch (error) {
          console.error('Failed to notify driver response:', error);
        }
      }
      
      // Stop timeout checking
      if (timeoutCheckIntervalRef.current) {
        clearInterval(timeoutCheckIntervalRef.current);
        timeoutCheckIntervalRef.current = null;
      }
    }

    // Trigger audio alert if needed
    if (audioEnabled && result.trigger_alarm) {
      if (result.alert_level === 'CRITICAL') {
        AudioService.playCriticalAlert();
        updateStats('alertsTriggered', sessionStats.alertsTriggered + 1);
        
        // Start WhatsApp alert monitoring
        if (whatsappEnabled && !alarmActiveRef.current) {
          alarmActiveRef.current = true;
          setWhatsappSent(false);
          
          // Notify backend that alarm was triggered
          try {
            await ApiService.notifyAlarmTriggered(serverUrl, {
              activity: result.activity,
              confidence: result.confidence,
              duration: result.details.eyes_closed_duration || result.details.looking_down_duration || 0,
              alert_level: result.alert_level
            });
            
            // Start checking for timeout every 2 seconds
            if (timeoutCheckIntervalRef.current) {
              clearInterval(timeoutCheckIntervalRef.current);
            }
            
            timeoutCheckIntervalRef.current = setInterval(async () => {
              try {
                const timeoutResult = await ApiService.checkAlertTimeout(serverUrl);
                if (timeoutResult.whatsapp_sent) {
                  console.log('WhatsApp alert sent!', timeoutResult);
                  setWhatsappSent(true);
                  
                  // Stop checking once sent
                  if (timeoutCheckIntervalRef.current) {
                    clearInterval(timeoutCheckIntervalRef.current);
                    timeoutCheckIntervalRef.current = null;
                  }
                }
              } catch (error) {
                console.error('Failed to check timeout:', error);
              }
            }, 2000); // Check every 2 seconds
            
          } catch (error) {
            console.error('Failed to notify alarm trigger:', error);
          }
        }
      } else if (result.alert_level === 'WARNING') {
        AudioService.playWarningAlert();
      }
    }
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

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No access to camera</Text>
        <Button mode="contained" onPress={requestPermission}>
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title style={styles.title}>🚗 Driver Monitor</Title>
        <IconButton
          icon="cog"
          size={24}
          onPress={() => onNavigate('settings')}
        />
      </View>

      {/* Connection Status */}
      <View style={styles.connectionBar}>
        <View style={styles.connectionIndicator}>
          <View
            style={[
              styles.connectionDot,
              { backgroundColor: isConnected ? '#4caf50' : '#f44336' }
            ]}
          />
          <Text style={styles.connectionText}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
        <Text style={styles.urlText}>{serverUrl}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Camera Feed */}
        <Card style={styles.cameraCard}>
          <Card.Content>
            <CameraView
              isMonitoring={isMonitoring}
              serverUrl={serverUrl}
              onFrameProcessed={handleFrameProcessed}
              annotatedFrame={annotatedFrame}
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
              {details.alarm_reason && (
                <Paragraph>ℹ️ {details.alarm_reason}</Paragraph>
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
      </ScrollView>

      {/* Control Buttons */}
      <View style={styles.controls}>
        {!isMonitoring ? (
          <Button
            mode="contained"
            onPress={startMonitoring}
            style={styles.startButton}
            icon="play"
            disabled={!isConnected}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  connectionBar: {
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  connectionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  urlText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    marginBottom: 16,
    textAlign: 'center',
  },
});


