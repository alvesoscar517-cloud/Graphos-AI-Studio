import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import { useRegisterForm } from '../../hooks/forms'

const EmailRegisterFormV2 = ({ onRegister, onSwitchToLogin, isLoading: externalLoading }) => {
  const { t } = useTranslation()
  
  // Helper to parse and translate registration errors
  const getRegisterErrorMessage = (err) => {
    const message = err.message || ''
    const errorCode = err.code || message.split(':')[0]?.trim()
    
    switch (errorCode) {
      case 'AUTH_EMAIL_EXISTS':
        return t('auth.email.emailAlreadyExists', 'This email is already registered. Please login instead.')
        
      case 'AUTH_WEAK_PASSWORD':
        return t('auth.errors.weakPassword', 'Password does not meet requirements. Please use a stronger password.')
        
      case 'AUTH_INVALID_EMAIL':
        return t('auth.errors.invalidEmail', 'Invalid email format. Please check your email address.')
        
      case 'AUTH_INVALID_NAME':
        return t('auth.errors.invalidName', 'Invalid display name. Please use only letters, numbers, and spaces.')
        
      case 'AUTH_DISPOSABLE_EMAIL':
        return t('auth.errors.disposableEmail', 'Disposable email addresses are not allowed. Please use a permanent email.')
        
      case 'AUTH_SERVICE_UNAVAILABLE':
      case 'AUTH_SERVICE_ERROR':
        return t('errors.serviceUnavailable', 'Service is temporarily unavailable. Please try again later.')
        
      case 'NETWORK_ERROR':
        return t('errors.networkError', 'Connection error. Please check your network.')
        
      default:
        const colonIndex = message.indexOf(':')
        if (colonIndex > 0) {
          return message.substring(colonIndex + 1).trim()
        }
        return message || t('auth.email.registerFailed', 'Registration failed. Please try again.')
    }
  }

  const {
    register,
    handleSubmit,
    errors,
    isLoading,
    rootError,
    watch,
    showPassword,
    togglePassword
  } = useRegisterForm(async (data) => {
    try {
      await onRegister(data.email, data.password, data.displayName.trim())
    } catch (err) {
      // Re-throw with translated message so the hook can display it
      const errorMessage = getRegisterErrorMessage(err)
      throw new Error(errorMessage)
    }
  })

  const password = watch('password')
  const confirmPassword = watch('confirmPassword')
  const loading = isLoading || externalLoading

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

  const strengthColors = {
    weak: 'bg-gradient-to-r from-red-500 to-red-400',
    fair: 'bg-gradient-to-r from-amber-500 to-amber-400',
    good: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    strong: 'bg-gradient-to-r from-emerald-600 to-emerald-500'
  }
  const strengthTextColors = {
    none: 'text-transparent', weak: 'text-error', fair: 'text-amber-500',
    good: 'text-emerald-500', strong: 'text-emerald-600'
  }

  const inputClass = cn(
    "w-full pl-11 pr-3.5 py-3 text-sm border border-gray-200 rounded-xl",
    "bg-white text-gray-900 transition-all duration-200",
    "focus:outline-none focus:border-system-blue focus:ring-2 focus:ring-system-blue/20",
    "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
    "placeholder:text-gray-400"
  )

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="text-center mb-5">
        <div className="mb-4">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center overflow-hidden">
            <svg className="w-7 h-7 shrink-0 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
            </svg>
          </div>
        </div>
        <h3 className="m-0 mb-1 text-xl font-semibold text-gray-900">{t('auth.getStarted')}</h3>
        <p className="m-0 text-sm text-gray-500">{t('auth.email.registerSubtitle', 'Create your account to get started')}</p>
      </div>

      {/* Name Field */}
      <div className="mb-3.5 text-left">
        <label htmlFor="displayName" className="block mb-1.5 text-sm font-medium text-gray-600">
          {t('auth.email.nameLabel')}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          <input 
            type="text" 
            id="displayName" 
            {...register('displayName')}
            placeholder={t('auth.email.namePlaceholder')} 
            disabled={loading} 
            autoComplete="name" 
            maxLength={50} 
            className={cn(inputClass, errors.displayName && "border-red-300")} 
          />
        </div>
        {errors.displayName && (
          <span className="text-xs text-red-500 mt-1 block">{errors.displayName.message}</span>
        )}
      </div>

      {/* Email Field */}
      <div className="mb-3.5 text-left">
        <label htmlFor="registerEmail" className="block mb-1.5 text-sm font-medium text-gray-600">
          {t('auth.email.emailLabel')}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M22 7l-10 6L2 7"/>
            </svg>
          </span>
          <input 
            type="email" 
            id="registerEmail" 
            {...register('email')}
            placeholder={t('auth.email.emailPlaceholder')} 
            disabled={loading} 
            autoComplete="email" 
            className={cn(inputClass, errors.email && "border-red-300")} 
          />
        </div>
        {errors.email && (
          <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>
        )}
      </div>

      {/* Password Field */}
      <div className="mb-3.5 text-left">
        <label htmlFor="registerPassword" className="block mb-1.5 text-sm font-medium text-gray-600">
          {t('auth.email.passwordLabel')}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <input 
            type={showPassword ? 'text' : 'password'} 
            id="registerPassword" 
            {...register('password')}
            placeholder={t('auth.email.passwordPlaceholder')}
            disabled={loading} 
            autoComplete="new-password" 
            className={cn(inputClass, "pr-12", errors.password && "border-red-300")} 
          />
          <button 
            type="button" 
            onClick={togglePassword} 
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded transition-all"
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>
        )}
        {/* Strength Bar */}
        <div className="min-h-[24px] mt-2.5">
          {password && (
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-300", strengthColors[passwordStrength.level])}
                  style={{ width: `${passwordStrength.score}%` }} 
                />
              </div>
              <span className={cn("text-2xs font-semibold uppercase tracking-wide min-w-[60px] text-right", strengthTextColors[passwordStrength.level])}>
                {t(`auth.email.strength.${passwordStrength.level}`)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Password */}
      <div className="mb-3.5 text-left">
        <label htmlFor="confirmPassword" className="block mb-1.5 text-sm font-medium text-gray-600">
          {t('auth.email.confirmPasswordLabel')}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </span>
          <input 
            type={showPassword ? 'text' : 'password'} 
            id="confirmPassword" 
            {...register('confirmPassword')}
            placeholder={t('auth.email.confirmPasswordPlaceholder')}
            disabled={loading} 
            autoComplete="new-password" 
            className={cn(inputClass, errors.confirmPassword && "border-red-300")} 
          />
        </div>
        <div className="min-h-[24px] mt-1.5">
          {errors.confirmPassword ? (
            <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>
          ) : (
            <span className={cn("text-sm text-error font-medium transition-opacity duration-150",
              confirmPassword && password !== confirmPassword ? "opacity-100" : "opacity-0")}>
              {t('auth.email.passwordMismatch')}
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {rootError && (
        <div className="flex items-center gap-2.5 p-3.5 mb-5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-left">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {rootError}
        </div>
      )}

      {/* Submit */}
      <button 
        type="submit" 
        disabled={loading || passwordStrength.score < 50}
        className={cn(
          "w-full py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200",
          "bg-system-blue text-white hover:brightness-110 active:scale-[0.98] active:brightness-95",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
        )}
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin mr-2 align-middle" />
            {t('auth.email.registering')}
          </>
        ) : t('auth.email.registerBtn')}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{t('auth.email.or')}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Switch to Login */}
      <button 
        type="button" 
        onClick={onSwitchToLogin} 
        disabled={loading}
        className={cn(
          "w-full py-3 px-4 text-sm font-medium rounded-xl transition-all duration-200",
          "bg-white text-gray-800 border border-gray-200",
          "hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 active:scale-[0.98]",
          "disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        {t('auth.email.alreadyHaveAccount')}
      </button>
    </form>
  )
}

export default EmailRegisterFormV2
