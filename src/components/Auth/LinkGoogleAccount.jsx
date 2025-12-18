import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const LinkGoogleAccount = ({ isLinked, linkedEmail, onLink, onUnlink, isLoading }) => {
  const { t } = useTranslation()
  const [error, setError] = useState('')
  const [localLoading, setLocalLoading] = useState(false)

  const handleLink = async () => {
    setError('')
    setLocalLoading(true)
    try { await onLink() }
    catch (err) { 
      // Use i18n key if available, otherwise fallback to error message
      const errorMessage = err.i18nKey ? t(err.i18nKey) : (err.message || t('auth.email.linkFailed'))
      setError(errorMessage)
    }
    finally { setLocalLoading(false) }
  }

  const handleUnlink = async () => {
    setError('')
    setLocalLoading(true)
    try { await onUnlink() }
    catch (err) { setError(err.message || t('auth.email.unlinkFailed')) }
    finally { setLocalLoading(false) }
  }

  return (
    <div className="p-5 bg-bg-secondary dark:bg-bg-primary rounded-xl border border-border">
      <div className="flex items-center gap-3 mb-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <h4 className="m-0 text-base font-semibold text-text-primary">{t('auth.email.googleLinkTitle')}</h4>
      </div>
      
      <p className="m-0 mb-4 text-sm text-text-muted leading-relaxed">
        {isLinked ? t('auth.email.googleLinkedDesc') : t('auth.email.googleNotLinkedDesc')}
      </p>
      
      {isLinked && linkedEmail && (
        <>
          <div className="flex items-center gap-2 p-3 bg-bg-primary dark:bg-bg-secondary rounded-lg mb-4 border border-transparent dark:border-border">
            <span className="text-xs text-text-muted">{t('auth.email.linkedAs')}</span>
            <span className="text-sm font-medium text-text-primary">{linkedEmail}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-transparent border border-border-light rounded-lg mb-4 text-sm text-text-secondary font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>{t('auth.email.driveSyncEnabled') || 'Google Drive sync enabled'}</span>
          </div>
        </>
      )}
      
      {error && <div className="flex items-center gap-2.5 p-3.5 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>{error}
      </div>}
      
      {isLinked ? (
        <button type="button" onClick={handleUnlink} disabled={isLoading || localLoading}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 text-sm font-medium rounded-lg bg-transparent text-text-secondary border border-border-light hover:bg-bg-hover hover:text-text-primary hover:border-border-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all">
          {localLoading ? (
            <><span className="inline-block w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin"/>{t('auth.email.unlinking')}</>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
              {t('auth.email.unlinkGoogle')}
            </>
          )}
        </button>
      ) : (
        <>
          <button type="button" onClick={handleLink} disabled={isLoading || localLoading}
            className="flex items-center justify-center gap-2.5 w-full py-3 px-4 bg-bg-primary dark:bg-bg-secondary border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-bg-secondary dark:hover:bg-bg-hover hover:border-border-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all">
            {localLoading ? <span className="inline-block w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin"/> : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            )}
            {localLoading ? t('auth.email.linking') : t('auth.email.linkGoogle')}
          </button>
          <p className="m-0 mt-3 text-xs text-text-muted text-center">{t('auth.email.linkGoogleNote') || 'Link your Google account to enable Google Drive sync for your notes.'}</p>
        </>
      )}
    </div>
  )
}

export default LinkGoogleAccount
