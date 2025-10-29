# 📱 How to Connect Mobile App to Backend

## 🎯 Quick Setup (Step-by-Step)

### **Part 1: Start Backend Server**

#### **Step 1: Open NEW Terminal**
- Press `Windows + X`
- Select "Windows PowerShell" or "Terminal"
- Navigate to FaceMonitor folder:
```powershell
cd C:\Users\PratheekRaj(G10XIND)\Downloads\FaceMonitor
```

#### **Step 2: Start Backend**
```powershell
.\START_BACKEND_NOW.bat
```

**Wait for:**
```
✅ YOLOv11 model loaded successfully!
✅ Server running on: http://0.0.0.0:8000
```

---

### **Part 2: Find Your Computer's IP Address**

#### **Windows (Quick Method):**

**Option A: Use ipconfig**
```powershell
ipconfig
```

Look for:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.XXX
```

**Option B: Settings**
1. Open Settings → Network & Internet
2. Click "Properties" under your WiFi
3. Scroll down to find "IPv4 address"

**Example IPs:**
- `192.168.1.100` (home WiFi)
- `192.168.0.50` (home WiFi alternate)
- `10.0.0.123` (some routers)
- `172.16.41.224` (corporate/university)

---

### **Part 3: Connect Mobile App**

#### **On Your Phone:**

1. **Open the Driver Monitor app** (already running from Expo)

2. **Tap Settings button** (⚙️ icon in top-right)

3. **Enter Backend URL:**
   ```
   http://YOUR_IP:8000
   ```
   
   **Examples:**
   - If your IP is `192.168.1.100`, enter: `http://192.168.1.100:8000`
   - If your IP is `172.16.41.224`, enter: `http://172.16.41.224:8000`

4. **Tap "Test Connection"**
   - ✅ Success: "Server connected successfully!"
   - ❌ Failure: See troubleshooting below

5. **Go back to Monitoring screen**

6. **Tap "Start Monitoring"** 🚀

---

## 🔧 Troubleshooting "Connection Failed"

### **Issue 1: Backend Not Running**
```
Solution: Make sure START_BACKEND_NOW.bat is running
Status: Terminal should show "Server running on: http://0.0.0.0:8000"
```

### **Issue 2: Wrong IP Address**
```
Problem: Phone and laptop on same WiFi but can't connect
Solution: Double-check your laptop's IP address:
  - Open Command Prompt: ipconfig
  - Look for "IPv4 Address"
  - Use that exact IP in the app
```

### **Issue 3: Different Networks**
```
Problem: Phone on 4G/5G or different WiFi
Solution: Use tunnel mode (covered earlier) OR use ngrok:
  1. Stop current backend (Ctrl+C)
  2. Run: python backend/start_server_public.py
  3. Copy the ngrok URL (e.g., https://abc123.ngrok.io)
  4. Use that URL in the app
```

### **Issue 4: Windows Firewall Blocking**
```
Solution: Allow Python through firewall
  1. Search "Windows Defender Firewall"
  2. Click "Allow an app through firewall"
  3. Click "Change settings"
  4. Find "Python" or click "Allow another app"
  5. Browse to Python.exe
  6. Check both Private and Public
  7. Click OK
  8. Restart backend server
```

### **Issue 5: Antivirus Blocking**
```
Solution: Temporarily disable antivirus or add exception
  - Add folder to exceptions: C:\Users\PratheekRaj(G10XIND)\Downloads\FaceMonitor
  - Try again
```

### **Issue 6: Port 8000 Already in Use**
```
Error: "Address already in use"
Solution: Kill existing process:
  1. taskkill /F /IM python.exe
  2. Restart backend
```

---

## ✅ **Correct URL Format**

### **Same WiFi (Local Network):**
```
✅ CORRECT: http://192.168.1.100:8000
✅ CORRECT: http://172.16.41.224:8000
✅ CORRECT: http://10.0.0.50:8000

❌ WRONG: https://192.168.1.100:8000  (don't use https)
❌ WRONG: 192.168.1.100:8000  (missing http://)
❌ WRONG: http://192.168.1.100  (missing port :8000)
❌ WRONG: http://localhost:8000  (won't work from phone)
❌ WRONG: http://127.0.0.1:8000  (won't work from phone)
```

### **Different Networks (Ngrok):**
```
✅ CORRECT: https://abc123.ngrok.io
✅ CORRECT: https://xyz-456.ngrok.io

❌ WRONG: http://abc123.ngrok.io  (ngrok uses https)
```

---

## 📊 **Connection Test Results**

### **Success (✅):**
```json
{
  "status": "healthy",
  "model": "yolo11n-pose.pt",
  "server_time": "2024-10-29T..."
}
```

**You'll see:** 
- Green "Connected" indicator
- Server URL displayed
- "Start Monitoring" button enabled

### **Failure (❌):**
```
Error: Network request failed
or
Error: Connection timeout
```

**Check:**
1. Backend server is running
2. IP address is correct
3. Port 8000 is included
4. Phone and laptop on same WiFi
5. Firewall allows connection

---

## 🚀 **Quick Commands Reference**

### **Start Backend:**
```powershell
cd C:\Users\PratheekRaj(G10XIND)\Downloads\FaceMonitor
.\START_BACKEND_NOW.bat
```

### **Find IP:**
```powershell
ipconfig | findstr IPv4
```

### **Start with Ngrok (Cross-network):**
```powershell
cd backend
python start_server_public.py
```

### **Kill Python Processes:**
```powershell
taskkill /F /IM python.exe
```

---

## 🎯 **Expected Workflow**

```
1. Start Backend on Laptop
   ├─ Run: START_BACKEND_NOW.bat
   ├─ Wait for: "Server running on: http://0.0.0.0:8000"
   └─ Note your IP: 192.168.1.XXX

2. Connect Phone App
   ├─ Open app on phone
   ├─ Go to Settings
   ├─ Enter: http://192.168.1.XXX:8000
   ├─ Tap "Test Connection"
   └─ See: "Connected ✅"

3. Start Monitoring
   ├─ Return to main screen
   ├─ Tap "Start Monitoring"
   ├─ Grant camera permission
   ├─ Camera activates
   ├─ Point at your face
   └─ See real-time detection! 🎉
```

---

## 💡 **Pro Tips**

### **For Development:**
- Keep backend terminal open while using app
- Backend will show all API requests in real-time
- Watch for errors in backend terminal

### **For Testing:**
- Start with laptop and phone on same WiFi (easiest)
- Use strong WiFi signal for best performance
- Backend logs show frame processing time

### **For Demo:**
- Use ngrok for reliable cross-network access
- Keep backend running continuously
- Monitor backend terminal for issues

---

## 🆘 **Still Not Working?**

### **Debug Checklist:**
- [ ] Backend terminal shows "Server running"
- [ ] No errors in backend terminal
- [ ] Correct IP address (not 127.0.0.1)
- [ ] Port 8000 included in URL
- [ ] http:// prefix (not https)
- [ ] Phone and laptop on SAME WiFi
- [ ] Windows Firewall allows Python
- [ ] Antivirus not blocking

### **Test Backend Directly:**
Open browser on your laptop and visit:
```
http://localhost:8000
```

You should see:
```json
{"message": "Driver Monitoring System API", "status": "running"}
```

If this works but phone doesn't connect, it's a network/firewall issue.

---

## 📞 **Common Error Messages**

| Error | Cause | Solution |
|-------|-------|----------|
| Network request failed | Backend not running | Start backend |
| Connection timeout | Wrong IP or firewall | Check IP and firewall |
| ECONNREFUSED | Port wrong or closed | Use :8000 port |
| Cannot read property | Wrong URL format | Use http://IP:8000 |
| 404 Not Found | Wrong endpoint | Use /health or / |

---

## ✅ **Success Indicators**

**Backend Terminal:**
```
✅ YOLOv11 model loaded successfully!
✅ Server running on: http://0.0.0.0:8000
INFO: Uvicorn running on http://0.0.0.0:8000
```

**Mobile App:**
```
✅ Green "Connected" dot
✅ Server URL shown
✅ "Start Monitoring" button enabled
```

**During Monitoring:**
```
Backend Terminal:
- POST /api/process-frame - 200 OK (150ms)
- POST /api/process-frame - 200 OK (145ms)

Mobile App:
- Live camera feed
- Real-time behavior detection
- Stats updating (frames, duration, alerts)
```

---

**Now follow the steps above to connect your app!** 🚀




