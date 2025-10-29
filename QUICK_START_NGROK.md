# ⚡ Quick Start with Ngrok

## Get your app running publicly in 5 minutes!

---

## 🎯 STEP-BY-STEP COMMANDS

### 1️⃣ Get Ngrok Token (ONE TIME ONLY)

1. Open: https://dashboard.ngrok.com/signup
2. Sign up (free)
3. Copy your token from: https://dashboard.ngrok.com/get-started/your-authtoken

### 2️⃣ Configure Ngrok (ONE TIME ONLY)

```powershell
npx ngrok config add-authtoken YOUR_TOKEN_HERE
```

**Replace `YOUR_TOKEN_HERE` with your actual token!**

---

### 3️⃣ Start Everything (EVERY TIME)

**Run this command:**

```powershell
cd C:\Users\PratheekRaj(G10XIND)\Downloads\FaceMonitor
.\START_PUBLIC_MODE.bat
```

This opens 2 terminals:
- **Terminal 1:** Ngrok tunnel
- **Terminal 2:** Backend server

---

### 4️⃣ Get Your Public URL

**In the Ngrok terminal, look for:**

```
Forwarding  https://abc-123-xyz.ngrok-free.app -> http://localhost:8000
```

**⭐ COPY THIS URL:** `https://abc-123-xyz.ngrok-free.app`

---

### 5️⃣ Test on Phone

1. **Open your app**
2. **Tap Settings** ⚙️
3. **Enter URL:** `https://abc-123-xyz.ngrok-free.app`
4. **Tap "Test Connection"** → ✅
5. **Go back**
6. **Start Monitoring** 🚀

---

## 🎉 IT WORKS!

Now your app can connect from anywhere!

---

## 📱 Build APK for Distribution

Once tested, build APK:

### Option 1: Auto-Configured (Recommended)

**Update default URL first:**

Edit `DriverMonitorApp\src\context\AppContext.js` line 6:

```javascript
const [serverUrl, setServerUrl] = useState('https://YOUR-NGROK-URL.ngrok-free.app');
```

**Then build:**

```powershell
cd DriverMonitorApp
npm install -g eas-cli
npx eas login
npx eas build:configure
npx eas build -p android --profile preview
```

**Or run:**

```powershell
cd DriverMonitorApp
.\BUILD_APK.bat
```

---

### Option 2: User Configures URL

Don't change the default URL. Users will:
1. Install APK
2. Open app
3. Go to Settings
4. Enter your ngrok URL
5. Start using!

---

## ⚠️ Remember

- **Keep both terminals open** while using the app
- **Ngrok free tier:** 40 hours/month
- **URL changes** each time you restart ngrok
- **For permanent URL:** Upgrade to ngrok paid plan ($8/month)

---

## 🔄 Daily Usage

**Every time you want to use the app:**

1. Run: `.\START_PUBLIC_MODE.bat`
2. Copy ngrok URL
3. Update in phone app (if URL changed)
4. Use app!
5. Close terminals when done

---

## 📞 Need Help?

- Ngrok dashboard: http://localhost:4040
- Backend health: https://YOUR-URL.ngrok-free.app/health
- Full guide: See `NGROK_DEPLOYMENT_GUIDE.md`

---

**Ready? Run the commands above! 🚀**



