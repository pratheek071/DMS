# 📱 Build APK for WiFi Distribution

## This APK will work on any WiFi network - users just need to enter the backend URL

---

## 🎯 Option 1: Users Configure URL (Recommended)

**This is best for WiFi-only apps!**

### Build APK (current setup is already configured this way):

```bash
cd DriverMonitorApp
npm install -g eas-cli
npx eas login
npx eas build:configure
npx eas build -p android --profile preview
```

### How users will use it:

1. **Install APK** on their phone
2. **Connect to same WiFi** as the backend laptop
3. **Find backend laptop IP:**
   - On backend laptop: `ipconfig | findstr IPv4`
   - Copy the IP (e.g., `192.168.1.100`)
4. **Open app** → **Settings**
5. **Enter URL:** `http://192.168.1.100:8000`
6. **Test Connection** → ✅
7. **Start Monitoring!**

---

## 🎯 Option 2: Hardcoded IP (For Fixed Network)

**Use this if you always use the SAME WiFi and SAME laptop**

### Update default URL:

Edit `DriverMonitorApp/src/context/AppContext.js` line 6:

```javascript
const [serverUrl, setServerUrl] = useState('http://192.168.1.100:8000');
```

(Replace `192.168.1.100` with YOUR laptop's IP)

### Build APK:

```bash
cd DriverMonitorApp
npx eas build -p android --profile preview
```

### How users will use it:

1. **Install APK**
2. **Connect to same WiFi** as backend
3. **Open app**
4. **Start Monitoring** (no configuration needed!)

---

## 📋 Requirements for Users

### Backend Laptop:
- ✅ Connected to WiFi
- ✅ Running backend: `python server.py`
- ✅ Firewall allows port 8000

### User Phone:
- ✅ On SAME WiFi network
- ✅ Can reach laptop's IP
- ✅ APK installed

---

## 🔧 Troubleshooting

### "Connection refused"

**Fix:** Allow port 8000 in Windows Firewall:

```powershell
netsh advfirewall firewall add rule name="Driver Monitor Backend" dir=in action=allow protocol=TCP localport=8000
```

### "Network request failed"

**Check:**
1. Both devices on same WiFi?
2. Backend running?
3. Correct IP address?
4. Test in browser: `http://192.168.1.100:8000/health`

---

## ⚡ Quick Start Script

Created `START_WIFI_MODE.bat` for easy startup!

---

**Ready to build? Run the commands above!** 🚀


