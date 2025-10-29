# Driver Monitor App - React Native

A mobile application for real-time driver monitoring using AI-powered pose estimation.

## Features

- 📱 Real-time camera feed monitoring
- 🤖 AI-powered driver behavior detection
- 🚨 Audio alerts for critical behaviors
- 📊 Live statistics and metrics
- 🎯 Multiple alert levels (SAFE, CAUTION, WARNING, CRITICAL)
- 📹 Video recording capabilities

## Monitored Behaviors

- **Eyes on Road** - Normal driving (SAFE)
- **Looking Left/Right** - Mirror checks (CAUTION)
- **Eyes Closing** - Drowsiness detection (WARNING)
- **Eyes Closed > 5s** - Critical sleep alert (CRITICAL)
- **Looking Down** - Phone usage detection (WARNING/CRITICAL)
- **Sleeping (Horizontal)** - Body position detection (CRITICAL)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Android Studio (for Android development) or Xcode (for iOS)
- Python 3.8+ (for backend server)

## Installation

### 1. Install Dependencies

```bash
cd DriverMonitorApp
npm install
```

### 2. Start the Development Server

```bash
npm start
```

This will start the Expo development server. You can then:

- Scan the QR code with the Expo Go app on your phone
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator (Mac only)

## Running on Android Device

### Method 1: Using Expo Go (Easiest)

1. Install Expo Go from Google Play Store
2. Make sure your phone and computer are on the same WiFi network
3. Run `npm start` on your computer
4. Scan the QR code with Expo Go app

### Method 2: Building APK

```bash
# Build for Android
expo build:android

# Or create development build
eas build --platform android --profile development
```

## Configuration

1. **Server URL**: Go to Settings in the app
2. Find your computer's local IP address:
   - Windows: Run `ipconfig` in Command Prompt
   - Mac/Linux: Run `ifconfig` or `ip addr` in Terminal
3. Enter URL in format: `http://YOUR_IP:8000`
4. Test connection using the "Test Connection" button

## Backend Setup

The app requires the Python FastAPI backend to be running. See the main project README for backend setup instructions.

## Development

### Project Structure

```
DriverMonitorApp/
├── App.js                      # Main app entry point
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── babel.config.js             # Babel configuration
└── src/
    ├── components/             # Reusable UI components
    │   ├── AlertBanner.js      # Alert display component
    │   ├── CameraView.js       # Camera handling component
    │   └── StatusCard.js       # Status metric card
    ├── context/                # React Context providers
    │   └── AppContext.js       # Global app state
    ├── screens/                # App screens
    │   ├── MonitoringScreen.js # Main monitoring interface
    │   └── SettingsScreen.js   # Settings and configuration
    └── services/               # API and service layers
        ├── ApiService.js       # Backend API calls
        └── AudioService.js     # Audio alert handling
```

### Key Components

- **MonitoringScreen**: Main screen with camera feed and real-time monitoring
- **SettingsScreen**: Configuration for server URL, audio, and detection settings
- **CameraView**: Handles camera access and frame capture
- **ApiService**: Manages communication with backend server
- **AudioService**: Handles audio alert playback

## Troubleshooting

### Connection Issues

- Ensure both devices are on the same WiFi network
- Check firewall settings on computer running backend
- Verify backend server is running on port 8000
- Try disabling VPN if enabled

### Camera Not Working

- Grant camera permissions in phone settings
- Restart the Expo app
- Clear Expo cache: `expo start -c`

### Audio Alerts Not Playing

- Check phone volume settings
- Enable audio alerts in app settings
- Grant audio permissions if prompted

### Poor Performance

- Reduce frame processing rate in `CameraView.js` (increase interval from 200ms)
- Lower camera quality in `CameraView.js`
- Ensure good network connection
- Close other apps to free up resources

## Building for Production

### Android APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build production APK
eas build --platform android --profile production
```

### iOS (Mac Only)

```bash
eas build --platform ios --profile production
```

## Known Limitations

- Requires active internet/network connection to backend
- Processing speed depends on network latency
- Camera quality affects detection accuracy
- Backend must be accessible on local network

## Future Enhancements

- Offline mode with on-device ML processing
- Cloud backend deployment option
- Historical session review
- Export session data
- Multi-language support
- Dark mode

## Support

For issues and questions, please refer to the main project documentation or create an issue on GitHub.

## License

MIT License - See LICENSE file for details






