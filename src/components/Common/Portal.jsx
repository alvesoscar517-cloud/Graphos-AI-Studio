import { createPortal } from 'react-dom'

/**
 * Portal component to render children outside of parent DOM hierarchy
 * Useful for modals, popups, tooltips that need to escape stacking context
 */
const Portal = ({ children, containerId = 'portal-root' }) => {
  // Get or create portal container
  let container = document.getElementById(containerId)
  
  if (!container) {
    container = document.createElement('div')
    container.id = containerId
    document.body.appendChild(container)
  }

  return createPortal(children, container)
}

export default Portal
