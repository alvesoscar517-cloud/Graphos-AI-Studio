import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import './EmailAuth.css'

const ChangePassword = ({ onChangePassword, onCancel, isLoading }) => {
  const { t } = useTranslation()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, level: 'none', feedback: [] }
    
    let score = 0
    const feedback = []
    
    if (newPassword.length >= 8) score += 20
    else feedback.push(t('auth.email.pwdMin8'))
    
    if (newPassword.length >= 12) score += 10
    if (newPassword.length >= 16) score += 10
    
    if (/[a-z]/.test(newPassword)) score += 15
    else feedback.push(t('auth.email.pwdLowercase'))
    
    if (/[A-Z]/.test(newPassword)) score += 15
    else feedback.push(t('auth.email.pwdUppercase'))
    
    if (/[0-9]/.test(newPassword)) score += 15
    else feedback.push(t('auth.email.pwdNumber'))
    
    if (/[^a-zA-Z0-9]/.test(newPassword)) score += 15
    else feedback.push(t('auth.email.pwdSpecial'))
    
    let level = 'weak'
    if (score >= 70) level = 'strong'
    else if (score >= 50) level = 'good'
    else if (score >= 30) level = 'fair'
    
    return { score: Math.min(100, score), level, feedback }
  }, [newPassword, t])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    
    if (!currentPassword || !newPassword) {
      setError(t('auth.email.fieldsRequired'))
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError(t('auth.email.passwordMismatch'))
      return
    }
    
    if (passwordStrength.score < 50) {
      setError(t('auth.email.passwordTooWeak'))
      return
    }
    
    if (currentPassword === newPassword) {
      setError(t('auth.email.passwordSameAsCurrent'))
      return
    }
    
    setLocalLoading(true)
    try {
      await onChangePassword(currentPassword, newPassword)
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message || t('auth.email.changePasswordFailed'))
    } finally {
      setLocalLoading(false)
    }
  }

  if (success) {
    return (
      <div className="change-password-success">
        <div className="success-icon">✓</div>
        <h3>{t('auth.email.passwordChangedTitle')}</h3>
        <p>{t('auth.email.passwordChangedMessage')}</p>
        <button 
          type="button" 
          className="email-auth-btn primary"
          onClick={onCancel}
        >
          {t('auth.email.done')}
        </button>
      </div>
    )
  }

  return (
    <form className="email-auth-form change-password-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>{t('auth.email.changePasswordTitle')}</h3>
        <p>{t('auth.email.changePasswordSubtitle')}</p>
      </div>
      
      <div className="form-group">
        <label htmlFor="currentPassword">{t('auth.email.currentPasswordLabel')}</label>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t('auth.email.currentPasswordPlaceholder')}
            disabled={isLoading || localLoading}
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
        </div>
        
        {/* Always show strength bar container to prevent modal jumping */}
        <div className="password-strength-container">
          {newPassword && (
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
        {/* Fixed height container to prevent modal jumping */}
        <div className="field-error-container">
          <span className={`field-error ${confirmPassword && newPassword !== confirmPassword ? 'visible' : ''}`}>
            {t('auth.email.passwordMismatch')}
          </span>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <button
        type="submit"
        className="email-auth-btn primary"
        disabled={isLoading || localLoading || passwordStrength.score < 50}
      >
        {localLoading ? (
          <>
            <span className="btn-spinner" />
            {t('auth.email.changing')}
          </>
        ) : (
          t('auth.email.changePasswordBtn')
        )}
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

export default ChangePassword
