/**
 * Main Configuration
 * Centralized config management
 */

module.exports = {
  // Server
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'production',
  
  // Google Cloud
  PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT || 'notes-sync-472107',
  LOCATION: process.env.VERTEX_AI_LOCATION || 'us-central1',
  
  // API
  API_VERSION: 'v1',
  REQUEST_TIMEOUT: 30000,
  MAX_REQUEST_SIZE: '10mb',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Caching
  CACHE_TTL: {
    PROFILE: 5 * 60 * 1000,      // 5 minutes
    EMBEDDING: 30 * 60 * 1000,   // 30 minutes
    ANALYSIS: 10 * 60 * 1000     // 10 minutes
  },
  
  CACHE_MAX_SIZE: {
    EMBEDDING: 1000,
    ANALYSIS: 100
  },
  
  // Gemini
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
  EMBEDDING_MODEL: 'text-embedding-004',
  MAX_TEXT_LENGTH: 20000,
  
  // Admin
  ADMIN_KEY: process.env.ADMIN_KEY || 'your-secure-admin-key-here',
  ADMIN_PANEL_URL: process.env.ADMIN_PANEL_URL || 'https://your-domain.com/admin',
  
  // Email (if using)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  
  // Feature Flags
  FEATURES: {
    ENABLE_CACHING: true,
    ENABLE_RATE_LIMITING: true,
    ENABLE_ANALYTICS: true,
    ENABLE_EMAIL: false
  }
};
