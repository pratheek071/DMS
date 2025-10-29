# 💚 WhatsApp Alert Setup Guide

## 🎯 Overview

This guide will help you set up **FREE WhatsApp alerts** for the Driver Monitoring System. When the driver doesn't respond to an alarm within 10 seconds, the system automatically sends a WhatsApp message to the owner/fleet manager.

---

## 📋 Prerequisites

- ✅ Backend server running
- ✅ Mobile app installed and connected
- ✅ Owner has WhatsApp installed
- ✅ Internet connection (both backend and mobile)

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get CallMeBot API Key

**Owner needs to do this ONCE:**

1. **Add CallMeBot to WhatsApp contacts:**
   - Open WhatsApp
   - Add new contact: `+34 644 24 39 05`
   - Name it "CallMeBot" (or anything you like)

2. **Send activation message:**
   - Open chat with CallMeBot
   - Send exactly this message:
   ```
   I allow callmebot to send me messages
   ```

3. **Get your API key:**
   - CallMeBot will reply instantly with your API key
   - Example reply:
   ```
   API Activated!
   Your API key is: 123456
   
   You can use this API key to send messages to your WhatsApp number.
   ```
   - **Save this API key** - you'll need it in the app!

4. **Done!** ✅ Your WhatsApp is ready to receive alerts!

---

### Step 2: Configure in Mobile App

1. **Open the Driver Monitoring App**

2. **Go to Settings tab** (gear icon)

3. **Scroll to "💚 WhatsApp Alerts" section**

4. **Enable WhatsApp Alerts** (toggle the switch)

5. **Tap "How to setup CallMeBot?"** if you need instructions again

6. **Enter Owner Phone Number:**
   - Format: `+[country code][phone number]`
   - India example: `+919876543210`
   - USA example: `+11234567890`
   - ⚠️ **Must include the + and country code!**

7. **Enter CallMeBot API Key:**
   - Enter the API key you received (e.g., `123456`)

8. **Tap "Save WhatsApp Settings"**
   - You should see "Settings saved!" message

9. **Tap "Send Test Message"**
   - Check your WhatsApp for the test message
   - If you receive it: **Setup complete!** 🎉
   - If not: Double-check phone number and API key

---

### Step 3: Install Backend Dependencies

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install new dependency:**
   ```bash
   pip install requests
   ```
   
   Or install all dependencies:
   ```bash
   pip install -r requirements.txt
   ```

---

### Step 4: Start Everything

#### Windows:

**Option 1: Start everything at once (EASIEST)**
```bash
.\START_EVERYTHING.bat
```
This starts both backend and mobile app automatically!

**Option 2: Manual start**

Terminal 1 - Backend:
```bash
cd backend
python server.py
```

Terminal 2 - Mobile App:
```bash
cd DriverMonitorApp
npx expo start
```

#### Linux/Mac:

Terminal 1 - Backend:
```bash
cd backend
python3 server.py
```

Terminal 2 - Mobile App:
```bash
cd DriverMonitorApp
npx expo start
```

---

## 🎨 How It Works

### Normal Operation:

```
1. Driver closes eyes > 5 seconds
   ↓
2. 🚨 ALARM sounds on phone (3 beeps)
   ↓
3. Driver wakes up and opens eyes
   ↓
4. ✅ Alert cancelled - No WhatsApp sent
```

### Critical Situation:

```
1. Driver closes eyes > 5 seconds
   ↓
2. 🚨 ALARM sounds on phone (3 beeps)
   ↓
3. Backend starts 10-second countdown
   ↓
4. Driver STILL not responding after 10 seconds?
   ↓
5. 💚 WhatsApp message sent to owner:
   
   "🚨 CRITICAL ALERT - DRIVER NOT RESPONDING
   
   ⚠️ Driver Status: Eyes Closed
   ⏱️ Duration: 15.3 seconds
   🕐 Time: 2:30 PM
   🔔 Alarm Status: Not responding for 10+ seconds
   
   ⚡ IMMEDIATE ACTION REQUIRED!
   
   Driver is not responding to alarm. Please check immediately!"
   ↓
6. Owner receives alert and can take action! 📞
```

---

## 📱 What Owner Receives

### Test Message:
```
✅ WhatsApp Alert Test

This is a test message from Driver Monitoring System.

If you received this, WhatsApp alerts are working correctly!
```

### Real Alert:
```
🚨 CRITICAL ALERT - DRIVER NOT RESPONDING

⚠️ Driver Status: Eyes Closed
⏱️ Duration: 15.3 seconds
🕐 Time: 2:30 PM
🔔 Alarm Status: Not responding for 10+ seconds

⚡ IMMEDIATE ACTION REQUIRED!

Driver is not responding to alarm. Please check immediately!
```

---

## ⚙️ Configuration

### In Mobile App Settings:

| Setting | Description | Example |
|---------|-------------|---------|
| **Enable WhatsApp Alerts** | Master switch | ON/OFF |
| **Owner Phone Number** | With country code | +919876543210 |
| **CallMeBot API Key** | From CallMeBot | 123456 |

### System Behavior:

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Alert Trigger** | Eyes closed > 5s | When alarm sounds |
| **Response Timeout** | 10 seconds | Time before WhatsApp sent |
| **Rate Limit** | 1 per 2 minutes | CallMeBot free tier |
| **Cost** | **FREE** | Forever! |

---

## 🔧 Troubleshooting

### Problem: Not receiving test message

**Solution 1: Check phone number format**
- ✅ Correct: `+919876543210`
- ❌ Wrong: `9876543210` (missing +91)
- ❌ Wrong: `+91 98765 43210` (has spaces)
- ❌ Wrong: `+91-9876543210` (has dash)

**Solution 2: Check API key**
- Make sure you copied the exact key from CallMeBot
- No spaces before/after the key
- Only numbers (e.g., `123456`)

**Solution 3: Re-activate CallMeBot**
- Send the activation message again:
  ```
  I allow callmebot to send me messages
  ```
- Get new API key
- Update in app

---

### Problem: "Rate limit" error

**Cause:** CallMeBot free tier allows 1 message per 2 minutes

**Solution:** Wait 2 minutes before sending another message

**Why:** This is CallMeBot's fair use policy for free service

---

### Problem: WhatsApp sent during test, but not during real alert

**Check:**
1. Is WhatsApp enabled in settings?
2. Is backend running?
3. Check backend terminal for error messages
4. Make sure mobile app is connected to backend

**Verify backend is working:**
```bash
# In browser or terminal:
http://YOUR_IP:8000/api/whatsapp/status

# Should return:
{
  "configured": true,
  "enabled": true,
  "owner_phone": "+919876543210",
  "can_send": true,
  ...
}
```

---

### Problem: Backend error "WhatsApp service not configured"

**Solution:** 
1. Open mobile app
2. Go to Settings
3. Make sure WhatsApp Alerts is **enabled**
4. Tap "Save WhatsApp Settings" again
5. Try test message

---

## 🎯 Testing the System

### Full Test Procedure:

1. **Setup complete**
   - WhatsApp configured
   - Test message received ✅

2. **Start monitoring**
   - Open app
   - Tap "Start Monitoring"

3. **Simulate driver sleeping**
   - Close your eyes
   - Keep them closed for 15+ seconds
   - You should hear alarm after 5 seconds

4. **Don't respond to alarm**
   - Keep eyes closed
   - Wait for 10 more seconds (15 seconds total)

5. **Check WhatsApp**
   - Owner should receive alert message
   - Message will say "Driver not responding"

6. **Success!** 🎉

---

## 📊 Alert Statistics

You can check alert history:

**In browser:**
```
http://YOUR_IP:8000/api/alert/history
```

**Response:**
```json
{
  "history": [
    {
      "timestamp": "2025-10-29T14:30:15",
      "details": {
        "activity": "EYES_CLOSED",
        "duration": 15.3,
        "alert_level": "CRITICAL"
      },
      "whatsapp_result": {
        "success": true,
        "message": "WhatsApp alert sent successfully"
      }
    }
  ]
}
```

---

## 💡 Tips for Best Results

1. **Test regularly**
   - Test WhatsApp alerts weekly
   - Make sure CallMeBot is still active

2. **Monitor backend logs**
   - Backend shows when alerts are sent
   - Watch for any errors

3. **Keep phone charged**
   - Low battery can affect alarm volume
   - Use phone charger during monitoring

4. **Good internet connection**
   - Both backend and mobile need internet
   - WiFi is more reliable than mobile data

5. **Update phone number**
   - If owner changes number, update in app
   - Send test message after updating

---

## 🔐 Privacy & Security

- ✅ **Phone number stored only in your backend**
- ✅ **CallMeBot doesn't store messages**
- ✅ **No data sent to third parties**
- ✅ **Works on your local network**
- ✅ **Owner controls all alerts**

---

## 🆓 Cost Breakdown

| Item | Cost |
|------|------|
| CallMeBot Service | **FREE** |
| WhatsApp Messages | **FREE** |
| Backend Server | **FREE** (your computer) |
| Mobile App | **FREE** |
| **TOTAL** | **100% FREE** ✅ |

**Rate Limits:**
- 1 message per 2 minutes (free tier)
- For most use cases, this is more than enough!

---

## 🚀 Upgrade Options

If you need more than 1 message per 2 minutes:

### Option 1: Twilio WhatsApp (Paid)
- Cost: ~₹0.40 per message
- No rate limits
- More reliable
- [Setup guide available]

### Option 2: Firebase Push Notifications (Free)
- Unlimited notifications
- Requires owner to install companion app
- More features (photos, location, etc.)
- [Setup guide available]

---

## 📞 Support

### Backend API Endpoints:

```bash
# Configure WhatsApp
POST http://YOUR_IP:8000/api/whatsapp/configure

# Get status
GET http://YOUR_IP:8000/api/whatsapp/status

# Send test
POST http://YOUR_IP:8000/api/whatsapp/test

# Get alert history
GET http://YOUR_IP:8000/api/alert/history
```

### Common Issues:

| Issue | Check | Fix |
|-------|-------|-----|
| No alerts | Backend running? | Start backend |
| Rate limit | Sent recently? | Wait 2 minutes |
| Wrong number | Format correct? | Use +[country][number] |
| Not configured | Settings saved? | Save again in app |

---

## ✅ Setup Checklist

- [ ] Owner added CallMeBot to WhatsApp (+34 644 24 39 05)
- [ ] Owner sent activation message
- [ ] Owner received API key
- [ ] API key and phone number entered in app
- [ ] WhatsApp alerts enabled in app
- [ ] Settings saved successfully
- [ ] Test message sent and received
- [ ] Backend running with requests library
- [ ] Mobile app connected to backend
- [ ] Full test completed (eyes closed 15+ seconds)
- [ ] Owner received real alert on WhatsApp

**All checked? You're ready to go!** 🎉

---

## 🎊 Congratulations!

Your Driver Monitoring System now has **FREE WhatsApp alerts**!

**What happens now:**
- Driver monitoring continues as normal
- If driver doesn't respond to alarm within 10 seconds
- Owner gets WhatsApp alert automatically
- Owner can take immediate action

**Stay safe on the road!** 🚗💨

