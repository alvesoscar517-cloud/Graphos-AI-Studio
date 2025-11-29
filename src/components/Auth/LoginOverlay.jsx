import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import * as lottie from 'lottie-web'
import EmailLoginForm from './EmailLoginForm'
import EmailRegisterForm from './EmailRegisterForm'
import OTPVerification from './OTPVerification'
import ForgotPassword from './ForgotPassword'
import './LoginOverlay.css'
import './EmailAuth.css'

const LoginOverlay = () => {
  const { t } = useTranslation()
  const { 
    isAuthenticated, 
    signIn, 
    signInWithEmail, 
    registerWithEmail, 
    verifyEmail, 
    resendVerificationOTP,
    requestPasswordReset,
    resetPassword,
    isLoading: authLoading 
  } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)
  const [authMode, setAuthMode] = useState('email-login') // select, google, email-login, email-register, otp, forgot-password
  const [pendingEmail, setPendingEmail] = useState('')
  const animationContainer = useRef(null)
  const animationInstance = useRef(null)

  useEffect(() => {
    // Show overlay when loading OR not authenticated
    console.log('[SECURE] LoginOverlay state:', { authLoading, isAuthenticated, shouldShow })
    if (authLoading || !isAuthenticated) {
      console.log('[WARNING] Showing login overlay')
      setShouldShow(true)
    } else {
      console.log('[SUCCESS] Hiding login overlay')
      setShouldShow(false)
    }
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (shouldShow && animationContainer.current) {
      loadAnimation()
    }

    return () => {
      if (animationInstance.current) {
        animationInstance.current.destroy()
      }
    }
  }, [shouldShow])

  const loadAnimation = () => {
    if (animationInstance.current) {
      animationInstance.current.destroy()
    }

    // Always use light mode animation
    const animationPath = '/animation/Loader cat.json'

    try {
      animationInstance.current = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: animationPath
      })
    } catch (error) {
      console.error('Animation load error:', error)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const success = await signIn()
      if (!success) {
        alert(t('auth.signInFailed'))
      }
    } catch (error) {
      console.error('Sign in error:', error)
      alert(t('auth.loginFailed') + ': ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailLogin = async (email, password) => {
    setIsLoading(true)
    try {
      await signInWithEmail(email, password)
    } catch (error) {
      console.error('Email login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailRegister = async (email, password, displayName) => {
    setIsLoading(true)
    try {
      console.log('[DEBUG] Registering with email:', email)
      await registerWithEmail(email, password, displayName)
      console.log('[DEBUG] Registration successful, setting pendingEmail:', email)
      setPendingEmail(email)
      setAuthMode('otp')
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (otp) => {
    setIsLoading(true)
    try {
      console.log('[DEBUG] Verifying OTP for email:', pendingEmail, 'OTP:', otp)
      await verifyEmail(pendingEmail, otp)
    } catch (error) {
      console.error('OTP verification error:', error, 'Email:', pendingEmail)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    try {
      await resendVerificationOTP(pendingEmail)
    } catch (error) {
      console.error('Resend OTP error:', error)
      throw error
    }
  }

  const handlePasswordReset = {
    request: async (email) => {
      await requestPasswordReset(email)
      setPendingEmail(email)
    },
    complete: async (email, otp, newPassword) => {
      await resetPassword(email, otp, newPassword)
      setAuthMode('email-login')
    }
  }

  // Don't show overlay while checking auth or if already authenticated
  if (!shouldShow) {
    console.log('🚫 LoginOverlay: Not rendering (shouldShow = false)')
    return null
  }

  console.log('✨ LoginOverlay: Rendering overlay')

  const renderAuthContent = () => {
    if (authLoading) {
      return (
        <>
          <h2 className="login-title">{t('auth.checking')}</h2>
          <p className="login-subtitle">{t('auth.pleaseWait')}</p>
        </>
      )
    }

    switch (authMode) {
      case 'email-login':
        return (
          <EmailLoginForm
            onLogin={handleEmailLogin}
            onSwitchToRegister={() => setAuthMode('email-register')}
            onForgotPassword={() => setAuthMode('forgot-password')}
            onGoogleSignIn={handleGoogleSignIn}
            isLoading={isLoading}
          />
        )

      case 'email-register':
        return (
          <EmailRegisterForm
            onRegister={handleEmailRegister}
            onSwitchToLogin={() => setAuthMode('email-login')}
            isLoading={isLoading}
          />
        )

      case 'otp':
        return (
          <OTPVerification
            email={pendingEmail}
            onVerify={handleVerifyOTP}
            onResend={handleResendOTP}
            onCancel={() => {
              setAuthMode('email-register')
              setPendingEmail('')
            }}
            isLoading={isLoading}
          />
        )

      case 'forgot-password':
        return (
          <ForgotPassword
            onResetPassword={handlePasswordReset}
            onCancel={() => setAuthMode('email-login')}
            isLoading={isLoading}
          />
        )

      default:
        return (
          <EmailLoginForm
            onLogin={handleEmailLogin}
            onSwitchToRegister={() => setAuthMode('email-register')}
            onForgotPassword={() => setAuthMode('forgot-password')}
            onGoogleSignIn={handleGoogleSignIn}
            isLoading={isLoading}
          />
        )
    }
  }

  return (
    <div className="login-overlay">
      <div className="login-container">
        {authMode === 'select' && (
          <div className="login-animation" ref={animationContainer}>
            <svg className="fallback-icon" width="120" height="120" viewBox="0 0 48 48" style={{ display: 'none' }}>
              <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
              <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
              <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
              <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
            </svg>
          </div>
        )}
        
        {(authMode === 'email-register' || authMode === 'forgot-password') && (
          <button 
            className="back-btn"
            onClick={() => setAuthMode('email-login')}
            disabled={isLoading}
          >
            ← {t('auth.email.back')}
          </button>
        )}
        
        {renderAuthContent()}
      </div>
    </div>
  )
}

export default LoginOverlay
