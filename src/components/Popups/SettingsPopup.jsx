import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import FeedbackModal from './FeedbackModal'
import BillingSupportModal from './BillingSupportModal'
import Icon from '../Common/Icon'
import Portal from '../Common/Portal'
import { cn } from '../../lib/utils'
import { useTheme } from '../../stores/themeStore'

// Language options with native names and country codes (lowercase for flag-icons)
const LANGUAGES = [
  { code: 'en', name: 'English', country: 'us' },
  { code: 'vi', name: 'Tiếng Việt', country: 'vn' },
  { code: 'zh-CN', name: '简体中文', country: 'cn' },
  { code: 'ja', name: '日本語', country: 'jp' },
  { code: 'ko', name: '한국어', country: 'kr' },
  { code: 'fr', name: 'Français', country: 'fr' },
  { code: 'de', name: 'Deutsch', country: 'de' },
  { code: 'es', name: 'Español', country: 'es' },
  { code: 'pt', name: 'Português', country: 'br' },
  { code: 'ru', name: 'Русский', country: 'ru' },
  { code: 'it', name: 'Italiano', country: 'it' },
  { code: 'th', name: 'ไทย', country: 'th' },
  { code: 'id', name: 'Indonesia', country: 'id' },
  { code: 'ar', name: 'العربية', country: 'sa' },
  { code: 'hi', name: 'हिन्दी', country: 'in' }
]

const SettingsPopup = ({ onClose, onViewChange }) => {
  const { t, i18n } = useTranslation()
  const popupRef = useRef(null)
  const themeSubmenuRef = useRef(null)
  const languageSubmenuRef = useRef(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showBillingModal, setShowBillingModal] = useState(false)
  const [showThemeSubmenu, setShowThemeSubmenu] = useState(false)
  const [showLanguageSubmenu, setShowLanguageSubmenu] = useState(false)
  const { themeMode, setTheme } = useTheme()

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close theme submenu if clicking outside of it
      if (themeSubmenuRef.current && !themeSubmenuRef.current.contains(e.target)) {
        setShowThemeSubmenu(false)
      }
      // Close language submenu if clicking outside of it
      if (languageSubmenuRef.current && !languageSubmenuRef.current.contains(e.target)) {
        setShowLanguageSubmenu(false)
      }
      // Close main popup if clicking outside
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [onClose])

  // Normalize language code (e.g., 'vi-VN' -> 'vi', 'zh-CN' stays 'zh-CN')
  const normalizeLanguageCode = (code) => {
    if (!code) return 'en'
    // Check if exact match exists
    if (LANGUAGES.some((l) => l.code === code)) return code
    // Try base language (e.g., 'vi-VN' -> 'vi')
    const baseCode = code.split('-')[0]
    if (LANGUAGES.some((l) => l.code === baseCode)) return baseCode
    return 'en'
  }

  const currentLangCode = normalizeLanguageCode(i18n.language)
  const currentLanguage = LANGUAGES.find((l) => l.code === currentLangCode) || LANGUAGES[0]

  const handleLanguageSelect = (code) => {
    i18n.changeLanguage(code)
    setShowLanguageSubmenu(false)
  }

  const themeOptions = [
    { value: 'light', icon: 'sun', label: t('settings.light') },
    { value: 'dark', icon: 'moon', label: t('settings.dark') },
    { value: 'system', icon: 'monitor', label: t('settings.system') }
  ]

  const handleThemeSelect = (value) => {
    setTheme(value)
    setShowThemeSubmenu(false)
  }

  return (
    <Portal>
      <div 
        ref={popupRef}
        className="popup fixed bottom-[104px] left-3 w-popup-sm z-popup py-2"
      >
        {/* Theme with submenu */}
        <div 
          className="dropdown-item justify-between relative"
          onMouseEnter={() => { setShowThemeSubmenu(true); setShowLanguageSubmenu(false) }}
          onClick={() => { setShowThemeSubmenu(!showThemeSubmenu); setShowLanguageSubmenu(false) }}
        >
          <div className="flex items-center gap-3">
            <Icon name="palette" alt={t('settings.theme') || 'Theme'} size="md" />
            <span className="flex-1 text-sm whitespace-nowrap">
              {t('settings.theme') || 'Theme'}
            </span>
          </div>
          <Icon name="chevron-right" size="sm" className="opacity-50" />
        </div>

        {/* Theme Submenu */}
        {showThemeSubmenu && (
          <div 
            ref={themeSubmenuRef}
            className={cn("popup fixed w-auto min-w-[140px] py-2 pr-2 z-popup-submenu","animate-fade-in"
            )}
            style={{
              bottom: 'auto',
              top: popupRef.current?.getBoundingClientRect().top + 'px',
              left: (popupRef.current?.getBoundingClientRect().right + 8) + 'px'
            }}
            onMouseLeave={() => setShowThemeSubmenu(false)}
          >
            {themeOptions.map((option) => (
              <div 
                key={option.value}
                className="dropdown-item gap-3 pr-4"
                onClick={() => handleThemeSelect(option.value)}
              >
                <div className={cn("w-5 h-5 rounded-full border-2 shrink-0 relative",
                  themeMode === option.value 
                    ?"border-text-primary" 
                    :"border-text-muted"
                )}>
                  {themeMode === option.value && (
                    <div className="w-2.5 h-2.5 rounded-full bg-text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <Icon name={option.icon} size="md" />
                <span className="text-sm whitespace-nowrap">{option.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Language with submenu */}
        <div 
          className="dropdown-item justify-between relative"
          onMouseEnter={() => { setShowLanguageSubmenu(true); setShowThemeSubmenu(false) }}
          onClick={() => { setShowLanguageSubmenu(!showLanguageSubmenu); setShowThemeSubmenu(false) }}
        >
          <div className="flex items-center gap-3">
            <Icon name="globe" alt={t('settings.language')} size="md" />
            <span className="flex-1 text-sm whitespace-nowrap">
              {t('settings.language')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`fi fis fi-${currentLanguage.country} rounded-full`} style={{ fontSize: '16px' }} />
            <Icon name="chevron-right" size="sm" className="opacity-50" />
          </div>
        </div>

        {/* Language Submenu */}
        {showLanguageSubmenu && (
          <div 
            ref={languageSubmenuRef}
            className={cn("popup fixed w-[200px] z-popup-submenu max-h-[320px] overflow-hidden","animate-fade-in"
            )}
            style={{
              bottom: 'auto',
              top: popupRef.current?.getBoundingClientRect().top + 'px',
              left: (popupRef.current?.getBoundingClientRect().right + 8) + 'px'
            }}
            onMouseLeave={() => setShowLanguageSubmenu(false)}
          >
            <div className="py-2 max-h-[320px] overflow-y-auto">
              {LANGUAGES.map((lang) => (
                <div 
                  key={lang.code}
                  className="dropdown-item gap-2.5 pr-3"
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  <div className={cn("w-4 h-4 rounded-full border-2 shrink-0 relative",
                    currentLangCode === lang.code 
                      ?"border-text-primary" 
                      :"border-text-muted"
                  )}>
                    {currentLangCode === lang.code && (
                      <div className="w-2 h-2 rounded-full bg-text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  <span className={`fi fis fi-${lang.country} rounded-full shrink-0`} style={{ fontSize: '16px' }} />
                  <span className="text-sm whitespace-nowrap truncate">{lang.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terms */}
        <a 
          href="https://graphosai.com/terms" 
          target="_blank" 
          rel="noopener noreferrer"
          className="dropdown-item no-underline text-inherit"
        >
          <Icon name="file-text" alt={t('settings.termsOfService')} size="md" />
          <span className="flex-1 text-sm whitespace-nowrap">
            {t('settings.termsOfService')}
          </span>
        </a>

        {/* Privacy */}
        <a 
          href="https://graphosai.com/privacy" 
          target="_blank" 
          rel="noopener noreferrer"
          className="dropdown-item no-underline text-inherit"
        >
          <Icon name="shield" alt={t('settings.privacyPolicy')} size="md" />
          <span className="flex-1 text-sm whitespace-nowrap">
            {t('settings.privacyPolicy')}
          </span>
        </a>

        {/* Feedback */}
        <div className="dropdown-item" onClick={() => setShowFeedbackModal(true)}>
          <Icon name="flag" alt={t('settings.sendFeedback')} size="md" />
          <span className="flex-1 text-sm whitespace-nowrap">
            {t('settings.sendFeedback')}
          </span>
        </div>

        {/* Billing */}
        <div className="dropdown-item" onClick={() => setShowBillingModal(true)}>
          <Icon name="dollar-sign" alt={t('settings.billingSupport')} size="md" />
          <span className="flex-1 text-sm whitespace-nowrap">
            {t('settings.billingSupport')}
          </span>
        </div>

        {/* Credit History */}
        <div className="dropdown-item" onClick={() => { onViewChange?.('credit-history'); onClose(); }}>
          <Icon name="credit-card" alt={t('settings.creditHistory')} size="md" />
          <span className="flex-1 text-sm whitespace-nowrap">
            {t('settings.creditHistory') || 'Credit History'}
          </span>
        </div>
      
        {showFeedbackModal && (
          <FeedbackModal onClose={() => setShowFeedbackModal(false)} />
        )}
        {showBillingModal && (
          <BillingSupportModal onClose={() => setShowBillingModal(false)} />
        )}
      </div>
    </Portal>
  )
}

export default SettingsPopup
