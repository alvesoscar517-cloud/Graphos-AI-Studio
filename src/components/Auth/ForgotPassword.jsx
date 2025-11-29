import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import OTPVerification from './OTPVerification'
import './EmailAuth.css'

const ForgotPassword = ({ onResetPassword, onCancel, isLoading }) => {
  const { t } = useTranslation()
  const [step, setStep] = useState('email') // email, otp, newPassword
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)

  const handleRequestReset = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError(t('auth.email.emailRequired'))
      return
    }
    
    setLocalLoading(true)
    try {
      await onResetPassword.request(email)
      setStep('otp')
    } catch (err) {
      // Handle network error with i18n
      if (err.isNetworkError || err.message === 'NETWORK_ERROR') {
        setError(t('errors.networkError'))
      } else {
        setError(err.message || t('auth.email.resetRequestFailed'))
      }
    } finally {
      setLocalLoading(false)
    }
  }

  const handleVerifyOTP = async (code) => {
    setOtp(code)
    setStep('newPassword')
  }

  const handleResendOTP = async () => {
    await onResetPassword.request(email)
  }

  const handleSetNewPassword = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!newPassword) {
      setError(t('auth.email.passwordRequired'))
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError(t('auth.email.passwordMismatch'))
      return
    }
    
    // Basic password validation
    if (newPassword.length < 8) {
      setError(t('auth.email.pwdMin8'))
      return
    }
    
    setLocalLoading(true)
    try {
      await onResetPassword.complete(email, otp, newPassword)
    } catch (err) {
      // Handle network error with i18n
      if (err.isNetworkError || err.message === 'NETWORK_ERROR') {
        setError(t('errors.networkError'))
      } else {
        setError(err.message || t('auth.email.resetFailed'))
        // If OTP is invalid, go back to OTP step
        if (err.message?.includes('OTP') || err.message?.includes('code')) {
          setStep('otp')
        }
      }
    } finally {
      setLocalLoading(false)
    }
  }

  if (step === 'otp') {
    return (
      <OTPVerification
        email={email}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        onCancel={() => setStep('email')}
        isLoading={isLoading || localLoading}
      />
    )
  }

  if (step === 'newPassword') {
    return (
      <form className="email-auth-form" onSubmit={handleSetNewPassword}>
        <div className="form-header">
          <h3>{t('auth.email.setNewPassword')}</h3>
          <p>{t('auth.email.setNewPasswordSubtitle')}</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="newPassword">{t('auth.email.newPasswordLabel')}</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('auth.email.newPasswordPlaceholder')}
              disabled={isLoading || localLoading}
              autoComplete="new-password"
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
        
        <div className="form-group">
          <label htmlFor="confirmNewPassword">{t('auth.email.confirmPasswordLabel')}</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirmNewPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('auth.email.confirmPasswordPlaceholder')}
            disabled={isLoading || localLoading}
            autoComplete="new-password"
          />
        </div>
        
        {error && <div className="form-error">{error}</div>}
        
        <button 
          type="submit" 
          className="email-auth-btn primary"
          disabled={isLoading || localLoading}
        >
          {localLoading ? t('auth.email.resetting') : t('auth.email.resetPasswordBtn')}
        </button>
        
        <button 
          type="button" 
          className="link-btn cancel"
          onClick={onCancel}
          disabled={isLoading || localLoading}
        >
          {t('auth.email.cancel')}
        </button>
      </form>
    )
  }

  // Email step
  return (
    <form className="email-auth-form" onSubmit={handleRequestReset}>
      <div className="form-header">
        <h3>{t('auth.email.forgotPasswordTitle')}</h3>
        <p>{t('auth.email.forgotPasswordSubtitle')}</p>
      </div>
      
      <div className="form-group">
        <label htmlFor="resetEmail">{t('auth.email.emailLabel')}</label>
        <input
          type="email"
          id="resetEmail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.email.emailPlaceholder')}
          disabled={isLoading || localLoading}
          autoComplete="email"
        />
      </div>
      
      {error && <div className="form-error">{error}</div>}
      
      <button 
        type="submit" 
        className="email-auth-btn primary"
        disabled={isLoading || localLoading}
      >
        {localLoading ? t('auth.email.sending') : t('auth.email.sendResetCode')}
      </button>
      
      <button 
        type="button" 
        className="link-btn cancel"
        onClick={onCancel}
        disabled={isLoading || localLoading}
      >
        {t('auth.email.backToLogin')}
      </button>
    </form>
  )
}

export default ForgotPassword
