// Modal notification system for React
// NotificationModal styles in main.css

import i18n from '@/i18n'

class ModalSystem {
  constructor() {
    this.currentModal = null
  }

  alert(message, title = 'Notification', type = 'info', forceLight = false) {
    return new Promise((resolve) => {
      this.showModal({
        type,
        title,
        message,
        forceLight,
        buttons: [
          {
            text: 'OK',
            style: 'primary',
            onClick: () => {
              this.closeModal()
              resolve(true)
            }
          }
        ]
      })
    })
  }

  confirm(message, title = 'Confirm', options = {}) {
    const {
      type = 'question',
      confirmText = 'OK',
      cancelText = 'Cancel',
      confirmStyle = 'primary',
      danger = false,
      forceLight = false
    } = options

    return new Promise((resolve) => {
      this.showModal({
        type,
        title,
        message,
        forceLight,
        buttons: [
          {
            text: cancelText,
            style: 'secondary',
            onClick: () => {
              this.closeModal()
              resolve(false)
            }
          },
          {
            text: confirmText,
            style: danger ? 'danger' : confirmStyle,
            onClick: () => {
              this.closeModal()
              resolve(true)
            }
          }
        ]
      })
    })
  }

  success(message, title = 'Success') {
    return this.alert(message, title, 'success')
  }

  error(message, title = 'Error') {
    return this.alert(message, title, 'error')
  }

  /**
   * Show error modal with report button
   * @param {string} message - Error message to display
   * @param {Error|string} error - Error object for reporting
   * @param {string} title - Modal title
   * @param {string} context - Additional context for the error report
   */
  errorWithReport(message, error = null, title = 'Error', context = '') {
    const errorObj = error instanceof Error ? error : new Error(error || message)
    const t = (key, fallback) => i18n.t(key, fallback)
    
    return new Promise((resolve) => {
      this.showModal({
        type: 'error',
        title,
        message,
        buttons: [
          {
            text: t('errorReport.report', 'Report'),
            style: 'secondary',
            onClick: async () => {
              // Since we can't use hooks outside React, we'll dispatch a custom event
              try {
                window.dispatchEvent(new CustomEvent('report-error', { 
                  detail: { error: errorObj, context } 
                }))
                this.toast(t('errorReport.errorReported', 'Error reported. Thank you!'), '', 'success')
              } catch (e) {
                console.error('Failed to report error:', e)
              }
              this.closeModal()
              resolve(false)
            }
          },
          {
            text: 'OK',
            style: 'primary',
            onClick: () => {
              this.closeModal()
              resolve(true)
            }
          }
        ]
      })
    })
  }

  warning(message, title = 'Warning') {
    return this.alert(message, title, 'warning')
  }

  info(message, title = 'Information') {
    return this.alert(message, title, 'info')
  }

  toast(message, title = '', type = 'info', options = {}) {
    const { forceLight = false } = options
    
    // Check if dark mode is active (unless forceLight is true)
    const isDarkMode = !forceLight && document.documentElement.classList.contains('dark')
    
    // Simple toast notification with inline styles for consistency
    const toast = document.createElement('div')
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      padding: 14px 24px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10001;
      opacity: 0;
      transition: all 0.2s ease;
      background: ${isDarkMode ? '#2C2C2E' : '#fff'};
      color: ${isDarkMode ? '#F5F5F7' : '#333'};
      box-shadow: ${isDarkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.12)'};
      border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'};
    `
    toast.innerHTML = `
      <span>${this.escapeHtml(message)}</span>
    `
    
    document.body.appendChild(toast)
    
    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1'
      toast.style.transform = 'translateX(-50%) translateY(0)'
    })
    
    // Animate out and remove
    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateX(-50%) translateY(20px)'
      setTimeout(() => toast.remove(), 200)
    }, 3000)
    
    return Promise.resolve()
  }

  // Toast with forced light theme (for profile setup)
  toastLight(message, title = '', type = 'info') {
    return this.toast(message, title, type, { forceLight: true })
  }

  loading(message = 'Processing...') {
    const overlay = document.createElement('div')
    overlay.className = 'notification-modal-overlay show'
    overlay.innerHTML = `
      <div class="notification-modal-container">
        <div class="notification-modal-loading">
          <div class="notification-modal-spinner"></div>
          <p class="notification-modal-loading-text">${this.escapeHtml(message)}</p>
        </div>
      </div>
    `

    document.body.appendChild(overlay)
    this.currentModal = overlay

    return {
      close: () => this.closeModal()
    }
  }

  showModal(config) {
    // Force close any existing modal first
    this.closeModal()

    const { type = 'info', title, message, buttons = [], forceLight = false } = config

    // Inline SVG icons from lucide-react
    const iconSvgMap = {
      success: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
      error: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
      warning: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
      info: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
      question: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>'
    }

    const iconSvg = iconSvgMap[type] || iconSvgMap.info

    const overlay = document.createElement('div')
    overlay.className = `notification-modal-overlay${forceLight ? ' force-light-theme' : ''}`

    const buttonsHtml = buttons.map(btn => 
      `<button class="notification-modal-button ${btn.style || 'secondary'}" data-action="${btn.text}">
        ${this.escapeHtml(btn.text)}
      </button>`
    ).join('')

    overlay.innerHTML = `
      <div class="notification-modal-container">
        <div class="notification-modal-header">
          <div class="notification-modal-icon ${type}">
            ${iconSvg}
          </div>
          <div class="notification-modal-header-text">
            <h3 class="notification-modal-title">${this.escapeHtml(title)}</h3>
            <p class="notification-modal-message">${this.escapeHtml(message)}</p>
          </div>
        </div>
        <div class="notification-modal-footer">
          ${buttonsHtml}
        </div>
      </div>
    `

    // Store event handlers for cleanup
    const handlers = {
      buttons: [],
      overlay: null,
      keyboard: null
    }

    // Append to body first
    document.body.appendChild(overlay)
    this.currentModal = overlay

    // Use requestAnimationFrame for smoother animation
    requestAnimationFrame(() => {
      if (overlay.parentNode) {
        overlay.classList.add('show')
      }
    })

    buttons.forEach((btn, index) => {
      const btnElement = overlay.querySelectorAll('.notification-modal-button')[index]
      if (btnElement && btn.onClick) {
        const handler = () => {
          this.cleanupHandlers(handlers)
          btn.onClick()
        }
        btnElement.addEventListener('click', handler)
        handlers.buttons.push({ element: btnElement, handler })
      }
    })

    const overlayHandler = (e) => {
      if (e.target === overlay) {
        const cancelBtn = buttons.find(b => b.style === 'secondary')
        if (cancelBtn && cancelBtn.onClick) {
          this.cleanupHandlers(handlers)
          cancelBtn.onClick()
        }
      }
    }
    overlay.addEventListener('click', overlayHandler)
    handlers.overlay = { element: overlay, handler: overlayHandler }

    const escHandler = (e) => {
      if (e.key === 'Escape') {
        const cancelBtn = buttons.find(b => b.style === 'secondary')
        if (cancelBtn && cancelBtn.onClick) {
          this.cleanupHandlers(handlers)
          cancelBtn.onClick()
        }
      }
    }
    document.addEventListener('keydown', escHandler)
    handlers.keyboard = escHandler
  }

  cleanupHandlers(handlers) {
    // Remove button handlers
    handlers.buttons.forEach(({ element, handler }) => {
      element.removeEventListener('click', handler)
    })
    
    // Remove overlay handler
    if (handlers.overlay) {
      handlers.overlay.element.removeEventListener('click', handlers.overlay.handler)
    }
    
    // Remove keyboard handler
    if (handlers.keyboard) {
      document.removeEventListener('keydown', handlers.keyboard)
    }
  }

  closeModal() {
    if (this.currentModal && this.currentModal.parentNode) {
      const oldModal = this.currentModal
      this.currentModal = null
      
      oldModal.classList.remove('show')
      
      setTimeout(() => {
        try {
          if (oldModal.parentNode) {
            oldModal.parentNode.removeChild(oldModal)
          }
        } catch {
          // Ignore errors if node was already removed
        }
      }, 200)
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

// Create and export singleton instance
const modal = new ModalSystem()
export default modal
