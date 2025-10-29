"""
Alert Manager - Tracks driver response to alarms
Triggers WhatsApp alert if driver doesn't respond within 10 seconds
"""
import time
from typing import Dict, Optional
from datetime import datetime

class AlertManager:
    """Manages alert states and triggers WhatsApp notifications"""
    
    def __init__(self, whatsapp_service=None):
        self.whatsapp_service = whatsapp_service
        self.alarm_triggered = False
        self.alarm_start_time = 0
        self.response_timeout = 10  # seconds
        self.whatsapp_sent = False
        self.current_alert_details = {}
        self.last_activity = "SAFE"
        self.alert_history = []
    
    def set_whatsapp_service(self, whatsapp_service):
        """Set WhatsApp service instance"""
        self.whatsapp_service = whatsapp_service
    
    def on_alarm_triggered(self, details: Dict):
        """
        Called when alarm is triggered on mobile app
        Starts the 10-second countdown
        
        Args:
            details: Alert details (activity, confidence, duration, etc.)
        """
        if not self.alarm_triggered:
            self.alarm_triggered = True
            self.alarm_start_time = time.time()
            self.whatsapp_sent = False
            self.current_alert_details = {
                **details,
                'alarm_triggered_at': datetime.now().strftime('%H:%M:%S'),
                'timestamp': datetime.now().isoformat()
            }
            print(f"⏰ Alarm triggered: {details.get('activity', 'Unknown')} - Starting 10s countdown")
    
    def on_driver_response(self):
        """
        Called when driver responds to alarm
        (eyes open, looking forward, any positive action)
        Resets the alert state
        """
        if self.alarm_triggered:
            elapsed = time.time() - self.alarm_start_time
            print(f"✅ Driver responded after {elapsed:.1f}s - Alert cancelled")
            self.reset_alert()
    
    def check_timeout(self) -> Optional[Dict]:
        """
        Check if driver hasn't responded within timeout period
        Triggers WhatsApp if needed
        
        Returns:
            Dict with WhatsApp send result if sent, None otherwise
        """
        if not self.alarm_triggered or self.whatsapp_sent:
            return None
        
        elapsed = time.time() - self.alarm_start_time
        
        # Check if timeout exceeded
        if elapsed >= self.response_timeout:
            print(f"⚠️ Driver not responding for {elapsed:.1f}s - Sending WhatsApp alert!")
            
            # Prepare alert details
            alert_info = {
                **self.current_alert_details,
                'duration': elapsed,
                'timeout_reached': True
            }
            
            # Send WhatsApp alert
            if self.whatsapp_service and self.whatsapp_service.is_configured():
                result = self.whatsapp_service.send_driver_alert(alert_info)
                self.whatsapp_sent = True
                
                # Add to history
                self.alert_history.append({
                    'timestamp': datetime.now().isoformat(),
                    'details': alert_info,
                    'whatsapp_result': result,
                    'elapsed_time': elapsed
                })
                
                return result
            else:
                print("⚠️ WhatsApp service not configured - Alert not sent")
                return {
                    "success": False,
                    "error": "WhatsApp service not configured"
                }
        
        return None
    
    def update_activity(self, activity: str, details: Dict):
        """
        Update current driver activity
        Automatically resets alert if driver returns to safe state
        
        Args:
            activity: Current activity (e.g., "SAFE", "EYES_CLOSED", etc.)
            details: Activity details
        """
        self.last_activity = activity
        
        # If driver returned to safe state, consider it a response
        if activity == "SAFE" or activity == "ACTIVE":
            if self.alarm_triggered:
                self.on_driver_response()
    
    def reset_alert(self):
        """Reset alert state"""
        self.alarm_triggered = False
        self.alarm_start_time = 0
        self.whatsapp_sent = False
        self.current_alert_details = {}
    
    def get_status(self) -> Dict:
        """Get current alert manager status"""
        elapsed = 0
        if self.alarm_triggered:
            elapsed = time.time() - self.alarm_start_time
        
        return {
            "alarm_active": self.alarm_triggered,
            "elapsed_time": round(elapsed, 1),
            "timeout": self.response_timeout,
            "whatsapp_sent": self.whatsapp_sent,
            "current_activity": self.last_activity,
            "time_until_whatsapp": max(0, self.response_timeout - elapsed) if self.alarm_triggered else 0,
            "total_alerts_sent": len(self.alert_history)
        }
    
    def get_history(self, limit: int = 10) -> list:
        """Get alert history"""
        return self.alert_history[-limit:]
    
    def force_send_alert(self) -> Dict:
        """Force send WhatsApp alert (for testing)"""
        test_details = {
            'activity': 'TEST',
            'duration': 0,
            'timestamp': datetime.now().isoformat(),
            'alarm_triggered_at': datetime.now().strftime('%H:%M:%S'),
            'confidence': 1.0
        }
        
        if self.whatsapp_service and self.whatsapp_service.is_configured():
            return self.whatsapp_service.send_test_message()
        else:
            return {
                "success": False,
                "error": "WhatsApp service not configured"
            }

