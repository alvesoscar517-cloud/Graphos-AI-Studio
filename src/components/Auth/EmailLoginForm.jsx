import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './EmailAuth.css'

const EmailLoginForm = ({ onLogin, onSwitchToRegister, onForgotPassword, isLoading }) => {
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
      setError(err.message || t('auth.email.loginFailed'))
    }
  }

  return (
    <form className="email-auth-form" onSubmit={handleSubmit}>
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
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>
      
      {error && <div className="form-error">{error}</div>}
      
      <button 
        type="submit" 
        className="email-auth-btn primary"
        disabled={isLoading}
      >
        {isLoading ? t('auth.email.loggingIn') : t('auth.email.loginBtn')}
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
      
      <button 
        type="button" 
        className="email-auth-btn secondary"
        onClick={onSwitchToRegister}
        disabled={isLoading}
      >
        {t('auth.email.createAccount')}
      </button>
    </form>
  )
}

export default EmailLoginForm
