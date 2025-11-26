import { Component } from 'react'
import './ErrorBoundary.css'
import ghostIcon from '../../../icon for background/ghost-with-raised-arms.svg'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }))
  }

  goHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <div className="error-content">
            <img 
              src={ghostIcon} 
              alt="Error" 
              className="error-icon"
            />
            <h1 className="error-title">An Error Occurred</h1>
            <p className="error-message">
              Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại sau.
            </p>
            
            {this.state.showDetails && (
              <div className="error-details">
                <div className="error-details-content">
                  <strong>Chi tiết lỗi:</strong>
                  <pre>{this.state.error && this.state.error.toString()}</pre>
                  {this.state.errorInfo && (
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  )}
                </div>
              </div>
            )}

            <div className="error-actions">
              <button 
                className="btn-details"
                onClick={this.toggleDetails}
              >
                {this.state.showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
              </button>
              <button 
                className="btn-home"
                onClick={this.goHome}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
