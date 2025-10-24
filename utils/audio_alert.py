import threading
import time
import sys

# Try pygame first
try:
    import pygame
    PYGAME_AVAILABLE = True
except ImportError:
    PYGAME_AVAILABLE = False

# Windows native audio (always available on Windows)
if sys.platform == 'win32':
    import winsound
    WINSOUND_AVAILABLE = True
else:
    WINSOUND_AVAILABLE = False

print(f"Audio systems available: pygame={PYGAME_AVAILABLE}, winsound={WINSOUND_AVAILABLE}")

class AudioAlert:
    """
    Handle audio alerts for critical driver behaviors
    """
    
    def __init__(self):
        self.initialized = False
        self.is_playing = False
        self.last_alert_time = 0
        self.alert_cooldown = 3.0  # seconds between repeated alerts
        self.use_winsound = False
        
        # Try pygame first
        if PYGAME_AVAILABLE:
            try:
                pygame.mixer.init(frequency=22050, size=-16, channels=2, buffer=512)
                self.initialized = True
                self.use_winsound = False
                print("✅ Audio system: pygame initialized")
            except Exception as e:
                print(f"pygame init failed: {e}")
                self.initialized = False
        
        # Fallback to Windows native sound
        if not self.initialized and WINSOUND_AVAILABLE:
            self.initialized = True
            self.use_winsound = True
            print("✅ Audio system: Windows native sound (winsound) initialized")
        
        if not self.initialized:
            print("⚠️ No audio system available")
    
    def generate_beep_sound(self, frequency=1000, duration=0.3):
        """Generate a beep sound using pygame"""
        if not self.initialized or not PYGAME_AVAILABLE:
            return None
        
        try:
            sample_rate = 22050
            n_samples = int(round(duration * sample_rate))
            
            # Generate square wave
            import numpy as np
            buf = np.zeros((n_samples, 2), dtype=np.int16)
            max_sample = 32767 // 2  # Reduced volume
            
            for i in range(n_samples):
                # Square wave
                value = max_sample if (i // (sample_rate // frequency)) % 2 == 0 else -max_sample
                buf[i][0] = value  # Left channel
                buf[i][1] = value  # Right channel
            
            sound = pygame.sndarray.make_sound(buf)
            return sound
        except Exception as e:
            print(f"Warning: Could not generate beep: {e}")
            return None
    
    def play_critical_alert(self):
        """Play critical alert sound (3 beeps)"""
        if not self.initialized or self.is_playing:
            return
        
        current_time = time.time()
        if current_time - self.last_alert_time < self.alert_cooldown:
            return  # Too soon since last alert
        
        self.last_alert_time = current_time
        
        def play_beeps():
            self.is_playing = True
            try:
                if self.use_winsound:
                    # Windows native beep - 3 rapid beeps
                    for _ in range(3):
                        winsound.Beep(1200, 200)  # 1200Hz, 200ms
                        time.sleep(0.1)
                else:
                    # pygame beeps
                    beep = self.generate_beep_sound(frequency=1200, duration=0.2)
                    if beep:
                        for _ in range(3):
                            beep.play()
                            time.sleep(0.3)
            except Exception as e:
                print(f"Warning: Could not play alert: {e}")
            finally:
                self.is_playing = False
        
        # Play in background thread to not block UI
        thread = threading.Thread(target=play_beeps, daemon=True)
        thread.start()
    
    def play_warning_alert(self):
        """Play warning alert sound (1 beep)"""
        if not self.initialized or self.is_playing:
            return
        
        current_time = time.time()
        if current_time - self.last_alert_time < self.alert_cooldown:
            return
        
        self.last_alert_time = current_time
        
        def play_beep():
            self.is_playing = True
            try:
                if self.use_winsound:
                    # Windows native beep - 1 longer beep
                    winsound.Beep(800, 400)  # 800Hz, 400ms
                else:
                    # pygame beep
                    beep = self.generate_beep_sound(frequency=800, duration=0.4)
                    if beep:
                        beep.play()
                        time.sleep(0.5)
            except Exception as e:
                print(f"Warning: Could not play alert: {e}")
            finally:
                self.is_playing = False
        
        thread = threading.Thread(target=play_beep, daemon=True)
        thread.start()
    
    def cleanup(self):
        """Cleanup audio resources"""
        if self.initialized and PYGAME_AVAILABLE:
            try:
                pygame.mixer.quit()
            except:
                pass
    
    def is_available(self):
        """Check if audio system is available"""
        return self.initialized
    
    def get_audio_backend(self):
        """Get which audio backend is being used"""
        if not self.initialized:
            return "None"
        return "winsound" if self.use_winsound else "pygame"



