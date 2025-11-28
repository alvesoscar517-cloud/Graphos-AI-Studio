/**
 * Language Middleware
 * Detects and sets user language for request processing
 */

const SUPPORTED_LANGUAGES = [
  'en', 'vi', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'it',
  'ru', 'ar', 'th', 'id', 'ms'
];

const DEFAULT_LANGUAGE = 'en';

/**
 * Language detection middleware
 * Priority: 1. Query param (?lang=vi), 2. Header (Accept-Language), 3. User profile, 4. Default
 */
function languageMiddleware(req, res, next) {
  // 1. Query parameter (highest priority for API calls)
  const queryLang = req.query.lang;
  
  // 2. Accept-Language header
  const headerLang = parseAcceptLanguage(req.headers['accept-language']);
  
  // 3. User profile language (set by auth middleware)
  const userLang = req.user?.preferredLanguage || req.user?.language;
  
  // 4. X-Language custom header (for extensions/apps)
  const customHeaderLang = req.headers['x-language'];
  
  // Determine final language
  const detectedLang = queryLang || customHeaderLang || userLang || headerLang || DEFAULT_LANGUAGE;
  
  // Validate and set
  req.language = SUPPORTED_LANGUAGES.includes(detectedLang) ? detectedLang : DEFAULT_LANGUAGE;
  req.supportedLanguages = SUPPORTED_LANGUAGES;
  
  // Set response header for client awareness
  res.setHeader('Content-Language', req.language);
  
  next();
}

/**
 * Parse Accept-Language header
 * @param {string} header - Accept-Language header value
 * @returns {string|null} - Primary language code or null
 */
function parseAcceptLanguage(header) {
  if (!header) return null;
  
  // Parse "en-US,en;q=0.9,vi;q=0.8" format
  const languages = header.split(',').map(lang => {
    const [code, qValue] = lang.trim().split(';q=');
    return {
      code: code.split('-')[0].toLowerCase(), // Get primary language code
      quality: qValue ? parseFloat(qValue) : 1.0
    };
  });
  
  // Sort by quality and return highest
  languages.sort((a, b) => b.quality - a.quality);
  
  return languages[0]?.code || null;
}

/**
 * Get language from request (utility function)
 * @param {Object} req - Express request object
 * @returns {string} - Language code
 */
function getLanguage(req) {
  return req.language || DEFAULT_LANGUAGE;
}

/**
 * Check if language is supported
 * @param {string} lang - Language code
 * @returns {boolean}
 */
function isSupported(lang) {
  return SUPPORTED_LANGUAGES.includes(lang);
}

module.exports = {
  languageMiddleware,
  getLanguage,
  isSupported,
  parseAcceptLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE
};
