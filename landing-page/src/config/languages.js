/**
 * Language Configuration - SEO-optimized multi-language support
 * Enhanced: Dec 2025 - Added SEO metadata for each language
 */

export const SUPPORTED_LANGUAGES = [
  { 
    code: 'en', 
    name: 'English', 
    flag: 'us',
    locale: 'en_US',
    dir: 'ltr',
    hreflang: 'en',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: { decimal: '.', thousand: ',' }
  },
  { 
    code: 'vi', 
    name: 'Tiếng Việt', 
    flag: 'vn',
    locale: 'vi_VN',
    dir: 'ltr',
    hreflang: 'vi',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimal: ',', thousand: '.' }
  },
  { 
    code: 'ja', 
    name: '日本語', 
    flag: 'jp',
    locale: 'ja_JP',
    dir: 'ltr',
    hreflang: 'ja',
    dateFormat: 'YYYY/MM/DD',
    numberFormat: { decimal: '.', thousand: ',' }
  },
  { 
    code: 'ko', 
    name: '한국어', 
    flag: 'kr',
    locale: 'ko_KR',
    dir: 'ltr',
    hreflang: 'ko',
    dateFormat: 'YYYY.MM.DD',
    numberFormat: { decimal: '.', thousand: ',' }
  },
  { 
    code: 'zh-CN', 
    name: '简体中文', 
    flag: 'cn',
    locale: 'zh_CN',
    dir: 'ltr',
    hreflang: 'zh-CN',
    dateFormat: 'YYYY-MM-DD',
    numberFormat: { decimal: '.', thousand: ',' }
  },
  { 
    code: 'es', 
    name: 'Español', 
    flag: 'es',
    locale: 'es_ES',
    dir: 'ltr',
    hreflang: 'es',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimal: ',', thousand: '.' }
  },
  { 
    code: 'fr', 
    name: 'Français', 
    flag: 'fr',
    locale: 'fr_FR',
    dir: 'ltr',
    hreflang: 'fr',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimal: ',', thousand: ' ' }
  },
  { 
    code: 'de', 
    name: 'Deutsch', 
    flag: 'de',
    locale: 'de_DE',
    dir: 'ltr',
    hreflang: 'de',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: { decimal: ',', thousand: '.' }
  },
  { 
    code: 'it', 
    name: 'Italiano', 
    flag: 'it',
    locale: 'it_IT',
    dir: 'ltr',
    hreflang: 'it',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimal: ',', thousand: '.' }
  },
  { 
    code: 'pt', 
    name: 'Português', 
    flag: 'br',
    locale: 'pt_BR',
    dir: 'ltr',
    hreflang: 'pt',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimal: ',', thousand: '.' }
  },
  { 
    code: 'ru', 
    name: 'Русский', 
    flag: 'ru',
    locale: 'ru_RU',
    dir: 'ltr',
    hreflang: 'ru',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: { decimal: ',', thousand: ' ' }
  },
  { 
    code: 'ar', 
    name: 'العربية', 
    flag: 'sa',
    locale: 'ar_SA',
    dir: 'rtl', // Right-to-left
    hreflang: 'ar',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimal: '٫', thousand: '٬' }
  },
  { 
    code: 'hi', 
    name: 'हिन्दी', 
    flag: 'in',
    locale: 'hi_IN',
    dir: 'ltr',
    hreflang: 'hi',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimal: '.', thousand: ',' }
  },
  { 
    code: 'th', 
    name: 'ไทย', 
    flag: 'th',
    locale: 'th_TH',
    dir: 'ltr',
    hreflang: 'th',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimal: '.', thousand: ',' }
  },
  { 
    code: 'id', 
    name: 'Bahasa Indonesia', 
    flag: 'id',
    locale: 'id_ID',
    dir: 'ltr',
    hreflang: 'id',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimal: ',', thousand: '.' }
  },
]

export const DEFAULT_LANGUAGE = 'en'

/**
 * Get language config by code
 */
export function getLanguageConfig(code) {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || SUPPORTED_LANGUAGES[0]
}

/**
 * Get all language codes
 */
export function getLanguageCodes() {
  return SUPPORTED_LANGUAGES.map(lang => lang.code)
}

/**
 * Check if language code is supported
 */
export function isLanguageSupported(code) {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code)
}

/**
 * Get locale for Open Graph
 */
export function getOGLocale(code) {
  const lang = getLanguageConfig(code)
  return lang?.locale || 'en_US'
}

/**
 * Get text direction for language
 */
export function getTextDirection(code) {
  const lang = getLanguageConfig(code)
  return lang?.dir || 'ltr'
}
