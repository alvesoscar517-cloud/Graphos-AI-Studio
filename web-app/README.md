# Graphos AI Studio - Web App

Best AI Humanizer & AI Detection Bypass Tool. Transform AI-generated text into 100% human-like content.

## 🚀 Features

- **AI Humanizer** - Convert ChatGPT, Claude, Gemini text to undetectable human content (99% bypass rate)
- **AI Detection** - Check if content is AI-generated with 98% accuracy
- **Voice Profile** - Create content that matches your unique writing style
- **Multi-language** - Support for 15+ languages
- **PWA** - Install as desktop/mobile app

## 📦 Tech Stack

- React 18 + Vite
- TailwindCSS 4
- Firebase (Auth, Firestore)
- i18next (Internationalization)
- Zustand (State Management)

## 🛠️ Setup

### 1. Clone & Install

```bash
git clone https://github.com/your-username/graphos-ai-web-app.git
cd graphos-ai-web-app
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- Firebase config (from Firebase Console)
- Google OAuth Client ID (from Google Cloud Console)

### 3. Development

```bash
npm run dev
```

App runs at `http://localhost:5174`

### 4. Build

```bash
npm run build
```

### 5. Deploy to Firebase

```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | ✅ |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | ✅ |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | ✅ |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | ✅ |
| `VITE_API_BASE_URL` | Backend API URL | ✅ |

## 📁 Project Structure

```
web-app/
├── public/           # Static assets
│   ├── icons/        # App icons
│   ├── screenshots/  # Feature screenshots
│   └── manifest.json # PWA manifest
├── src/
│   ├── components/   # React components
│   ├── hooks/        # Custom hooks
│   ├── i18n/         # Translations
│   ├── services/     # API services
│   ├── stores/       # Zustand stores
│   └── utils/        # Utilities
├── functions/        # Firebase Cloud Functions (optional)
└── index.html        # Entry HTML with SEO
```

## 🔍 SEO

- Full Schema.org markup (SoftwareApplication, Organization, FAQ)
- Open Graph & Twitter Cards
- Multi-language hreflang tags
- Sitemap & robots.txt
- Noscript fallback for crawlers

## 📄 License

MIT License - Graphos AI Studio
