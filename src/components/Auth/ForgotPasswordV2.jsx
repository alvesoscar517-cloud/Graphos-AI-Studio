import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import { useForgotPasswordForm, useResetPasswordForm } from '../../hooks/forms'
import OTPVerification from './OTPVerification'

const ForgotPasswordV2 = ({ onResetPassword, onCancel, isLoading: externalLoading }) => {
  const { t } = useTranslation()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')

  // Email step form
  const emailForm = useForgotPasswordForm(async (data) => {
    await onResetPassword.request(data.email)
    setEmail(data.email)
    setStep('otp')
  })

  // New password step form
  const passwordForm = useResetPasswordForm(async (data) => {
    try {
      await onResetPassword.complete(email, otp, data.newPassword)
    } catch (err) {
      if (err.message?.includes('OTP') || err.message?.includes('code')) {
        setStep('otp')
      }
      throw err
    }
  })

  const handleVerifyOTP = async (code) => {
    setOtp(code)
    setStep('newPassword')
  }

  const handleResendOTP = async () => {
    await onResetPassword.request(email)
  }

  const inputClass = cn(
    "w-full pl-11 pr-3.5 py-3 text-sm border border-gray-200 rounded-xl",
    "bg-white text-gray-900 transition-all duration-200",
    "focus:outline-none focus:border-system-blue focus:ring-2 focus:ring-system-blue/20",
    "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
    "placeholder:text-gray-400"
  )

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
        <div className="text-center mb-5">
          <div className="mb-4">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center overflow-hidden">
              <svg className="w-7 h-7 shrink-0 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
          </div>
          <h3 className="m-0 mb-1 text-xl font-semibold text-gray-900">
            {t('auth.email.setNewPassword')}
          </h3>
          <p className="m-0 text-sm text-gray-500">
            {t('auth.email.setNewPasswordSubtitle')}
          </p>
        </div>

        {/* New Password */}
        <div className="mb-3.5 text-left">
          <label htmlFor="newPassword" className="block mb-1.5 text-sm font-medium text-gray-600">
            {t('auth.email.newPasswordLabel')}
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
              id="newPassword" 
              {...register('newPassword')}
              placeholder={t('auth.email.newPasswordPlaceholder')} 
              disabled={loading} 
              autoComplete="new-password" 
              className={cn(inputClass, "pr-12", errors.newPassword && "border-red-300")} 
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
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          {errors.newPassword && (
            <span className="text-xs text-red-500 mt-1 block">{errors.newPassword.message}</span>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-3.5 text-left">
          <label htmlFor="confirmNewPassword" className="block mb-1.5 text-sm font-medium text-gray-600">
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
              id="confirmNewPassword" 
              {...register('confirmPassword')}
              placeholder={t('auth.email.confirmPasswordPlaceholder')} 
              disabled={loading} 
              autoComplete="new-password" 
              className={cn(inputClass, errors.confirmPassword && "border-red-300")} 
            />
          </div>
          {errors.confirmPassword && (
            <span className="text-xs text-red-500 mt-1 block">{errors.confirmPassword.message}</span>
          )}
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
          disabled={loading}
          className={cn(
            "w-full py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200",
            "bg-system-blue text-white hover:brightness-110 active:scale-[0.98] active:brightness-95",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
          )}
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin mr-2 align-middle"/>
              {t('auth.email.resetting')}
            </>
          ) : t('auth.email.resetPasswordBtn')}
        </button>

        {/* Cancel */}
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={loading}
          className="block w-full text-center mt-4 text-system-blue text-sm font-medium hover:bg-system-blue/10 active:bg-system-blue/15 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
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
      <div className="text-center mb-5">
        <div className="mb-4">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center overflow-hidden">
            <svg className="w-7 h-7 shrink-0 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
          </div>
        </div>
        <h3 className="m-0 mb-1 text-xl font-semibold text-gray-900">
          {t('auth.email.forgotPasswordTitle')}
        </h3>
        <p className="m-0 text-sm text-gray-500">
          {t('auth.email.forgotPasswordSubtitle')}
        </p>
      </div>

      {/* Email */}
      <div className="mb-3.5 text-left">
        <label htmlFor="resetEmail" className="block mb-1.5 text-sm font-medium text-gray-600">
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
            id="resetEmail" 
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
        disabled={loading}
        className={cn(
          "w-full py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200",
          "bg-system-blue text-white hover:brightness-110 active:scale-[0.98] active:brightness-95",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
        )}
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin mr-2 align-middle"/>
            {t('auth.email.sending')}
          </>
        ) : t('auth.email.sendResetCode')}
      </button>

      {/* Back to Login */}
      <button 
        type="button" 
        onClick={onCancel} 
        disabled={loading}
        className="block w-full text-center mt-4 text-system-blue text-sm font-medium hover:bg-system-blue/10 active:bg-system-blue/15 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        {t('auth.email.backToLogin')}
      </button>
    </form>
  )
}

export default ForgotPasswordV2
