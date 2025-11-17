# Assets Setup

Expo requires PNG images for app icons and splash screens. The SVG files have been created as templates.

## Required PNG Files

You need to convert the following SVG files to PNG:

1. **icon.png** (1024x1024) - from `assets/icon.svg`
2. **splash.png** (1242x2436) - from `assets/splash.svg`  
3. **adaptive-icon.png** (1024x1024) - from `assets/icon.svg` (same as icon for Android)

## Quick Conversion

You can use online tools like:
- https://cloudconvert.com/svg-to-png
- https://convertio.co/svg-png/

Or use ImageMagick if installed:
```bash
convert -background none -resize 1024x1024 assets/icon.svg assets/icon.png
convert -background none -resize 1242x2436 assets/splash.svg assets/splash.png
cp assets/icon.png assets/adaptive-icon.png
```

## Temporary Solution

For now, you can create simple placeholder PNG files using any image editor, or the app will use default Expo icons during development.

