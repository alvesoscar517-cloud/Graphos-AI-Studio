import { Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import ghostIcon from '../../../icon for background/ghost-with-raised-arms.svg'
// ErrorBoundary styles in main.css

// Use refactored version with better code organization
const ProfileSetup = lazy(() => import('./ProfileSetupRefactored'))

// Loading skeleton - centered on screen
const LoadingSkeleton = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--color-bg-primary)'
    }}>
      <LazyLottie 
        animationData={threeDotsAnimation} 
        loop={true}
        style={{ width: 120, height: 90 }}
      />
    </div>
  )
}

// Error fallback - reuse design from app's ErrorBoundary
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const { t } = useTranslation()
  return (
    <div className="error-screen">
      <div className="error-content">
        <img 
          src={ghostIcon} 
          alt={t('common.error')} 
          className="error-icon"
        />
        <h1 className="error-title">{t('loadingPage.unableToLoadPage')}</h1>
        <p className="error-message">
          {error?.message || t('loadingPage.errorLoadingPage')}
        </p>
        
        <div className="error-actions">
          <button 
            className="btn-details"
            onClick={resetErrorBoundary}
          >
            {t('loadingPage.retry')}
          </button>
          <button 
            className="btn-home"
            onClick={() => window.location.href = '/'}
          >
            {t('loadingPage.backToHome')}
          </button>
        </div>
      </div>
    </div>
  )
}

// Simple Error Boundary for ProfileSetup
import { Component } from 'react'

class ProfileSetupErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ProfileSetup Error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error} 
          resetErrorBoundary={this.handleReset} 
        />
      )
    }
    return this.props.children
  }
}

const ProfileSetupWrapper = () => {
  return (
    <ProfileSetupErrorBoundary>
      <Suspense fallback={<LoadingSkeleton />}>
        <ProfileSetup />
      </Suspense>
    </ProfileSetupErrorBoundary>
  )
}

export default ProfileSetupWrapper
