# Graphos AI Studio

A comprehensive AI-powered content humanization and detection platform. Transform AI-generated text into natural, human-like content while offering advanced AI detection capabilities with 98%+ accuracy.

## 🌐 Live Demo

- **Web Application:** [https://app.graphosai.com](https://app.graphosai.com)
- **Landing Page:** [https://graphosai.com](https://graphosai.com)
- **Chrome Extension:** Available on Chrome Web Store

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security](#security)
- [Internationalization](#internationalization)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

Graphos AI Studio is a full-stack SaaS platform consisting of:

| Component | Description | Tech Stack |
|-----------|-------------|------------|
| **Web Application** | Main SaaS platform for content humanization | React 18, Vite, TailwindCSS |
| **Chrome Extension** | Browser integration for in-page AI tools | Manifest V3, React |
| **Admin Panel** | Management dashboard for administrators | React 18, Recharts |
| **Landing Page** | Marketing website with SEO optimization | React 18, Framer Motion |
| **Backend API** | Core AI processing engine | Node.js, Express, Gemini AI |


### Supported AI Detection Bypass

The platform is designed to bypass major AI detection tools:
- GPTZero
- Originality AI
- Turnitin
- Copyleaks
- ZeroGPT
- Winston AI
- Content at Scale

## Key Features

### 🤖 AI Content Humanization
- Advanced text transformation using Google Gemini 2.5 Flash
- Maintains original meaning while changing writing patterns
- Adjustable humanization intensity levels
- Real-time preview and comparison
- 99% success rate in bypassing AI detectors

### 🔍 AI Detection Analysis
- Multi-detector compatibility checking
- Sentence-by-sentence analysis with visual highlighting
- Detailed confidence scores
- 98% detection accuracy

### 👤 Voice Profile System
- Create custom writing personas with unique styles
- Define tone, vocabulary, and writing preferences
- Multi-step profile creation wizard
- Profile-based content generation for consistency

### ✍️ Rich Text Editor
- TipTap-based WYSIWYG editor with full formatting
- Document import (DOCX, PDF, TXT)
- Export to multiple formats
- Real-time word count and statistics

### 💬 AI Chat Workspace
- Conversational AI interface with streaming responses
- Context-aware conversations
- Chat history management
- Offline-first sync with Firestore

### 💳 Credit System
- Usage-based billing with Lemon Squeezy integration
- Credit packages and subscriptions
- Transaction history tracking
- Automatic credit deduction

### 🌍 Internationalization
- 15+ supported languages
- Auto-detection of user language
- RTL language support (Arabic)
- Localized UI, errors, and email templates

## Tech Stack

### Frontend (Web App, Admin Panel, Landing Page)

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| Vite | 5.2.0 | Build Tool & Dev Server |
| React Router | 6.22.0 | Client-side Routing |
| TailwindCSS | 4.1.17 | Utility-first CSS |
| Zustand | 5.0.9 | Global State Management |
| TanStack React Query | 5.90.11 | Server State & Caching |
| TipTap | 3.13.0 | Rich Text Editor |
| Framer Motion | 12.23.24 | Animations |
| i18next | 25.6.3 | Internationalization |
| Firebase | 12.6.0 | Auth & Realtime Database |
| Zod | 4.1.13 | Schema Validation |
| Three.js | 0.181.2 | 3D Graphics |
| Recharts | 2.15.3 | Charts (Admin Panel) |


### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x | Runtime Environment |
| Express | 4.18.2 | Web Framework |
| Firebase Admin SDK | 12.0.0 | Database & Auth |
| Google Vertex AI | 1.9.2 | Gemini 2.5 Flash AI Model |
| BullMQ | 5.65.1 | Job Queue Processing |
| Redis (ioredis) | 5.8.2 | Caching & Sessions |
| Nodemailer | 7.0.10 | Email Service |
| Argon2 | 0.44.0 | Password Hashing |
| Pino | 10.1.0 | Structured Logging |
| Zod | 4.1.13 | Request Validation |
| wink-nlp | 2.4.0 | Natural Language Processing |

### Chrome Extension

| Technology | Purpose |
|------------|---------|
| Manifest V3 | Extension Configuration |
| Service Worker | Background Processing |
| Chrome Identity API | Google OAuth |
| Chrome Storage API | Local Data Persistence |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Google Cloud Run | Backend Hosting |
| Firebase Hosting | Frontend Hosting |
| Firestore | NoSQL Database |
| Redis Cloud | Distributed Caching |
| Vercel | Admin Panel Hosting |
| Lemon Squeezy | Payment Processing |

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENTS                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Web App    │  │   Chrome     │  │   Admin      │  │   Landing    │        │
│  │   (React)    │  │  Extension   │  │   Panel      │  │    Page      │        │
│  │              │  │  (MV3)       │  │   (React)    │  │   (React)    │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────────────┘        │
│         │                 │                 │                                    │
│         └─────────────────┼─────────────────┘                                    │
│                           │                                                      │
├───────────────────────────┼──────────────────────────────────────────────────────┤
│                           ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         BACKEND API (Express.js)                         │    │
│  │                         Google Cloud Run                                 │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │    │
│  │  │    Auth     │  │  Analysis   │  │    Chat     │  │   Payment   │    │    │
│  │  │  Controller │  │ Controller  │  │ Controller  │  │ Controller  │    │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │    │
│  │                                                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │    │
│  │  │   Profile   │  │   Credit    │  │ Notification│  │   Support   │    │    │
│  │  │ Controller  │  │ Controller  │  │ Controller  │  │ Controller  │    │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                              SERVICES LAYER                                       │
│                                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Gemini    │  │   Email     │  │   Queue     │  │   Cache     │            │
│  │   Service   │  │   Service   │  │   Service   │  │   Service   │            │
│  │ (AI Engine) │  │ (Nodemailer)│  │  (BullMQ)   │  │   (Redis)   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Humanize   │  │   Credit    │  │  Activity   │  │  Realtime   │            │
│  │   Service   │  │   Service   │  │ Log Service │  │   Events    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                              DATA LAYER                                          │
│                                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐     │
│  │      Firestore      │  │       Redis         │  │   Lemon Squeezy     │     │
│  │   (Primary DB)      │  │  (Cache/Sessions)   │  │    (Payments)       │     │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘     │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```


### Backend Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              MIDDLEWARE PIPELINE                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Request → CORS → Compression → Rate Limit → Auth → Language → Validation →    │
│                                                                                  │
│  → Controller → Service → Response Localization → Error Handler → Response      │
│                                                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                              BACKGROUND WORKERS                                  │
│                                                                                  │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐              │
│  │      Email Worker           │  │     Analysis Worker          │              │
│  │  - Welcome emails           │  │  - Background AI processing  │              │
│  │  - OTP verification         │  │  - Batch humanization        │              │
│  │  - Password reset           │  │  - Profile creation          │              │
│  │  - Notifications            │  │  - Credit calculations       │              │
│  └─────────────────────────────┘  └─────────────────────────────┘              │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
graphos-ai-studio/
├── src/                          # Chrome Extension source
│   ├── components/               # React components
│   ├── contexts/                 # React contexts
│   ├── hooks/                    # Custom hooks
│   ├── services/                 # API services
│   ├── stores/                   # Zustand stores
│   └── utils/                    # Utility functions
│
├── admin-panel/                  # Admin Dashboard
│   ├── components/               # Admin UI components
│   ├── contexts/                 # Admin contexts
│   ├── hooks/                    # Admin hooks
│   ├── lib/                      # Utilities
│   └── services/                 # Admin API services
│
├── backend/                      # Node.js Backend API
│   ├── src/
│   │   ├── config/               # Configuration files
│   │   │   ├── firebase.js       # Firebase config
│   │   │   ├── gemini.js         # Gemini AI config
│   │   │   └── pricing.js        # Credit pricing
│   │   │
│   │   ├── controllers/          # Route handlers
│   │   │   ├── analysis.controller.js
│   │   │   ├── chat.controller.js
│   │   │   ├── credit.controller.js
│   │   │   ├── emailAuth.controller.js
│   │   │   ├── payment.controller.js
│   │   │   ├── profile.controller.js
│   │   │   └── realtime.controller.js
│   │   │
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.middleware.js
│   │   │   ├── credit.middleware.js
│   │   │   ├── rateLimit.js
│   │   │   └── validation.middleware.js
│   │   │
│   │   ├── routes/               # API routes
│   │   │   ├── analysis.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── chat.routes.js
│   │   │   ├── credit.routes.js
│   │   │   ├── payment.routes.js
│   │   │   └── profile.routes.js
│   │   │
│   │   ├── services/             # Business logic
│   │   │   ├── gemini.service.js      # AI processing
│   │   │   ├── humanize.service.js    # Content humanization
│   │   │   ├── email.service.js       # Email sending
│   │   │   ├── credit.service.js      # Credit management
│   │   │   ├── cache.service.js       # Redis caching
│   │   │   └── queue.service.js       # BullMQ jobs
│   │   │
│   │   ├── workers/              # Background workers
│   │   │   ├── email.worker.js
│   │   │   └── analysis.worker.js
│   │   │
│   │   ├── locales/              # Backend i18n (15 languages)
│   │   └── utils/                # Utility functions
│   │
│   └── index.js                  # Server entry point
│
├── web-app/                      # Main Web Application
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── Analysis/         # AI detection components
│   │   │   ├── Auth/             # Authentication
│   │   │   ├── Editor/           # TipTap editor
│   │   │   ├── Layout/           # Layout components
│   │   │   ├── ProfileSetup/     # Profile wizard
│   │   │   └── Views/            # Main views
│   │   │
│   │   ├── contexts/             # React contexts
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # API client
│   │   ├── stores/               # Zustand stores
│   │   └── utils/                # Utilities
│   │
│   └── public/locales/           # Translation files
│
├── landing-page/                 # Marketing Website
│   ├── src/
│   │   ├── components/           # Landing components
│   │   ├── pages/                # Page components
│   │   └── styles/               # CSS styles
│   │
│   └── scripts/                  # Build scripts
│
├── background.js                 # Extension service worker
├── manifest.json                 # Extension manifest (MV3)
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Firestore indexes
└── firebase.json                 # Firebase configuration
```


## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Firebase project with Firestore enabled
- Google Cloud project with Vertex AI API enabled
- Redis instance (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/alvesoscar517-cloud/Graphos-AI-Studio.git
   cd Graphos-AI-Studio
   ```

2. **Install dependencies for all packages**
   ```bash
   # Root (Chrome Extension)
   npm install

   # Backend
   cd backend && npm install

   # Web App
   cd ../web-app && npm install

   # Admin Panel
   cd ../admin-panel && npm install

   # Landing Page
   cd ../landing-page && npm install
   ```

3. **Configure environment variables**

   Create `.env` files based on `.env.example` in each directory:

   **Backend (.env)**
   ```env
   NODE_ENV=development
   PORT=8080
   GOOGLE_CLOUD_PROJECT=your-project-id
   FIREBASE_SERVICE_ACCOUNT=path/to/service-account.json
   REDIS_URL=redis://localhost:6379
   LEMONSQUEEZY_API_KEY=your-api-key
   LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret
   ```

   **Frontend (.env)**
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

4. **Start development servers**

   ```bash
   # Backend (Terminal 1)
   cd backend && npm run dev

   # Web App (Terminal 2)
   cd web-app && npm run dev

   # Admin Panel (Terminal 3)
   cd admin-panel && npm run dev

   # Landing Page (Terminal 4)
   cd landing-page && npm run dev
   ```

5. **Build Chrome Extension**
   ```bash
   # From root directory
   npm run build
   ```

### Development URLs

| Service | URL |
|---------|-----|
| Web App | http://localhost:5173 |
| Admin Panel | http://localhost:5174 |
| Landing Page | http://localhost:5175 |
| Backend API | http://localhost:8080 |

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/email/register` | Register with email |
| POST | `/api/auth/email/login` | Login with email |
| POST | `/api/auth/email/verify-otp` | Verify OTP code |
| POST | `/api/auth/email/resend-otp` | Resend OTP |
| POST | `/api/auth/email/forgot-password` | Request password reset |
| POST | `/api/auth/email/reset-password` | Reset password |
| POST | `/api/auth/firebase/google-login` | Google OAuth login |
| POST | `/api/auth/refresh-token` | Refresh JWT token |
| POST | `/api/auth/logout` | Logout user |

### Analysis Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Analyze text for AI patterns |
| POST | `/api/detect` | Detect AI-generated content |
| POST | `/api/compatibility-check` | Check against multiple detectors |
| POST | `/api/rewrite` | Humanize AI content |
| POST | `/api/rewrite/iterative` | Multi-pass humanization |
| POST | `/api/suggestions` | Get improvement suggestions |

### Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles` | Get user profiles |
| GET | `/api/profiles/:id` | Get profile by ID |
| POST | `/api/profiles/create` | Create new profile |
| POST | `/api/profiles/create-complete` | Create profile with samples |
| PUT | `/api/profiles/:id` | Update profile |
| DELETE | `/api/profiles/:id` | Delete profile |

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/send` | Send chat message |
| POST | `/api/chat/stream` | Stream chat response |
| GET | `/api/chat/conversations` | Get conversations |
| GET | `/api/chat/conversations/:id` | Get conversation |
| DELETE | `/api/chat/conversations/:id` | Delete conversation |

### Credit & Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/credits` | Get user credits |
| GET | `/api/credits/history` | Get credit history |
| POST | `/api/payments/create-checkout` | Create checkout session |
| POST | `/api/payments/webhook` | Lemon Squeezy webhook |
| GET | `/api/payments/orders` | Get user orders |


## Database Schema

### Firestore Collections

```
├── users/                        # User profiles
│   └── {userId}
│       ├── email: string
│       ├── displayName: string
│       ├── credits: number
│       ├── plan: string
│       ├── settings: object
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── user_notes/                   # User documents
│   └── {noteId}
│       ├── userId: string
│       ├── title: string
│       ├── content: string
│       ├── created: timestamp
│       └── updated: timestamp
│
├── user_conversations/           # Chat conversations
│   └── {conversationId}
│       ├── userId: string
│       ├── title: string
│       ├── messages: array
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── voice_profiles/               # Writing profiles
│   └── {profileId}
│       ├── user_id: string
│       ├── name: string
│       ├── description: string
│       ├── tone: string
│       ├── style: string
│       ├── vocabulary: array
│       ├── samples: array
│       └── embedding: array
│
├── orders/                       # Purchase orders
│   └── {orderId}
│       ├── userId: string
│       ├── amount: number
│       ├── credits: number
│       ├── status: string
│       ├── provider: string
│       └── createdAt: timestamp
│
├── notifications/                # User notifications
│   └── {notificationId}
│       ├── userId: string
│       ├── type: string
│       ├── title: string
│       ├── message: string
│       ├── read: boolean
│       └── createdAt: timestamp
│
├── activity_logs/                # User activity
│   └── {logId}
│       ├── userId: string
│       ├── action: string
│       ├── details: object
│       └── timestamp: timestamp
│
├── credit_transactions/          # Credit history
│   └── {transactionId}
│       ├── userId: string
│       ├── type: string (credit/debit)
│       ├── amount: number
│       ├── reason: string
│       └── createdAt: timestamp
│
└── system_settings/              # Admin settings
    └── {settingId}
        ├── key: string
        ├── value: any
        └── updatedAt: timestamp
```

### Firestore Indexes

Key composite indexes for query optimization:

```json
{
  "indexes": [
    {
      "collectionGroup": "user_notes",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "updated", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "user_conversations",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "voice_profiles",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## Security

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Firebase   │────▶│   Backend   │────▶│  Firestore  │
│   Login     │     │    Auth     │     │   Verify    │     │   (Admin)   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       │                   ▼                   ▼                   │
       │            ┌─────────────┐     ┌─────────────┐           │
       │            │  ID Token   │     │  JWT Token  │           │
       │            │  (Firebase) │     │  (Backend)  │           │
       │            └─────────────┘     └─────────────┘           │
       │                                       │                   │
       └───────────────────────────────────────┘                   │
                           │                                       │
                           ▼                                       │
                    ┌─────────────┐                                │
                    │   Client    │◀───────────────────────────────┘
                    │   Storage   │
                    └─────────────┘
```

### Security Features

| Feature | Implementation |
|---------|----------------|
| Password Hashing | Argon2 with salt |
| Token Management | JWT with refresh tokens |
| Rate Limiting | Per-user operation limits |
| Input Sanitization | sanitize-html library |
| CORS Protection | Whitelist-based origins |
| Request Validation | Zod schema validation |
| Activity Logging | Comprehensive audit trail |
| Circuit Breaker | Fault tolerance for external APIs |

### Firestore Security Rules

```javascript
// Key security principles:
// 1. Backend uses Admin SDK (bypasses rules) for writes
// 2. Frontend uses Web SDK for read-only operations
// 3. User data isolation enforced by userId field
// 4. Sensitive data never exposed to frontend

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read their own data
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if false; // Backend only
    }
    
    // Notes with owner validation
    match /user_notes/{noteId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```


## Internationalization

### Supported Languages

| Language | Code | Status | RTL |
|----------|------|--------|-----|
| English | en | ✅ Complete | No |
| Vietnamese | vi | ✅ Complete | No |
| Spanish | es | ✅ Complete | No |
| French | fr | ✅ Complete | No |
| German | de | ✅ Complete | No |
| Italian | it | ✅ Complete | No |
| Portuguese | pt | ✅ Complete | No |
| Russian | ru | ✅ Complete | No |
| Japanese | ja | ✅ Complete | No |
| Korean | ko | ✅ Complete | No |
| Chinese (Simplified) | zh | ✅ Complete | No |
| Arabic | ar | ✅ Complete | Yes |
| Hindi | hi | ✅ Complete | No |
| Thai | th | ✅ Complete | No |
| Indonesian | id | ✅ Complete | No |
| Malay | ms | ✅ Complete | No |

### i18n Implementation

**Frontend (React)**
```javascript
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();
  return <h1>{t('home.title')}</h1>;
};
```

**Backend (Node.js)**
```javascript
const { t } = require('./utils/i18n.util');

// Localized response
res.json({
  message: t('auth.loginSuccess', req.language)
});
```

### Translation Files Location

- Frontend: `web-app/public/locales/{lang}/translation.json`
- Backend: `backend/src/locales/{lang}.json`

## Testing

### Test Framework

| Package | Purpose |
|---------|---------|
| Vitest | Test runner |
| jsdom | DOM environment |
| fast-check | Property-based testing |
| @testing-library/react | React component testing |

### Running Tests

```bash
# Web App
cd web-app
npm run test           # Run once
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage

# Backend
cd backend
npm run test           # Run once
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage

# Landing Page
cd landing-page
npm run test
```

### Test Structure

```
src/
├── __tests__/           # Test files
│   ├── components/      # Component tests
│   ├── hooks/           # Hook tests
│   ├── services/        # Service tests
│   └── utils/           # Utility tests
├── __mocks__/           # Mock implementations
└── setupTests.js        # Test configuration
```

## Deployment

### Production Build

```bash
# Build all packages
npm run build              # Chrome Extension
cd web-app && npm run build
cd admin-panel && npm run build
cd landing-page && npm run build
```

### Deployment Commands

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Admin Panel to Vercel
cd admin-panel && vercel --prod

# Deploy Backend to Cloud Run
gcloud run deploy graphosai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

### CI/CD Pipeline

The project uses GitHub Actions for automated deployment:

1. **On Push to `main`:**
   - Run linting and tests
   - Build all packages
   - Deploy to production

2. **On Pull Request:**
   - Run linting and tests
   - Build verification
   - Preview deployment

### Environment Configuration

| Environment | Backend URL | Firebase Project |
|-------------|-------------|------------------|
| Development | localhost:8080 | graphosai-dev |
| Staging | staging.graphosai.com | graphosai-staging |
| Production | api.graphosai.com | graphosai-prod |

## Available Scripts

### Root (Chrome Extension)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start extension dev server |
| `npm run build` | Build extension for production |
| `npm run build:admin` | Build admin panel |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

### Backend

| Command | Description |
|---------|-------------|
| `npm run start` | Start production server |
| `npm run dev` | Start development server |
| `npm run test` | Run tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run i18n:validate` | Validate translations |
| `npm run deploy:indexes` | Deploy Firestore indexes |

### Web App / Admin Panel / Landing Page

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format with Prettier |
| `npm run test` | Run tests |


## Performance Optimizations

### Frontend

- **Code Splitting:** Route-based lazy loading
- **Bundle Optimization:** Vendor chunk separation
- **Image Optimization:** WebP format, lazy loading
- **Caching:** React Query with stale-while-revalidate
- **Virtual Lists:** react-window for large lists

### Backend

- **Multi-layer Caching:**
  - L1: In-memory LRU cache
  - L2: Redis distributed cache
- **Connection Pooling:** Firestore & Redis
- **Compression:** gzip/brotli responses
- **Rate Limiting:** Per-user operation limits
- **Circuit Breaker:** Fault tolerance for AI APIs

### Database

- **Composite Indexes:** Optimized queries
- **Denormalization:** Reduced read operations
- **Batch Operations:** Bulk writes
- **Offline-first:** IndexedDB + Firestore sync

## Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### Chrome Extension

- Manifest V3 compatible
- Chrome 88+ required
- Service Worker based

## Contributing

### Code Style

- ESLint for JavaScript linting
- Prettier for code formatting
- Conventional commits for git messages

### Development Workflow

1. Fork the repository
2. Create feature branch from `main`
3. Make changes with tests
4. Run `npm run lint` and `npm run test`
5. Submit pull request

### Commit Convention

```
feat: Add new feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting)
refactor: Code refactoring
test: Test additions/changes
chore: Build/config changes
perf: Performance improvements
```

### Pull Request Guidelines

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Follow existing code style
5. Keep PRs focused and small

## Roadmap

### Upcoming Features

- [ ] Mobile application (React Native)
- [ ] API access for developers
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Custom AI model training
- [ ] Browser extension for Firefox
- [ ] Offline mode improvements
- [ ] Real-time collaboration

## License

This project is proprietary software. All rights reserved.

© 2024-2026 Graphos AI Studio. All rights reserved.

## Contact

- **Website:** [https://graphosai.com](https://graphosai.com)
- **Email:** support@graphosai.com
- **GitHub:** [https://github.com/alvesoscar517-cloud/Graphos-AI-Studio](https://github.com/alvesoscar517-cloud/Graphos-AI-Studio)

---

Built with ❤️ by the Graphos AI Team
