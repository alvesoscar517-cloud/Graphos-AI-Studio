import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useIsAuthenticated, useAuth } from '../../stores/authStore'
import EmailLoginForm from './EmailLoginForm'
import EmailRegisterForm from './EmailRegisterFormV2'
import OTPVerification from './OTPVerification'
import ForgotPassword from './ForgotPasswordV2'
import { cn } from '../../lib/utils'

const LoginOverlay = () => {
  const { t } = useTranslation()
  const isAuthenticated = useIsAuthenticated() // Use Zustand store
  const { 
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
  const vantaRef = useRef(null)
  const vantaEffect = useRef(null)

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

  // Vanta.js fog effect
  useEffect(() => {
    if (!shouldShow || !vantaRef.current) return

    const loadVanta = async () => {
      try {
        // Load Three.js and Vanta dynamically
        if (!window.THREE) {
          const threeScript = document.createElement('script')
          threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js'
          threeScript.async = true
          document.head.appendChild(threeScript)
          await new Promise(resolve => { threeScript.onload = resolve })
        }

        if (!window.VANTA) {
          const vantaScript = document.createElement('script')
          vantaScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.fog.min.js'
          vantaScript.async = true
          document.head.appendChild(vantaScript)
          await new Promise(resolve => { vantaScript.onload = resolve })
        }

        // Initialize Vanta effect with Apple System Blue colors
        if (window.VANTA && vantaRef.current && !vantaEffect.current) {
          vantaEffect.current = window.VANTA.FOG({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            highlightColor: 0x5AC8FA,  // Apple System Teal
            midtoneColor: 0x007AFF,    // Apple System Blue
            lowlightColor: 0x5856D6,   // Apple System Indigo
            baseColor: 0x0051D5,       // Apple Blue Hover (darker)
            blurFactor: 0.6,
            speed: 1.2,
            zoom: 1.0
          })
        }
      } catch (error) {
        console.error('Vanta.js load error:', error)
      }
    }

    loadVanta()

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy()
        vantaEffect.current = null
      }
    }
  }, [shouldShow])

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

  const loadAnimation = async () => {
    if (animationInstance.current) {
      animationInstance.current.destroy()
    }

    // Always use light mode animation
    const animationPath = '/animation/Loader cat.json'

    try {
      // Lazy load lottie-web
      const lottie = await import('lottie-web')
      animationInstance.current = lottie.default.loadAnimation({
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
      const result = await signInWithEmail(email, password)
      if (!result.success) {
        // Create error with code for proper handling in form
        const error = new Error(result.error || 'Login failed')
        error.code = result.code
        throw error
      }
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
      const result = await registerWithEmail(email, password, displayName)
      if (!result.success) {
        const error = new Error(result.error || 'Registration failed')
        error.code = result.code
        throw error
      }
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
      const result = await verifyEmail(pendingEmail, otp)

      if (!result.success && !result.needsLogin) {
        const error = new Error(result.error || 'Verification failed')
        error.code = result.code
        throw error
      }

      // If server couldn't generate token, redirect to login
      if (result?.needsLogin) {
        console.log('[INFO] Account verified but needs manual login')
        setAuthMode('email-login')
        // Show success message - user needs to login
        return
      }
    } catch (error) {
      console.error('OTP verification error:', error, 'Email:', pendingEmail)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    try {
      const result = await resendVerificationOTP(pendingEmail)
      if (!result.success) {
        const error = new Error(result.error || 'Failed to resend code')
        error.code = result.code
        throw error
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      throw error
    }
  }

  const handlePasswordReset = {
    request: async (email) => {
      const result = await requestPasswordReset(email)
      if (!result.success) {
        const error = new Error(result.error || 'Failed to request reset')
        error.code = result.code
        throw error
      }
      setPendingEmail(email)
    },
    complete: async (email, otp, newPassword) => {
      const result = await resetPassword(email, otp, newPassword)
      if (!result.success) {
        const error = new Error(result.error || 'Failed to reset password')
        error.code = result.code
        throw error
      }
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">{t('auth.checking')}</h2>
          <p className="text-md text-gray-400 leading-relaxed mb-8">{t('auth.pleaseWait')}</p>
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
    <div 
      ref={vantaRef}
      className="fixed inset-0 z-modal flex items-center justify-center overflow-hidden p-5 light-mode-only"
      style={{
        background: 'linear-gradient(135deg, #0071E3 0%, #5856D6 100%)'
      }}
    >
      <div className={cn(
        "relative z-10 w-full max-w-[400px] text-center",
        "py-8 px-8 pb-6 bg-white rounded-2xl",
        "border border-black/[0.04] shadow-modal animate-slide-up-slow"
      )}>
        {authMode === 'select' && (
          <div className="w-thumbnail-md h-thumbnail-md mx-auto mb-8 flex items-center justify-center" ref={animationContainer}>
            <svg className="animate-pulse hidden" width="120" height="120" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
              <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
              <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
              <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
            </svg>
          </div>
        )}
        
        {(authMode === 'email-register' || authMode === 'forgot-password') && (
          <button 
            className={cn(
              "absolute top-8 left-9 bg-transparent border-none",
              "text-sm text-gray-400 cursor-pointer p-0 rounded-lg",
              "transition-all duration-150 font-medium flex items-center gap-1",
              "hover:not-disabled:text-gray-900",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
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
