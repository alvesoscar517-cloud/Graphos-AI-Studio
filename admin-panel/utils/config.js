/**
 * Application Configuration
 * Centralized config for admin panel
 */

// API Base URL - auto-detect based on environment
export function getApiBaseUrl() {
  // Use env variable if set, otherwise use Cloud Run URL
  return import.meta.env.VITE_API_URL || 'https://ai-backend-admin-472729326429.us-central1.run.app';
}

// Legacy CONFIG export for backward compatibility
export const CONFIG = {
  API_BASE_URL: getApiBaseUrl()
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'AI Content Authenticator Admin',
  VERSION: '2.0.0',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Cache TTL (milliseconds)
  CACHE_TTL: {
    SHORT: 60 * 1000,        // 1 minute
    MEDIUM: 5 * 60 * 1000,   // 5 minutes
    LONG: 30 * 60 * 1000     // 30 minutes
  },
  
  // Debounce delays
  DEBOUNCE: {
    SEARCH: 300,
    SAVE: 500
  },
  
  // Notification types
  NOTIFICATION_TYPES: [
    { value: 'info', label: 'Info', icon: 'info.svg', color: '#666' },
    { value: 'success', label: 'Success', icon: 'check-circle.svg', color: '#000' },
    { value: 'warning', label: 'Warning', icon: 'alert-triangle.svg', color: '#999' },
    { value: 'error', label: 'Error', icon: 'x-circle.svg', color: '#000' },
    { value: 'announcement', label: 'Announcement', icon: 'megaphone.svg', color: '#333' }
  ],
  
  // Priority levels
  PRIORITY_LEVELS: [
    { value: 'low', label: 'Low', color: '#ccc' },
    { value: 'medium', label: 'Medium', color: '#999' },
    { value: 'high', label: 'High', color: '#666' },
    { value: 'urgent', label: 'Urgent', color: '#000' }
  ],
  
  // Credit segments for analytics
  CREDIT_SEGMENTS: [
    { value: 'noCredits', label: 'No Credits', color: '#ef4444', desc: 'Users with 0 credits' },
    { value: 'low', label: 'Low (1-50)', color: '#f59e0b', desc: 'Users with 1-50 credits' },
    { value: 'medium', label: 'Medium (51-200)', color: '#3b82f6', desc: 'Users with 51-200 credits' },
    { value: 'high', label: 'High (200+)', color: '#10b981', desc: 'Users with 200+ credits' }
  ],
  
  // Ticket statuses
  TICKET_STATUSES: [
    { value: 'open', label: 'Open', color: '#f59e0b' },
    { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
    { value: 'resolved', label: 'Resolved', color: '#10b981' },
    { value: 'closed', label: 'Closed', color: '#6b7280' }
  ],
  
  // Target segments for notifications
  TARGET_SEGMENTS: [
    { value: 'inactive', label: 'Inactive users (30+ days)', icon: '○', desc: 'Users who haven\'t logged in for 30+ days' },
    { value: 'new', label: 'New users (< 7 days)', icon: '●', desc: 'Users who registered in the last 7 days' },
    { value: 'has_profile', label: 'Has voice profile', icon: '◆', desc: 'Users who have created at least one voice profile' },
    { value: 'no_profile', label: 'No voice profile', icon: '✕', desc: 'Users who haven\'t created any voice profile' },
    { value: 'low_credits', label: 'Low credits (< 10)', icon: '!', desc: 'Users with less than 10 credits remaining' },
    { value: 'active', label: 'Active users (7 days)', icon: '[OK]', desc: 'Users who have been active in the last 7 days' }
  ],
  
  // CTA action types
  CTA_ACTIONS: [
    { value: 'none', label: 'No action' },
    { value: 'url', label: 'Open URL' },
    { value: 'view', label: 'Navigate to view' }
  ],
  
  // Target views for CTA
  TARGET_VIEWS: [
    { value: 'home', label: 'Home' },
    { value: 'aistudio-editor', label: 'AI Studio' },
    { value: 'workspace', label: 'AI Workspace' },
    { value: 'settings', label: 'Settings' },
    { value: 'upgrade', label: 'Upgrade Plan' }
  ],
  
  // Languages (matches main app's 15 languages)
  LANGUAGES: [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'vi', label: 'Vietnamese', flag: '🇻🇳' },
    { code: 'zh-CN', label: 'Chinese (Simplified)', flag: '🇨🇳' },
    { code: 'es', label: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', label: 'French', flag: '🇫🇷' },
    { code: 'de', label: 'German', flag: '🇩🇪' },
    { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', label: 'Korean', flag: '🇰🇷' },
    { code: 'pt', label: 'Portuguese', flag: '🇧🇷' },
    { code: 'ru', label: 'Russian', flag: '🇷🇺' },
    { code: 'it', label: 'Italian', flag: '🇮🇹' },
    { code: 'th', label: 'Thai', flag: '🇹🇭' },
    { code: 'id', label: 'Indonesian', flag: '🇮🇩' },
    { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', label: 'Hindi', flag: '🇮🇳' }
  ]
};

export default APP_CONFIG;
