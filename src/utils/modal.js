// Modal notification system for React
// NotificationModal styles in main.css

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

  warning(message, title = 'Warning') {
    return this.alert(message, title, 'warning')
  }

  info(message, title = 'Information') {
    return this.alert(message, title, 'info')
  }

  toast(message, title = '', type = 'info') {
    // Simple toast notification
    const toast = document.createElement('div')
    toast.className = `simple-toast ${type}`
    toast.innerHTML = `
      <span class="simple-toast-message">${this.escapeHtml(message)}</span>
    `
    
    // Add styles if not exists
    if (!document.getElementById('simple-toast-styles')) {
      const style = document.createElement('style')
      style.id = 'simple-toast-styles'
      style.textContent = `
        .simple-toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 13px;
          z-index: 10001;
          opacity: 0;
          transition: all 0.2s ease;
        }
        .simple-toast.show {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .simple-toast {
          background: #fff;
          color: #333;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      `
      document.head.appendChild(style)
    }
    
    document.body.appendChild(toast)
    
    requestAnimationFrame(() => toast.classList.add('show'))
    
    setTimeout(() => {
      toast.classList.remove('show')
      setTimeout(() => toast.remove(), 200)
    }, 3000)
    
    return Promise.resolve()
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

    const iconMap = {
      success: 'check-circle',
      error: 'x-circle',
      warning: 'alert-triangle',
      info: 'info',
      question: 'help-circle'
    }

    const icon = iconMap[type] || 'info'

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
            <img src="/icon/${icon}.svg" alt="${type}">
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
        } catch (error) {
          // Ignore errors if node was already removed
          console.debug('Modal already removed:', error)
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
