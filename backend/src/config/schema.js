/**
 * Configuration Schema - Powered by Convict
 * Type-safe, validated configuration management
 * 
 * @module config/schema
 */

const convict = require('convict');

// ============================================================================
// CUSTOM FORMATS
// ============================================================================

// Add custom format for comma-separated list
convict.addFormat({
  name: 'comma-separated-list',
  validate: (val) => {
    if (val && typeof val !== 'string' && !Array.isArray(val)) {
      throw new Error('must be a string or array');
    }
  },
  coerce: (val) => {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
});

// ============================================================================
// CONFIGURATION SCHEMA
// ============================================================================

const config = convict({
  // Environment
  env: {
    doc: 'Application environment',
    format: ['production', 'development', 'test'],
    default: 'production',
    env: 'NODE_ENV'
  },
  
  // Server
  server: {
    port: {
      doc: 'Server port',
      format: 'port',
      default: 8080,
      env: 'PORT'
    },
    requestTimeout: {
      doc: 'Request timeout in milliseconds',
      format: 'int',
      default: 30000,
      env: 'REQUEST_TIMEOUT'
    },
    maxRequestSize: {
      doc: 'Maximum request body size',
      format: String,
      default: '10mb',
      env: 'MAX_REQUEST_SIZE'
    }
  },
  
  // Google Cloud
  gcp: {
    projectId: {
      doc: 'Google Cloud Project ID',
      format: String,
      default: '',
      env: 'GOOGLE_CLOUD_PROJECT'
    },
    location: {
      doc: 'Vertex AI location',
      format: String,
      default: 'us-central1',
      env: 'VERTEX_AI_LOCATION'
    }
  },
  
  // Redis
  redis: {
    url: {
      doc: 'Redis connection URL',
      format: String,
      default: 'redis://localhost:6379',
      env: 'REDIS_URL'
    }
  },
  
  // Rate Limiting
  rateLimit: {
    window: {
      doc: 'Rate limit window in milliseconds',
      format: 'int',
      default: 15 * 60 * 1000,
      env: 'RATE_LIMIT_WINDOW'
    },
    maxRequests: {
      doc: 'Maximum requests per window',
      format: 'int',
      default: 100,
      env: 'RATE_LIMIT_MAX_REQUESTS'
    }
  },
  
  // Caching
  cache: {
    profileTtl: {
      doc: 'Profile cache TTL in milliseconds',
      format: 'int',
      default: 5 * 60 * 1000,
      env: 'CACHE_TTL_PROFILE'
    },
    embeddingTtl: {
      doc: 'Embedding cache TTL in milliseconds',
      format: 'int',
      default: 30 * 60 * 1000,
      env: 'CACHE_TTL_EMBEDDING'
    },
    analysisTtl: {
      doc: 'Analysis cache TTL in milliseconds',
      format: 'int',
      default: 10 * 60 * 1000,
      env: 'CACHE_TTL_ANALYSIS'
    },
    maxEmbeddings: {
      doc: 'Maximum cached embeddings',
      format: 'int',
      default: 1000,
      env: 'CACHE_MAX_EMBEDDING'
    },
    maxAnalysis: {
      doc: 'Maximum cached analysis results',
      format: 'int',
      default: 100,
      env: 'CACHE_MAX_ANALYSIS'
    }
  },
  
  // AI Detection
  aiDetection: {
    maxChunkSize: {
      doc: 'Maximum chunk size for AI detection',
      format: 'int',
      default: 3000,
      env: 'AI_DETECTION_MAX_CHUNK_SIZE'
    },
    uncertainRangeLow: {
      doc: 'Lower bound of uncertain range',
      format: 'int',
      default: 35,
      env: 'AI_DETECTION_UNCERTAIN_LOW'
    },
    uncertainRangeHigh: {
      doc: 'Upper bound of uncertain range',
      format: 'int',
      default: 65,
      env: 'AI_DETECTION_UNCERTAIN_HIGH'
    },
    deepAnalysisThreshold: {
      doc: 'Confidence threshold for deep analysis',
      format: 'int',
      default: 75,
      env: 'AI_DETECTION_DEEP_THRESHOLD'
    }
  },
  
  // Gemini
  gemini: {
    model: {
      doc: 'Gemini model name',
      format: String,
      default: 'gemini-2.0-flash-exp',
      env: 'GEMINI_MODEL'
    },
    embeddingModel: {
      doc: 'Embedding model name',
      format: String,
      default: 'text-embedding-004',
      env: 'EMBEDDING_MODEL'
    },
    maxTextLength: {
      doc: 'Maximum text length for processing',
      format: 'int',
      default: 20000,
      env: 'MAX_TEXT_LENGTH'
    },
    apiKey: {
      doc: 'Gemini API key',
      format: String,
      default: '',
      env: 'GEMINI_API_KEY',
      sensitive: true
    }
  },
  
  // Email
  email: {
    smtpHost: {
      doc: 'SMTP server host',
      format: String,
      default: '',
      env: 'SMTP_HOST'
    },
    smtpPort: {
      doc: 'SMTP server port',
      format: 'int',
      default: 587,
      env: 'SMTP_PORT'
    },
    smtpUser: {
      doc: 'SMTP username',
      format: String,
      default: '',
      env: 'SMTP_USER'
    },
    smtpPass: {
      doc: 'SMTP password',
      format: String,
      default: '',
      env: 'SMTP_PASS',
      sensitive: true
    },
    fromAddress: {
      doc: 'Email from address (for OTP, notifications)',
      format: String,
      default: 'no-reply@graphosai.com',
      env: 'EMAIL_FROM'
    },
    fromName: {
      doc: 'Email from display name',
      format: String,
      default: 'Graphos AI Studio',
      env: 'EMAIL_FROM_NAME'
    },
    supportEmail: {
      doc: 'Support email address',
      format: String,
      default: 'support@graphosai.com',
      env: 'EMAIL_SUPPORT'
    },
    billingEmail: {
      doc: 'Billing support email address',
      format: String,
      default: 'support@graphosai.com',
      env: 'EMAIL_BILLING'
    }
  },
  
  // Features
  features: {
    enableCaching: {
      doc: 'Enable caching',
      format: Boolean,
      default: true,
      env: 'ENABLE_CACHING'
    },
    enableRateLimiting: {
      doc: 'Enable rate limiting',
      format: Boolean,
      default: true,
      env: 'ENABLE_RATE_LIMITING'
    },
    enableAnalytics: {
      doc: 'Enable analytics',
      format: Boolean,
      default: true,
      env: 'ENABLE_ANALYTICS'
    },
    enableEmail: {
      doc: 'Enable email functionality',
      format: Boolean,
      default: false,
      env: 'ENABLE_EMAIL'
    },
    enableDebugEndpoints: {
      doc: 'Enable debug endpoints',
      format: Boolean,
      default: false,
      env: 'ENABLE_DEBUG_ENDPOINTS'
    }
  },
  
  // Security
  security: {
    corsWhitelist: {
      doc: 'CORS whitelist (comma-separated)',
      format: 'comma-separated-list',
      default: [],
      env: 'CORS_WHITELIST'
    },
    maxProfileSamples: {
      doc: 'Maximum profile samples',
      format: 'int',
      default: 100,
      env: 'MAX_PROFILE_SAMPLES'
    },
    maxBatchSize: {
      doc: 'Maximum batch size',
      format: 'int',
      default: 10,
      env: 'MAX_BATCH_SIZE'
    },
    sessionSecret: {
      doc: 'Session secret',
      format: String,
      default: '',
      env: 'SESSION_SECRET',
      sensitive: true
    },
    sessionMaxAge: {
      doc: 'Session max age in milliseconds',
      format: 'int',
      default: 24 * 60 * 60 * 1000,
      env: 'SESSION_MAX_AGE'
    },
    sanitizeInput: {
      doc: 'Enable input sanitization',
      format: Boolean,
      default: true,
      env: 'SANITIZE_INPUT'
    }
  },
  
  // Admin
  admin: {
    panelUrl: {
      doc: 'Admin panel URL',
      format: String,
      default: '',
      env: 'ADMIN_PANEL_URL'
    }
  }
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = config;
