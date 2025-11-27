import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './i18n' // Initialize i18n
import './styles/global.css'
import './styles/auto-scrollbar.css'
import './styles/tooltip.css'
import './utils/tooltips'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
