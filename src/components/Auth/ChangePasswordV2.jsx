/**
 * ChangePasswordV2 Component
 * Uses React Hook Form + Zod via useChangePasswordForm hook
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useChangePasswordForm } from '@/hooks/forms'
import { cn } from '@/lib/utils'

const ChangePasswordV2 = ({ onChangePassword, onCancel, isLoading: externalLoading }) => {
  const { t } = useTranslation()
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const {
    register,
    handleSubmit,
    errors,
    rootError,
    isLoading: formLoading,
  } = useChangePasswordForm(async (data) => {
    await onChangePassword(data.currentPassword, data.newPassword)
  })

  const isLoading = externalLoading || formLoading

  const togglePassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const inputClass = cn(
    "w-full pl-11 pr-12 py-3 text-sm border rounded-xl",
    "bg-white text-gray-900 transition-all duration-200",
    "focus:outline-none focus:border-system-blue focus:ring-2 focus:ring-system-blue/20",
    "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
    "placeholder:text-gray-400"
  )

  const inputErrorClass = "border-red-300 focus:border-red-500 focus:ring-red-500/20"

  const PasswordIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )

  const EyeIcon = ({ show }) =>
    show ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="m-0 mb-4 text-base font-semibold text-text-primary">
        {t('auth.email.changePassword')}
      </h4>

      {/* Current Password */}
      <div className="text-left">
        <label htmlFor="currentPassword" className="block mb-1.5 text-sm font-medium text-gray-600">
          {t('auth.email.currentPassword')}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <PasswordIcon />
          </span>
          <input
            type={showPasswords.current ? 'text' : 'password'}
            id="currentPassword"
            {...register('currentPassword')}
            placeholder={t('auth.email.currentPasswordPlaceholder')}
            disabled={isLoading}
            autoComplete="current-password"
            className={cn(inputClass, errors.currentPassword && inputErrorClass)}
          />
          <button
            type="button"
            onClick={() => togglePassword('current')}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded transition-all"
          >
            <EyeIcon show={showPasswords.current} />
          </button>
        </div>
        {errors.currentPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.currentPassword.message}</p>
        )}
      </div>

      {/* New Password */}
      <div className="text-left">
        <label htmlFor="newPassword" className="block mb-1.5 text-sm font-medium text-gray-600">
          {t('auth.email.newPassword')}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <PasswordIcon />
          </span>
          <input
            type={showPasswords.new ? 'text' : 'password'}
            id="newPassword"
            {...register('newPassword')}
            placeholder={t('auth.email.newPasswordPlaceholder')}
            disabled={isLoading}
            autoComplete="new-password"
            className={cn(inputClass, errors.newPassword && inputErrorClass)}
          />
          <button
            type="button"
            onClick={() => togglePassword('new')}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded transition-all"
          >
            <EyeIcon show={showPasswords.new} />
          </button>
        </div>
        {errors.newPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="text-left">
        <label htmlFor="confirmPassword" className="block mb-1.5 text-sm font-medium text-gray-600">
          {t('auth.email.confirmNewPassword')}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <PasswordIcon />
          </span>
          <input
            type={showPasswords.confirm ? 'text' : 'password'}
            id="confirmPassword"
            {...register('confirmPassword')}
            placeholder={t('auth.email.confirmPasswordPlaceholder')}
            disabled={isLoading}
            autoComplete="new-password"
            className={cn(inputClass, errors.confirmPassword && inputErrorClass)}
          />
          <button
            type="button"
            onClick={() => togglePassword('confirm')}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded transition-all"
          >
            <EyeIcon show={showPasswords.confirm} />
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Root Error */}
      {rootError && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#dc2626">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {rootError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200",
            "bg-system-blue text-white hover:brightness-110 active:scale-[0.98]",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin mr-2" />
              {t('auth.email.changing')}
            </>
          ) : (
            t('auth.email.changePasswordBtn')
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={cn(
              "px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              "bg-gray-100 text-gray-700 hover:bg-gray-200",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {t('common.cancel')}
          </button>
        )}
      </div>
    </form>
  )
}

export default ChangePasswordV2
