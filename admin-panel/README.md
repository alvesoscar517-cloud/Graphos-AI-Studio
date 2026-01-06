# Graphos AI Studio - Admin Panel

A comprehensive administrative dashboard for managing the Graphos AI Studio platform. Built with React 18, TailwindCSS, and modern UI components, this panel provides real-time monitoring, user management, analytics, and system configuration capabilities.

## 🌐 Live Demo

**Admin Panel:** [https://admin.graphosai.com](https://admin.graphosai.com)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [API Integration](#api-integration)
- [Authentication](#authentication)
- [Real-time Updates](#real-time-updates)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)

## Overview

The Admin Panel is a standalone React application that provides administrators with complete control over the Graphos AI Studio platform. It features a modern, responsive interface with real-time data synchronization, comprehensive user management, analytics dashboards, and system configuration tools.

### Key Capabilities

| Feature | Description |
|---------|-------------|
| **User Management** | View, edit, lock/unlock users, manage credits, view activity logs |
| **Analytics Dashboard** | Real-time statistics, revenue tracking, user growth metrics |
| **Notification System** | Create, schedule, and send push notifications to users |
| **Support Tickets** | Manage customer support requests with status tracking |
| **Error Monitoring** | Track and resolve application errors reported by users |
| **System Logs** | View and filter system activity logs |
| **Settings Management** | Configure email, environment variables, and system settings |
| **Backup & Restore** | Create and manage database backups |


## Key Features

### 🎯 Dashboard
- **Real-time Statistics**: Live updates for users, revenue, support tickets, and profiles
- **Activity Feed**: Recent system activities with timestamps
- **Revenue Tracking**: 30-day revenue statistics with order counts
- **Live Alerts**: Real-time notifications for new users and purchases
- **Quick Navigation**: Direct links to detailed views

### 👥 User Management
- **User List**: Paginated table with search, filters, and sorting
- **User Details**: Comprehensive user information including:
  - Profile data (email, name, plan, credits)
  - Account status (locked/unlocked)
  - Registration and last login dates
  - Credit balance and transaction history
- **User Actions**:
  - Lock/unlock accounts with reason tracking
  - Adjust credits (add/deduct with audit trail)
  - Delete users with confirmation
  - Send direct notifications
  - View activity logs
  - Manage writing profiles
- **Bulk Operations**: Lock/unlock or delete multiple users at once
- **Export**: Export user data to JSON/CSV formats

### 📊 Analytics
- **User Analytics**: Registration trends, active users, growth metrics
- **Usage Analytics**: Feature usage statistics, API call tracking
- **Revenue Analytics**: Sales trends, popular products, conversion rates
- **Activity Statistics**: User engagement metrics over time periods

### 🔔 Notification Management
- **Create Notifications**: Rich text editor with image support
- **Targeting Options**:
  - All users
  - Specific user segments (free, premium, enterprise)
  - Individual users
- **Scheduling**: Send immediately or schedule for later
- **Templates**: Pre-built notification templates
- **Delivery Tracking**: View delivery status and statistics
- **Email Integration**: Send notifications via email with progress tracking

### 🎫 Support System
- **Ticket Management**: View and respond to support tickets
- **Status Tracking**: Open, in progress, resolved, closed
- **Priority Levels**: Low, medium, high, urgent
- **Response System**: Reply to tickets with admin notes
- **Statistics**: Ticket volume, resolution time, status distribution
- **Filtering**: Filter by status, priority, date range

### 🐛 Error Monitoring
- **Error Reports**: View application errors reported by users
- **Error Details**: Stack traces, user context, browser information
- **Status Management**: Mark errors as resolved or in progress
- **Filtering**: Filter by status, severity, date range
- **User Context**: See which users are affected by specific errors

### 📝 System Logs
- **Activity Logs**: Comprehensive audit trail of all system activities
- **User Logs**: Per-user activity history with action details
- **Credit Transactions**: Detailed credit transaction history
- **Feature Usage**: Track feature usage by users
- **Filtering**: Filter by action type, date range, user
- **Cleanup**: Automated cleanup of old logs

### ⚙️ Settings
- **Email Configuration**: Configure SMTP settings for email delivery
- **Environment Variables**: Manage environment variables for different services
- **System Settings**: Configure global system parameters
- **Backup Management**: Create, download, and restore database backups
- **Storage Statistics**: View backup storage usage


## Tech Stack

### Frontend Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| React Router DOM | 6.22.0 | Client-side Routing |
| Vite | 5.2.0 | Build Tool & Dev Server |
| TailwindCSS | 4.1.8 | Utility-first CSS Framework |

### State Management & Data Fetching

| Technology | Version | Purpose |
|------------|---------|---------|
| TanStack React Query | 5.90.11 | Server State Management & Caching |
| React Context API | - | Global State (Auth, Realtime) |

### UI Components

| Technology | Version | Purpose |
|------------|---------|---------|
| Radix UI | Various | Accessible UI Primitives |
| @radix-ui/react-dialog | 1.1.15 | Modal Dialogs |
| @radix-ui/react-dropdown-menu | 2.1.16 | Dropdown Menus |
| @radix-ui/react-tabs | 1.1.13 | Tab Navigation |
| @radix-ui/react-select | 2.2.6 | Select Inputs |
| @radix-ui/react-switch | 1.2.6 | Toggle Switches |
| @radix-ui/react-tooltip | 1.2.8 | Tooltips |
| @radix-ui/react-checkbox | 1.3.3 | Checkboxes |
| @radix-ui/react-popover | 1.1.15 | Popovers |
| @radix-ui/react-avatar | 1.1.11 | User Avatars |
| @radix-ui/react-progress | 1.1.8 | Progress Bars |

### Data Visualization

| Technology | Version | Purpose |
|------------|---------|---------|
| Recharts | 2.15.3 | Charts & Graphs |
| React Window | 1.8.11 | Virtualized Lists |
| TanStack React Table | 8.21.3 | Advanced Data Tables |

### Forms & Validation

| Technology | Version | Purpose |
|------------|---------|---------|
| React Hook Form | 7.56.4 | Form Management |
| @hookform/resolvers | 5.0.1 | Form Validation Resolvers |
| Zod | 3.25.67 | Schema Validation |

### Backend Integration

| Technology | Version | Purpose |
|------------|---------|---------|
| Firebase | 12.6.0 | Authentication & Realtime Database |
| Fetch API | - | HTTP Client |

### Utilities

| Technology | Version | Purpose |
|------------|---------|---------|
| date-fns | 4.1.0 | Date Formatting & Manipulation |
| clsx | 2.1.1 | Conditional Class Names |
| tailwind-merge | 3.4.0 | Tailwind Class Merging |
| sonner | 2.0.3 | Toast Notifications |
| react-error-boundary | 6.0.0 | Error Boundaries |

### 3D Graphics

| Technology | Version | Purpose |
|------------|---------|---------|
| Three.js | 0.181.2 | 3D Graphics Library |
| Vanta | 0.5.24 | Animated 3D Backgrounds |


## Architecture

### Application Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ADMIN PANEL                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                         PRESENTATION LAYER                          │    │
│  ├────────────────────────────────────────────────────────────────────┤    │
│  │                                                                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │    │
│  │  │Dashboard │  │  Users   │  │Analytics │  │  Support │          │    │
│  │  │   View   │  │   View   │  │   View   │  │   View   │          │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │    │
│  │                                                                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │    │
│  │  │  Notif.  │  │  Errors  │  │   Logs   │  │ Settings │          │    │
│  │  │   View   │  │   View   │  │   View   │  │   View   │          │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │    │
│  │                                                                     │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                         STATE MANAGEMENT                            │    │
│  ├────────────────────────────────────────────────────────────────────┤    │
│  │                                                                     │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │    │
│  │  │   Auth       │  │   Realtime   │  │   Portal     │            │    │
│  │  │   Context    │  │   Context    │  │   Context    │            │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘            │    │
│  │                                                                     │    │
│  │  ┌──────────────────────────────────────────────────────────┐     │    │
│  │  │         React Query (Server State & Caching)             │     │    │
│  │  └──────────────────────────────────────────────────────────┘     │    │
│  │                                                                     │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                         SERVICE LAYER                               │    │
│  ├────────────────────────────────────────────────────────────────────┤    │
│  │                                                                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │    │
│  │  │  Admin   │  │   Auth   │  │   API    │  │  Drive   │          │    │
│  │  │   API    │  │ Service  │  │ Service  │  │ Service  │          │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │    │
│  │                                                                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                         │    │
│  │  │Firestore │  │ IndexedDB│  │  Cache   │                         │    │
│  │  │ Realtime │  │ Service  │  │ Service  │                         │    │
│  │  └──────────┘  └──────────┘  └──────────┘                         │    │
│  │                                                                     │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                         BACKEND API                                 │    │
│  ├────────────────────────────────────────────────────────────────────┤    │
│  │                                                                     │    │
│  │  Backend Admin API (Port 8081)                                     │    │
│  │  - JWT Authentication                                               │    │
│  │  - RESTful Endpoints                                                │    │
│  │  - Real-time SSE Events                                             │    │
│  │                                                                     │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │────▶│   View   │────▶│  Service │────▶│   API    │
│  Action  │     │Component │     │  Layer   │     │ Backend  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                       │                                  │
                       │                                  ▼
                       │                          ┌──────────┐
                       │                          │Firestore │
                       │                          │  Redis   │
                       │                          └──────────┘
                       │                                  │
                       ▼                                  │
                 ┌──────────┐                             │
                 │  React   │◀────────────────────────────┘
                 │  Query   │
                 │  Cache   │
                 └──────────┘
                       │
                       ▼
                 ┌──────────┐
                 │   UI     │
                 │  Update  │
                 └──────────┘
```


## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Backend Admin API running on port 8081
- Firebase project with Firestore enabled

### Installation

1. **Navigate to admin panel directory**
   ```bash
   cd admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file based on `.env.example`:

   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:8080
   VITE_API_TIMEOUT=30000

   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Feature Flags
   VITE_ENABLE_ANALYTICS=true
   VITE_ENABLE_REALTIME=true

   # Environment
   VITE_APP_ENV=development
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The admin panel will be available at `http://localhost:5175`

5. **First-time setup**

   On first launch, you'll be prompted to create an admin account:
   - Email address
   - Password (minimum 8 characters)
   - Display name

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5175) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build locally
npm run preview
```

The build output will be in the `dist/` directory.


## Project Structure

```
admin-panel/
├── components/                   # React Components
│   ├── Analytics/                # Analytics dashboard components
│   │   └── AnalyticsView.jsx
│   │
│   ├── Common/                   # Shared components
│   │   ├── ErrorBoundary.jsx
│   │   ├── NotificationProvider.jsx
│   │   └── PageHeader.jsx
│   │
│   ├── Dashboard/                # Dashboard components
│   │   ├── ActivityStatsWidget.jsx
│   │   ├── DashboardView.jsx
│   │   └── StatsCard.jsx
│   │
│   ├── ErrorReports/             # Error monitoring components
│   │   ├── ErrorReportDetail.jsx
│   │   └── ErrorReportsList.jsx
│   │
│   ├── Logs/                     # System logs components
│   │   ├── AllActivityLogs.jsx
│   │   ├── SystemLogs.jsx
│   │   ├── UserCreditsDetail.jsx
│   │   └── UserLogs.jsx
│   │
│   ├── Notifications/            # Notification management
│   │   ├── NotificationEditor.jsx
│   │   └── NotificationList.jsx
│   │
│   ├── Orders/                   # Order management
│   │   └── OrdersView.jsx
│   │
│   ├── Settings/                 # Settings components
│   │   ├── BackupSuccessModal.jsx
│   │   ├── EnvironmentConfig.jsx
│   │   └── SettingsView.jsx
│   │
│   ├── Support/                  # Support ticket components
│   │   ├── SupportDetail.jsx
│   │   └── SupportList.jsx
│   │
│   ├── ui/                       # UI primitives
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── dialog.jsx
│   │   ├── error-boundary.jsx
│   │   ├── skeleton.jsx
│   │   ├── toast.jsx
│   │   └── ...
│   │
│   ├── Users/                    # User management components
│   │   ├── UserDetail.jsx
│   │   ├── UserList.jsx
│   │   ├── UserLogs.jsx
│   │   └── UserProfiles.jsx
│   │
│   ├── AdminHeader.jsx           # Top navigation bar
│   ├── AdminLayout.jsx           # Main layout wrapper
│   ├── AdminLogin.jsx            # Login page
│   ├── AdminRoutes.jsx           # Route configuration
│   └── AdminSidebar.jsx          # Side navigation
│
├── contexts/                     # React Contexts
│   ├── AdminAuthContext.jsx      # Authentication state
│   ├── PortalContext.jsx         # Portal management
│   └── RealtimeContext.jsx       # Real-time updates
│
├── hooks/                        # Custom React Hooks
│   ├── useDebounce.js
│   ├── useLocalStorage.js
│   └── useToast.js
│
├── lib/                          # Utilities & Helpers
│   ├── logger.js                 # Logging utility
│   ├── queryClient.js            # React Query config
│   └── utils.js                  # General utilities
│
├── services/                     # API Services
│   ├── adminApi.js               # Main API client
│   ├── analysisCache.js          # Analysis caching
│   ├── api.js                    # Base API utilities
│   ├── authService.js            # Authentication service
│   ├── drive.js                  # Google Drive integration
│   ├── firestoreRealtimeService.js # Firestore real-time
│   └── indexedDB.js              # Local database
│
├── styles/                       # Global Styles
│   └── globals.css               # Tailwind & custom CSS
│
├── utils/                        # Utility Functions
│   ├── cache.js                  # Caching utilities
│   └── config.js                 # Configuration helpers
│
├── dist/                         # Production build output
├── public/                       # Static assets
│   └── icon/                     # SVG icons
│
├── .env.example                  # Environment variables template
├── .firebaserc                   # Firebase project config
├── AdminApp.jsx                  # Root component
├── admin.css                     # Admin-specific styles
├── firebase.json                 # Firebase hosting config
├── index.html                    # HTML entry point
├── jsconfig.json                 # JavaScript config
├── main.jsx                      # Application entry point
├── package.json                  # Dependencies
├── ShadowRoot.jsx                # Shadow DOM wrapper
├── vercel.json                   # Vercel deployment config
└── vite.config.js                # Vite configuration
```


## Core Features

### Dashboard

The dashboard provides a comprehensive overview of the platform:

**Real-time Statistics:**
- Total users with weekly growth
- 30-day revenue with order count
- Open support tickets
- Total writing profiles

**Activity Feed:**
- Recent user registrations
- Profile creations
- Notification deliveries
- Account status changes
- Timestamps for all activities

**Live Alerts:**
- Real-time notifications for new users
- Instant alerts for new purchases
- Dismissible alert banners
- Direct navigation to relevant sections

**Visual Indicators:**
- Live connection status indicator
- Animated pulse for real-time updates
- Color-coded alert types
- Responsive grid layout

### User Management

**User List View:**
```javascript
// Features:
- Paginated table (10/25/50/100 per page)
- Search by email or name
- Filter by plan (free/premium/enterprise)
- Filter by status (active/locked)
- Sort by registration date, last login, credits
- Bulk selection for mass operations
- Export to JSON/CSV
```

**User Detail View:**
```javascript
// Information displayed:
- Profile: email, name, plan, credits
- Status: locked/unlocked with reason
- Dates: registration, last login
- Statistics: total profiles, activity count
- Actions: lock/unlock, adjust credits, delete, notify
```

**User Actions:**
- **Lock/Unlock**: Prevent/allow user access with reason tracking
- **Credit Adjustment**: Add or deduct credits with audit trail
- **Delete User**: Permanent deletion with confirmation
- **Send Notification**: Direct message to user
- **View Logs**: Complete activity history
- **Manage Profiles**: View and delete writing profiles

**Bulk Operations:**
- Select multiple users via checkboxes
- Lock/unlock selected users
- Delete selected users (with confirmation)
- Clear selection

### Analytics

**User Analytics:**
- Registration trends (daily/weekly/monthly)
- Active users count
- User growth rate
- Plan distribution (free vs paid)
- Geographic distribution

**Usage Analytics:**
- Feature usage statistics
- API call volume
- Credit consumption patterns
- Peak usage times
- Popular features

**Revenue Analytics:**
- Total revenue by period
- Revenue trends over time
- Average order value
- Popular credit packages
- Conversion rates

**Activity Statistics:**
- User engagement metrics
- Session duration
- Feature adoption rates
- Retention metrics

### Notification System

**Create Notification:**
```javascript
{
  title: "Notification Title",
  message: "Notification message",
  type: "info|success|warning|error",
  target: "all|free|premium|enterprise|specific",
  scheduledAt: "ISO timestamp or null for immediate",
  expiresAt: "ISO timestamp or null for no expiry",
  actionUrl: "Optional URL for action button",
  actionText: "Optional button text",
  imageUrl: "Optional image URL"
}
```

**Targeting Options:**
- **All Users**: Send to entire user base
- **Free Users**: Target free plan users
- **Premium Users**: Target premium subscribers
- **Enterprise Users**: Target enterprise customers
- **Specific Users**: Select individual users

**Scheduling:**
- Send immediately
- Schedule for specific date/time
- Recurring notifications (future feature)

**Delivery Tracking:**
- Total sent
- Delivered count
- Read count
- Click-through rate (if action URL provided)

**Email Integration:**
- Send notification via email
- Progress tracking for bulk emails
- Email delivery status
- Retry failed deliveries


### Support System

**Ticket Management:**
```javascript
// Ticket structure:
{
  id: "ticket_id",
  userId: "user_id",
  subject: "Ticket subject",
  message: "User message",
  status: "open|in_progress|resolved|closed",
  priority: "low|medium|high|urgent",
  category: "technical|billing|feature|other",
  createdAt: "timestamp",
  updatedAt: "timestamp",
  replies: [
    {
      message: "Reply message",
      isAdmin: true,
      createdAt: "timestamp"
    }
  ]
}
```

**Features:**
- View all tickets with filters
- Filter by status, priority, category
- Search by subject or user
- Sort by date, priority, status
- Reply to tickets
- Update ticket status
- Add internal notes
- Delete tickets

**Statistics:**
- Total tickets
- Open tickets
- Average resolution time
- Tickets by status
- Tickets by priority
- Response rate

### Error Monitoring

**Error Report Structure:**
```javascript
{
  id: "error_id",
  userId: "user_id",
  message: "Error message",
  stack: "Stack trace",
  url: "Page URL where error occurred",
  userAgent: "Browser information",
  timestamp: "timestamp",
  status: "new|investigating|resolved",
  severity: "low|medium|high|critical",
  context: {
    // Additional context data
  }
}
```

**Features:**
- View all error reports
- Filter by status, severity
- Search by error message
- View stack traces
- See affected users
- Mark as resolved
- Add investigation notes
- Delete resolved errors

### System Logs

**Activity Logs:**
```javascript
// Log entry structure:
{
  id: "log_id",
  userId: "user_id",
  action: "action_type",
  details: {
    // Action-specific details
  },
  timestamp: "timestamp",
  ipAddress: "IP address",
  userAgent: "Browser info"
}
```

**Log Types:**
- User authentication (login, logout, register)
- Credit transactions (purchase, usage, adjustment)
- Profile operations (create, update, delete)
- Content operations (humanize, detect, analyze)
- Admin actions (user lock, credit adjustment)
- System events (backup, cleanup, maintenance)

**Features:**
- View all logs with pagination
- Filter by action type
- Filter by date range
- Search by user
- Export logs
- Cleanup old logs (configurable retention period)

**User-specific Logs:**
- Complete activity history for a user
- Credit transaction history
- Feature usage breakdown
- Login history
- Profile operations


### Settings Management

**Email Configuration:**
```javascript
{
  provider: "smtp|sendgrid|mailgun",
  smtp: {
    host: "smtp.example.com",
    port: 587,
    secure: false,
    auth: {
      user: "username",
      pass: "password"
    }
  },
  from: {
    name: "Graphos AI Studio",
    email: "noreply@graphosai.com"
  }
}
```

**Environment Variables:**
- Manage environment variables for different services
- Categorized by service (backend, frontend, admin)
- Add custom variables
- Delete variables
- Export configuration
- Refresh backend configuration

**System Settings:**
```javascript
{
  maintenance: {
    enabled: false,
    message: "System maintenance in progress"
  },
  registration: {
    enabled: true,
    requireEmailVerification: true
  },
  credits: {
    welcomeBonus: 100,
    referralBonus: 50
  },
  features: {
    chatEnabled: true,
    profilesEnabled: true,
    analysisEnabled: true
  }
}
```

**Backup Management:**
- Create manual backups
- Schedule automatic backups
- Download backups
- Restore from backup
- Delete old backups
- View storage statistics
- Cleanup old backups (keep last N)


## API Integration

### Admin API Service

The admin panel communicates with the backend through a comprehensive API service (`services/adminApi.js`):

**API Modules:**

| Module | Endpoints | Purpose |
|--------|-----------|---------|
| `usersApi` | `/api/admin/users/*` | User management operations |
| `analyticsApi` | `/api/admin/analytics/*` | Analytics and statistics |
| `notificationsApi` | `/api/notifications/*` | Notification management |
| `ordersApi` | `/api/admin/orders/*` | Order and payment data |
| `supportApi` | `/api/support/*` | Support ticket management |
| `logsApi` | `/api/admin/logs/*` | System logs |
| `activityLogsApi` | `/api/admin/activity-logs/*` | User activity logs |
| `settingsApi` | `/api/admin/settings/*` | System settings |
| `emailConfigApi` | `/api/admin/email-config/*` | Email configuration |
| `envConfigApi` | `/api/admin/env-config/*` | Environment variables |
| `backupApi` | `/api/backup/*` | Backup operations |
| `translationApi` | `/api/admin/translate` | Auto-translation |

### API Request Flow

```javascript
// Example: Get user list
import { usersApi } from './services/adminApi';

// With caching (2 minutes)
const users = await usersApi.getAll({ 
  page: 1, 
  limit: 25,
  search: 'john',
  plan: 'premium'
});

// Response:
{
  success: true,
  users: [...],
  pagination: {
    page: 1,
    limit: 25,
    total: 150,
    pages: 6
  }
}
```

### Error Handling

```javascript
try {
  const result = await usersApi.update(userId, data);
  if (result.success) {
    toast.success('User updated successfully');
  }
} catch (error) {
  // Automatic error handling:
  // - 401: Clear auth and redirect to login
  // - 403: Show permission error
  // - 500: Show server error
  toast.error(error.message);
}
```

### Caching Strategy

The admin panel implements intelligent caching:

```javascript
// Cache configuration
const cache = {
  users: 2 * 60 * 1000,        // 2 minutes
  analytics: 5 * 60 * 1000,    // 5 minutes
  support: 1 * 60 * 1000,      // 1 minute
  settings: 10 * 60 * 1000     // 10 minutes
};

// Cache invalidation on mutations
await usersApi.update(userId, data);
// Automatically clears user cache
```

### React Query Integration

```javascript
import { useQuery, useMutation } from '@tanstack/react-query';
import { usersApi } from './services/adminApi';

// Fetch users with automatic caching and refetching
const { data, isLoading, error } = useQuery({
  queryKey: ['users', filters],
  queryFn: () => usersApi.getAll(filters),
  staleTime: 2 * 60 * 1000,
  refetchOnWindowFocus: true
});

// Mutation with optimistic updates
const updateUser = useMutation({
  mutationFn: ({ id, data }) => usersApi.update(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries(['users']);
    toast.success('User updated');
  }
});
```


## Authentication

### JWT-based Authentication

The admin panel uses JWT tokens with automatic refresh:

**Authentication Flow:**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│   Backend   │────▶│  Firestore  │
│   Form      │     │   Verify    │     │   Admin     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │ JWT Token   │            │
       │            │ (15 min)    │            │
       │            └─────────────┘            │
       │                   │                   │
       ▼                   ▼                   │
┌─────────────┐     ┌─────────────┐           │
│  Encrypted  │     │   Refresh   │           │
│   Storage   │     │   Token     │           │
│  (Local)    │     │  (7 days)   │           │
└─────────────┘     └─────────────┘           │
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │Auto Refresh │            │
       │            │(2 min before│            │
       │            │  expiry)    │            │
       └────────────┴─────────────┴────────────┘
```

**Security Features:**

1. **Encrypted Storage**: Tokens encrypted using device fingerprint
2. **Auto Refresh**: Tokens refreshed 2 minutes before expiry
3. **Secure Transmission**: HTTPS only in production
4. **HttpOnly Cookies**: Refresh tokens stored in HttpOnly cookies
5. **CSRF Protection**: CSRF tokens for state-changing operations

**Authentication Service:**

```javascript
// services/authService.js

// Login
const result = await authApi.login(email, password);
if (result.success) {
  setAuthData(result.accessToken, result.admin, result.expiresIn);
  startTokenRefresh();
}

// Auto refresh
startTokenRefresh(); // Automatically refreshes before expiry

// Logout
await authApi.logout();
clearAuthData();
stopTokenRefresh();

// Check authentication
const isAuth = isAuthenticated(); // Checks token validity
```

**Protected Routes:**

```javascript
// AdminRoutes.jsx
export default function AdminRoutes() {
  const { isAdminAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAdminAuthenticated) return <AdminLogin />;

  return <AdminLayout>...</AdminLayout>;
}
```

**First-time Setup:**

```javascript
// Initial admin account creation
const result = await authApi.setup(email, password, name);
if (result.success) {
  // Auto-login after setup
  await loginAdmin(email, password);
}
```

### Password Security

- **Hashing**: Argon2 with salt (backend)
- **Minimum Length**: 8 characters
- **Complexity**: Enforced on backend
- **Change Password**: Requires current password verification
- **Password Reset**: Email-based reset flow (future feature)


## Real-time Updates

### Server-Sent Events (SSE)

The admin panel uses SSE for real-time data synchronization:

**Realtime Context:**

```javascript
// contexts/RealtimeContext.jsx

const RealtimeContext = createContext();

export function RealtimeProvider({ children }) {
  const [overview, setOverview] = useState(null);
  const [realtimeEvents, setRealtimeEvents] = useState({});
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Connect to SSE endpoint
  useEffect(() => {
    const eventSource = new EventSource('/api/admin/realtime/overview');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOverview(data);
      setRealtimeConnected(true);
    };

    eventSource.onerror = () => {
      setRealtimeConnected(false);
    };

    return () => eventSource.close();
  }, []);

  return (
    <RealtimeContext.Provider value={{ 
      overview, 
      realtimeEvents, 
      realtimeConnected 
    }}>
      {children}
    </RealtimeContext.Provider>
  );
}
```

**Real-time Events:**

| Event Type | Description | Data |
|------------|-------------|------|
| `overview` | Dashboard statistics update | User count, revenue, tickets |
| `new_user` | New user registration | User details, timestamp |
| `new_order` | New purchase | Order details, amount |
| `ticket_update` | Support ticket status change | Ticket ID, new status |
| `error_report` | New error reported | Error details, user |

**Usage in Components:**

```javascript
import { useRealtime } from '../../contexts/RealtimeContext';

function DashboardView() {
  const { 
    overview, 
    realtimeEvents, 
    realtimeConnected 
  } = useRealtime();

  // Show live indicator
  {realtimeConnected && (
    <span className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      Live
    </span>
  )}

  // Display real-time data
  <StatsCard value={overview?.totalUsers || 0} />
}
```

**Connection Management:**

- **Auto Reconnect**: Automatically reconnects on connection loss
- **Heartbeat**: Server sends heartbeat every 30 seconds
- **Timeout**: 60-second timeout for inactive connections
- **Fallback**: Falls back to polling if SSE not supported

### Firestore Real-time Listeners

For specific data, the panel uses Firestore real-time listeners:

```javascript
// services/firestoreRealtimeService.js

// Listen to user changes
const unsubscribe = onSnapshot(
  collection(db, 'users'),
  (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        // New user added
      }
      if (change.type === 'modified') {
        // User updated
      }
      if (change.type === 'removed') {
        // User deleted
      }
    });
  }
);

// Cleanup
return () => unsubscribe();
```

**Real-time Features:**

- User list updates
- Support ticket status changes
- Notification delivery status
- Order confirmations
- Error report submissions


## Deployment

### Firebase Hosting

**Configuration:**

```json
// firebase.json
{
  "hosting": {
    "site": "notes-sync-472107-admin",
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

**Deploy to Firebase:**

```bash
# Build the application
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy to specific site
firebase deploy --only hosting:notes-sync-472107-admin
```

### Vercel Deployment

**Configuration:**

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Deploy to Vercel:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables

Set these in your deployment platform:

```env
VITE_API_BASE_URL=https://api.graphosai.com
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_REALTIME=true
VITE_APP_ENV=production
```


### Build Optimization

**Vite Configuration:**

```javascript
// vite.config.js
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'data-vendor': ['@tanstack/react-query', '@tanstack/react-table'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'chart-vendor': ['recharts'],
          'radix-vendor': [...], // All Radix UI components
          'date-vendor': ['date-fns', 'react-day-picker'],
          'utils-vendor': ['clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  }
});
```

**Performance Optimizations:**

- **Code Splitting**: Route-based lazy loading
- **Vendor Chunking**: Separate chunks for libraries
- **Tree Shaking**: Remove unused code
- **Minification**: esbuild for fast minification
- **Asset Optimization**: Image compression and lazy loading
- **Cache Headers**: Long-term caching for static assets


## Security

### Security Measures

| Feature | Implementation |
|---------|----------------|
| **Authentication** | JWT tokens with automatic refresh |
| **Token Storage** | Encrypted local storage using device fingerprint |
| **Password Security** | Argon2 hashing on backend |
| **HTTPS Only** | Enforced in production |
| **CORS Protection** | Whitelist-based origin validation |
| **XSS Prevention** | React's built-in XSS protection |
| **CSRF Protection** | CSRF tokens for mutations |
| **Rate Limiting** | Backend rate limiting per admin |
| **Input Validation** | Zod schema validation |
| **SQL Injection** | Firestore (NoSQL) prevents SQL injection |
| **Audit Logging** | All admin actions logged |

### Access Control

**Admin Roles** (Future Enhancement):

```javascript
// Planned role-based access control
const roles = {
  super_admin: {
    permissions: ['*'] // All permissions
  },
  admin: {
    permissions: [
      'users.read',
      'users.update',
      'support.manage',
      'notifications.send'
    ]
  },
  support: {
    permissions: [
      'users.read',
      'support.manage'
    ]
  },
  viewer: {
    permissions: [
      'users.read',
      'analytics.read'
    ]
  }
};
```

### Data Protection

**Sensitive Data Handling:**

- Passwords never stored in frontend
- Credit card data handled by Lemon Squeezy (PCI compliant)
- Personal data encrypted at rest (Firestore)
- Secure token transmission (HTTPS)
- Automatic session timeout (15 minutes)

**Audit Trail:**

All admin actions are logged:

```javascript
{
  adminId: "admin_id",
  action: "user_locked",
  targetUserId: "user_id",
  reason: "Suspicious activity",
  timestamp: "2024-01-06T10:30:00Z",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0..."
}
```


## Performance

### Optimization Strategies

**Frontend Performance:**

| Strategy | Implementation | Impact |
|----------|----------------|--------|
| Code Splitting | Route-based lazy loading | -60% initial bundle |
| Memoization | React.memo, useMemo, useCallback | -40% re-renders |
| Virtual Scrolling | react-window for large lists | 10x faster lists |
| Image Optimization | Lazy loading, WebP format | -50% image size |
| Caching | React Query + local cache | -80% API calls |
| Debouncing | Search inputs debounced | -90% API calls |
| Prefetching | Link prefetching | Instant navigation |

**Bundle Size:**

```
dist/
├── index.html                    2 KB
├── assets/
│   ├── index-[hash].js         120 KB (main)
│   ├── react-vendor-[hash].js  140 KB (React)
│   ├── data-vendor-[hash].js    80 KB (React Query)
│   ├── chart-vendor-[hash].js   90 KB (Recharts)
│   ├── radix-vendor-[hash].js  110 KB (Radix UI)
│   └── ...
└── Total: ~650 KB (gzipped: ~180 KB)
```

**Loading Performance:**

- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1

### Caching Strategy

**Multi-layer Caching:**

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Cache                         │
│                  (Static Assets)                         │
│                   Cache-Control                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  React Query Cache                       │
│              (API Responses, 2-10 min)                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Local Cache                            │
│            (Analysis Results, 30 min)                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   IndexedDB                              │
│              (Offline Data, Persistent)                  │
└─────────────────────────────────────────────────────────┘
```


## UI/UX Features

### Design System

**Color Palette:**

```css
/* Light Mode */
--color-primary: #1a1a1a;
--color-secondary: #666666;
--color-accent: #3b82f6;
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-surface: #ffffff;
--color-surface-secondary: #f5f5f5;

/* Dark Mode */
--color-primary: #ffffff;
--color-secondary: #a3a3a3;
--color-accent: #60a5fa;
--color-success: #34d399;
--color-warning: #fbbf24;
--color-error: #f87171;
--color-surface: #1a1a1a;
--color-surface-secondary: #262626;
```

**Typography:**

- Font Family: Inter (system font fallback)
- Font Sizes: 12px - 32px (responsive)
- Line Heights: 1.2 - 1.8
- Font Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

**Spacing System:**

```
0.5 = 2px
1   = 4px
2   = 8px
3   = 12px
4   = 16px
5   = 20px
6   = 24px
8   = 32px
10  = 40px
12  = 48px
```

### Responsive Design

**Breakpoints:**

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

**Mobile-First Approach:**

- All components designed for mobile first
- Progressive enhancement for larger screens
- Touch-friendly targets (min 44x44px)
- Responsive tables with horizontal scroll
- Collapsible sidebar on mobile

### Accessibility

**WCAG 2.1 AA Compliance:**

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Color contrast ratios > 4.5:1
- Screen reader support
- Alt text for images
- Form labels and error messages

**Keyboard Shortcuts:**

```
Ctrl/Cmd + K: Search
Ctrl/Cmd + /: Toggle sidebar
Esc: Close modals/dialogs
Tab: Navigate forward
Shift + Tab: Navigate backward
Enter: Submit forms
Space: Toggle checkboxes/switches
```


## Troubleshooting

### Common Issues

**1. Cannot connect to backend**

```
Error: Unable to connect to server
```

**Solution:**
- Ensure backend-admin is running on port 8081
- Check `VITE_API_BASE_URL` in `.env`
- Verify CORS settings in backend
- Check network connectivity

**2. Authentication fails**

```
Error: Session expired
```

**Solution:**
- Clear browser cache and local storage
- Check token expiry settings
- Verify backend authentication service
- Re-login with credentials

**3. Real-time updates not working**

```
Warning: SSE connection failed
```

**Solution:**
- Check backend SSE endpoint
- Verify firewall/proxy settings
- Check browser console for errors
- Fallback to manual refresh

**4. Build fails**

```
Error: Build failed with errors
```

**Solution:**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check Node.js version (18.x required)
- Verify all environment variables are set

**5. Slow performance**

**Solution:**
- Clear React Query cache
- Reduce pagination limit
- Disable real-time updates temporarily
- Check network speed
- Clear browser cache

### Debug Mode

Enable debug logging:

```javascript
// lib/logger.js
const DEBUG = true; // Set to true for debug logs

// View logs in browser console
localStorage.setItem('debug', 'admin:*');
```

### Support

For issues not covered here:

1. Check browser console for errors
2. Review backend logs
3. Check Firebase console for database issues
4. Contact development team


## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   ```bash
   npm run lint
   npm run build
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**

### Code Style

**JavaScript/React:**
- Use functional components with hooks
- Use arrow functions for components
- Destructure props and state
- Use meaningful variable names
- Add JSDoc comments for complex functions

**CSS/Tailwind:**
- Use Tailwind utility classes
- Follow mobile-first approach
- Use custom CSS only when necessary
- Keep styles consistent with design system

**File Naming:**
- Components: PascalCase (e.g., `UserList.jsx`)
- Utilities: camelCase (e.g., `formatDate.js`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```


## Future Enhancements

### Planned Features

**Q1 2026:**
- [ ] Role-based access control (RBAC)
- [ ] Advanced analytics with custom date ranges
- [ ] Email template editor
- [ ] Automated backup scheduling
- [ ] Multi-language support for admin panel

**Q2 2026:**
- [ ] Two-factor authentication (2FA)
- [ ] Audit log export
- [ ] Custom dashboard widgets
- [ ] Advanced user segmentation
- [ ] A/B testing for notifications

**Q3 2026:**
- [ ] Mobile app (React Native)
- [ ] Webhook management
- [ ] API key management
- [ ] Custom reports builder
- [ ] Integration marketplace

**Q4 2026:**
- [ ] AI-powered insights
- [ ] Predictive analytics
- [ ] Automated user engagement
- [ ] Advanced fraud detection
- [ ] Multi-tenant support

### Roadmap

```
2026 Q1: Security & Access Control
├── RBAC implementation
├── 2FA authentication
└── Enhanced audit logging

2026 Q2: Analytics & Insights
├── Custom dashboards
├── Advanced reporting
└── User behavior analytics

2026 Q3: Integrations & APIs
├── Webhook system
├── Public API
└── Third-party integrations

2026 Q4: AI & Automation
├── AI-powered insights
├── Automated workflows
└── Predictive analytics
```


## License

This project is part of Graphos AI Studio and is proprietary software. All rights reserved.

For licensing inquiries, please contact: [contact@graphosai.com](mailto:contact@graphosai.com)

---

## Related Documentation

- [Main Project README](../README.md)
- [Backend API Documentation](../backend/README.md)
- [Web App Documentation](../web-app/README.md)
- [Chrome Extension Documentation](../README.md#chrome-extension)

---

## Contact & Support

- **Website**: [https://graphosai.com](https://graphosai.com)
- **Admin Panel**: [https://admin.graphosai.com](https://admin.graphosai.com)
- **Email**: [support@graphosai.com](mailto:support@graphosai.com)
- **GitHub**: [https://github.com/alvesoscar517-cloud/Graphos-AI-Studio](https://github.com/alvesoscar517-cloud/Graphos-AI-Studio)

---

**Built with ❤️ by the Graphos AI Studio Team**

*Last Updated: January 6, 2026*
