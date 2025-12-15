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
        <span className={`fi fi-${currentLang.flag} w-5 h-4 rounded-sm`} />
        <span className="text-sm text-text-primary">{currentLang.name}</span>
        <Icon 
          name="chevron-down" 
          size="sm" 
          color="gray-medium"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-bg-primary border border-gray-200 rounded-lg shadow-popup py-1 min-w-[180px] max-h-[300px] overflow-y-auto z-popup">
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-2.5 px-4 h-10 text-sm leading-none hover:bg-bg-hover ${
                lang.code === i18n.language ? 'text-primary bg-primary-light' : 'text-text-primary'
              }`}
            >
              <span className={`fi fi-${lang.flag} w-5 h-4 rounded-sm shrink-0`} />
              <span className="truncate">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
