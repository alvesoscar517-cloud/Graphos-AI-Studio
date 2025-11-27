import { useTranslation } from 'react-i18next'
import { useCallback, useEffect } from 'react'

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' }
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
