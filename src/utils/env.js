/**
 * Environment Configuration
 * Centralized access to environment variables
 */

export const ENV = {
  // Environment
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  
  // API
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  // Feature Flags
  ENABLE_DEV_MODE: import.meta.env.VITE_ENABLE_DEV_MODE === 'true',
  ENABLE_MONITORING: import.meta.env.VITE_ENABLE_MONITORING === 'true',
  ENABLE_ERROR_TRACKING: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
  
  // Analytics
  GA_TRACKING_ID: import.meta.env.VITE_GA_TRACKING_ID,
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  
  // Development
  DEV_USER_EMAIL: import.meta.env.VITE_DEV_USER_EMAIL || 'dev@example.com',
  DEV_USER_NAME: import.meta.env.VITE_DEV_USER_NAME || 'Development User'
}

/**
 * Validate environment configuration
 */
export function validateEnv() {
  const warnings = []
  
  if (ENV.IS_PROD) {
    if (!ENV.API_BASE_URL || ENV.API_BASE_URL.includes('localhost')) {
      warnings.push('API_BASE_URL should be set to production URL')
    }
    
    if (ENV.ENABLE_DEV_MODE) {
      warnings.push('DEV_MODE should be disabled in production')
    }
  }
  
  if (warnings.length > 0) {
    console.warn('[WARNING] Environment Configuration Warnings:')
    warnings.forEach(w => console.warn(`  - ${w}`))
  }
  
  return warnings.length === 0
}

// Log environment on load
if (ENV.IS_DEV) {
  console.log('[SETTINGS] Environment Configuration:', {
    mode: ENV.NODE_ENV,
    apiUrl: ENV.API_BASE_URL,
    devMode: ENV.ENABLE_DEV_MODE,
    monitoring: ENV.ENABLE_MONITORING
  })
}

// Validate in production
if (ENV.IS_PROD) {
  validateEnv()
}
