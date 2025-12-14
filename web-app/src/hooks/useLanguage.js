import { useTranslation } from 'react-i18next'
import { useCallback, useEffect } from 'react'

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
]

export function useLanguage() {
  const { i18n, t } = useTranslation()

  const currentLanguage = i18n.language?.split('-')[0] || 'en'

  const changeLanguage = useCallback((langCode) => {
    i18n.changeLanguage(langCode)
    // Language is automatically persisted by i18next-browser-languagedetector
  }, [i18n])

  const getCurrentLanguageInfo = useCallback(() => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0]
  }, [currentLanguage])

  // Ensure language is set on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng')
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang.split('-')[0])
    }
  }, [i18n])

  return {
    currentLanguage,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    getCurrentLanguageInfo,
    t
  }
}

export default useLanguage
