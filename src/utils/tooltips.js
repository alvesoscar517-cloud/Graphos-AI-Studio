// Simple tooltip system - replaces browser native tooltips
let currentTooltip = null
let tooltipTimeout = null

export function showTooltip(element, text) {
  hideTooltip()
  if (!text || !element) return
  
  tooltipTimeout = setTimeout(() => {
    if (!element || !document.body.contains(element)) return
    
    const tooltip = document.createElement('div')
    tooltip.className = 'tooltip'
    tooltip.textContent = text
    document.body.appendChild(tooltip)
    
    const rect = element.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()
    
    // Simple positioning: below element, centered
    let top = rect.bottom + 6
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2
    
    // Keep within viewport
    const margin = 8
    if (left < margin) left = margin
    if (left + tooltipRect.width > window.innerWidth - margin) {
      left = window.innerWidth - tooltipRect.width - margin
    }
    
    // If no space below, show above
    if (top + tooltipRect.height > window.innerHeight - margin) {
      top = rect.top - tooltipRect.height - 6
    }
    
    tooltip.style.top = Math.round(top) + 'px'
    tooltip.style.left = Math.round(left) + 'px'
    currentTooltip = tooltip
    
    requestAnimationFrame(() => {
      if (currentTooltip === tooltip) tooltip.classList.add('show')
    })
  }, 400)
}

export function hideTooltip() {
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout)
    tooltipTimeout = null
  }
  if (currentTooltip) {
    const t = currentTooltip
    currentTooltip = null
    t.classList.remove('show')
    setTimeout(() => {
      if (t.parentNode) t.parentNode.removeChild(t)
    }, 150)
  }
}

const initialized = new WeakSet()

export function initTooltips() {
  document.querySelectorAll('[data-tooltip]').forEach((el) => {
    if (initialized.has(el)) return
    initialized.add(el)
    
    // Remove title attribute to prevent browser tooltip
    if (el.hasAttribute('title')) {
      el.removeAttribute('title')
    }
    
    el.addEventListener('mouseenter', () => {
      const text = el.getAttribute('data-tooltip')
      if (text) showTooltip(el, text)
    })
    el.addEventListener('mouseleave', hideTooltip)
    el.addEventListener('click', hideTooltip)
  })
}

// Auto-init and watch for new elements
if (typeof window !== 'undefined') {
  const init = () => {
    initTooltips()
    new MutationObserver(() => initTooltips()).observe(document.body, { childList: true, subtree: true })
  }
  
  if (document.body) init()
  else document.addEventListener('DOMContentLoaded', init)
}
