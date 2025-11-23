import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotesProvider } from './contexts/NotesContext'
import { AIProcessingProvider } from './contexts/AIProcessingContext'
import { ProfileProvider } from './contexts/ProfileContext'
import { WorkspaceProvider } from './contexts/WorkspaceContext'
import LoginOverlay from './components/Auth/LoginOverlay'
import MainLayout from './components/Layout/MainLayout'
import ProfileSetupWrapper from './components/ProfileSetup/ProfileSetupWrapper'
import ErrorBoundary from './components/Common/ErrorBoundary'
import modal from './utils/modal'
import { initTooltips } from './utils/tooltips'

function App() {
  useEffect(() => {
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
  }, [])

  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <NotesProvider>
              <AIProcessingProvider>
                <ProfileProvider>
                  <WorkspaceProvider>
                    <AppContent />
                  </WorkspaceProvider>
                </ProfileProvider>
              </AIProcessingProvider>
            </NotesProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  )
}

// Separate component to access auth context
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

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
