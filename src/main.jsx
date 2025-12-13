import 'regenerator-runtime/runtime' // Required for react-speech-recognition
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './i18n' // Initialize i18n
import './styles/main.css' // Tailwind CSS v4
import './utils/tooltips'
import 'flag-icons/css/flag-icons.min.css' // Country flags

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
