import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import all language files
import en from './locales/en.json'
import vi from './locales/vi.json'
import zhCN from './locales/zh-CN.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import pt from './locales/pt.json'
import ru from './locales/ru.json'
import it from './locales/it.json'
import th from './locales/th.json'
import id from './locales/id.json'
import ar from './locales/ar.json'
import hi from './locales/hi.json'

const resources = {
  en: { translation: en },
  vi: { translation: vi },
  'zh-CN': { translation: zhCN },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  ja: { translation: ja },
  ko: { translation: ko },
  pt: { translation: pt },
  ru: { translation: ru },
  it: { translation: it },
  th: { translation: th },
  id: { translation: id },
  ar: { translation: ar },
  hi: { translation: hi }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache user language preference
      caches: ['localStorage'],
      // localStorage key
      lookupLocalStorage: 'i18nextLng'
    },
    
    interpolation: {
      escapeValue: false // React already escapes
    }
  })

export default i18n
