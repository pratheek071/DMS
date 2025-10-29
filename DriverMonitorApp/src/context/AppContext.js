import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [serverUrl, setServerUrl] = useState('http://192.168.1.100:8000');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.3);
  
  // WhatsApp Alert Settings
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [ownerPhone, setOwnerPhone] = useState('');
  const [callmebotApiKey, setCallmebotApiKey] = useState('');
  
  const [sessionStats, setSessionStats] = useState({
    framesProcessed: 0,
    alertsTriggered: 0,
    duration: 0,
  });

  const resetSession = () => {
    setSessionStats({
      framesProcessed: 0,
      alertsTriggered: 0,
      duration: 0,
    });
  };

  const updateStats = (field, value) => {
    setSessionStats(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        serverUrl,
        setServerUrl,
        isMonitoring,
        setIsMonitoring,
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
        sessionStats,
        updateStats,
        resetSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};




