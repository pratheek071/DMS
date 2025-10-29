# 🌐 Ngrok Deployment Guide

## Complete guide for deploying your app publicly using Ngrok

---

## 📋 Prerequisites

- ✅ Ngrok account (free): https://dashboard.ngrok.com/signup
- ✅ Backend working locally
- ✅ Mobile app working locally

---

## 🚀 Setup Steps

### Step 1: Get Ngrok Auth Token

1. Sign up at: https://dashboard.ngrok.com/signup
2. Go to: https://dashboard.ngrok.com/get-started/your-authtoken
3. Copy your token (looks like: `2abc123def456...`)

### Step 2: Configure Ngrok

```bash
npx ngrok config add-authtoken YOUR_TOKEN_HERE
```

This saves your token - you only need to do this ONCE!

### Step 3: Start Ngrok Tunnel

```bash
cd backend
npx ngrok http 8000
```

**Copy the URL shown** (e.g., `https://abc-123.ngrok-free.app`)

**Keep this terminal open!**

### Step 4: Start Backend Server

**In a NEW terminal:**

```bash
cd backend
python server.py
```

**Keep this terminal open too!**

### Step 5: Test on Phone

1. Open app → Settings
2. Enter ngrok URL: `https://abc-123.ngrok-free.app`
3. Test connection ✅
4. Start monitoring and verify it works!

---

## 📱 Building APK for Distribution

### Option A: With Default URL (Recommended)

**Users won't need to configure anything!**

1. **Update default URL in code:**

Edit `DriverMonitorApp/src/context/AppContext.js` line 6:

```javascript
const [serverUrl, setServerUrl] = useState('https://your-ngrok-url.ngrok-free.app');
```

2. **Install Expo EAS CLI:**

```bash
npm install -g eas-cli
```

3. **Login to Expo:**

```bash
cd DriverMonitorApp
npx eas login
```

4. **Configure build:**

```bash
npx eas build:configure
```

5. **Build APK:**

```bash
npx eas build -p android --profile preview
```

This takes 10-15 minutes. When done, you'll get a download link.

6. **Download and share the APK!**

### Option B: Users Configure URL Themselves

Keep the default URL as-is, and users enter the ngrok URL manually in Settings.

---

## ⚠️ Important Notes

### Free Tier Limits

- ✅ 40 hours/month tunnel time
- ✅ 1 online tunnel at a time
- ⚠️ URL changes each time you restart ngrok

### For Permanent URL (Paid Plan)

Ngrok paid plans give you a static URL that never changes:

```bash
ngrok http 8000 --domain=your-static-domain.ngrok-free.app
```

Then you build APK once and it works forever!

### Keeping Backend Running

Your laptop must be:
- ✅ Powered on
- ✅ Connected to internet
- ✅ Running both terminals (ngrok + backend)

**Alternative:** Deploy backend to cloud (PythonAnywhere/Render) for 24/7 availability.

---

## 🎯 Production Checklist

Before sharing APK:

- [ ] Test thoroughly on your phone
- [ ] Verify all features work
- [ ] Test with different lighting conditions
- [ ] Check audio alerts work
- [ ] Test with poor internet connection
- [ ] Update default URL in code
- [ ] Build APK
- [ ] Test APK on another device
- [ ] Keep your laptop + backend running!

---

## 🔧 Troubleshooting

### Ngrok tunnel disconnects

**Solution:** Restart ngrok:
```bash
Ctrl+C
npx ngrok http 8000
```

**Note:** URL will change! Update in app settings.

### "Network request failed"

**Check:**
1. Both terminals running? (ngrok + backend)
2. URL correct in app settings?
3. Internet working on phone?

### Want 24/7 availability?

Deploy backend to cloud:
- PythonAnywhere (free forever)
- Render.com (free tier)
- Railway (free trial)

---

## 📞 Support

If you encounter issues:
1. Check both terminals are running
2. Verify ngrok URL hasn't changed
3. Test backend: Open `https://your-ngrok-url.ngrok-free.app/health` in browser
4. Should show: `{"status":"healthy"}`

---

## 🎉 Success!

Once your APK is built:
- ✅ Share APK file with anyone
- ✅ They install it
- ✅ It just works (if default URL is set)
- ✅ No WiFi or network setup needed!

**Happy Monitoring! 🚗**



