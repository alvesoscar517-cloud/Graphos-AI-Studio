import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '@config/languages'
import Icon from './Icon'

function LanguageSelector() {
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-hover transition-colors"
      >
        <div 
          className={`fi fi-${currentLang.flag} !w-6 !h-6 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm flex-shrink-0`}
          style={{ backgroundSize: '150%', backgroundPosition: 'center' }}
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
              <div 
                className={`fi fi-${lang.flag} !w-6 !h-6 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm flex-shrink-0`}
                style={{ backgroundSize: '150%', backgroundPosition: 'center' }}
              />
              <span className="truncate">{lang.name}</span>
              {lang.code === i18n.language && (
                <Icon name="check" size="sm" className="ml-auto text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
