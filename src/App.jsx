import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProviders } from './providers/AppProviders'
import { useAuth } from './contexts/AuthContext'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'
import LoginOverlay from './components/Auth/LoginOverlay'
import MainLayout from './components/Layout/MainLayout'
import ProfileSetupWrapper from './components/ProfileSetup/ProfileSetupWrapper'

import ErrorBoundary from './components/Common/ErrorBoundary'
import ContextMenu from './components/Common/ContextMenu'
import ToastContainer from './components/Common/ToastContainer'
import SessionExpiredModal from './components/Auth/SessionExpiredModal'
import modal from './utils/modal'
import { initTooltips } from './utils/tooltips'
import { initStorageCleanup } from './utils/storageCleanup'
import { migrateToSecureStorage } from './utils/authStorage'

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
  return (
    <ErrorBoundary>
      <Router>
        <AppProviders>
          <AppContent />
          <ContextMenu />
          <ToastContainer />
          <SessionExpiredModal />
        </AppProviders>
      </Router>
    </ErrorBoundary>
  )
}

// Separate component to access auth context
function AppContent() {
  const { isLoading } = useAuth()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated) // Use Zustand store
  return (
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
            {/* Show login overlay when loading or not authenticated */}
            {(isLoading || !isAuthenticated) && <LoginOverlay />}
            {/* Only render MainLayout when authenticated and not loading */}
            {!isLoading && isAuthenticated && <MainLayout />}
          </div>
        </ErrorBoundary>
      } />
    </Routes>
  )
}

export default App
