import 'regenerator-runtime/runtime' // Required for react-speech-recognition
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './i18n' // Initialize i18n
import './styles/main.css' // Tailwind CSS v4
import './utils/tooltips'
import 'flag-icons/css/flag-icons.min.css' // Country flags
import { isWebApp } from './utils/environment'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// Register service worker for PWA support (web app only)
if (isWebApp() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope)
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New content available, refresh to update')
              }
            })
          }
        })
      })
      .catch((error) => {
        console.warn('[PWA] Service Worker registration failed:', error)
      })
  })
}
