/**
 * Localization Service
 * Handles translation and localized content delivery
 * Enhanced with locale-aware formatting for 15 languages
 * 
 * Features:
 * - Lazy loading of locale files
 * - LRU cache for formatted values
 * - File watching in development mode
 * - Type-safe translation keys (see types/i18n.d.ts)
 */

const fs = require('fs');
const path = require('path');

const logger = require('../utils/logger');
const LOCALES_DIR = path.join(__dirname, '../locales');
const DEFAULT_LANGUAGE = 'en';

// Cache configuration
const CACHE_CONFIG = {
  maxSize: 1000,           // Max cached translations
  ttl: 5 * 60 * 1000,      // 5 minutes TTL
  enableFileWatch: process.env.NODE_ENV === 'development'
};

// Supported languages (15)
const SUPPORTED_LANGUAGES = ['en', 'vi', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'it', 'ru', 'ar', 'th', 'id', 'ms'];

// Locale mappings for Intl API
const LOCALE_MAPPINGS = {
  en: 'en-US',
  vi: 'vi-VN',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  pt: 'pt-BR',
  it: 'it-IT',
  ru: 'ru-RU',
  ar: 'ar-SA',
  th: 'th-TH',
  id: 'id-ID',
  ms: 'ms-MY'
};

// Default currency by locale
const DEFAULT_CURRENCIES = {
  en: 'USD',
  vi: 'VND',
  zh: 'CNY',
  ja: 'JPY',
  ko: 'KRW',
  fr: 'EUR',
  de: 'EUR',
  es: 'EUR',
  pt: 'BRL',
  it: 'EUR',
  ru: 'RUB',
  ar: 'SAR',
  th: 'THB',
  id: 'IDR',
  ms: 'MYR'
};

// Pluralization rules by language
// Categories: zero, one, two, few, many, other
const PLURAL_RULES = {
  // English: one, other
  en: (n) => n === 1 ? 'one' : 'other',
  // Vietnamese: other (no plural forms)
  vi: () => 'other',
  // Chinese: other (no plural forms)
  zh: () => 'other',
  // Japanese: other (no plural forms)
  ja: () => 'other',
  // Korean: other (no plural forms)
  ko: () => 'other',
  // French: one (0-1), other
  fr: (n) => (n === 0 || n === 1) ? 'one' : 'other',
  // German: one, other
  de: (n) => n === 1 ? 'one' : 'other',
  // Spanish: one, other
  es: (n) => n === 1 ? 'one' : 'other',
  // Portuguese: one, other
  pt: (n) => n === 1 ? 'one' : 'other',
  // Italian: one, other
  it: (n) => n === 1 ? 'one' : 'other',
  // Russian: one, few, many, other (complex rules)
  ru: (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'one';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'few';
    if (mod10 === 0 || (mod10 >= 5 && mod10 <= 9) || (mod100 >= 11 && mod100 <= 14)) return 'many';
    return 'other';
  },
  // Arabic: zero, one, two, few, many, other (most complex)
  ar: (n) => {
    if (n === 0) return 'zero';
    if (n === 1) return 'one';
    if (n === 2) return 'two';
    const mod100 = n % 100;
    if (mod100 >= 3 && mod100 <= 10) return 'few';
    if (mod100 >= 11 && mod100 <= 99) return 'many';
    return 'other';
  },
  // Thai: other (no plural forms)
  th: () => 'other',
  // Indonesian: other (no plural forms)
  id: () => 'other',
  // Malay: other (no plural forms)
  ms: () => 'other'
};

// Duration unit translations
const DURATION_UNITS = {
  en: { hours: 'hours', hour: 'hour', minutes: 'minutes', minute: 'minute', seconds: 'seconds', second: 'second' },
  vi: { hours: 'giờ', hour: 'giờ', minutes: 'phút', minute: 'phút', seconds: 'giây', second: 'giây' },
  zh: { hours: '小时', hour: '小时', minutes: '分钟', minute: '分钟', seconds: '秒', second: '秒' },
  ja: { hours: '時間', hour: '時間', minutes: '分', minute: '分', seconds: '秒', second: '秒' },
  ko: { hours: '시간', hour: '시간', minutes: '분', minute: '분', seconds: '초', second: '초' },
  fr: { hours: 'heures', hour: 'heure', minutes: 'minutes', minute: 'minute', seconds: 'secondes', second: 'seconde' },
  de: { hours: 'Stunden', hour: 'Stunde', minutes: 'Minuten', minute: 'Minute', seconds: 'Sekunden', second: 'Sekunde' },
  es: { hours: 'horas', hour: 'hora', minutes: 'minutos', minute: 'minuto', seconds: 'segundos', second: 'segundo' },
  pt: { hours: 'horas', hour: 'hora', minutes: 'minutos', minute: 'minuto', seconds: 'segundos', second: 'segundo' },
  it: { hours: 'ore', hour: 'ora', minutes: 'minuti', minute: 'minuto', seconds: 'secondi', second: 'secondo' },
  ru: { hours: 'часов', hour: 'час', minutes: 'минут', minute: 'минута', seconds: 'секунд', second: 'секунда', hours_few: 'часа', minutes_few: 'минуты', seconds_few: 'секунды' },
  ar: { hours: 'ساعات', hour: 'ساعة', minutes: 'دقائق', minute: 'دقيقة', seconds: 'ثواني', second: 'ثانية' },
  th: { hours: 'ชั่วโมง', hour: 'ชั่วโมง', minutes: 'นาที', minute: 'นาที', seconds: 'วินาที', second: 'วินาที' },
  id: { hours: 'jam', hour: 'jam', minutes: 'menit', minute: 'menit', seconds: 'detik', second: 'detik' },
  ms: { hours: 'jam', hour: 'jam', minutes: 'minit', minute: 'minit', seconds: 'saat', second: 'saat' }
};

class LocalizationService {
  constructor() {
    this.locales = {};
    this.loadedLanguages = new Set();
    this.translationCache = new Map();
    this.cacheTimestamps = new Map();
    this.fileWatchers = new Map();
    
    this.loadLocale(DEFAULT_LANGUAGE); // Always load default
    
    // Setup file watching in development
    if (CACHE_CONFIG.enableFileWatch) {
      this._setupFileWatching();
    }
  }

  /**
   * Setup file watching for hot reload in development
   * @private
   */
  _setupFileWatching() {
    for (const lang of SUPPORTED_LANGUAGES) {
      const filePath = path.join(LOCALES_DIR, `${lang}.json`);
      if (fs.existsSync(filePath)) {
        try {
          const watcher = fs.watch(filePath, (eventType) => {
            if (eventType === 'change') {
              logger.info(`[LOCALE] File changed, reloading: ${lang}`);
              this._reloadLocale(lang);
            }
          });
          this.fileWatchers.set(lang, watcher);
        } catch (error) {
          logger.warn(`[LOCALE] Could not watch file for ${lang}:`, error.message);
        }
      }
    }
  }

  /**
   * Reload a specific locale (used by file watcher)
   * @private
   */
  _reloadLocale(lang) {
    this.loadedLanguages.delete(lang);
    this.loadLocale(lang);
    this._invalidateCacheForLang(lang);
  }

  /**
   * Invalidate cache entries for a specific language
   * @private
   */
  _invalidateCacheForLang(lang) {
    for (const key of this.translationCache.keys()) {
      if (key.startsWith(`${lang}:`)) {
        this.translationCache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }
    logger.info(`[LOCALE] Cache invalidated for: ${lang}`);
  }

  /**
   * Get from cache with TTL check
   * @private
   */
  _getFromCache(cacheKey) {
    if (!this.translationCache.has(cacheKey)) return null;
    
    const timestamp = this.cacheTimestamps.get(cacheKey);
    if (Date.now() - timestamp > CACHE_CONFIG.ttl) {
      this.translationCache.delete(cacheKey);
      this.cacheTimestamps.delete(cacheKey);
      return null;
    }
    
    return this.translationCache.get(cacheKey);
  }

  /**
   * Set cache with size limit (LRU-like eviction)
   * @private
   */
  _setCache(cacheKey, value) {
    // Simple eviction: remove oldest entries if over limit
    if (this.translationCache.size >= CACHE_CONFIG.maxSize) {
      const oldestKey = this.translationCache.keys().next().value;
      this.translationCache.delete(oldestKey);
      this.cacheTimestamps.delete(oldestKey);
    }
    
    this.translationCache.set(cacheKey, value);
    this.cacheTimestamps.set(cacheKey, Date.now());
  }

  /**
   * Load locale file for a language
   * @param {string} lang - Language code
   * @returns {boolean} - Success status
   */
  loadLocale(lang) {
    if (this.loadedLanguages.has(lang)) return true;
    
    const filePath = path.join(LOCALES_DIR, `${lang}.json`);
    
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        this.locales[lang] = JSON.parse(content);
        this.loadedLanguages.add(lang);
        logger.info(`[LOCALE] Loaded locale: ${lang}`);
        return true;
      }
    } catch (error) {
      logger.error(`[LOCALE] Failed to load locale ${lang}:`, error.message);
    }
    
    return false;
  }

  /**
   * Translate a key to specified language
   * @param {string} key - Translation key (dot notation: "analysis.sentence_too_long")
   * @param {string} lang - Target language
   * @param {Object} params - Interpolation parameters
   * @returns {string} - Translated string
   */
  translate(key, lang = DEFAULT_LANGUAGE, params = {}) {
    // Ensure locale is loaded
    this.loadLocale(lang);
    
    // Check cache for translations without params (most common case)
    const hasParams = params && Object.keys(params).length > 0;
    const cacheKey = `${lang}:${key}`;
    
    if (!hasParams) {
      const cached = this._getFromCache(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }
    
    // Get translation from locale or fallback to default
    let text = this.getNestedValue(this.locales[lang], key) 
            || this.getNestedValue(this.locales[DEFAULT_LANGUAGE], key) 
            || key;
    
    // Cache the raw translation (before interpolation)
    if (!hasParams) {
      this._setCache(cacheKey, text);
    }
    
    // Interpolate parameters: {{name}} -> value
    if (hasParams) {
      Object.entries(params).forEach(([paramKey, value]) => {
        const regex = new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g');
        text = text.replace(regex, String(value));
      });
    }
    
    return text;
  }

  /**
   * Shorthand for translate
   */
  t(key, lang = DEFAULT_LANGUAGE, params = {}) {
    return this.translate(key, lang, params);
  }

  /**
   * Get all translations for a category
   * @param {string} category - Category name (e.g., "analysis", "errors")
   * @param {string} lang - Target language
   * @returns {Object} - All translations in category
   */
  getCategory(category, lang = DEFAULT_LANGUAGE) {
    this.loadLocale(lang);
    
    const langCategory = this.locales[lang]?.[category] || {};
    const defaultCategory = this.locales[DEFAULT_LANGUAGE]?.[category] || {};
    
    // Merge with default as fallback
    return { ...defaultCategory, ...langCategory };
  }

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Source object
   * @param {string} key - Dot notation key
   * @returns {*} - Value or undefined
   */
  getNestedValue(obj, key) {
    if (!obj || !key) return undefined;
    
    return key.split('.').reduce((current, part) => {
      return current && current[part] !== undefined ? current[part] : undefined;
    }, obj);
  }

  /**
   * Check if a translation key exists
   * @param {string} key - Translation key
   * @param {string} lang - Language code
   * @returns {boolean}
   */
  hasTranslation(key, lang = DEFAULT_LANGUAGE) {
    this.loadLocale(lang);
    return this.getNestedValue(this.locales[lang], key) !== undefined;
  }

  /**
   * Get all available languages
   * @returns {Array<string>} - List of language codes with locale files
   */
  getAvailableLanguages() {
    try {
      const files = fs.readdirSync(LOCALES_DIR);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    } catch (error) {
      return [DEFAULT_LANGUAGE];
    }
  }

  /**
   * Localize an object - translate all message/detail/suggestion fields
   * @param {Object} obj - Object to localize
   * @param {string} lang - Target language
   * @returns {Object} - Localized object
   */
  localizeObject(obj, lang = DEFAULT_LANGUAGE) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const translatableFields = ['message', 'detail', 'suggestion', 'description', 'title', 'label'];
    const result = Array.isArray(obj) ? [] : {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (translatableFields.includes(key) && typeof value === 'string') {
        // Check if value is a translation key (contains dots or starts with known prefix)
        if (value.includes('.') || this.hasTranslation(value, lang)) {
          result[key] = this.translate(value, lang);
        } else {
          result[key] = value;
        }
      } else if (typeof value === 'object') {
        result[key] = this.localizeObject(value, lang);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Create localized error response
   * @param {string} errorKey - Error translation key
   * @param {string} lang - Target language
   * @param {Object} params - Interpolation parameters
   * @returns {Object} - Error object
   */
  createError(errorKey, lang = DEFAULT_LANGUAGE, params = {}) {
    return {
      error: true,
      message: this.translate(`errors.${errorKey}`, lang, params),
      code: errorKey.toUpperCase().replace(/\./g, '_')
    };
  }

  /**
   * Reload all locales (useful for development)
   */
  reloadLocales() {
    this.locales = {};
    this.loadedLanguages.clear();
    this.loadLocale(DEFAULT_LANGUAGE);
    logger.info('[LOCALE] All locales reloaded');
  }

  // ============================================================================
  // LOCALE-AWARE FORMATTING FUNCTIONS
  // ============================================================================

  /**
   * Get the full locale string for Intl API
   * @param {string} lang - Language code
   * @returns {string} - Full locale string (e.g., 'en-US')
   */
  getLocaleString(lang) {
    return LOCALE_MAPPINGS[lang] || LOCALE_MAPPINGS[DEFAULT_LANGUAGE];
  }

  /**
   * Format a number according to locale conventions
   * @param {number} value - Number to format
   * @param {string} lang - Language code
   * @param {Object} options - Intl.NumberFormat options
   * @returns {string} - Formatted number
   */
  formatNumber(value, lang = DEFAULT_LANGUAGE, options = {}) {
    try {
      const locale = this.getLocaleString(lang);
      const formatter = new Intl.NumberFormat(locale, {
        maximumFractionDigits: options.decimals ?? 2,
        minimumFractionDigits: options.minDecimals ?? 0,
        useGrouping: options.useGrouping !== false,
        ...options
      });
      return formatter.format(value);
    } catch (error) {
      logger.error(`[LOCALE] formatNumber error for ${lang}:`, error.message);
      return String(value);
    }
  }

  /**
   * Format a date according to locale conventions
   * @param {Date|string|number} date - Date to format
   * @param {string} lang - Language code
   * @param {string|Object} format - Format preset ('short', 'medium', 'long', 'full') or Intl options
   * @returns {string} - Formatted date
   */
  formatDate(date, lang = DEFAULT_LANGUAGE, format = 'medium') {
    try {
      const locale = this.getLocaleString(lang);
      const dateObj = date instanceof Date ? date : new Date(date);
      
      if (isNaN(dateObj.getTime())) {
        return String(date);
      }

      let options;
      if (typeof format === 'string') {
        // Preset formats
        switch (format) {
          case 'short':
            options = { year: 'numeric', month: 'numeric', day: 'numeric' };
            break;
          case 'medium':
            options = { year: 'numeric', month: 'short', day: 'numeric' };
            break;
          case 'long':
            options = { year: 'numeric', month: 'long', day: 'numeric' };
            break;
          case 'full':
            options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            break;
          case 'time':
            options = { hour: '2-digit', minute: '2-digit' };
            break;
          case 'datetime':
            options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            break;
          default:
            options = { year: 'numeric', month: 'short', day: 'numeric' };
        }
      } else {
        options = format;
      }

      const formatter = new Intl.DateTimeFormat(locale, options);
      return formatter.format(dateObj);
    } catch (error) {
      logger.error(`[LOCALE] formatDate error for ${lang}:`, error.message);
      return String(date);
    }
  }

  /**
   * Format currency according to locale conventions
   * @param {number} amount - Amount to format
   * @param {string} lang - Language code
   * @param {string} currency - Currency code (defaults to locale's currency)
   * @returns {string} - Formatted currency
   */
  formatCurrency(amount, lang = DEFAULT_LANGUAGE, currency = null) {
    try {
      const locale = this.getLocaleString(lang);
      const currencyCode = currency || DEFAULT_CURRENCIES[lang] || 'USD';
      
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
      
      return formatter.format(amount);
    } catch (error) {
      logger.error(`[LOCALE] formatCurrency error for ${lang}:`, error.message);
      return `${amount} ${currency || 'USD'}`;
    }
  }

  /**
   * Format duration in human-readable form
   * @param {number} seconds - Duration in seconds
   * @param {string} lang - Language code
   * @param {Object} options - Options { showSeconds: boolean, compact: boolean }
   * @returns {string} - Formatted duration (e.g., "2 hours 30 minutes")
   */
  formatDuration(seconds, lang = DEFAULT_LANGUAGE, options = {}) {
    try {
      const { showSeconds = true, compact = false } = options;
      const units = DURATION_UNITS[lang] || DURATION_UNITS[DEFAULT_LANGUAGE];
      const parts = [];

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);

      if (hours > 0) {
        const hourUnit = this._getDurationUnit(hours, 'hour', lang, units);
        parts.push(compact ? `${hours}${units.hour.charAt(0)}` : `${hours} ${hourUnit}`);
      }

      if (minutes > 0) {
        const minuteUnit = this._getDurationUnit(minutes, 'minute', lang, units);
        parts.push(compact ? `${minutes}${units.minute.charAt(0)}` : `${minutes} ${minuteUnit}`);
      }

      if ((showSeconds && secs > 0) || parts.length === 0) {
        const secondUnit = this._getDurationUnit(secs, 'second', lang, units);
        parts.push(compact ? `${secs}${units.second.charAt(0)}` : `${secs} ${secondUnit}`);
      }

      return parts.join(' ');
    } catch (error) {
      logger.error(`[LOCALE] formatDuration error for ${lang}:`, error.message);
      return `${seconds}s`;
    }
  }

  /**
   * Get the correct duration unit based on count and language
   * @private
   */
  _getDurationUnit(count, unit, lang, units) {
    // For languages with simple plural (or no plural)
    if (['vi', 'zh', 'ja', 'ko', 'th', 'id', 'ms'].includes(lang)) {
      return units[unit];
    }

    // For Russian with complex plural
    if (lang === 'ru') {
      const pluralForm = PLURAL_RULES.ru(count);
      if (pluralForm === 'one') return units[unit];
      if (pluralForm === 'few') return units[`${unit}s_few`] || units[`${unit}s`];
      return units[`${unit}s`];
    }

    // For other languages (simple one/other)
    return count === 1 ? units[unit] : units[`${unit}s`];
  }

  /**
   * Pluralize a translation key based on count
   * @param {string} key - Base translation key (should have .zero, .one, .two, .few, .many, .other variants)
   * @param {number} count - Count for pluralization
   * @param {string} lang - Language code
   * @param {Object} params - Additional interpolation parameters
   * @returns {string} - Pluralized and translated string
   */
  pluralize(key, count, lang = DEFAULT_LANGUAGE, params = {}) {
    try {
      const pluralRule = PLURAL_RULES[lang] || PLURAL_RULES[DEFAULT_LANGUAGE];
      const pluralForm = pluralRule(count);
      
      // Try specific plural form first, then fall back to 'other', then base key
      const pluralKey = `${key}.${pluralForm}`;
      const otherKey = `${key}.other`;
      
      let translation;
      if (this.hasTranslation(pluralKey, lang)) {
        translation = this.translate(pluralKey, lang, { count, ...params });
      } else if (this.hasTranslation(otherKey, lang)) {
        translation = this.translate(otherKey, lang, { count, ...params });
      } else {
        // Fall back to base key with count
        translation = this.translate(key, lang, { count, ...params });
      }
      
      return translation;
    } catch (error) {
      logger.error(`[LOCALE] pluralize error for ${lang}:`, error.message);
      return this.translate(key, lang, { count, ...params });
    }
  }

  /**
   * Format percentage according to locale
   * @param {number} value - Value (0-100 or 0-1 based on isDecimal)
   * @param {string} lang - Language code
   * @param {Object} options - { isDecimal: boolean, decimals: number }
   * @returns {string} - Formatted percentage
   */
  formatPercentage(value, lang = DEFAULT_LANGUAGE, options = {}) {
    try {
      const locale = this.getLocaleString(lang);
      const { isDecimal = false, decimals = 0 } = options;
      
      const percentValue = isDecimal ? value : value / 100;
      
      const formatter = new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
      
      return formatter.format(percentValue);
    } catch (error) {
      logger.error(`[LOCALE] formatPercentage error for ${lang}:`, error.message);
      return `${value}%`;
    }
  }

  /**
   * Get list of missing translation keys for a language compared to default
   * @param {string} lang - Language code to check
   * @returns {Array<string>} - List of missing keys
   */
  getMissingKeys(lang) {
    this.loadLocale(lang);
    this.loadLocale(DEFAULT_LANGUAGE);
    
    const defaultKeys = this._getAllKeys(this.locales[DEFAULT_LANGUAGE]);
    const langKeys = new Set(this._getAllKeys(this.locales[lang] || {}));
    
    return defaultKeys.filter(key => !langKeys.has(key));
  }

  /**
   * Get all keys from an object recursively
   * @private
   */
  _getAllKeys(obj, prefix = '') {
    const keys = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...this._getAllKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys;
  }

  /**
   * Check if a language is supported
   * @param {string} lang - Language code
   * @returns {boolean}
   */
  isSupported(lang) {
    return SUPPORTED_LANGUAGES.includes(lang);
  }

  /**
   * Get supported languages list
   * @returns {Array<string>}
   */
  getSupportedLanguages() {
    return [...SUPPORTED_LANGUAGES];
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  getCacheStats() {
    let expiredCount = 0;
    const now = Date.now();
    
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (now - timestamp > CACHE_CONFIG.ttl) {
        expiredCount++;
      }
    }
    
    return {
      size: this.translationCache.size,
      maxSize: CACHE_CONFIG.maxSize,
      ttl: CACHE_CONFIG.ttl,
      expiredEntries: expiredCount,
      loadedLanguages: [...this.loadedLanguages],
      fileWatchEnabled: CACHE_CONFIG.enableFileWatch
    };
  }

  /**
   * Clear expired cache entries
   * @returns {number} - Number of entries cleared
   */
  clearExpiredCache() {
    const now = Date.now();
    let cleared = 0;
    
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (now - timestamp > CACHE_CONFIG.ttl) {
        this.translationCache.delete(key);
        this.cacheTimestamps.delete(key);
        cleared++;
      }
    }
    
    if (cleared > 0) {
      logger.info(`[LOCALE] Cleared ${cleared} expired cache entries`);
    }
    
    return cleared;
  }

  /**
   * Clear all cache
   */
  clearCache() {
    const size = this.translationCache.size;
    this.translationCache.clear();
    this.cacheTimestamps.clear();
    logger.info(`[LOCALE] Cleared all ${size} cache entries`);
  }

  /**
   * Preload all locales into memory
   * Useful for production to avoid lazy loading delays
   */
  preloadAllLocales() {
    for (const lang of SUPPORTED_LANGUAGES) {
      this.loadLocale(lang);
    }
    logger.info(`[LOCALE] Preloaded ${this.loadedLanguages.size} locales`);
  }

  /**
   * Cleanup resources (file watchers)
   * Call this on application shutdown
   */
  cleanup() {
    for (const [lang, watcher] of this.fileWatchers.entries()) {
      watcher.close();
      logger.info(`[LOCALE] Closed file watcher for: ${lang}`);
    }
    this.fileWatchers.clear();
    this.clearCache();
  }
}

// Export constants for external use
module.exports.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
module.exports.LOCALE_MAPPINGS = LOCALE_MAPPINGS;
module.exports.DEFAULT_CURRENCIES = DEFAULT_CURRENCIES;
module.exports.PLURAL_RULES = PLURAL_RULES;

// Export singleton instance
module.exports = new LocalizationService();
