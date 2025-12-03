import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'

const OTPVerification = ({ email, onVerify, onResend, onCancel, isLoading }) => {
  const { t } = useTranslation()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(600)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef([])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  useEffect(() => { inputRefs.current[0]?.focus() }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
    if (value && index === 5) {
      const code = newOtp.join('')
      if (code.length === 6) handleSubmit(code)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('')
        const newOtp = [...otp]
        digits.forEach((digit, i) => { if (i < 6) newOtp[i] = digit })
        setOtp(newOtp)
        if (digits.length === 6) handleSubmit(digits.join(''))
        else inputRefs.current[Math.min(digits.length, 5)]?.focus()
      })
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text')
    const digits = text.replace(/\D/g, '').slice(0, 6).split('')
    const newOtp = [...otp]
    digits.forEach((digit, i) => { if (i < 6) newOtp[i] = digit })
    setOtp(newOtp)
    if (digits.length === 6) handleSubmit(digits.join(''))
    else inputRefs.current[Math.min(digits.length, 5)]?.focus()
  }

  const getErrorMessage = (err) => {
    if (err.isNetworkError || err.message === 'NETWORK_ERROR') return t('errors.networkError')
    if (err.code === 'AUTH_INVALID_OTP') return t('auth.email.otpInvalid')
    if (err.code === 'AUTH_REGISTRATION_EXPIRED') return t('auth.email.codeExpired')
    return err.message || t('auth.email.otpInvalid')
  }

  const handleSubmit = async (code) => {
    if (code.length !== 6) { setError(t('auth.email.otpIncomplete')); return }
    try { await onVerify(code) }
    catch (err) { setError(getErrorMessage(err)); setOtp(['', '', '', '', '', '']); inputRefs.current[0]?.focus() }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    try { await onResend(); setResendCooldown(60); setCountdown(600); setOtp(['', '', '', '', '', '']); setError(''); inputRefs.current[0]?.focus() }
    catch (err) { setError(getErrorMessage(err)) }
  }

  return (
    <div className="text-center py-2.5">
      <div className="mb-7">
        <div className="mb-4">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center overflow-hidden">
            <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/>
            </svg>
          </div>
        </div>
        <h3 className="m-0 mb-2.5 text-xl font-bold text-gray-900">{t('auth.email.verifyTitle')}</h3>
        <p className="m-0 text-sm text-gray-600 leading-relaxed">{t('auth.email.verifySubtitle', { email: '' })}<br/><strong className="text-gray-900 font-semibold block mt-1 text-md">{email}</strong></p>
      </div>
      
{/* OTP Inputs */}
      <div className="flex justify-center gap-2.5 mb-5">
        {otp.map((digit, index) => (
          <input key={index} ref={el => inputRefs.current[index] = el} type="text" inputMode="numeric" maxLength={1}
            value={digit} onChange={(e) => handleChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)} onPaste={handlePaste}
            disabled={isLoading || countdown <= 0} placeholder="•"
            className={cn("w-otp h-otp text-center text-2xl font-bold border-2 rounded-xl transition-all duration-200",
              "bg-white text-gray-900 border-gray-200",
              "focus:outline-none focus:border-system-blue focus:ring-2 focus:ring-system-blue/20",
              "disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed",
              "placeholder:text-gray-300",
              error && "border-system-red bg-red-50 animate-shake")} />
        ))}
      </div>

      {error && (
        <div className="flex items-center justify-center gap-2.5 p-3.5 mb-5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </div>
      )}

      <div className="mb-6 text-sm text-gray-600 font-medium">
        {countdown > 0 ? (
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {t('auth.email.codeExpires', { time: formatTime(countdown) })}
          </span>
        ) : <span className="text-error font-semibold">{t('auth.email.codeExpired')}</span>}
      </div>

      <div className="flex flex-col gap-3">
        <button type="button" onClick={() => handleSubmit(otp.join(''))} disabled={isLoading || otp.join('').length !== 6 || countdown <= 0}
          className={cn("w-full py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200",
            "bg-system-blue text-white hover:brightness-110 active:scale-[0.98] active:brightness-95",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100")}>
          {isLoading ? <><span className="inline-block w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin mr-2 align-middle"/>{t('auth.email.verifying')}</> : t('auth.email.verifyBtn')}
        </button>
        <button type="button" onClick={handleResend} disabled={isLoading || resendCooldown > 0}
          className="bg-transparent border-none text-system-blue text-sm font-medium px-3 py-2 rounded-lg hover:bg-system-blue/10 active:bg-system-blue/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200">
          {resendCooldown > 0 ? t('auth.email.resendIn', { seconds: resendCooldown }) : t('auth.email.resendCode')}
        </button>
        <button type="button" onClick={onCancel} disabled={isLoading}
          className="text-gray-500 text-sm font-medium mt-2 hover:text-gray-700 active:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200">
          {t('auth.email.cancel')}
        </button>
      </div>
    </div>
  )
}

export default OTPVerification