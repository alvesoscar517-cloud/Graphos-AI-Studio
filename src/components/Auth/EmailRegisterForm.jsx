import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import './EmailAuth.css'

const EmailRegisterForm = ({ onRegister, onSwitchToLogin, isLoading }) => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, level: 'none', feedback: [] }
    
    let score = 0
    const feedback = []
    
    if (password.length >= 8) score += 20
    else feedback.push(t('auth.email.pwdMin8'))
    
    if (password.length >= 12) score += 10
    if (password.length >= 16) score += 10
    
    if (/[a-z]/.test(password)) score += 15
    else feedback.push(t('auth.email.pwdLowercase'))
    
    if (/[A-Z]/.test(password)) score += 15
    else feedback.push(t('auth.email.pwdUppercase'))
    
    if (/[0-9]/.test(password)) score += 15
    else feedback.push(t('auth.email.pwdNumber'))
    
    if (/[^a-zA-Z0-9]/.test(password)) score += 15
    
    let level = 'weak'
    if (score >= 70) level = 'strong'
    else if (score >= 50) level = 'good'
    else if (score >= 30) level = 'fair'
    
    return { score: Math.min(100, score), level, feedback }
  }, [password, t])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password || !displayName) {
      setError(t('auth.email.fieldsRequired'))
      return
    }
    
    if (password !== confirmPassword) {
      setError(t('auth.email.passwordMismatch'))
      return
    }
    
    if (passwordStrength.score < 50) {
      setError(t('auth.email.passwordTooWeak'))
      return
    }
    
    if (displayName.trim().length < 2) {
      setError(t('auth.email.nameTooShort'))
      return
    }
    
    try {
      await onRegister(email, password, displayName.trim())
    } catch (err) {
      // Handle network error with i18n
      if (err.isNetworkError || err.message === 'NETWORK_ERROR') {
        setError(t('errors.networkError'))
      } else if (err.message?.includes('already registered') || err.message?.includes('AUTH_EMAIL_EXISTS')) {
        // Email already exists - suggest login instead
        setError(t('auth.email.emailAlreadyExists', 'This email is already registered. Please login instead.'))
      } else {
        setError(err.message || t('auth.email.registerFailed'))
      }
    }
  }

  return (
    <form className="email-auth-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>{t('auth.getStarted')}</h3>
      </div>
      
      <div className="form-group">
        <label htmlFor="displayName">{t('auth.email.nameLabel')}</label>
        <input
          type="text"
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={t('auth.email.namePlaceholder')}
          disabled={isLoading}
          autoComplete="name"
          maxLength={50}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="registerEmail">{t('auth.email.emailLabel')}</label>
        <input
          type="email"
          id="registerEmail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.email.emailPlaceholder')}
          disabled={isLoading}
          autoComplete="email"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="registerPassword">{t('auth.email.passwordLabel')}</label>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="registerPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.email.passwordPlaceholder')}
            disabled={isLoading}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
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
        
        {/* Always show strength bar container to prevent modal jumping */}
        <div className="password-strength-container">
          {password && (
            <div className="password-strength">
              <div className="strength-bar">
                <div
                  className={`strength-fill ${passwordStrength.level}`}
                  style={{ width: `${passwordStrength.score}%` }}
                />
              </div>
              <span className={`strength-label ${passwordStrength.level}`}>
                {t(`auth.email.strength.${passwordStrength.level}`)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="confirmPassword">{t('auth.email.confirmPasswordLabel')}</label>
        <input
          type={showPassword ? 'text' : 'password'}
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t('auth.email.confirmPasswordPlaceholder')}
          disabled={isLoading}
          autoComplete="new-password"
        />
        {/* Fixed height container to prevent modal jumping */}
        <div className="field-error-container">
          <span className={`field-error ${confirmPassword && password !== confirmPassword ? 'visible' : ''}`}>
            {t('auth.email.passwordMismatch')}
          </span>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <button
        type="submit"
        className="email-auth-btn primary"
        disabled={isLoading || passwordStrength.score < 50}
      >
        {isLoading ? (
          <>
            <span className="btn-spinner" />
            {t('auth.email.registering')}
          </>
        ) : (
          t('auth.email.registerBtn')
        )}
      </button>

      <div className="form-divider">
        <span>{t('auth.email.or')}</span>
      </div>

      <button
        type="button"
        className="email-auth-btn secondary"
        onClick={onSwitchToLogin}
        disabled={isLoading}
      >
        {t('auth.email.alreadyHaveAccount')}
      </button>
    </form>
  )
}

export default EmailRegisterForm
