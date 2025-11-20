import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotesProvider } from './contexts/NotesContext'
import { AIProcessingProvider } from './contexts/AIProcessingContext'
import { ProfileProvider } from './contexts/ProfileContext'
import LoginOverlay from './components/Auth/LoginOverlay'
import MainLayout from './components/Layout/MainLayout'
import ProfileSetup from './components/ProfileSetup/ProfileSetup'
import modal from './utils/modal'
import { initTooltips } from './utils/tooltips'
import './styles/App.css'
import './styles/modal.css'

function App() {
  useEffect(() => {
    // Make modal available globally for components
    window.modal = modal
    
    // Initialize tooltips
    initTooltips()
    
    // Clean up any leftover overlays and debug
    const cleanupAndDebug = () => {
      const overlays = document.querySelectorAll('.modal-overlay, .ai-detail-overlay, .login-overlay, [class*="overlay"]')
      console.log('🔍 Found overlays:', overlays.length)
      overlays.forEach((overlay, index) => {
        const styles = window.getComputedStyle(overlay)
        console.log(`Overlay ${index}:`, {
          className: overlay.className,
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          zIndex: styles.zIndex,
          position: styles.position
        })
        
        // Remove if it's blocking (visible and has high z-index)
        if (styles.display !== 'none' && styles.visibility !== 'hidden' && parseInt(styles.zIndex) > 1000) {
          console.log(`⚠️ Removing blocking overlay:`, overlay.className)
          overlay.remove()
        }
      })
      
      // Check all elements with high z-index
      const allElements = document.querySelectorAll('*')
      allElements.forEach(el => {
        const styles = window.getComputedStyle(el)
        const zIndex = parseInt(styles.zIndex)
        if (zIndex > 5000 && styles.position === 'fixed') {
          console.log('🎯 High z-index fixed element:', {
            tag: el.tagName,
            className: el.className,
            zIndex: styles.zIndex,
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            pointerEvents: styles.pointerEvents,
            background: styles.background,
            backgroundColor: styles.backgroundColor
          })
          
          // Try to remove it if it's blocking
          if (styles.pointerEvents !== 'none' && styles.display !== 'none') {
            console.log('⚠️ Removing blocking element:', el.className)
            el.remove()
          }
        }
      })
      
      // Check body and root elements
      const bodyStyles = window.getComputedStyle(document.body)
      const rootStyles = window.getComputedStyle(document.getElementById('root'))
      
      console.log('📦 Body styles:', {
        overflow: bodyStyles.overflow,
        pointerEvents: bodyStyles.pointerEvents,
        background: bodyStyles.background,
        backgroundColor: bodyStyles.backgroundColor,
        position: bodyStyles.position
      })
      console.log('📦 Root styles:', {
        overflow: rootStyles.overflow,
        pointerEvents: rootStyles.pointerEvents,
        background: rootStyles.background,
        backgroundColor: rootStyles.backgroundColor,
        position: rootStyles.position
      })
      
      // Force remove any background on body
      if (bodyStyles.backgroundColor && bodyStyles.backgroundColor !== 'rgba(0, 0, 0, 0)' && bodyStyles.backgroundColor !== 'transparent') {
        console.log('⚠️ Removing body background:', bodyStyles.backgroundColor)
        document.body.style.backgroundColor = ''
        document.body.style.background = ''
      }
    }
    
    // Run cleanup after a short delay to ensure DOM is ready
    setTimeout(cleanupAndDebug, 500)
    
    // Also run on window load
    window.addEventListener('load', cleanupAndDebug)
  }, [])

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <NotesProvider>
            <AIProcessingProvider>
              <ProfileProvider>
                <AppContent />
              </ProfileProvider>
            </AIProcessingProvider>
          </NotesProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

// Separate component to access auth context
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <Routes>
      <Route path="/profile-setup" element={<ProfileSetup />} />
      <Route path="*" element={
        <div className="app">
          {/* Show login overlay when loading or not authenticated */}
          {(isLoading || !isAuthenticated) && <LoginOverlay />}
          {/* Only render MainLayout when authenticated and not loading */}
          {!isLoading && isAuthenticated && <MainLayout />}
        </div>
      } />
    </Routes>
  )
}

export default App
