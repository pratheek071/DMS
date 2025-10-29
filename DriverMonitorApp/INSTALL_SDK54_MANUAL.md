# Manual SDK 54 Installation Guide

If the automated script doesn't work, follow these steps manually:

## Step-by-Step Installation

### Step 1: Clean Everything

```powershell
cd DriverMonitorApp

# Remove node_modules
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Remove package-lock.json
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Remove .expo cache
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
```

### Step 2: Install Using Expo CLI

```powershell
# This automatically installs compatible versions
npx expo install --fix
```

**OR if that fails:**

```powershell
npm install
```

### Step 3: Check Installation

```powershell
npx expo-doctor
```

If you see warnings about package versions, run:

```powershell
npx expo install expo-av expo-camera expo-file-system expo-media-library expo-status-bar expo-keep-awake react-native-safe-area-context react-native-screens --fix
```

### Step 4: Create Placeholder Assets

Run these commands to create empty placeholder images:

```powershell
# Create assets directory if it doesn't exist
New-Item -ItemType Directory -Force -Path assets

# Create placeholder files
"" | Out-File -FilePath assets\icon.png
"" | Out-File -FilePath assets\splash.png  
"" | Out-File -FilePath assets\adaptive-icon.png
"" | Out-File -FilePath assets\favicon.png
```

### Step 5: Start the App

```powershell
# Clear cache and start with tunnel
npx expo start --tunnel --clear
```

## Alternative: Simpler Installation

If you just want to get it working quickly, do this:

```powershell
cd DriverMonitorApp

# Step 1: Clean install
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install --legacy-peer-deps

# Step 2: Start (warnings are OK)
npx expo start --tunnel
```

The `--legacy-peer-deps` flag will ignore version conflicts and just install packages.

## What the Warnings Mean

When you see:
```
The following packages should be updated for best compatibility...
```

**This is OK!** The app will still work. These are just recommendations.

To fix them later:
```powershell
npx expo install --fix
```

## Quick Test

After installation:

1. **Start server:**
   ```powershell
   npx expo start --tunnel
   ```

2. **Wait for QR code** to appear (1-2 minutes for tunnel)

3. **On your phone:**
   - Open Expo Go app
   - Scan the QR code
   - App should load!

4. **If you see asset errors:**
   - Don't worry! The app functionality works
   - Assets are just icons/splash screens
   - App will show default Expo logos

## Troubleshooting

### Error: "Unable to resolve asset"

**Solution:** The placeholder assets might not be created properly.

Create them manually:
1. Download any small image (PNG)
2. Rename it to `icon.png`
3. Place in `DriverMonitorApp/assets/` folder
4. Copy it 3 times as: `splash.png`, `adaptive-icon.png`, `favicon.png`

### Error: "Package conflicts"

**Solution:** Use legacy peer deps

```powershell
npm install --legacy-peer-deps
```

### Error: "Metro bundler failed"

**Solution:**Clear everything

```powershell
Remove-Item -Recurse -Force node_modules, .expo, android, ios -ErrorAction SilentlyContinue
npm install
npx expo start --clear
```

### Can't scan QR code

**Solution:** Use manual URL entry

1. Look for the URL in terminal (e.g., `exp://abc123.exp.direct:80`)
2. In Expo Go app: Shake device → "Enter URL manually"
3. Type the URL

## Success Checklist

- [ ] `node_modules` folder exists
- [ ] No errors during `npm install`
- [ ] `npx expo start` shows QR code
- [ ] Expo Go app on phone is updated
- [ ] QR code scans successfully
- [ ] App loads (even with placeholder assets)

## Current Status

After running the automated script or manual steps:

✅ **SDK 54** packages installed
✅ **Tunnel mode** for cross-network access  
✅ **Placeholder assets** created
⚠️ **Warnings are normal** - app still works!

## Next Steps

1. **Test the app** - Make sure all features work
2. **Replace assets** - Add proper icons later (see `CREATE_ASSETS.md`)
3. **Start backend** - Don't forget to run the Python backend!

```powershell
# In another terminal - Backend
cd ..\backend
python server.py

# OR with ngrok for public access
python start_server_public.py
```

4. **Configure app** - Enter backend URL in Settings

## Need Help?

If nothing works, try the **nuclear option**:

```powershell
# Delete EVERYTHING
cd ..
Remove-Item -Recurse -Force DriverMonitorApp
git checkout DriverMonitorApp
cd DriverMonitorApp
npm install --legacy-peer-deps
npx expo start --tunnel
```

This resets everything to original state and reinstalls.

---

**Remember:** Package version warnings are OK! As long as the QR code appears and the app loads, you're good to go! 🚀





