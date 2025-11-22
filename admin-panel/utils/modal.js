// Modal notification system for React

class ModalSystem {
  constructor() {
    this.currentModal = null
  }

  alert(message, title = 'Notification', type = 'info') {
    return new Promise((resolve) => {
      this.showModal({
        type,
        title,
        message,
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
      danger = false
    } = options

    return new Promise((resolve) => {
      this.showModal({
        type,
        title,
        message,
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
    // Toast removed - no notification shown
    return Promise.resolve()
  }

  loading(message = 'Processing...') {
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay show'
    overlay.innerHTML = `
      <div class="modal-container">
        <div class="modal-loading">
          <div class="modal-spinner"></div>
          <p class="modal-loading-text">${this.escapeHtml(message)}</p>
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
    if (this.currentModal) {
      if (this.currentModal.parentNode) {
        this.currentModal.parentNode.removeChild(this.currentModal)
      }
      this.currentModal = null
    }

    const { type = 'info', title, message, buttons = [] } = config

    const iconMap = {
      success: 'check-circle',
      error: 'x-circle',
      warning: 'alert-triangle',
      info: 'info',
      question: 'help-circle'
    }

    const icon = iconMap[type] || 'info'

    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'

    const buttonsHtml = buttons.map(btn => 
      `<button class="modal-button ${btn.style || 'secondary'}" data-action="${btn.text}">
        ${this.escapeHtml(btn.text)}
      </button>`
    ).join('')

    overlay.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-icon ${type}">
            <img src="/icon/${icon}.svg" alt="${type}">
          </div>
          <div class="modal-header-text">
            <h3 class="modal-title">${this.escapeHtml(title)}</h3>
            <p class="modal-message">${this.escapeHtml(message)}</p>
          </div>
        </div>
        <div class="modal-footer">
          ${buttonsHtml}
        </div>
      </div>
    `

    document.body.appendChild(overlay)
    this.currentModal = overlay

    // Store event handlers for cleanup
    const handlers = {
      buttons: [],
      overlay: null,
      keyboard: null
    }

    setTimeout(() => overlay.classList.add('show'), 10)

    buttons.forEach((btn, index) => {
      const btnElement = overlay.querySelectorAll('.modal-button')[index]
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
    if (this.currentModal) {
      // Remove all event listeners by cloning and replacing
      const oldModal = this.currentModal
      oldModal.classList.remove('show')
      
      setTimeout(() => {
        if (oldModal && oldModal.parentNode) {
          oldModal.parentNode.removeChild(oldModal)
        }
        if (this.currentModal === oldModal) {
          this.currentModal = null
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
