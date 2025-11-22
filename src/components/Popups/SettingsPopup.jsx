import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import FeedbackModal from './FeedbackModal'
import BillingSupportModal from './BillingSupportModal'
import './Popups.css'

const SettingsPopup = ({ onClose }) => {
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
        onMouseEnter={() => setShowThemeSubmenu(true)}
        onMouseLeave={() => setShowThemeSubmenu(false)}
      >
        <img src="/icon/palette.svg" className="settings-icon" alt="Theme" />
        <span>Theme</span>
        <img src="/icon/chevron-right.svg" className="settings-arrow" alt="" />
        
        {showThemeSubmenu && (
          <div className="theme-submenu show">
            <div className="theme-option" onClick={() => changeTheme('light')}>
              <input type="radio" name="theme" checked={theme === 'light'} readOnly />
              <label>
                <img src="/icon/sun.svg" className="theme-icon" alt="Light" />
                <span>Light</span>
              </label>
            </div>
            <div className="theme-option" onClick={() => changeTheme('dark')}>
              <input type="radio" name="theme" checked={theme === 'dark'} readOnly />
              <label>
                <img src="/icon/moon.svg" className="theme-icon" alt="Dark" />
                <span>Dark</span>
              </label>
            </div>
            <div className="theme-option" onClick={() => changeTheme('system')}>
              <input type="radio" name="theme" checked={theme === 'system'} readOnly />
              <label>
                <img src="/icon/monitor.svg" className="theme-icon" alt="System" />
                <span>System</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="settings-item">
        <img src="/icon/upload.svg" className="settings-icon" alt="Submit" />
        <span>Submit prompt key</span>
        <img src="/icon/chevron-right.svg" className="settings-arrow" alt="" />
      </div>

      <div className="settings-divider"></div>

      <div className="settings-item">
        <img src="/icon/list.svg" className="settings-icon" alt="Status" />
        <span>View status</span>
      </div>
      <div className="settings-item">
        <img src="/icon/file-text.svg" className="settings-icon" alt="Terms" />
        <span>Terms of service</span>
      </div>
      <div className="settings-item">
        <img src="/icon/shield.svg" className="settings-icon" alt="Privacy" />
        <span>Privacy policy</span>
      </div>
      <div className="settings-item" onClick={() => setShowFeedbackModal(true)}>
        <img src="/icon/flag.svg" className="settings-icon" alt="Feedback" />
        <span>Send feedback</span>
      </div>
      <div className="settings-item" onClick={() => setShowBillingModal(true)}>
        <img src="/icon/dollar-sign.svg" className="settings-icon" alt="Billing" />
        <span>Billing Support</span>
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
