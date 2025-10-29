import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import MonitoringScreen from './src/screens/MonitoringScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { AppProvider } from './src/context/AppContext';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1f77b4',
    accent: '#f44336',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
  },
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('monitoring');

  return (
    <PaperProvider theme={theme}>
      <AppProvider>
        <View style={styles.container}>
          <StatusBar style="auto" />
          {currentScreen === 'monitoring' ? (
            <MonitoringScreen onNavigate={setCurrentScreen} />
          ) : (
            <SettingsScreen onNavigate={setCurrentScreen} />
          )}
        </View>
      </AppProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});






