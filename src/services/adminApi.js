/**
 * Admin API Service
 * Handles all admin panel API calls
 */

const API_BASE_URL = 'https://ai-content-authenticator-472729326429.us-central1.run.app';

// Get admin key from localStorage or environment
const getAdminKey = () => {
  return localStorage.getItem('adminKey') || '';
};

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const adminKey = getAdminKey();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': adminKey,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const adminAuth = {
  setAdminKey: (key) => {
    localStorage.setItem('adminKey', key);
  },
  
  getAdminKey: () => {
    return localStorage.getItem('adminKey');
  },
  
  clearAdminKey: () => {
    localStorage.removeItem('adminKey');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('adminKey');
  }
};

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notificationsApi = {
  // Get all notifications
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/api/admin/notifications?${params}`);
  },

  // Create notification
  create: async (notification) => {
    return apiCall('/api/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  },

  // Update notification
  update: async (id, updates) => {
    return apiCall(`/api/admin/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete notification
  delete: async (id) => {
    return apiCall(`/api/admin/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  // Send notification
  send: async (id) => {
    return apiCall(`/api/admin/notifications/${id}/send`, {
      method: 'POST',
    });
  },

  // Get notification stats
  getStats: async (id) => {
    return apiCall(`/api/admin/notifications/${id}/stats`);
  },
};

// ============================================================================
// USERS
// ============================================================================

export const usersApi = {
  // Get all users
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiCall(`/api/admin/users?${queryParams}`);
  },

  // Get user details
  getById: async (id) => {
    return apiCall(`/api/admin/users/${id}`);
  },
};

// ============================================================================
// ANALYTICS
// ============================================================================

export const analyticsApi = {
  // Get overview
  getOverview: async () => {
    return apiCall('/api/admin/analytics/overview');
  },
};

// ============================================================================
// SETTINGS
// ============================================================================

export const settingsApi = {
  // Get settings
  get: async () => {
    return apiCall('/api/admin/settings');
  },

  // Update settings
  update: async (settings) => {
    return apiCall('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

// ============================================================================
// TRANSLATION
// ============================================================================

export const translationApi = {
  // Auto-translate text using Gemini
  translate: async (text, sourceLang = 'vi', targetLang = 'en') => {
    try {
      // Use Gemini for translation
      const response = await fetch('https://ai-content-authenticator-472729326429.us-central1.run.app/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          source_lang: sourceLang,
          target_lang: targetLang
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      return {
        translations: {
          [targetLang]: data.translated_text
        }
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  },
};

// ============================================================================
// ADVANCED ANALYTICS
// ============================================================================

export const advancedAnalyticsApi = {
  // Get user analytics
  getUserAnalytics: async (days = 30) => {
    return apiCall(`/api/admin/analytics/users?days=${days}`);
  },

  // Get usage analytics
  getUsageAnalytics: async () => {
    return apiCall('/api/admin/analytics/usage');
  },
};
