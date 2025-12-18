import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '@config/languages'
import Icon from './Icon'

function LanguageSelector({ mobile = false }) {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0]

  useEffect(() => {
    const handleClickOutside = event => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = code => {
    i18n.changeLanguage(code)
    setIsOpen(false)
  }

  // Mobile: inline expandable list instead of dropdown
  if (mobile) {
    return (
      <div ref={ref} className="w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-hover transition-colors mx-auto"
        >
          <span 
            className={`fi fis fi-${currentLang.flag} rounded-full flex-shrink-0`}
            style={{ fontSize: '20px' }}
          />
          <span className="text-sm text-text-primary">{currentLang.name}</span>
          <Icon 
            name="chevron-down" 
            size="sm" 
            color="gray-medium"
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {isOpen && (
          <div className="mt-2 grid grid-cols-2 gap-1.5 px-1">
            {SUPPORTED_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  lang.code === i18n.language 
                    ? 'text-primary bg-primary-light' 
                    : 'text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span 
                  className={`fi fis fi-${lang.flag} rounded-full flex-shrink-0`}
                  style={{ fontSize: '18px' }}
                />
                <span className="truncate text-left">{lang.name}</span>
                {lang.code === i18n.language && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Desktop: dropdown menu
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-hover transition-colors"
      >
        <span 
          className={`fi fis fi-${currentLang.flag} rounded-full flex-shrink-0`}
          style={{ fontSize: '20px' }}
        />
        <span className="text-sm text-text-primary hidden sm:inline">{currentLang.name}</span>
        <Icon 
          name="chevron-down" 
          size="sm" 
          color="gray-medium"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-bg-primary border border-gray-200 dark:border-gray-700 rounded-xl shadow-popup py-1.5 min-w-[200px] max-h-[320px] overflow-y-auto scrollbar-hidden z-popup">
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-3 mx-1.5 px-3 py-2.5 text-sm leading-none rounded-lg transition-colors ${
                lang.code === i18n.language ? 'text-primary bg-primary-light' : 'text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              style={{ width: 'calc(100% - 12px)' }}
            >
              <span 
                className={`fi fis fi-${lang.flag} rounded-full flex-shrink-0`}
                style={{ fontSize: '20px' }}
              />
              <span className="truncate">{lang.name}</span>
              {lang.code === i18n.language && (
                <span className="ml-auto w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
