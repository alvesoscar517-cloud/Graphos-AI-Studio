import { Suspense, lazy } from 'react'
import Lottie from 'lottie-react'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import ghostIcon from '../../../icon for background/ghost-with-raised-arms.svg'
import '../Common/ErrorBoundary.css'

// Use refactored version with better code organization
const ProfileSetup = lazy(() => import('./ProfileSetupRefactored'))

// Loading skeleton - reuse design from app's error screen
const LoadingSkeleton = () => (
  <div className="error-screen">
    <div className="error-content">
      <div style={{ marginBottom: '24px' }}>
        <Lottie 
          animationData={threeDotsAnimation} 
          loop={true}
          style={{ width: 120, height: 90 }}
        />
      </div>
      <h1 className="error-title" style={{ fontSize: '24px', marginBottom: '8px' }}>
        Đang tải...
      </h1>
      <p className="error-message" style={{ marginBottom: '0' }}>
        Please wait a moment
      </p>
    </div>
  </div>
)

// Error fallback - reuse design from app's ErrorBoundary
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="error-screen">
    <div className="error-content">
      <img 
        src={ghostIcon} 
        alt="Error" 
        className="error-icon"
      />
      <h1 className="error-title">Không thể tải trang</h1>
      <p className="error-message">
        {error?.message || 'Đã có lỗi xảy ra khi tải trang tạo hồ sơ. Vui lòng thử lại.'}
      </p>
      
      <div className="error-actions">
        <button 
          className="btn-details"
          onClick={resetErrorBoundary}
        >
          Thử lại
        </button>
        <button 
          className="btn-home"
          onClick={() => window.location.href = '/'}
        >
          Back to Home
        </button>
      </div>
    </div>
  </div>
)

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
