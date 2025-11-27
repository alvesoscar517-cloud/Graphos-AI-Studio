import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import './LanguageSwitcher.css'

const LanguageSwitcher = ({ compact = false }) => {
  const { currentLanguage, changeLanguage, supportedLanguages, getCurrentLanguageInfo } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode)
    setIsOpen(false)
  }

  const currentLangInfo = getCurrentLanguageInfo()

  if (compact) {
    return (
      <div className="language-switcher compact" ref={dropdownRef}>
        <button 
          className="language-btn compact"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="lang-code">{currentLanguage.toUpperCase()}</span>
          <img src="/icon/chevron-down.svg" alt="" className={`chevron ${isOpen ? 'open' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="language-dropdown">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                className={`language-option ${currentLanguage === lang.code ? 'active' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="lang-code">{lang.code.toUpperCase()}</span>
                <span className="lang-name">{lang.nativeName}</span>
                {currentLanguage === lang.code && (
                  <img src="/icon/check.svg" alt="" className="check-icon" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button 
        className="language-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img src="/icon/globe.svg" alt="Language" className="globe-icon" />
        <span className="lang-name">{currentLangInfo.nativeName}</span>
        <img src="/icon/chevron-down.svg" alt="" className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${currentLanguage === lang.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="lang-name">{lang.nativeName}</span>
              <span className="lang-english">({lang.name})</span>
              {currentLanguage === lang.code && (
                <img src="/icon/check.svg" alt="" className="check-icon" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
