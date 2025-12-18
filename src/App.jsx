import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProviders } from './providers/AppProviders'
import { useAuth, useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'
import LoginOverlay from './components/Auth/LoginOverlay'
import MainLayout from './components/Layout/MainLayout'
import ProfileSetupWrapper from './components/ProfileSetup/ProfileSetupWrapper'
import ErrorBoundary from './components/Common/ErrorBoundary'
import GlobalErrorHandler from './components/Common/GlobalErrorHandler'
import ContextMenu from './components/Common/ContextMenu'
import ToastContainer from './components/Common/ToastContainer'
import ErrorReportListener from './components/Common/ErrorReportListener'
import SessionExpiredModal from './components/Auth/SessionExpiredModal'
import WelcomeBanner from './components/Common/WelcomeBanner'
import LowCreditsToast from './components/LowCreditsToast'
import UpgradePlanModal from './components/UpgradePlanModal'
import UnsupportedScreenOverlay from './components/Common/UnsupportedScreenOverlay'
import { ErrorBoundaryProvider } from './contexts/ErrorBoundaryContext'
import modal from './utils/modal'
import { initTooltips } from './utils/tooltips'
import { initStorageCleanup } from './utils/storageCleanup'
import { migrateToSecureStorage } from './utils/authStorage'

// Separate component to access auth context
function AppContent() {
  const { isLoading } = useAuth()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
  // Listen for showUpgradeModal event from creditHandler
  useEffect(() => {
    const handleShowUpgradeModal = () => {
      setShowUpgradeModal(true)
    }
    
    window.addEventListener('showUpgradeModal', handleShowUpgradeModal)
    return () => {
      window.removeEventListener('showUpgradeModal', handleShowUpgradeModal)
    }
  }, [])
  
  return (
    <>
      <Routes>
        <Route 
          path="/profile-setup" 
          element={
            <ErrorBoundary>
              {!isLoading && isAuthenticated ? (
                <ProfileSetupWrapper />
              ) : (
                <div className="app">
                  <LoginOverlay />
                </div>
              )}
            </ErrorBoundary>
          } 
        />
        <Route path="*" element={
          <ErrorBoundary>
            <div className="app">
              {(isLoading || !isAuthenticated) && <LoginOverlay />}
              {!isLoading && isAuthenticated && <MainLayout />}
            </div>
          </ErrorBoundary>
        } />
      </Routes>
      
      {/* Low Credits Toast - Windows-style notification */}
      {isAuthenticated && (
        <LowCreditsToast onBuyCredits={() => setShowUpgradeModal(true)} />
      )}
      
      {/* Upgrade Plan Modal */}
      <UpgradePlanModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </>
  )
}

function App() {
  // Initialize theme from Zustand store
  const initTheme = useThemeStore((state) => state.initTheme)

  useEffect(() => {
    // Initialize theme
    initTheme()
    
    // Migrate to secure storage (one-time migration)
    migrateToSecureStorage()
    
    // Clean corrupted localStorage data first
    initStorageCleanup()
    
    // Make modal available globally for components
    window.modal = modal
    
    // Initialize tooltips
    initTooltips()
    
    // Clean up any leftover overlays
    const cleanupOverlays = () => {
      // Only remove specific blocking overlays, not all elements
      const overlays = document.querySelectorAll('.modal-overlay, .ai-detail-overlay')
      overlays.forEach((overlay) => {
        const styles = window.getComputedStyle(overlay)
        // Remove if it's blocking (visible and has high z-index)
        if (styles.display !== 'none' && styles.visibility !== 'hidden' && parseInt(styles.zIndex) > 1000) {
          overlay.remove()
        }
      })
    }
    
    // Run cleanup after a short delay to ensure DOM is ready
    setTimeout(cleanupOverlays, 500)
  }, [initTheme])

  // Using composed providers for cleaner code
  // Provider order is managed in AppProviders
  // ErrorBoundaryProvider wraps everything to track error state across the app
  return (
    <ErrorBoundaryProvider>
      <ErrorBoundary>
        <GlobalErrorHandler>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppProviders>
              <AppContent />
              <ContextMenu />
              <ToastContainer />
              <SessionExpiredModal />
              <WelcomeBanner />
              <ErrorReportListener />
              <UnsupportedScreenOverlay />
            </AppProviders>
          </Router>
        </GlobalErrorHandler>
      </ErrorBoundary>
    </ErrorBoundaryProvider>
  )
}

export default App
