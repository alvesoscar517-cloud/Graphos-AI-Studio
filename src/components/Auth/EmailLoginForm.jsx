import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './EmailAuth.css'

const EmailLoginForm = ({ onLogin, onSwitchToRegister, onForgotPassword, onGoogleSignIn, isLoading }) => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError(t('auth.email.fieldsRequired'))
      return
    }
    
    try {
      await onLogin(email, password)
    } catch (err) {
      // Handle specific error codes with i18n
      if (err.isNetworkError || err.message === 'NETWORK_ERROR') {
        setError(t('errors.networkError'))
      } else if (err.code === 'AUTH_ACCOUNT_DELETED') {
        setError(t('auth.errors.accountDeleted', 'This account has been deleted. Please contact support.'))
      } else if (err.code === 'AUTH_ACCOUNT_SUSPENDED') {
        setError(t('auth.errors.accountSuspended', 'Your account has been suspended. Please contact support.'))
      } else if (err.code === 'AUTH_ACCOUNT_LOCKED') {
        setError(t('auth.errors.accountLocked', 'Account temporarily locked. Please try again later.'))
      } else if (err.code === 'AUTH_EMAIL_NOT_VERIFIED') {
        setError(t('auth.errors.emailNotVerified', 'Please verify your email before logging in.'))
      } else {
        setError(err.message || t('auth.email.loginFailed'))
      }
    }
  }

  return (
    <form className="email-auth-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <div className="form-logo">
          <img src="/icons/content.png" alt="Logo" />
        </div>
        <h3>{t('auth.appName')}</h3>
        <p>{t('auth.signInTagline')}</p>
      </div>
      
      <div className="form-group">
        <label htmlFor="email">{t('auth.email.emailLabel')}</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.email.emailPlaceholder')}
          disabled={isLoading}
          autoComplete="email"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">{t('auth.email.passwordLabel')}</label>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.email.passwordPlaceholder')}
            disabled={isLoading}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {error && <div className="form-error">{error}</div>}
      
      <button
        type="submit"
        className="email-auth-btn primary"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="btn-spinner" />
            {t('auth.email.loggingIn')}
          </>
        ) : (
          t('auth.email.loginBtn')
        )}
      </button>
      
      <div className="form-links">
        <button 
          type="button" 
          className="link-btn"
          onClick={onForgotPassword}
          disabled={isLoading}
        >
          {t('auth.email.forgotPassword')}
        </button>
      </div>
      
      <div className="form-divider">
        <span>{t('auth.email.or')}</span>
      </div>
      
      {onGoogleSignIn && (
        <button 
          type="button" 
          className="google-signin-btn"
          onClick={onGoogleSignIn}
          disabled={isLoading}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z" fill="#4285F4"/>
            <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
            <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
            <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
          </svg>
          <span>{t('auth.continueWithGoogle')}</span>
        </button>
      )}
      
      <div className="form-footer-links">
        <span>{t('auth.email.dontHaveAccount')}</span>
        <button 
          type="button" 
          className="link-btn"
          onClick={onSwitchToRegister}
          disabled={isLoading}
        >
          {t('auth.email.createAccount')}
        </button>
      </div>
      
      <p className="login-terms">
        {t('auth.termsAgreement')}{' '}
        <a href="#" className="login-link">{t('auth.termsOfService')}</a> {t('auth.and')}{' '}
        <a href="#" className="login-link">{t('auth.privacyPolicy')}</a>
      </p>
    </form>
  )
}

export default EmailLoginForm
