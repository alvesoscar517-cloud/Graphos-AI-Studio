import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'

const LinkGooglePrompt = ({ onLink, onClose }) => {
  const { t } = useTranslation()
  const [isLinking, setIsLinking] = useState(false)

  const handleLink = async () => {
    setIsLinking(true)
    try {
      await onLink()
    } finally {
      setIsLinking(false)
    }
  }

  return createPortal(
    <div 
      className={cn(
        "fixed inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center p-5 animate-fade-in",
        "max-md:p-3 max-md:items-end"
      )}
      style={{ zIndex: 999999 }}
      onClick={onClose}
    >
      <div 
        className={cn(
          "bg-bg-primary rounded-xl p-6 w-full max-w-[380px] text-center relative",
          "shadow-modal animate-slide-up border border-border-light",
          "max-md:max-w-full max-md:rounded-t-xl max-md:rounded-b-none max-md:p-5"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className={cn(
            "absolute top-4 right-4 bg-transparent border-none cursor-pointer p-1",
            "text-text-muted rounded-full transition-colors duration-200",
            "hover:bg-bg-hover"
          )}
          onClick={onClose}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="mb-4 flex justify-center">
          <svg width="56" height="56" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
            <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
            <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
            <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
            <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
            <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
            <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
          </svg>
        </div>

        <h3 className="text-lg font-medium text-text-primary m-0 mb-2">
          {t('auth.email.linkGoogleRequired', 'Link Google Account')}
        </h3>
        
        <p className="text-sm text-text-muted m-0 mb-6 leading-relaxed">
          {t('auth.email.linkGoogleDesc', 'To use Google Drive sync, please link your Google account first.')}
        </p>

        <button 
          className={cn(
            "flex items-center justify-center gap-2.5 w-full py-3 px-6",
            "bg-bg-secondary border border-border-light rounded-xl",
            "text-sm font-medium text-text-primary cursor-pointer transition-all duration-200",
            "hover:bg-bg-hover hover:border-border-hover",
            "active:scale-[0.98]",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          onClick={handleLink}
          disabled={isLinking}
        >
          <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z" fill="#4285F4"/>
            <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
            <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
            <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
          </svg>
          <span>
            {isLinking 
              ? t('auth.email.linking', 'Linking...') 
              : t('auth.email.linkGoogle', 'Link Google Account')
            }
          </span>
        </button>

        <button 
          className={cn(
            "bg-transparent border-none text-text-muted text-sm cursor-pointer mt-4 py-2 px-4",
            "hover:text-text-primary"
          )}
          onClick={onClose}
        >
          {t('common.cancel') || 'Cancel'}
        </button>
      </div>
    </div>,
    document.body
  )
}

export default LinkGooglePrompt
