// Simple tooltip system - replaces browser native tooltips
let currentTooltip = null
let tooltipTimeout = null

// Check if element has visible text (not hidden by CSS or React conditional rendering)
function hasVisibleText(element) {
  // Check for CSS-hidden text spans (responsive hiding)
  const textSpan = element.querySelector('[class*="max-xl:hidden"], [class*="max-lg:hidden"], [class*="max-md:hidden"]')
  if (textSpan) {
    const style = window.getComputedStyle(textSpan)
    return style.display !== 'none'
  }
  
  // Check if element has any visible text content (for React conditional rendering)
  // Look for direct text nodes or spans without hidden classes
  const hasDirectText = Array.from(element.childNodes).some(node => 
    node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
  )
  if (hasDirectText) return true
  
  // Check for visible span children (not icons/images)
  const visibleSpans = element.querySelectorAll('span:not([class*="hidden"])')
  for (const span of visibleSpans) {
    const style = window.getComputedStyle(span)
    if (style.display !== 'none' && span.textContent.trim().length > 0) {
      return true
    }
  }
  
  return false
}

export function showTooltip(element, text, isCollapsible = false) {
  hideTooltip()
  if (!text || !element) return
  
  // For collapsible tooltips, only show when text is hidden
  if (isCollapsible && hasVisibleText(element)) return
  
  tooltipTimeout = setTimeout(() => {
    if (!element || !document.body.contains(element)) return
    
    // Re-check for collapsible tooltips (in case window was resized)
    if (isCollapsible && hasVisibleText(element)) return
    
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
  // Regular tooltips - always show
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
  
  // Collapsible tooltips - only show when text is hidden (responsive)
  document.querySelectorAll('[data-tooltip-collapsed]').forEach((el) => {
    if (initialized.has(el)) return
    initialized.add(el)
    
    if (el.hasAttribute('title')) {
      el.removeAttribute('title')
    }
    
    el.addEventListener('mouseenter', () => {
      const text = el.getAttribute('data-tooltip-collapsed')
      if (text) showTooltip(el, text, true)
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
