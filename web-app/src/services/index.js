/**
 * Services Index
 * Re-exports all services for easy importing
 */

// API Services
export * from './api';
export { kyClient } from './api/kyClient';

// Token Management
export { 
  tokenService,
  getValidToken,
  refreshToken,
  clearTokens,
  setTokens,
  subscribeToTokenEvents
} from './tokenService';

// Real-time Services
export { default as realtimeService, realtimeService as realtime } from './realtimeService';

// Health Check
export { default as healthCheckService, healthCheckService as healthCheck } from './healthCheck';

// Notification Service
export {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  markNotificationAsClicked,
  deleteNotification,
  handleCtaAction,
  simulateNotification
} from './notificationService';

// RxDB Database (replaces IndexedDB)
export { getDatabase, setupFirestoreSync, clearLocalData } from '../db/database';

// Analysis Cache
export { default as analysisCache } from './analysisCache';
