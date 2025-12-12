import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../hooks/useLanguage'
import { cn } from '../../lib/utils'
import Icon from './Icon'

const LanguageSwitcher = ({ compact = false }) => {
  const { t } = useTranslation()
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
      <div className="inline-flex items-center relative" ref={dropdownRef}>
        <button 
          className={cn(
            "flex items-center gap-1.5 py-1.5 px-2.5 rounded-md",
            "bg-bg-secondary border border-border-light",
            "text-text-primary text-sm cursor-pointer",
            "transition-all duration-200",
            "hover:border-accent"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="font-medium">{currentLanguage.toUpperCase()}</span>
          <Icon 
            name="chevron-down" 
            size="sm"
            color="muted"
            className={cn("transition-transform duration-200", isOpen && "rotate-180")}
          />
        </button>
        
        {isOpen && (
          <div className={cn(
            "absolute top-full right-0 mt-1 min-w-[160px]",
            "bg-bg-primary border border-border-light rounded-lg",
            "shadow-lg overflow-hidden z-50",
            "animate-fade-in-fast"
          )}>
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                className={cn(
                  "w-full flex items-center gap-2 py-2 px-3",
                  "text-sm text-left bg-transparent border-none cursor-pointer",
                  "text-text-primary transition-colors duration-150",
                  "hover:bg-bg-hover",
                  currentLanguage === lang.code && "bg-bg-secondary"
                )}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="font-medium w-8">{lang.code.toUpperCase()}</span>
                <span className="flex-1 text-text-secondary">{lang.nativeName}</span>
                {currentLanguage === lang.code && (
                  <Icon name="check" size="md" color="primary" themed={false} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="inline-flex items-center relative" ref={dropdownRef}>
      <button 
        className={cn(
          "flex items-center gap-2 py-1.5 px-3 rounded-md",
          "bg-bg-secondary border border-border-light",
          "text-text-primary text-sm cursor-pointer",
          "transition-all duration-200",
          "hover:border-accent focus:outline-none focus:border-accent focus:ring-2 focus:ring-primary/20"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon name="globe" alt={t('analysis.language')} size="md" color="muted" />
        <span>{currentLangInfo.nativeName}</span>
        <Icon 
          name="chevron-down"
          size="sm"
          color="muted"
          className={cn("transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>
      
      {isOpen && (
        <div className={cn(
          "absolute top-full left-0 mt-1 min-w-[200px]",
          "bg-bg-primary border border-border-light rounded-lg",
          "shadow-lg overflow-hidden z-50",
          "animate-fade-in-fast"
        )}>
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              className={cn(
                "w-full flex items-center gap-2 py-2.5 px-3",
                "text-sm text-left bg-transparent border-none cursor-pointer",
                "text-text-primary transition-colors duration-150",
                "hover:bg-bg-hover",
                currentLanguage === lang.code && "bg-bg-secondary"
              )}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="flex-1">{lang.nativeName}</span>
              <span className="text-text-secondary text-xs">({lang.name})</span>
              {currentLanguage === lang.code && (
                <Icon name="check" size="md" color="primary" themed={false} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
