# Assets Directory

This directory contains app assets like icons, images, and sounds.

## Required Assets

For a production build, you'll need:

### Icons
- `icon.png` - App icon (1024x1024)
- `adaptive-icon.png` - Android adaptive icon (1024x1024)
- `favicon.png` - Web favicon (48x48)

### Splash Screen
- `splash.png` - Splash screen (1284x2778 for iOS, 1080x1920 for Android)

### Audio (Optional - for better alerts)
Create a `sounds/` directory with:
- `beep-critical.mp3` - Critical alert sound (3 beeps)
- `beep-warning.mp3` - Warning alert sound (1 beep)

## Generating Icons

You can use online tools to generate icons:
- [Expo Icon Generator](https://buildicon.netlify.app/)
- [App Icon Generator](https://www.appicon.co/)

## Using Default Assets

If you don't provide custom assets, Expo will use default placeholders.

## Custom Beep Sounds

To use custom beep sounds instead of downloading from URL:

1. Create `sounds/` directory here
2. Add your `beep.mp3` files
3. Update `AudioService.js`:

```javascript
// Replace this line:
{ uri: 'https://www.soundjay.com/button/sounds/beep-01a.mp3' }

// With:
require('../assets/sounds/beep.mp3')
```

## Image Guidelines

- **Icon**: Simple, recognizable, works at small sizes
- **Splash**: Should match your brand/theme
- **Format**: PNG with transparency for icons
- **Size**: Follow Expo's recommendations for best results

## Audio Guidelines

- **Format**: MP3 or WAV
- **Duration**: 0.2-0.5 seconds per beep
- **Quality**: 44.1kHz, mono is sufficient
- **Volume**: Normalized to prevent clipping

## Testing Assets

Test your assets:
```bash
expo start
```

Then check:
- App icon in Expo Go
- Splash screen on app launch
- Audio alerts during monitoring






