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
      setError(err.message || t('auth.email.registerFailed'))
    }
  }

  return (
    <form className="email-auth-form" onSubmit={handleSubmit}>
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
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        
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
        
        {passwordStrength.feedback.length > 0 && (
          <ul className="password-feedback">
            {passwordStrength.feedback.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
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
        {confirmPassword && password !== confirmPassword && (
          <span className="field-error">{t('auth.email.passwordMismatch')}</span>
        )}
      </div>
      
      {error && <div className="form-error">{error}</div>}
      
      <button 
        type="submit" 
        className="email-auth-btn primary"
        disabled={isLoading || passwordStrength.score < 50}
      >
        {isLoading ? t('auth.email.registering') : t('auth.email.registerBtn')}
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
