/**
 * Main Configuration - Powered by Convict
 * Type-safe, validated configuration management
 * 
 * @module config
 */

const convictConfig = require('./schema');

const logger = require('../utils/logger');
// ============================================================================
// ENVIRONMENT-SPECIFIC OVERRIDES
// ============================================================================

const env = convictConfig.get('env');

// Load environment-specific config file if exists
const path = require('path');
const fs = require('fs');

const envConfigPath = path.join(__dirname, `config.${env}.json`);
if (fs.existsSync(envConfigPath)) {
  try {
    convictConfig.loadFile(envConfigPath);
    logger.info(`[CONFIG] Loaded environment config: ${envConfigPath}`);
  } catch (error) {
    logger.warn(`[CONFIG WARNING] Failed to load ${envConfigPath}:`, error.message);
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

// Validate configuration - log errors but don't exit immediately
// This allows the server to start and show logs in Cloud Run
let configValidationError = null;
try {
  // Use 'warn' to allow unknown properties during migration
  convictConfig.validate({ allowed: 'warn' });
  logger.info('[CONFIG] Configuration validated successfully');
} catch (error) {
  configValidationError = error;
  logger.error('[CONFIG ERROR] Configuration validation failed:', error.message);
  logger.error('[CONFIG ERROR] Full error:', JSON.stringify(error, null, 2));
  logger.error('[CONFIG ERROR] Current config values:');
  try {
    const props = convictConfig.getProperties();
    // Log non-sensitive config for debugging
    logger.error('[CONFIG ERROR] env:', props.env);
    logger.error('[CONFIG ERROR] server.port:', props.server?.port);
    logger.error('[CONFIG ERROR] gcp.projectId:', props.gcp?.projectId);
    logger.error('[CONFIG ERROR] email.smtpPort:', props.email?.smtpPort);
  } catch (e) {
    logger.error('[CONFIG ERROR] Could not get properties:', e.message);
  }
  
  // In production, we'll still continue but log a warning
  // The server will start but may have issues
  if (convictConfig.get('env') === 'production') {
    logger.error('[CONFIG WARNING] Configuration validation failed in production, but continuing to allow debugging');
    // Don't exit - let the server start so we can see logs
  }
}

// Additional validation for required secrets in production
if (convictConfig.get('env') === 'production') {
  const missingSecrets = [];
  
  // Check critical secrets
  if (!convictConfig.get('security.sessionSecret')) {
    missingSecrets.push('SESSION_SECRET');
  }
  
  if (missingSecrets.length > 0) {
    logger.warn(`[CONFIG WARNING] Missing recommended secrets: ${missingSecrets.join(', ')}`);
  }
}

// ============================================================================
// DERIVED VALUES
// ============================================================================

const NODE_ENV = convictConfig.get('env');
const IS_PRODUCTION = NODE_ENV === 'production';
const IS_DEVELOPMENT = NODE_ENV === 'development';

// ============================================================================
// LEGACY COMPATIBILITY EXPORTS
// ============================================================================

// Export both new convict-style and legacy format for backward compatibility
module.exports = {
  // Convict config object (for new code)
  config: convictConfig,
  
  // Legacy exports (for backward compatibility)
  CONFIG_WARNINGS: [],
  
  // Server
  PORT: convictConfig.get('server.port'),
  NODE_ENV,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  
  // Google Cloud
  PROJECT_ID: convictConfig.get('gcp.projectId') || (IS_PRODUCTION ? null : 'notes-sync-472107'),
  LOCATION: convictConfig.get('gcp.location'),
  
  // API
  API_VERSION: 'v1',
  REQUEST_TIMEOUT: convictConfig.get('server.requestTimeout'),
  MAX_REQUEST_SIZE: convictConfig.get('server.maxRequestSize'),
  
  // Redis
  REDIS_URL: convictConfig.get('redis.url'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: convictConfig.get('rateLimit.window'),
  RATE_LIMIT_MAX_REQUESTS: IS_PRODUCTION 
    ? convictConfig.get('rateLimit.maxRequests') 
    : 1000,
  
  // Caching
  CACHE_TTL: {
    PROFILE: convictConfig.get('cache.profileTtl'),
    EMBEDDING: convictConfig.get('cache.embeddingTtl'),
    ANALYSIS: convictConfig.get('cache.analysisTtl')
  },
  
  CACHE_MAX_SIZE: {
    EMBEDDING: convictConfig.get('cache.maxEmbeddings'),
    ANALYSIS: convictConfig.get('cache.maxAnalysis')
  },
  
  // AI Detection
  AI_DETECTION: {
    MAX_CHUNK_SIZE: convictConfig.get('aiDetection.maxChunkSize'),
    UNCERTAIN_RANGE_LOW: convictConfig.get('aiDetection.uncertainRangeLow'),
    UNCERTAIN_RANGE_HIGH: convictConfig.get('aiDetection.uncertainRangeHigh'),
    DEEP_ANALYSIS_CONFIDENCE_THRESHOLD: convictConfig.get('aiDetection.deepAnalysisThreshold')
  },
  
  // Gemini
  GEMINI_MODEL: convictConfig.get('gemini.model'),
  EMBEDDING_MODEL: convictConfig.get('gemini.embeddingModel'),
  MAX_TEXT_LENGTH: convictConfig.get('gemini.maxTextLength'),
  GEMINI_API_KEY: convictConfig.get('gemini.apiKey'),
  
  // Admin
  ADMIN_PANEL_URL: convictConfig.get('admin.panelUrl'),
  
  // Email
  SMTP_HOST: convictConfig.get('email.smtpHost'),
  SMTP_PORT: convictConfig.get('email.smtpPort'),
  SMTP_USER: convictConfig.get('email.smtpUser'),
  SMTP_PASS: convictConfig.get('email.smtpPass'),
  EMAIL_FROM: convictConfig.get('email.fromAddress'),
  EMAIL_FROM_NAME: convictConfig.get('email.fromName'),
  EMAIL_SUPPORT: convictConfig.get('email.supportEmail'),
  EMAIL_BILLING: convictConfig.get('email.billingEmail'),
  
  // Feature Flags
  FEATURES: {
    ENABLE_CACHING: convictConfig.get('features.enableCaching'),
    ENABLE_RATE_LIMITING: IS_PRODUCTION 
      ? convictConfig.get('features.enableRateLimiting') 
      : false,
    ENABLE_ANALYTICS: IS_PRODUCTION 
      ? convictConfig.get('features.enableAnalytics') 
      : false,
    ENABLE_EMAIL: convictConfig.get('features.enableEmail'),
    ENABLE_DEBUG_ENDPOINTS: IS_DEVELOPMENT 
      ? true 
      : convictConfig.get('features.enableDebugEndpoints')
  },
  
  // Security
  SECURITY: {
    CORS_WHITELIST: convictConfig.get('security.corsWhitelist').length > 0
      ? convictConfig.get('security.corsWhitelist')
      : IS_PRODUCTION 
        ? [] 
        : ['http://localhost:5173', 'http://localhost:3000'],
    
    MAX_PROFILE_SAMPLES: convictConfig.get('security.maxProfileSamples'),
    MAX_BATCH_SIZE: convictConfig.get('security.maxBatchSize'),
    
    SESSION_SECRET: convictConfig.get('security.sessionSecret') || 
      (IS_PRODUCTION ? null : 'dev-session-secret'),
    SESSION_MAX_AGE: convictConfig.get('security.sessionMaxAge'),
    
    SANITIZE_INPUT: convictConfig.get('security.sanitizeInput')
  },
  
  // JWT Secret for email auth
  JWT_SECRET: convictConfig.get('security.jwtSecret'),
  
  // Helper methods
  get: (path) => convictConfig.get(path),
  has: (path) => convictConfig.has(path),
  getProperties: () => convictConfig.getProperties()
};
