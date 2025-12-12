/**
 * i18n Utility Module
 * Type-safe wrapper and utilities for localization service
 * Provides better DX with autocomplete and validation
 */

const localization = require('../services/localization.service');

// Re-export supported languages for convenience
const SUPPORTED_LANGUAGES = localization.getSupportedLanguages();

/**
 * Translation key validator
 * Validates that a key exists in the default locale
 * @param {string} key - Translation key to validate
 * @returns {boolean} - Whether the key exists
 */
function isValidKey(key) {
  return localization.hasTranslation(key, 'en');
}

/**
 * Safe translate function with fallback
 * Returns the key itself if translation not found (useful for debugging)
 * @param {string} key - Translation key
 * @param {string} lang - Language code
 * @param {Object} params - Interpolation parameters
 * @returns {string} - Translated string or key
 */
function t(key, lang = 'en', params = {}) {
  const result = localization.translate(key, lang, params);
  
  // In development, warn if key not found
  if (process.env.NODE_ENV === 'development' && result === key) {
    console.warn(`[i18n] Missing translation: ${key} (${lang})`);
  }
  
  return result;
}

/**
 * Batch translate multiple keys
 * @param {string[]} keys - Array of translation keys
 * @param {string} lang - Language code
 * @returns {Object} - Object with key -> translated value
 */
function translateBatch(keys, lang = 'en') {
  const result = {};
  for (const key of keys) {
    result[key] = t(key, lang);
  }
  return result;
}

/**
 * Get all translations for a namespace/category
 * @param {string} namespace - Namespace (e.g., 'errors', 'common')
 * @param {string} lang - Language code
 * @returns {Object} - All translations in namespace
 */
function getNamespace(namespace, lang = 'en') {
  return localization.getCategory(namespace, lang);
}

/**
 * Create a scoped translator for a specific namespace
 * @param {string} namespace - Namespace prefix
 * @param {string} lang - Language code
 * @returns {Function} - Scoped translate function
 */
function createScopedTranslator(namespace, lang = 'en') {
  return (key, params = {}) => {
    const fullKey = `${namespace}.${key}`;
    return t(fullKey, lang, params);
  };
}

/**
 * Format helpers with locale awareness
 */
const format = {
  /**
   * Format number with locale
   * @param {number} value - Number to format
   * @param {string} lang - Language code
   * @param {Object} options - Intl.NumberFormat options
   */
  number: (value, lang = 'en', options = {}) => {
    return localization.formatNumber(value, lang, options);
  },

  /**
   * Format date with locale
   * @param {Date|string|number} date - Date to format
   * @param {string} lang - Language code
   * @param {string|Object} format - Format preset or options
   */
  date: (date, lang = 'en', formatOption = 'medium') => {
    return localization.formatDate(date, lang, formatOption);
  },

  /**
   * Format currency with locale
   * @param {number} amount - Amount to format
   * @param {string} lang - Language code
   * @param {string} currency - Currency code
   */
  currency: (amount, lang = 'en', currency = null) => {
    return localization.formatCurrency(amount, lang, currency);
  },

  /**
   * Format duration
   * @param {number} seconds - Duration in seconds
   * @param {string} lang - Language code
   * @param {Object} options - Format options
   */
  duration: (seconds, lang = 'en', options = {}) => {
    return localization.formatDuration(seconds, lang, options);
  },

  /**
   * Format percentage
   * @param {number} value - Value to format
   * @param {string} lang - Language code
   * @param {Object} options - Format options
   */
  percentage: (value, lang = 'en', options = {}) => {
    return localization.formatPercentage(value, lang, options);
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   * @param {Date|number} date - Date or timestamp
   * @param {string} lang - Language code
   */
  relativeTime: (date, lang = 'en') => {
    const locale = localization.getLocaleString(lang);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    
    const now = Date.now();
    const timestamp = date instanceof Date ? date.getTime() : date;
    const diffMs = timestamp - now;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (Math.abs(diffSec) < 60) {
      return rtf.format(diffSec, 'second');
    } else if (Math.abs(diffMin) < 60) {
      return rtf.format(diffMin, 'minute');
    } else if (Math.abs(diffHour) < 24) {
      return rtf.format(diffHour, 'hour');
    } else {
      return rtf.format(diffDay, 'day');
    }
  }
};

/**
 * Pluralization helper
 * @param {string} key - Base translation key
 * @param {number} count - Count for pluralization
 * @param {string} lang - Language code
 * @param {Object} params - Additional parameters
 */
function plural(key, count, lang = 'en', params = {}) {
  return localization.pluralize(key, count, lang, params);
}

/**
 * Check if language is supported
 * @param {string} lang - Language code
 * @returns {boolean}
 */
function isSupported(lang) {
  return localization.isSupported(lang);
}

/**
 * Get language from various sources with fallback
 * @param {Object} options - Options object
 * @param {Object} options.req - Express request object
 * @param {string} options.query - Query parameter value
 * @param {string} options.header - Header value
 * @param {string} options.user - User preference
 * @param {string} options.default - Default language
 * @returns {string} - Resolved language code
 */
function resolveLanguage({ req, query, header, user, default: defaultLang = 'en' } = {}) {
  // If request object provided, use its language
  if (req?.language) {
    return req.language;
  }
  
  // Priority: query > header > user > default
  const candidates = [query, header, user, defaultLang];
  
  for (const lang of candidates) {
    if (lang && isSupported(lang)) {
      return lang;
    }
  }
  
  return defaultLang;
}

/**
 * Express middleware factory for i18n
 * Creates a middleware that attaches i18n helpers to request
 * @param {Object} options - Middleware options
 * @returns {Function} - Express middleware
 */
function createI18nMiddleware(options = {}) {
  const { attachHelpers = true } = options;
  
  return (req, res, next) => {
    // Language should already be set by language.middleware.js
    const lang = req.language || 'en';
    
    if (attachHelpers) {
      // Attach translation helper
      req.t = (key, params = {}) => t(key, lang, params);
      
      // Attach format helpers
      req.format = {
        number: (value, opts) => format.number(value, lang, opts),
        date: (date, fmt) => format.date(date, lang, fmt),
        currency: (amount, curr) => format.currency(amount, lang, curr),
        duration: (secs, opts) => format.duration(secs, lang, opts),
        percentage: (val, opts) => format.percentage(val, lang, opts),
        relativeTime: (date) => format.relativeTime(date, lang)
      };
      
      // Attach scoped translator factory
      req.scopedT = (namespace) => createScopedTranslator(namespace, lang);
    }
    
    next();
  };
}

/**
 * Validation result with localized messages
 * @param {boolean} valid - Whether validation passed
 * @param {string} errorKey - Error translation key
 * @param {Object} params - Error parameters
 * @param {string} lang - Language code
 * @returns {Object} - Validation result
 */
function validationResult(valid, errorKey = null, params = {}, lang = 'en') {
  if (valid) {
    return { valid: true, error: null };
  }
  
  return {
    valid: false,
    error: {
      key: errorKey,
      message: t(`errors.${errorKey}`, lang, params),
      params
    }
  };
}

/**
 * Create localized API response
 * @param {Object} data - Response data
 * @param {string} messageKey - Message translation key
 * @param {string} lang - Language code
 * @param {Object} params - Message parameters
 * @returns {Object} - Localized response
 */
function localizedResponse(data, messageKey, lang = 'en', params = {}) {
  return {
    success: true,
    message: t(messageKey, lang, params),
    data
  };
}

/**
 * Create localized error response
 * @param {string} errorKey - Error translation key
 * @param {string} lang - Language code
 * @param {Object} params - Error parameters
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Localized error response
 */
function localizedError(errorKey, lang = 'en', params = {}, statusCode = 400) {
  return {
    success: false,
    error: {
      code: errorKey.toUpperCase().replace(/\./g, '_'),
      message: t(`errors.${errorKey}`, lang, params),
      friendlyMessage: t(`errors.friendly.${errorKey}`, lang, params) || t(`errors.${errorKey}`, lang, params)
    },
    statusCode
  };
}

module.exports = {
  // Core functions
  t,
  plural,
  translateBatch,
  getNamespace,
  createScopedTranslator,
  
  // Format helpers
  format,
  
  // Validation & utilities
  isValidKey,
  isSupported,
  resolveLanguage,
  
  // Middleware
  createI18nMiddleware,
  
  // Response helpers
  validationResult,
  localizedResponse,
  localizedError,
  
  // Constants
  SUPPORTED_LANGUAGES
};
