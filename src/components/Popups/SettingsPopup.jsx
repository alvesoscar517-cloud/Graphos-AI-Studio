import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'
import FeedbackModal from './FeedbackModal'
import BillingSupportModal from './BillingSupportModal'
import './Popups.css'

const SettingsPopup = ({ onClose }) => {
  const { t } = useTranslation()
  const popupRef = useRef(null)
  const { theme, changeTheme } = useTheme()
  const [showThemeSubmenu, setShowThemeSubmenu] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showBillingModal, setShowBillingModal] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [onClose])

  return (
    <div className="settings-popup show" ref={popupRef} style={{ display: 'block' }}>
      <div 
        className="settings-item" 
        onClick={() => setShowThemeSubmenu(!showThemeSubmenu)}
      >
        <img src="/icon/palette.svg" className="settings-icon" alt={t('settings.theme')} />
        <span>{t('settings.theme')}</span>
        <img src="/icon/chevron-right.svg" className="settings-arrow" alt="" />
        
        {showThemeSubmenu && (
          <div className="theme-submenu show">
            <div className="theme-option" onClick={(e) => { e.stopPropagation(); changeTheme('light'); }}>
              <input type="radio" name="theme" checked={theme === 'light'} readOnly />
              <label>
                <img src="/icon/sun.svg" className="theme-icon" alt={t('settings.light')} />
                <span>{t('settings.light')}</span>
              </label>
            </div>
            <div className="theme-option" onClick={(e) => { e.stopPropagation(); changeTheme('dark'); }}>
              <input type="radio" name="theme" checked={theme === 'dark'} readOnly />
              <label>
                <img src="/icon/moon.svg" className="theme-icon" alt={t('settings.dark')} />
                <span>{t('settings.dark')}</span>
              </label>
            </div>
            <div className="theme-option" onClick={(e) => { e.stopPropagation(); changeTheme('system'); }}>
              <input type="radio" name="theme" checked={theme === 'system'} readOnly />
              <label>
                <img src="/icon/monitor.svg" className="theme-icon" alt={t('settings.system')} />
                <span>{t('settings.system')}</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="settings-item">
        <img src="/icon/file-text.svg" className="settings-icon" alt={t('settings.termsOfService')} />
        <span>{t('settings.termsOfService')}</span>
      </div>
      <div className="settings-item">
        <img src="/icon/shield.svg" className="settings-icon" alt={t('settings.privacyPolicy')} />
        <span>{t('settings.privacyPolicy')}</span>
      </div>
      <div className="settings-item" onClick={() => setShowFeedbackModal(true)}>
        <img src="/icon/flag.svg" className="settings-icon" alt={t('settings.sendFeedback')} />
        <span>{t('settings.sendFeedback')}</span>
      </div>
      <div className="settings-item" onClick={() => setShowBillingModal(true)}>
        <img src="/icon/dollar-sign.svg" className="settings-icon" alt={t('settings.billingSupport')} />
        <span>{t('settings.billingSupport')}</span>
      </div>
      
      {showFeedbackModal && (
        <FeedbackModal onClose={() => setShowFeedbackModal(false)} />
      )}
      {showBillingModal && (
        <BillingSupportModal onClose={() => setShowBillingModal(false)} />
      )}
    </div>
  )
}

export default SettingsPopup
