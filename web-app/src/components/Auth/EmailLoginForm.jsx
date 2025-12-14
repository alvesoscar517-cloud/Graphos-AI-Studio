/**
 * EmailLoginForm Component
 * Uses React Hook Form + Zod for validation via useLoginForm hook
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLoginForm } from '@/hooks/forms'
import { cn } from '@/lib/utils'

const EmailLoginForm = ({ onLogin, onSwitchToRegister, onForgotPassword, onGoogleSignIn, isLoading: externalLoading }) => {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)

  // Helper to parse error message and extract details
  const parseAuthError = (err) => {
    const message = err.message || ''
    
    // Check for network errors
    if (err.isNetworkError || message === 'NETWORK_ERROR') {
      return { errorCode: 'NETWORK_ERROR' }
    }
    
    // Get error code - prefer err.code, fallback to parsing from message
    let errorCode = err.code
    if (!errorCode && message.includes(':')) {
      // Parse from message format: "ERROR_CODE: message" or just the code
      const possibleCode = message.split(':')[0]?.trim()
      if (possibleCode && possibleCode.startsWith('AUTH_')) {
        errorCode = possibleCode
      }
    }
    
    // Extract remaining attempts from message
    const attemptsMatch = message.match(/(\d+)\s*attempts?\s*remaining/i)
    const remainingAttempts = attemptsMatch ? parseInt(attemptsMatch[1]) : null
    
    // Extract lock time from message
    const lockTimeMatch = message.match(/(\d+)\s*minutes?/i)
    const lockMinutes = lockTimeMatch ? parseInt(lockTimeMatch[1]) : null
    
    return { errorCode, remainingAttempts, lockMinutes, originalMessage: message }
  }

  const {
    register,
    handleSubmit,
    setError,
    errors,
    isLoading: formLoading
  } = useLoginForm(async (data) => {
    try {
      await onLogin(data.email, data.password, data.rememberMe)
    } catch (err) {
      const { errorCode, remainingAttempts, lockMinutes, originalMessage } = parseAuthError(err)
      
      let errorMessage
      
      switch (errorCode) {
        case 'AUTH_INVALID_CREDENTIALS':
          if (remainingAttempts !== null) {
            errorMessage = t('auth.errors.invalidCredentialsWithAttempts', {
              defaultValue: 'Invalid email or password. {{count}} attempts remaining.',
              count: remainingAttempts
            })
          } else {
            errorMessage = t('auth.errors.invalidCredentials', 'Invalid email or password.')
          }
          break
          
        case 'AUTH_ACCOUNT_LOCKED':
          if (lockMinutes !== null) {
            errorMessage = t('auth.errors.accountLockedWithTime', {
              defaultValue: 'Account temporarily locked. Please try again in {{minutes}} minutes.',
              minutes: lockMinutes
            })
          } else {
            errorMessage = t('auth.errors.accountLocked', 'Account temporarily locked due to too many failed attempts.')
          }
          break
          
        case 'AUTH_ACCOUNT_DELETED':
          errorMessage = t('auth.errors.accountDeleted', 'This account has been deleted. Contact Support@graphosai.com if you believe this is an error.')
          break
          
        case 'AUTH_ACCOUNT_SUSPENDED':
          errorMessage = t('auth.errors.accountSuspended', 'Your account has been suspended. Please contact Support@graphosai.com for assistance.')
          break
          
        case 'AUTH_EMAIL_NOT_VERIFIED':
          errorMessage = t('auth.errors.emailNotVerified', 'Please verify your email before logging in.')
          break
          
        case 'NETWORK_ERROR':
          errorMessage = t('errors.networkError', 'Connection error. Please check your network.')
          break
          
        default:
          // Use original message if no specific translation
          errorMessage = originalMessage || t('auth.email.loginFailed', 'Login failed. Please try again.')
      }
      
      setError('root', { message: errorMessage })
    }
  })

  const isLoading = externalLoading || formLoading

  const inputClass = cn(
    "w-full pl-11 pr-3.5 py-3 text-sm border border-gray-200 rounded-xl",
    "bg-white text-gray-900 transition-all duration-200",
    "focus:outline-none focus:border-system-blue focus:ring-2 focus:ring-system-blue/20",
    "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
    "placeholder:text-gray-400"
  )

  const inputErrorClass = "border-red-300 focus:border-red-500 focus:ring-red-500/20"

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      {/* Header */}
      <div className="text-center mb-4 sm:mb-5">
        <div className="mb-2 sm:mb-3">
          <img src="/icons/content.png" alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain mx-auto" />
        </div>
        <h3 className="m-0 mb-1 text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">{t('auth.appName')}</h3>
        <p className="m-0 text-xs sm:text-sm text-gray-500">{t('auth.signInTagline')}</p>
      </div>

      {/* Email Field */}
      <div className="mb-3 sm:mb-3.5 text-left">
        <label htmlFor="email" className="block mb-1 sm:mb-1.5 text-xs sm:text-sm font-medium text-gray-600">
          {t('auth.email.emailLabel')}
        </label>
        <div className="relative">
          <span className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/>
            </svg>
          </span>
          <input
            type="email"
            id="email"
            {...register('email')}
            placeholder={t('auth.email.emailPlaceholder')}
            disabled={isLoading}
            autoComplete="email"
            className={cn(inputClass, "pl-9 sm:pl-11 py-2.5 sm:py-3 text-xs sm:text-sm", errors.email && inputErrorClass)}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-[10px] sm:text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>
      
      {/* Password Field */}
      <div className="mb-4 sm:mb-5 text-left">
        <label htmlFor="password" className="block mb-1 sm:mb-1.5 text-xs sm:text-sm font-medium text-gray-600">
          {t('auth.email.passwordLabel')}
        </label>
        <div className="relative">
          <span className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            {...register('password')}
            placeholder={t('auth.email.passwordPlaceholder')}
            disabled={isLoading}
            autoComplete="current-password"
            className={cn(inputClass, "pl-9 sm:pl-11 py-2.5 sm:py-3 text-xs sm:text-sm pr-10 sm:pr-12", errors.password && inputErrorClass)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded transition-all"
          >
            {showPassword ? (
              <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-[10px] sm:text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <input
          type="checkbox"
          id="rememberMe"
          {...register('rememberMe')}
          disabled={isLoading}
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 accent-system-blue rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          style={{ outline: 'none', boxShadow: 'none' }}
        />
        <label htmlFor="rememberMe" className="text-xs sm:text-sm text-gray-600 cursor-pointer select-none">
          {t('auth.email.rememberMe', 'Remember me')}
        </label>
      </div>
      
      {/* Root Error */}
      {errors.root && (
        <div className="flex items-center gap-2 sm:gap-2.5 p-3 sm:p-3.5 mb-4 sm:mb-5 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-600">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" fill="#dc2626">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {errors.root.message}
        </div>
      )}
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "w-full py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200",
          "bg-system-blue text-white hover:brightness-110 active:scale-[0.98]",
          "disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <>
            <span className="inline-block w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-transparent border-t-current rounded-full animate-spin mr-2" />
            {t('auth.email.loggingIn')}
          </>
        ) : t('auth.email.loginBtn')}
      </button>
      
      {/* Forgot Password */}
      <div className="text-center mt-2">
        <button type="button" onClick={onForgotPassword} disabled={isLoading}
          className="bg-transparent border-none text-system-blue text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-system-blue/10 disabled:opacity-40 transition-all">
          {t('auth.email.forgotPassword')}
        </button>
      </div>
      
      {/* Divider */}
      <div className="flex items-center gap-2 sm:gap-3 my-2.5 sm:my-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">{t('auth.email.or')}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
     
      {/* Google Sign In */}
      {onGoogleSignIn && (
        <button type="button" onClick={onGoogleSignIn} disabled={isLoading}
          className={cn(
            "flex items-center justify-center gap-2 sm:gap-2.5 w-full py-2.5 sm:py-3 px-4",
            "bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-800",
            "hover:bg-gray-50 active:scale-[0.98] disabled:opacity-40 transition-all"
          )}>
          <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z" fill="#4285F4"/>
            <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
            <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
            <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
          </svg>
          <span>{t('auth.continueWithGoogle')}</span>
        </button>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-center gap-1 mt-2.5 sm:mt-3 text-xs sm:text-sm text-gray-500 flex-wrap">
        <span>{t('auth.email.dontHaveAccount')}</span>
        <button type="button" onClick={onSwitchToRegister} disabled={isLoading}
          className="bg-transparent border-none text-system-blue text-xs sm:text-sm font-semibold px-1 sm:px-1.5 py-0.5 sm:py-1 rounded hover:underline disabled:opacity-40 transition-all">
          {t('auth.email.createAccount')}
        </button>
      </div>
      
      {/* Terms */}
      <p className="mt-2.5 sm:mt-3 text-[9px] sm:text-[10px] text-gray-400 leading-relaxed text-center">
        {t('auth.termsAgreement')}{' '}
        <span className="text-system-blue font-medium cursor-pointer hover:underline">{t('auth.termsOfService')}</span> {t('auth.and')}{' '}
        <span className="text-system-blue font-medium cursor-pointer hover:underline">{t('auth.privacyPolicy')}</span>
      </p>
    </form>
  )
}

export default EmailLoginForm
