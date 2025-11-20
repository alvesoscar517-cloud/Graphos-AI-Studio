import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import * as lottie from 'lottie-web'
import './LoginOverlay.css'

const LoginOverlay = () => {
  const { isAuthenticated, signIn, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)
  const animationContainer = useRef(null)
  const animationInstance = useRef(null)

  useEffect(() => {
    // Show overlay when loading OR not authenticated
    console.log('🔐 LoginOverlay state:', { authLoading, isAuthenticated, shouldShow })
    if (authLoading || !isAuthenticated) {
      console.log('⚠️ Showing login overlay')
      setShouldShow(true)
    } else {
      console.log('✅ Hiding login overlay')
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

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      const success = await signIn()
      if (!success) {
        alert('Đăng nhập thất bại. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      alert('Đăng nhập thất bại: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show overlay while checking auth or if already authenticated
  if (!shouldShow) {
    console.log('🚫 LoginOverlay: Not rendering (shouldShow = false)')
    return null
  }

  console.log('✨ LoginOverlay: Rendering overlay')
  return (
    <div className="login-overlay">
      <div className="login-container">
        <div className="login-animation" ref={animationContainer}>
          <svg className="fallback-icon" width="120" height="120" viewBox="0 0 48 48" style={{ display: 'none' }}>
            <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
            <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
            <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
            <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
          </svg>
        </div>
        {authLoading ? (
          <>
            <h2 className="login-title">Đang kiểm tra...</h2>
            <p className="login-subtitle">Vui lòng đợi trong giây lát</p>
          </>
        ) : (
          <>
            <h2 className="login-title">Đăng nhập để tiếp tục</h2>
            <p className="login-subtitle">Vui lòng đăng nhập với tài khoản Google để sử dụng AI Content Authenticator</p>
            <button 
              className={`google-signin-btn ${isLoading ? 'loading' : ''}`}
              onClick={handleSignIn}
              disabled={isLoading}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z" fill="#4285F4"/>
                <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
              </svg>
              <span>{isLoading ? 'Đang đăng nhập...' : 'Đăng nhập với Google'}</span>
            </button>
            <p className="login-footer">
              Bằng cách đăng nhập, bạn đồng ý với{' '}
              <a href="#" className="login-link">Điều khoản dịch vụ</a> và{' '}
              <a href="#" className="login-link">Chính sách bảo mật</a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default LoginOverlay
