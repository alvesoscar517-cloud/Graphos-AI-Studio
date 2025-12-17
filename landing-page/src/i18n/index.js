/**
 * i18n Configuration - SEO-optimized multi-language support
 * Enhanced: Dec 2025 - URL-based language detection for SEO
 * Features: Path-based routing, localStorage fallback, proper language detection order
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import en from './locales/en.json'
import vi from './locales/vi.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import zhCN from './locales/zh-CN.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import it from './locales/it.json'
import pt from './locales/pt.json'
import ru from './locales/ru.json'
import ar from './locales/ar.json'
import hi from './locales/hi.json'
import th from './locales/th.json'
import id from './locales/id.json'

// Supported language codes
export const LANGUAGE_CODES = [
  'en', 'vi', 'ja', 'ko', 'zh-CN',
  'es', 'fr', 'de', 'it', 'pt', 'ru',
  'ar', 'hi', 'th', 'id'
]

const resources = {
  en: { translation: en },
  vi: { translation: vi },
  ja: { translation: ja },
  ko: { translation: ko },
  'zh-CN': { translation: zhCN },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  it: { translation: it },
  pt: { translation: pt },
  ru: { translation: ru },
  ar: { translation: ar },
  hi: { translation: hi },
  th: { translation: th },
  id: { translation: id },
}

/**
 * Custom path detector for URL-based language detection
 * Detects language from URL path like /vi/, /ja/, etc.
 */
const pathDetector = {
  name: 'path',
  lookup() {
    const pathname = window.location.pathname
    const segments = pathname.split('/').filter(Boolean)
    
    if (segments.length > 0) {
      const potentialLang = segments[0]
      if (LANGUAGE_CODES.includes(potentialLang)) {
        return potentialLang
      }
    }
    
    return undefined
  },
  cacheUserLanguage(lng) {
    // Don't cache path-based language, let URL be the source of truth
  }
}

// Add custom detector to LanguageDetector
const languageDetector = new LanguageDetector()
languageDetector.addDetector(pathDetector)

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: LANGUAGE_CODES,
    debug: import.meta.env.DEV,
    
    detection: {
      // Order matters! Path first for SEO, then localStorage, then browser
      order: ['path', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      
      // Check only these languages
      checkWhitelist: true,
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    // React specific options
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'span'],
    },
  })

/**
 * Get language from URL path
 */
export function getLanguageFromPath(pathname = window.location.pathname) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0 && LANGUAGE_CODES.includes(segments[0])) {
    return segments[0]
  }
  return 'en'
}

/**
 * Build URL with language prefix
 */
export function buildLocalizedUrl(path, lang = i18n.language) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  
  // Remove existing language prefix if any
  let pathWithoutLang = cleanPath
  for (const code of LANGUAGE_CODES) {
    if (cleanPath.startsWith(`/${code}/`) || cleanPath === `/${code}`) {
      pathWithoutLang = cleanPath.slice(code.length + 1) || '/'
      break
    }
  }
  
  // Don't add prefix for default language (English)
  if (lang === 'en') {
    return pathWithoutLang
  }
  
  return `/${lang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`
}

/**
 * Change language and update URL
 */
export function changeLanguage(lang, navigate) {
  if (!LANGUAGE_CODES.includes(lang)) {
    console.warn(`Unsupported language: ${lang}`)
    return
  }
  
  // Change i18n language
  i18n.changeLanguage(lang)
  
  // Update URL if navigate function is provided
  if (navigate) {
    const currentPath = window.location.pathname
    const newPath = buildLocalizedUrl(currentPath, lang)
    navigate(newPath, { replace: true })
  }
  
  // Update html lang attribute
  document.documentElement.lang = lang
  
  // Update text direction for RTL languages
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
}

export default i18n
