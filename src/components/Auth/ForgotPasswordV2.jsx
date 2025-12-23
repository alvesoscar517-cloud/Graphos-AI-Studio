import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import { useForgotPasswordForm, useResetPasswordForm } from '../../hooks/forms'
import OTPVerification from './OTPVerification'

const ForgotPasswordV2 = ({ onResetPassword, onCancel, isLoading: externalLoading }) => {
  const { t } = useTranslation()
  const [step, setStep] = useState('email') // email, otp, newPassword, success
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [emailSentSuccess, setEmailSentSuccess] = useState(false)

  // Helper to parse and translate password reset errors
  const getResetErrorMessage = (err) => {
    const message = err.message || ''
    const errorCode = err.code || message.split(':')[0]?.trim()
    
    switch (errorCode) {
      case 'AUTH_USER_NOT_FOUND':
        // Don't reveal if email exists for security
        return t('auth.errors.resetEmailSent', 'If this email exists, a reset code has been sent.')
        
      case 'AUTH_INVALID_OTP':
        if (message.toLowerCase().includes('expired')) {
          return t('auth.errors.otpExpired', 'Reset code has expired. Please request a new one.')
        }
        return t('auth.errors.invalidResetCode', 'Invalid reset code. Please check and try again.')
        
      case 'AUTH_WEAK_PASSWORD':
        return t('auth.errors.weakPassword', 'Password does not meet requirements. Please use a stronger password.')
        
      case 'AUTH_PASSWORD_SAME':
        return t('auth.email.passwordSameAsCurrent', 'New password must be different from current password.')
        
      case 'AUTH_PASSWORD_REUSED':
        return t('auth.errors.passwordReused', 'Cannot reuse recent passwords. Please choose a different password.')
        
      case 'AUTH_TOO_MANY_ATTEMPTS':
        return t('auth.errors.tooManyResetAttempts', 'Too many attempts. Please try again later.')
        
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
        return message || t('auth.email.resetFailed', 'Failed to reset password. Please try again.')
    }
  }

  // Email step form
  const emailForm = useForgotPasswordForm(async (emailInput) => {
    try {
      await onResetPassword.request(emailInput)
      setEmail(emailInput)
      setEmailSentSuccess(true)
      // Auto transition to OTP after showing success briefly
      setTimeout(() => {
        setEmailSentSuccess(false)
        setStep('otp')
      }, 1500)
    } catch (err) {
      const errorMessage = getResetErrorMessage(err)
      throw new Error(errorMessage)
    }
  })

  // New password step form
  const passwordForm = useResetPasswordForm(async (data) => {
    try {
      await onResetPassword.complete(email, otp, data.newPassword)
      setStep('success')
    } catch (err) {
      const errorCode = err.code || err.message?.split(':')[0]?.trim()
      
      // If OTP error, go back to OTP step
      if (errorCode === 'AUTH_INVALID_OTP' || err.message?.includes('OTP') || err.message?.includes('code')) {
        setStep('otp')
      }
      
      const errorMessage = getResetErrorMessage(err)
      throw new Error(errorMessage)
    }
  })

  const handleVerifyOTP = async (code) => {
    setOtp(code)
    setStep('newPassword')
  }

  const handleResendOTP = async () => {
    await onResetPassword.request(email)
  }

  const inputClass = cn("w-full pl-11 pr-3.5 py-3 text-sm border border-gray-200 rounded-xl","bg-white text-gray-900 transition-all duration-200","focus:outline-none focus:border-system-blue focus:ring-2 focus:ring-system-blue/20","disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed","placeholder:text-gray-400"
  )

  // Success Step
  if (step === 'success') {
    return (
      <div className="text-center py-4 sm:py-6">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="m-0 mb-2 text-lg sm:text-xl font-semibold text-gray-900">
          {t('auth.email.passwordResetSuccess', 'Password Reset Successfully!')}
        </h3>
        <p className="m-0 mb-6 text-xs sm:text-sm text-gray-600 leading-relaxed">
          {t('auth.email.passwordResetSuccessMessage', 'Your password has been reset. You can now sign in with your new password.')}
        </p>
        <button
          type="button"
          onClick={onCancel}
          className={cn("w-full py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200","bg-system-blue text-white hover:brightness-110 active:scale-[0.98]"
          )}
        >
          {t('auth.email.backToLogin', 'Back to login')}
        </button>
      </div>
    )
  }

  // OTP Step
  if (step === 'otp') {
    return (
      <OTPVerification 
        email={email} 
        onVerify={handleVerifyOTP} 
        onResend={handleResendOTP} 
        onCancel={() => setStep('email')} 
        isLoading={externalLoading} 
      />
    )
  }

  // New Password Step
  if (step === 'newPassword') {
    const { register, handleSubmit, errors, isLoading, rootError, showPassword, togglePassword } = passwordForm
    const loading = isLoading || externalLoading

    return (
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="text-center mb-4 sm:mb-5">
          <div className="mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-xl sm:rounded-2xl mx-auto flex items-center justify-center overflow-hidden">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
          </div>
          <h3 className="m-0 mb-1 text-lg sm:text-xl font-semibold text-gray-900">
            {t('auth.email.setNewPassword')}
          </h3>
          <p className="m-0 text-xs sm:text-sm text-gray-500">
            {t('auth.email.setNewPasswordSubtitle')}
          </p>
        </div>

        {/* New Password */}
        <div className="mb-3 sm:mb-3.5 text-left">
          <label htmlFor="newPassword" className="block mb-1 sm:mb-1.5 text-xs sm:text-sm font-medium text-gray-600">
            {t('auth.email.newPasswordLabel')}
          </label>
          <div className="relative">
            <span className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input 
              type={showPassword ? 'text' : 'password'} 
              id="newPassword" 
              {...register('newPassword')}
              placeholder={t('auth.email.newPasswordPlaceholder')} 
              disabled={loading} 
              autoComplete="new-password" 
              className={cn(inputClass,"pl-9 sm:pl-11 py-2.5 sm:py-3 text-xs sm:text-sm pr-10 sm:pr-12", errors.newPassword &&"border-red-300")} 
            />
            <button 
              type="button" 
              onClick={togglePassword} 
              tabIndex={-1}
              className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded transition-all"
            >
              {showPassword ? (
                <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          {errors.newPassword && (
            <span className="text-[10px] sm:text-xs text-red-500 mt-1 block">{errors.newPassword.message}</span>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-3 sm:mb-3.5 text-left">
          <label htmlFor="confirmNewPassword" className="block mb-1 sm:mb-1.5 text-xs sm:text-sm font-medium text-gray-600">
            {t('auth.email.confirmPasswordLabel')}
          </label>
          <div className="relative">
            <span className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </span>
            <input 
              type={showPassword ? 'text' : 'password'} 
              id="confirmNewPassword" 
              {...register('confirmPassword')}
              placeholder={t('auth.email.confirmPasswordPlaceholder')} 
              disabled={loading} 
              autoComplete="new-password" 
              className={cn(inputClass,"pl-9 sm:pl-11 py-2.5 sm:py-3 text-xs sm:text-sm", errors.confirmPassword &&"border-red-300")} 
            />
          </div>
          {errors.confirmPassword && (
            <span className="text-[10px] sm:text-xs text-red-500 mt-1 block">{errors.confirmPassword.message}</span>
          )}
        </div>

        {/* Error */}
        {rootError && (
          <div className="flex items-center gap-2 sm:gap-2.5 p-3 sm:p-3.5 mb-4 sm:mb-5 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-600 text-left">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {rootError}
          </div>
        )}

        {/* Submit */}
        <button 
          type="submit" 
          disabled={loading}
          className={cn("w-full py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200","bg-system-blue text-white hover:brightness-110 active:scale-[0.98] active:brightness-95","disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
          )}
        >
          {loading ? (
            <>
              <span className="inline-block w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-transparent border-t-current rounded-full animate-spin mr-2 align-middle"/>
              {t('auth.email.resetting')}
            </>
          ) : t('auth.email.resetPasswordBtn')}
        </button>

        {/* Cancel */}
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={loading}
          className="block w-full text-center mt-3 sm:mt-4 text-system-blue text-xs sm:text-sm font-medium hover:bg-system-blue/10 active:bg-system-blue/15 py-1.5 sm:py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          {t('auth.email.cancel')}
        </button>
      </form>
    )
  }

  // Email Step (default)
  const { register, handleSubmit, errors, isLoading, rootError } = emailForm
  const loading = isLoading || externalLoading

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="text-center mb-4 sm:mb-5">
        <div className="mb-3 sm:mb-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-xl sm:rounded-2xl mx-auto flex items-center justify-center overflow-hidden">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
          </div>
        </div>
        <h3 className="m-0 mb-1 text-lg sm:text-xl font-semibold text-gray-900">
          {t('auth.email.forgotPasswordTitle')}
        </h3>
        <p className="m-0 text-xs sm:text-sm text-gray-500">
          {t('auth.email.forgotPasswordSubtitle')}
        </p>
      </div>

      {/* Email */}
      <div className="mb-3 sm:mb-3.5 text-left">
        <label htmlFor="resetEmail" className="block mb-1 sm:mb-1.5 text-xs sm:text-sm font-medium text-gray-600">
          {t('auth.email.emailLabel')}
        </label>
        <div className="relative">
          <span className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M22 7l-10 6L2 7"/>
            </svg>
          </span>
          <input 
            type="email" 
            id="resetEmail" 
            {...register('email')}
            placeholder={t('auth.email.emailPlaceholder')} 
            disabled={loading} 
            autoComplete="email" 
            className={cn(inputClass,"pl-9 sm:pl-11 py-2.5 sm:py-3 text-xs sm:text-sm", errors.email &&"border-red-300")} 
          />
        </div>
        {errors.email && (
          <span className="text-[10px] sm:text-xs text-red-500 mt-1 block">{errors.email.message}</span>
        )}
      </div>

      {/* Success Message */}
      {emailSentSuccess && (
        <div className="flex items-center gap-2 sm:gap-2.5 p-3 sm:p-3.5 mb-4 sm:mb-5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-600 text-left">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          {t('auth.email.resetCodeSent', 'Reset code sent! Check your email.')}
        </div>
      )}

      {/* Error */}
      {rootError && !emailSentSuccess && (
        <div className="flex items-center gap-2 sm:gap-2.5 p-3 sm:p-3.5 mb-4 sm:mb-5 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-600 text-left">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {rootError}
        </div>
      )}

      {/* Submit */}
      <button 
        type="submit" 
        disabled={loading || emailSentSuccess}
        className={cn("w-full py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200","bg-system-blue text-white hover:brightness-110 active:scale-[0.98] active:brightness-95","disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
        )}
      >
        {loading ? (
          <>
            <span className="inline-block w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-transparent border-t-current rounded-full animate-spin mr-2 align-middle"/>
            {t('auth.email.sending')}
          </>
        ) : emailSentSuccess ? t('auth.email.resetCodeSent', 'Code sent!') : t('auth.email.sendResetCode')}
      </button>

      {/* Back to Login */}
      <button 
        type="button" 
        onClick={onCancel} 
        disabled={loading}
        className="block w-full text-center mt-3 sm:mt-4 text-system-blue text-xs sm:text-sm font-medium hover:bg-system-blue/10 active:bg-system-blue/15 py-1.5 sm:py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        {t('auth.email.backToLogin')}
      </button>
    </form>
  )
}

export default ForgotPasswordV2
