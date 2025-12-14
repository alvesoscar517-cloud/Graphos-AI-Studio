# Graphos AI Studio Web App - Deployment Guide

This guide covers deploying the Graphos AI Studio web application to Firebase Hosting.

## Prerequisites

- Node.js 18+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud Console access
- Firebase project

## 1. Google Cloud Console Setup

### Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Select **Web application**
6. Add authorized JavaScript origins:
   - `http://localhost:5174` (development)
   - `https://app.graphosai.com` (production)
7. Add authorized redirect URIs:
   - `http://localhost:5174` (development)
   - `https://app.graphosai.com` (production)
8. Copy the **Client ID**: `94136052128-4n6fekrgo3vk0mo1polsd2ts2t96j8g6.apps.googleusercontent.com`

### Enable Required APIs

1. Go to **APIs & Services > Library**
2. Enable:
   - Google Drive API (if using Drive features)
   - Google Identity Services

## 2. Firebase Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Enable **Authentication**:
   - Go to **Authentication > Sign-in method**
   - Enable **Google** provider
   - Add your domain to **Authorized domains**

### Get Firebase Config

1. Go to **Project Settings > General**
2. Under **Your apps**, click **Add app > Web**
3. Copy the Firebase config values

## 3. Environment Configuration

Create `.env` file in `web-app/` directory:

```bash
cp .env.example .env
```

Fill in the values (production values for app.graphosai.com):

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyAhHsXuRUsUfQjsVqlu6F7uix_E9zFTXm4
VITE_FIREBASE_AUTH_DOMAIN=notes-sync-472107.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=notes-sync-472107
VITE_FIREBASE_STORAGE_BUCKET=notes-sync-472107.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=472729326429
VITE_FIREBASE_APP_ID=1:472729326429:web:8f3d06edfde82426820eb4

# Google OAuth
VITE_GOOGLE_CLIENT_ID=94136052128-4n6fekrgo3vk0mo1polsd2ts2t96j8g6.apps.googleusercontent.com

# API URL
VITE_API_BASE_URL=https://graphosai-472729326429.us-central1.run.app
```

## 4. Build & Deploy

### Update Firebase Project ID

Edit `.firebaserc`:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

### Build the Application

```bash
cd web-app
npm install
npm run build
```

### Deploy to Firebase

```bash
firebase login
firebase deploy --only hosting
```

## 5. PWA Icons

Before deploying, generate PWA icons from the source SVG:

```bash
# Using ImageMagick
convert -background none -resize 192x192 public/icon/graphos-ai-studio-logo.svg public/icons/icon-192x192.png
convert -background none -resize 512x512 public/icon/graphos-ai-studio-logo.svg public/icons/icon-512x512.png
```

Or use online tools like [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator).

## 6. Custom Domain (Optional)

1. Go to Firebase Console > Hosting
2. Click **Add custom domain**
3. Follow the DNS verification steps
4. Update OAuth credentials with new domain

## Known Limitations vs Chrome Extension

| Feature | Chrome Extension | Web App |
|---------|-----------------|---------|
| Google Sign-in | `chrome.identity` (seamless) | OAuth popup |
| Storage | `chrome.storage.local` | localStorage/sessionStorage |
| Background sync | Service worker | Limited |
| Offline access | Full | Basic caching |
| Installation | Chrome Web Store | PWA install prompt |

## Troubleshooting

### OAuth Popup Blocked
- Ensure popups are allowed for your domain
- The sign-in button must be triggered by user action

### CORS Errors
- Verify backend API allows your domain in CORS settings
- Check `VITE_API_BASE_URL` is correct

### PWA Not Installing
- Ensure HTTPS is enabled
- Check manifest.json is valid
- Verify service worker is registered

### Firebase Auth Errors
- Verify domain is in Firebase authorized domains
- Check Firebase config values are correct
