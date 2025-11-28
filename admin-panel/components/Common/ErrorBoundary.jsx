import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  componentDidUpdate(prevProps) {
    // Reset error state when children change (e.g., route change)
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/admin';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">
              <img src="/icon/alert-circle.svg" alt="Error" />
            </div>
            
            <h1 className="error-title">Something went wrong</h1>
            <p className="error-message">
              An unexpected error occurred. Try reloading the page or return to dashboard.
            </p>

            <div className="error-dashboard">
              <button className="btn-dashboard" onClick={this.handleGoHome}>
                <img src="/icon/home.svg" alt="Home" />
                Dashboard
              </button>
            </div>

            {this.state.error && (
              <div className="error-details">
                <details>
                  <summary>Technical details</summary>
                  <pre className="error-stack">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
