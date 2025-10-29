import React from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { Card } from 'react-native-paper';

export default function AlertBanner({ alertLevel, activity, details, icon }) {
  const [pulseAnim] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    if (alertLevel === 'CRITICAL' || alertLevel === 'WARNING') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [alertLevel]);

  const getBackgroundColor = () => {
    switch (alertLevel) {
      case 'SAFE':
        return '#e8f5e9';
      case 'CAUTION':
        return '#fff3e0';
      case 'WARNING':
        return '#ffe0b2';
      case 'CRITICAL':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  };

  const getBorderColor = () => {
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

  const getTextColor = () => {
    switch (alertLevel) {
      case 'SAFE':
        return '#2e7d32';
      case 'CAUTION':
        return '#ef6c00';
      case 'WARNING':
        return '#d84315';
      case 'CRITICAL':
        return '#c62828';
      default:
        return '#424242';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <Card
        style={[
          styles.card,
          {
            backgroundColor: getBackgroundColor(),
            borderLeftWidth: 4,
            borderLeftColor: getBorderColor(),
          },
        ]}
      >
        <Card.Content style={styles.content}>
          <Text style={styles.icon}>{icon}</Text>
          <View style={styles.textContainer}>
            <Text style={[styles.level, { color: getTextColor() }]}>
              {alertLevel}
            </Text>
            <Text style={[styles.activity, { color: getTextColor() }]}>
              {activity}
            </Text>
            {details.eyes_closed_duration > 0 && (
              <Text style={styles.detail}>
                👁️ Eyes Closed: {details.eyes_closed_duration.toFixed(1)}s
              </Text>
            )}
            {details.looking_down_duration > 0 && (
              <Text style={styles.detail}>
                📱 Looking Down: {details.looking_down_duration.toFixed(1)}s
              </Text>
            )}
            {alertLevel === 'CRITICAL' && (
              <Text style={[styles.alarm, { color: getTextColor() }]}>
                🔊 BEEP BEEP BEEP
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  card: {
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    fontSize: 32,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  level: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  activity: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  alarm: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
});






