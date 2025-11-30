/**
 * Main Configuration
 * Centralized config management
 */

/**
 * Main Configuration
 * Centralized config management with security validation
 */

const NODE_ENV = process.env.NODE_ENV || 'production'
const IS_PRODUCTION = NODE_ENV === 'production'

// Validate required environment variables in production
function validateConfig() {
  const warnings = [];
  
  if (IS_PRODUCTION) {
    const required = [
      'GOOGLE_CLOUD_PROJECT'
    ]
    
    const missing = required.filter(key => !process.env[key])
    
    if (missing.length > 0) {
      warnings.push(`Missing environment variables: ${missing.join(', ')}`);
      console.error(`[CONFIG WARNING] Missing required environment variables: ${missing.join(', ')}`);
    }
  }
  
  return warnings;
}

// Run validation (log warnings but don't throw - let server start for health checks)
const configWarnings = validateConfig();

module.exports = {
  // Config validation warnings (empty if all good)
  CONFIG_WARNINGS: configWarnings,
  
  // Server
  PORT: process.env.PORT || 8080,
  NODE_ENV,
  IS_PRODUCTION,
  IS_DEVELOPMENT: !IS_PRODUCTION,
  
  // Google Cloud
  PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT || (IS_PRODUCTION ? null : 'notes-sync-472107'),
  LOCATION: process.env.VERTEX_AI_LOCATION || 'us-central1',
  
  // API
  API_VERSION: 'v1',
  REQUEST_TIMEOUT: 30000,
  MAX_REQUEST_SIZE: '10mb',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: IS_PRODUCTION ? 100 : 1000, // More lenient in dev
  
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
  ADMIN_PANEL_URL: process.env.ADMIN_PANEL_URL || 'https://your-domain.com/admin',
  
  // Email (if using)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  
  // Feature Flags
  FEATURES: {
    ENABLE_CACHING: true,
    ENABLE_RATE_LIMITING: IS_PRODUCTION, // Only in production
    ENABLE_ANALYTICS: IS_PRODUCTION,
    ENABLE_EMAIL: false
  },
  
  // Security
  SECURITY: {
    // CORS whitelist (add your domains)
    CORS_WHITELIST: process.env.CORS_WHITELIST 
      ? process.env.CORS_WHITELIST.split(',')
      : IS_PRODUCTION 
        ? [] // Must be configured in production
        : ['http://localhost:5173', 'http://localhost:3000'],
    
    // Request size limits
    MAX_PROFILE_SAMPLES: 100,
    MAX_BATCH_SIZE: 10,
    
    // Session
    SESSION_SECRET: process.env.SESSION_SECRET || (IS_PRODUCTION ? null : 'dev-session-secret'),
    SESSION_MAX_AGE: 24 * 60 * 60 * 1000 // 24 hours
  }
};
