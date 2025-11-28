import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import './EmailAuth.css'

const OTPVerification = ({ email, onVerify, onResend, onCancel, isLoading }) => {
  const { t } = useTranslation()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(600) // 10 minutes
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef([])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [countdown])

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return
    
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
    
    // Auto-submit when complete
    if (value && index === 5) {
      const code = newOtp.join('')
      if (code.length === 6) {
        handleSubmit(code)
      }
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('')
        const newOtp = [...otp]
        digits.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit
        })
        setOtp(newOtp)
        
        if (digits.length === 6) {
          handleSubmit(digits.join(''))
        } else {
          inputRefs.current[Math.min(digits.length, 5)]?.focus()
        }
      })
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text')
    const digits = text.replace(/\D/g, '').slice(0, 6).split('')
    const newOtp = [...otp]
    digits.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit
    })
    setOtp(newOtp)
    
    if (digits.length === 6) {
      handleSubmit(digits.join(''))
    } else {
      inputRefs.current[Math.min(digits.length, 5)]?.focus()
    }
  }

  const handleSubmit = async (code) => {
    if (code.length !== 6) {
      setError(t('auth.email.otpIncomplete'))
      return
    }
    
    try {
      await onVerify(code)
    } catch (err) {
      setError(err.message || t('auth.email.otpInvalid'))
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    
    try {
      await onResend()
      setResendCooldown(60) // 1 minute cooldown
      setCountdown(600) // Reset countdown
      setOtp(['', '', '', '', '', ''])
      setError('')
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(err.message || t('auth.email.resendFailed'))
    }
  }

  return (
    <div className="otp-verification">
      <div className="otp-header">
        <h3>{t('auth.email.verifyTitle')}</h3>
        <p>{t('auth.email.verifySubtitle', { email })}</p>
      </div>
      
      <div className="otp-inputs">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading || countdown <= 0}
            className={error ? 'error' : ''}
          />
        ))}
      </div>
      
      {error && <div className="form-error">{error}</div>}
      
      <div className="otp-timer">
        {countdown > 0 ? (
          <span>{t('auth.email.codeExpires', { time: formatTime(countdown) })}</span>
        ) : (
          <span className="expired">{t('auth.email.codeExpired')}</span>
        )}
      </div>
      
      <div className="otp-actions">
        <button
          type="button"
          className="email-auth-btn primary"
          onClick={() => handleSubmit(otp.join(''))}
          disabled={isLoading || otp.join('').length !== 6 || countdown <= 0}
        >
          {isLoading ? t('auth.email.verifying') : t('auth.email.verifyBtn')}
        </button>
        
        <button
          type="button"
          className="link-btn"
          onClick={handleResend}
          disabled={isLoading || resendCooldown > 0}
        >
          {resendCooldown > 0 
            ? t('auth.email.resendIn', { seconds: resendCooldown })
            : t('auth.email.resendCode')
          }
        </button>
        
        <button
          type="button"
          className="link-btn cancel"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t('auth.email.cancel')}
        </button>
      </div>
    </div>
  )
}

export default OTPVerification
