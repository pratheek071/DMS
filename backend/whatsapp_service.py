"""
WhatsApp Alert Service using CallMeBot API
Sends WhatsApp messages to owner when driver doesn't respond to alarms
"""
import requests
import time
from typing import Optional, Dict
from urllib.parse import quote

class WhatsAppService:
    """Handles WhatsApp notifications via CallMeBot API"""
    
    def __init__(self):
        self.callmebot_url = "https://api.callmebot.com/whatsapp.php"
        self.last_sent_time = 0
        self.cooldown_seconds = 120  # 2-minute cooldown (CallMeBot rate limit)
        self.enabled = False
        self.owner_phone = None
        self.api_key = None
    
    def configure(self, owner_phone: str, api_key: str, enabled: bool = True):
        """
        Configure WhatsApp service
        
        Args:
            owner_phone: Owner's phone number with country code (e.g., +919876543210)
            api_key: CallMeBot API key
            enabled: Whether WhatsApp alerts are enabled
        """
        self.owner_phone = owner_phone
        self.api_key = api_key
        self.enabled = enabled
        print(f"✅ WhatsApp service configured: {owner_phone}")
    
    def is_configured(self) -> bool:
        """Check if service is properly configured"""
        return self.enabled and self.owner_phone and self.api_key
    
    def can_send(self) -> bool:
        """Check if we can send a message (respects cooldown)"""
        if not self.is_configured():
            return False
        
        current_time = time.time()
        time_since_last = current_time - self.last_sent_time
        
        return time_since_last >= self.cooldown_seconds
    
    def send_alert(self, message: str, force: bool = False) -> Dict:
        """
        Send WhatsApp alert to owner
        
        Args:
            message: Message to send
            force: If True, bypass cooldown (use sparingly)
        
        Returns:
            Dict with success status and message
        """
        if not self.is_configured():
            return {
                "success": False,
                "error": "WhatsApp service not configured"
            }
        
        # Check cooldown
        if not force and not self.can_send():
            time_remaining = self.cooldown_seconds - (time.time() - self.last_sent_time)
            return {
                "success": False,
                "error": f"Rate limit: Wait {int(time_remaining)}s before next message"
            }
        
        try:
            # Format message for URL
            encoded_message = quote(message)
            
            # CallMeBot API requires phone without '+' and with no spaces
            clean_phone = self.owner_phone.replace('+', '').replace(' ', '').replace('-', '')
            
            # Build API URL
            url = f"{self.callmebot_url}?phone={clean_phone}&text={encoded_message}&apikey={self.api_key}"
            
            # Send request
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                self.last_sent_time = time.time()
                return {
                    "success": True,
                    "message": "WhatsApp alert sent successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"API returned status {response.status_code}: {response.text}"
                }
        
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": "Request timeout - check internet connection"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to send WhatsApp: {str(e)}"
            }
    
    def send_driver_alert(self, details: Dict) -> Dict:
        """
        Send formatted driver alert message
        
        Args:
            details: Dictionary with alert details (activity, duration, timestamp, etc.)
        
        Returns:
            Dict with success status
        """
        # Format alert message
        message = f"""🚨 *CRITICAL ALERT - DRIVER NOT RESPONDING*

⚠️ Driver Status: {details.get('activity', 'Unknown')}
⏱️ Duration: {details.get('duration', 0):.1f} seconds
🕐 Time: {details.get('timestamp', 'N/A')}
🔔 Alarm Status: Not responding for 10+ seconds

⚡ IMMEDIATE ACTION REQUIRED!

Driver is not responding to alarm. Please check immediately!"""
        
        return self.send_alert(message)
    
    def send_test_message(self) -> Dict:
        """Send a test message to verify configuration"""
        message = "✅ WhatsApp Alert Test\n\nThis is a test message from Driver Monitoring System.\n\nIf you received this, WhatsApp alerts are working correctly!"
        return self.send_alert(message, force=True)  # Bypass cooldown for tests
    
    def get_status(self) -> Dict:
        """Get current service status"""
        cooldown_remaining = 0
        if self.last_sent_time > 0:
            time_since_last = time.time() - self.last_sent_time
            if time_since_last < self.cooldown_seconds:
                cooldown_remaining = self.cooldown_seconds - time_since_last
        
        return {
            "configured": self.is_configured(),
            "enabled": self.enabled,
            "owner_phone": self.owner_phone if self.owner_phone else "Not set",
            "can_send": self.can_send(),
            "cooldown_remaining": int(cooldown_remaining),
            "last_sent": time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(self.last_sent_time)) if self.last_sent_time > 0 else "Never"
        }


# Global instance
whatsapp_service = WhatsAppService()

