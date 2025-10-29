import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Title,
  Card,
  TextInput,
  Switch,
  Button,
  Divider,
  Paragraph,
  Chip,
} from 'react-native-paper';
import { useAppContext } from '../context/AppContext';
import { ApiService } from '../services/ApiService';

export default function SettingsScreen({ onNavigate }) {
  const {
    serverUrl,
    setServerUrl,
    audioEnabled,
    setAudioEnabled,
    confidenceThreshold,
    setConfidenceThreshold,
    whatsappEnabled,
    setWhatsappEnabled,
    ownerPhone,
    setOwnerPhone,
    callmebotApiKey,
    setCallmebotApiKey,
  } = useAppContext();

  const [tempUrl, setTempUrl] = React.useState(serverUrl);
  const [tempOwnerPhone, setTempOwnerPhone] = React.useState(ownerPhone);
  const [tempApiKey, setTempApiKey] = React.useState(callmebotApiKey);
  const [serverStatus, setServerStatus] = React.useState(null);
  const [whatsappStatus, setWhatsappStatus] = React.useState(null);
  const [testing, setTesting] = React.useState(false);
  const [testingWhatsapp, setTestingWhatsapp] = React.useState(false);

  const testConnection = async () => {
    setTesting(true);
    try {
      const response = await ApiService.healthCheck(tempUrl);
      setServerStatus({
        success: true,
        message: 'Connected successfully!',
        data: response,
      });
      setServerUrl(tempUrl);
      Alert.alert('Success', 'Server connected successfully!');
    } catch (error) {
      setServerStatus({
        success: false,
        message: 'Connection failed',
        error: error.message,
      });
      Alert.alert('Error', `Failed to connect: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const resetToDefault = () => {
    setTempUrl('http://192.168.1.100:8000');
    setAudioEnabled(true);
    setConfidenceThreshold(0.3);
  };

  const getLocalIpInstructions = () => {
    Alert.alert(
      'Finding Your Local IP',
      'On your computer running the backend:\n\n' +
      'Windows:\n' +
      '1. Open Command Prompt\n' +
      '2. Type: ipconfig\n' +
      '3. Look for "IPv4 Address"\n\n' +
      'Mac/Linux:\n' +
      '1. Open Terminal\n' +
      '2. Type: ifconfig or ip addr\n' +
      '3. Look for inet address\n\n' +
      'Example: 192.168.1.100\n' +
      'Then use: http://192.168.1.100:8000',
      [{ text: 'OK' }]
    );
  };

  const saveWhatsAppSettings = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/whatsapp/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_phone: tempOwnerPhone,
          api_key: tempApiKey,
          enabled: whatsappEnabled
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setOwnerPhone(tempOwnerPhone);
        setCallmebotApiKey(tempApiKey);
        setWhatsappStatus({ success: true, message: 'Settings saved!' });
        Alert.alert('Success', 'WhatsApp settings saved successfully!');
      } else {
        setWhatsappStatus({ success: false, message: result.error });
        Alert.alert('Error', result.error || 'Failed to save settings');
      }
    } catch (error) {
      setWhatsappStatus({ success: false, message: error.message });
      Alert.alert('Error', `Failed to save: ${error.message}`);
    }
  };

  const testWhatsApp = async () => {
    if (!tempOwnerPhone || !tempApiKey) {
      Alert.alert('Error', 'Please enter owner phone number and API key first');
      return;
    }

    setTestingWhatsapp(true);
    try {
      // First save settings
      await saveWhatsAppSettings();
      
      // Then send test message
      const response = await fetch(`${serverUrl}/api/whatsapp/test`, {
        method: 'POST',
      });

      const result = await response.json();
      
      if (result.success) {
        Alert.alert(
          'Test Message Sent!',
          'Check your WhatsApp for the test message. If you received it, WhatsApp alerts are working correctly!'
        );
      } else {
        Alert.alert('Test Failed', result.error || 'Failed to send test message');
      }
    } catch (error) {
      Alert.alert('Error', `Test failed: ${error.message}`);
    } finally {
      setTestingWhatsapp(false);
    }
  };

  const showCallMeBotSetup = () => {
    Alert.alert(
      '📱 CallMeBot Setup Instructions',
      '1. Add +34 644 24 39 05 to WhatsApp contacts\n\n' +
      '2. Send this message to that number:\n' +
      '   "I allow callmebot to send me messages"\n\n' +
      '3. You will receive your API key instantly\n\n' +
      '4. Enter your phone number (with country code) and API key below\n\n' +
      'Example phone: +919876543210\n' +
      'Example API key: 123456',
      [{ text: 'Got it!' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          icon="arrow-left"
          onPress={() => onNavigate('monitoring')}
        >
          Back
        </Button>
        <Title style={styles.title}>Settings</Title>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Server Configuration */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>🌐 Server Configuration</Title>
            <Paragraph style={styles.paragraph}>
              Enter your computer's local IP address where the backend is running.
            </Paragraph>
            
            <TextInput
              label="Server URL"
              value={tempUrl}
              onChangeText={setTempUrl}
              mode="outlined"
              style={styles.input}
              placeholder="http://192.168.1.100:8000"
            />

            <Button
              mode="outlined"
              onPress={getLocalIpInstructions}
              style={styles.helpButton}
              icon="help-circle"
            >
              How to find my IP?
            </Button>

            <Button
              mode="contained"
              onPress={testConnection}
              loading={testing}
              disabled={testing}
              style={styles.testButton}
              icon="connection"
            >
              Test Connection
            </Button>

            {serverStatus && (
              <View style={styles.statusContainer}>
                <Chip
                  icon={serverStatus.success ? 'check-circle' : 'alert-circle'}
                  style={[
                    styles.statusChip,
                    { backgroundColor: serverStatus.success ? '#e8f5e9' : '#ffebee' }
                  ]}
                >
                  {serverStatus.message}
                </Chip>
                {serverStatus.success && serverStatus.data && (
                  <View style={styles.serverInfo}>
                    <Paragraph>✅ Model Loaded: {serverStatus.data.detector_loaded ? 'Yes' : 'No'}</Paragraph>
                    <Paragraph>🔊 Audio: {serverStatus.data.audio_backend || 'N/A'}</Paragraph>
                    <Paragraph>📱 Active Sessions: {serverStatus.data.active_sessions}</Paragraph>
                  </View>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Audio Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>🔊 Audio Alerts</Title>
            <Paragraph style={styles.paragraph}>
              Enable audio alerts for critical driver behaviors.
            </Paragraph>
            
            <View style={styles.switchRow}>
              <Paragraph>Audio Alerts</Paragraph>
              <Switch
                value={audioEnabled}
                onValueChange={setAudioEnabled}
              />
            </View>

            {audioEnabled && (
              <View style={styles.alertInfo}>
                <Paragraph>🚨 Critical Alert: 3 beeps (Eyes closed &gt; 5s, Looking down &gt; 5s)</Paragraph>
                <Paragraph>⚠️ Warning Alert: 1 beep (Eyes closing 2-5s)</Paragraph>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* WhatsApp Alert Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>💚 WhatsApp Alerts</Title>
            <Paragraph style={styles.paragraph}>
              Get WhatsApp alerts if driver doesn't respond to alarm within 10 seconds.
            </Paragraph>
            
            <View style={styles.switchRow}>
              <Paragraph>Enable WhatsApp Alerts</Paragraph>
              <Switch
                value={whatsappEnabled}
                onValueChange={setWhatsappEnabled}
              />
            </View>

            {whatsappEnabled && (
              <>
                <Button
                  mode="outlined"
                  onPress={showCallMeBotSetup}
                  style={styles.setupButton}
                  icon="help-circle"
                >
                  How to setup CallMeBot?
                </Button>

                <TextInput
                  label="Owner Phone Number (with country code)"
                  value={tempOwnerPhone}
                  onChangeText={setTempOwnerPhone}
                  mode="outlined"
                  style={styles.input}
                  placeholder="+919876543210"
                  keyboardType="phone-pad"
                />

                <TextInput
                  label="CallMeBot API Key"
                  value={tempApiKey}
                  onChangeText={setTempApiKey}
                  mode="outlined"
                  style={styles.input}
                  placeholder="123456"
                  keyboardType="numeric"
                />

                <Button
                  mode="contained"
                  onPress={saveWhatsAppSettings}
                  style={styles.saveButton}
                  icon="content-save"
                >
                  Save WhatsApp Settings
                </Button>

                <Button
                  mode="outlined"
                  onPress={testWhatsApp}
                  loading={testingWhatsapp}
                  disabled={testingWhatsapp}
                  style={styles.testButton}
                  icon="message-text"
                >
                  Send Test Message
                </Button>

                {whatsappStatus && (
                  <View style={styles.statusContainer}>
                    <Chip
                      icon={whatsappStatus.success ? 'check-circle' : 'alert-circle'}
                      style={[
                        styles.statusChip,
                        { backgroundColor: whatsappStatus.success ? '#e8f5e9' : '#ffebee' }
                      ]}
                    >
                      {whatsappStatus.message}
                    </Chip>
                  </View>
                )}

                <View style={styles.whatsappInfo}>
                  <Paragraph style={styles.subParagraph}>
                    ⏱️ Alert sent if driver doesn't respond within 10 seconds
                  </Paragraph>
                  <Paragraph style={styles.subParagraph}>
                    ⚠️ Rate limit: 1 message per 2 minutes (CallMeBot free tier)
                  </Paragraph>
                  <Paragraph style={styles.subParagraph}>
                    💚 100% FREE forever!
                  </Paragraph>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Detection Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>🎯 Detection Settings</Title>
            <Paragraph style={styles.paragraph}>
              Confidence threshold: {(confidenceThreshold * 100).toFixed(0)}%
            </Paragraph>
            <Paragraph style={styles.subParagraph}>
              Lower = More sensitive (recommended: 30%)
            </Paragraph>
            
            <View style={styles.thresholdButtons}>
              <Button
                mode={confidenceThreshold === 0.2 ? 'contained' : 'outlined'}
                onPress={() => setConfidenceThreshold(0.2)}
                style={styles.thresholdButton}
              >
                20% (High)
              </Button>
              <Button
                mode={confidenceThreshold === 0.3 ? 'contained' : 'outlined'}
                onPress={() => setConfidenceThreshold(0.3)}
                style={styles.thresholdButton}
              >
                30% (Default)
              </Button>
              <Button
                mode={confidenceThreshold === 0.5 ? 'contained' : 'outlined'}
                onPress={() => setConfidenceThreshold(0.5)}
                style={styles.thresholdButton}
              >
                50% (Low)
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>ℹ️ About</Title>
            <Paragraph>Driver Monitoring System v1.0</Paragraph>
            <Paragraph style={styles.paragraph}>
              Monitors driver behavior using YOLOv11 pose estimation with real-time alerts.
            </Paragraph>
            <Divider style={styles.divider} />
            <Paragraph style={styles.subParagraph}>
              ⚠️ Important: Ensure both devices are on the same WiFi network for connectivity.
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Reset Button */}
        <Button
          mode="outlined"
          onPress={resetToDefault}
          style={styles.resetButton}
          icon="restore"
        >
          Reset to Defaults
        </Button>
      </ScrollView>
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
    paddingHorizontal: 8,
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
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
  paragraph: {
    marginTop: 8,
    marginBottom: 16,
    color: '#666',
  },
  subParagraph: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  input: {
    marginBottom: 12,
  },
  helpButton: {
    marginBottom: 12,
  },
  testButton: {
    marginTop: 4,
  },
  statusContainer: {
    marginTop: 16,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  serverInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  alertInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
  },
  thresholdButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  thresholdButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  divider: {
    marginVertical: 12,
  },
  resetButton: {
    margin: 16,
    marginBottom: 32,
  },
  setupButton: {
    marginTop: 8,
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  whatsappInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
});






