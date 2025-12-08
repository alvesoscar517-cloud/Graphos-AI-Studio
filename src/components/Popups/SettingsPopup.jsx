import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import FeedbackModal from './FeedbackModal'
import BillingSupportModal from './BillingSupportModal'
import Icon from '../Common/Icon'
import Portal from '../Common/Portal'
import { cn } from '../../lib/utils'
import { useTheme } from '../../stores/themeStore'

const SettingsPopup = ({ onClose }) => {
  const { t } = useTranslation()
  const popupRef = useRef(null)
  const themeSubmenuRef = useRef(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showBillingModal, setShowBillingModal] = useState(false)
  const [showThemeSubmenu, setShowThemeSubmenu] = useState(false)
  const { themeMode, setTheme } = useTheme()

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close theme submenu if clicking outside of it
      if (themeSubmenuRef.current && !themeSubmenuRef.current.contains(e.target)) {
        setShowThemeSubmenu(false)
      }
      // Close main popup if clicking outside
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [onClose])

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
          onMouseEnter={() => setShowThemeSubmenu(true)}
          onClick={() => setShowThemeSubmenu(!showThemeSubmenu)}
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
            className={cn(
              "popup fixed w-[160px] py-2 pr-2 z-popup-submenu",
              "animate-fade-in"
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
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 shrink-0 relative",
                  themeMode === option.value 
                    ? "border-text-primary" 
                    : "border-text-muted"
                )}>
                  {themeMode === option.value && (
                    <div className="w-2.5 h-2.5 rounded-full bg-text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <Icon name={option.icon} size="md" />
                <span className="text-sm">{option.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Terms */}
        <div className="dropdown-item">
          <Icon name="file-text" alt={t('settings.termsOfService')} size="md" />
          <span className="flex-1 text-sm whitespace-nowrap">
            {t('settings.termsOfService')}
          </span>
        </div>

        {/* Privacy */}
        <div className="dropdown-item">
          <Icon name="shield" alt={t('settings.privacyPolicy')} size="md" />
          <span className="flex-1 text-sm whitespace-nowrap">
            {t('settings.privacyPolicy')}
          </span>
        </div>

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
