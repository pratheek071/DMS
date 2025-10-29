import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class AudioServiceClass {
  constructor() {
    this.sound = null;
    this.isPlaying = false;
    this.lastAlertTime = 0;
    this.alertCooldown = 2000; // 2 seconds cooldown between alerts
    this.initialized = false;
  }

  /**
   * Initialize audio system
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      
      this.initialized = true;
      console.log('✅ Audio system initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      // Non-critical error, continue without audio
      this.initialized = false;
    }
  }

  /**
   * Play critical alert (3 beeps)
   */
  async playCriticalAlert() {
    if (!this.initialized) {
      await this.initialize();
    }

    const now = Date.now();
    if (this.isPlaying || (now - this.lastAlertTime < this.alertCooldown)) {
      return; // Skip if already playing or in cooldown
    }

    this.isPlaying = true;
    this.lastAlertTime = now;

    try {
      console.log('🚨 Playing CRITICAL alert');
      // Play beep 3 times for critical alert
      for (let i = 0; i < 3; i++) {
        await this.playBeep();
        await this.sleep(200);
      }
    } catch (error) {
      console.error('Failed to play critical alert:', error);
    } finally {
      this.isPlaying = false;
    }
  }

  /**
   * Play warning alert (1 beep)
   */
  async playWarningAlert() {
    if (!this.initialized) {
      await this.initialize();
    }

    const now = Date.now();
    if (this.isPlaying || (now - this.lastAlertTime < this.alertCooldown)) {
      return;
    }

    this.isPlaying = true;
    this.lastAlertTime = now;

    try {
      console.log('⚠️ Playing WARNING alert');
      await this.playBeep();
    } catch (error) {
      console.error('Failed to play warning alert:', error);
    } finally {
      this.isPlaying = false;
    }
  }

  /**
   * Play a simple beep sound
   */
  async playBeep() {
    try {
      // Clean up previous sound if exists
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Use a simple beep from a reliable source
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/button/beep-01a.mp3' },
        { shouldPlay: false, volume: 1.0 },
        null,
        false
      );
      
      this.sound = sound;
      await sound.playAsync();
      
      // Auto cleanup after 1 second
      setTimeout(async () => {
        try {
          if (this.sound) {
            await this.sound.unloadAsync();
            this.sound = null;
          }
        } catch (e) {
          console.log('Cleanup error (non-critical):', e.message);
        }
      }, 1000);
    } catch (error) {
      console.log('Audio playback skipped:', error.message);
      // Non-critical - app continues without sound
    }
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup audio resources
   */
  async cleanup() {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
      this.initialized = false;
      console.log('🧹 Audio cleaned up');
    } catch (error) {
      console.error('Failed to cleanup audio:', error);
    }
  }
}

export const AudioService = new AudioServiceClass();



