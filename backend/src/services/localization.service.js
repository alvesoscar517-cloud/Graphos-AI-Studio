/**
 * Localization Service
 * Handles translation and localized content delivery
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../locales');
const DEFAULT_LANGUAGE = 'en';

class LocalizationService {
  constructor() {
    this.locales = {};
    this.loadedLanguages = new Set();
    this.loadLocale(DEFAULT_LANGUAGE); // Always load default
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
        console.log(`[LOCALE] Loaded locale: ${lang}`);
        return true;
      }
    } catch (error) {
      console.error(`[LOCALE] Failed to load locale ${lang}:`, error.message);
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
    
    // Get translation from locale or fallback to default
    let text = this.getNestedValue(this.locales[lang], key) 
            || this.getNestedValue(this.locales[DEFAULT_LANGUAGE], key) 
            || key;
    
    // Interpolate parameters: {{name}} -> value
    if (params && typeof params === 'object') {
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
    console.log('[LOCALE] All locales reloaded');
  }
}

// Export singleton instance
module.exports = new LocalizationService();
