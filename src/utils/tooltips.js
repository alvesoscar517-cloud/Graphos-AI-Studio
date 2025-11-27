// Tooltip system
let currentTooltip = null
let tooltipTimeout = null

export function showTooltip(element, text, position = 'bottom') {
  hideTooltip()
  
  tooltipTimeout = setTimeout(() => {
    // Kiểm tra element còn tồn tại không
    if (!element || !element.parentNode) {
      return
    }
    const tooltip = document.createElement('div')
    tooltip.className = 'tooltip'
    tooltip.textContent = text
    
    // Add to body temporarily to measure
    document.body.appendChild(tooltip)
    
    const rect = element.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()
    const gap = 8
    const margin = 8
    
    let top, left, finalPosition = position
    
    // Calculate position based on preference
    const positions = {
      bottom: {
        top: rect.bottom + gap,
        left: rect.left + rect.width / 2 - tooltipRect.width / 2
      },
      top: {
        top: rect.top - tooltipRect.height - gap,
        left: rect.left + rect.width / 2 - tooltipRect.width / 2
      },
      right: {
        top: rect.top + rect.height / 2 - tooltipRect.height / 2,
        left: rect.right + gap
      },
      left: {
        top: rect.top + rect.height / 2 - tooltipRect.height / 2,
        left: rect.left - tooltipRect.width - gap
      }
    }
    
    // Try preferred position first
    let pos = positions[position] || positions.bottom
    top = pos.top
    left = pos.left
    finalPosition = position
    
    // Smart repositioning if out of bounds
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Check horizontal bounds
    if (left < margin) {
      left = margin
    } else if (left + tooltipRect.width > viewportWidth - margin) {
      left = viewportWidth - tooltipRect.width - margin
    }
    
    // Check vertical bounds and try alternative positions
    if (top < margin) {
      // Try bottom if top is too high
      if (position !== 'bottom') {
        const bottomPos = positions.bottom
        if (bottomPos.top + tooltipRect.height <= viewportHeight - margin) {
          top = bottomPos.top
          finalPosition = 'bottom'
        } else {
          top = margin
        }
      } else {
        top = margin
      }
    } else if (top + tooltipRect.height > viewportHeight - margin) {
      // Try top if bottom is too low
      if (position !== 'top') {
        const topPos = positions.top
        if (topPos.top >= margin) {
          top = topPos.top
          finalPosition = 'top'
        } else {
          top = viewportHeight - tooltipRect.height - margin
        }
      } else {
        top = viewportHeight - tooltipRect.height - margin
      }
    }
    
    // Apply position class for arrow styling
    tooltip.className = `tooltip tooltip-${finalPosition}`
    tooltip.style.top = `${Math.round(top)}px`
    tooltip.style.left = `${Math.round(left)}px`
    
    currentTooltip = tooltip
    
    // Trigger animation
    requestAnimationFrame(() => {
      if (currentTooltip === tooltip) {
        tooltip.classList.add('show')
      }
    })
  }, 400)
}

export function hideTooltip() {
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout)
    tooltipTimeout = null
  }
  
  if (currentTooltip) {
    currentTooltip.classList.remove('show')
    setTimeout(() => {
      if (currentTooltip && currentTooltip.parentNode) {
        try {
          currentTooltip.parentNode.removeChild(currentTooltip)
        } catch (e) {
          // Element already removed
        }
      }
      currentTooltip = null
    }, 150)
  }
}

const tooltipElements = new WeakSet()

export function initTooltips() {
  document.querySelectorAll('[data-tooltip]').forEach(element => {
    // Skip if already initialized
    if (tooltipElements.has(element)) {
      return
    }
    
    tooltipElements.add(element)
    
    const handleMouseEnter = () => {
      const text = element.getAttribute('data-tooltip')
      const position = element.getAttribute('data-tooltip-position') || 'bottom'
      if (text) {
        showTooltip(element, text, position)
      }
    }
    
    const handleMouseLeave = () => {
      hideTooltip()
    }
    
    const handleClick = () => {
      hideTooltip()
    }
    
    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)
    element.addEventListener('click', handleClick)
  })
}

// Auto-initialize tooltips
if (typeof window !== 'undefined') {
  // Initial setup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTooltips)
  } else {
    initTooltips()
  }
  
  // Watch for dynamically added elements
  const observer = new MutationObserver(() => {
    initTooltips()
  })
  
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }
}
