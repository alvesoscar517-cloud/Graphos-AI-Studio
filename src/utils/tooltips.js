// Tooltip system
let currentTooltip = null
let tooltipTimeout = null

export function showTooltip(element, text, position = 'bottom') {
  hideTooltip()
  
  tooltipTimeout = setTimeout(() => {
    const tooltip = document.createElement('div')
    tooltip.className = `tooltip tooltip-${position}`
    tooltip.textContent = text
    
    document.body.appendChild(tooltip)
    currentTooltip = tooltip
    
    const rect = element.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()
    
    let top, left
    
    switch (position) {
      case 'top':
        top = rect.top - tooltipRect.height - 8
        left = rect.left + (rect.width - tooltipRect.width) / 2
        break
      case 'bottom':
        top = rect.bottom + 8
        left = rect.left + (rect.width - tooltipRect.width) / 2
        break
      case 'left':
        top = rect.top + (rect.height - tooltipRect.height) / 2
        left = rect.left - tooltipRect.width - 8
        break
      case 'right':
        top = rect.top + (rect.height - tooltipRect.height) / 2
        left = rect.right + 8
        break
      default:
        top = rect.bottom + 8
        left = rect.left + (rect.width - tooltipRect.width) / 2
    }
    
    tooltip.style.top = `${top}px`
    tooltip.style.left = `${left}px`
    
    requestAnimationFrame(() => {
      tooltip.classList.add('show')
    })
  }, 500)
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
        currentTooltip.parentNode.removeChild(currentTooltip)
      }
      currentTooltip = null
    }, 200)
  }
}

export function initTooltips() {
  document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseenter', () => {
      const text = element.getAttribute('data-tooltip')
      const position = element.getAttribute('data-tooltip-position') || 'bottom'
      showTooltip(element, text, position)
    })
    
    element.addEventListener('mouseleave', () => {
      hideTooltip()
    })
    
    element.addEventListener('click', () => {
      hideTooltip()
    })
  })
}

// Auto-initialize tooltips
if (typeof window !== 'undefined') {
  const observer = new MutationObserver(() => {
    initTooltips()
  })
  
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    initTooltips()
  }
}
