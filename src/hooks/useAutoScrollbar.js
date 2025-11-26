import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * useAutoScrollbar - Hook to automatically show scrollbar when scrolling
 * 
 * @param {Object} options - Configuration
 * @param {number} options.scrollThreshold - Scroll threshold to show (px), default 50
 * @param {number} options.hideDelay - Time to hide after stopping scroll (ms), default 1500
 * @param {boolean} options.showOnHover - Show on hover, default true
 * @param {boolean} options.alwaysShowWhenScrolling - Always show when scrolling, default true
 * @param {React.RefObject} options.externalRef - External ref (optional)
 * 
 * @returns {Object} { containerRef, isScrollbarVisible, scrollbarClassName }
 * 
 * @example
 * const { containerRef, scrollbarClassName } = useAutoScrollbar()
 * return <div ref={containerRef} className={`my-container ${scrollbarClassName}`}>...</div>
 */
const useAutoScrollbar = (options = {}) => {
  const {
    scrollThreshold = 50,
    hideDelay = 1500,
    showOnHover = true,
    alwaysShowWhenScrolling = true,
    externalRef = null
  } = options

  const internalRef = useRef(null)
  const containerRef = externalRef || internalRef
  const [isScrollbarVisible, setIsScrollbarVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const hideTimeoutRef = useRef(null)
  const lastScrollTopRef = useRef(0)
  const scrollDistanceRef = useRef(0)

  // Clear timeout helper
  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }, [])

  // Schedule hide scrollbar
  const scheduleHide = useCallback(() => {
    clearHideTimeout()
    hideTimeoutRef.current = setTimeout(() => {
      if (!isHovering) {
        setIsScrollbarVisible(false)
        scrollDistanceRef.current = 0
      }
    }, hideDelay)
  }, [clearHideTimeout, hideDelay, isHovering])

  // Handle scroll event
  const handleScroll = useCallback((e) => {
    const container = e.target
    const currentScrollTop = container.scrollTop
    const scrollDelta = Math.abs(currentScrollTop - lastScrollTopRef.current)
    
    // Accumulate scroll distance
    scrollDistanceRef.current += scrollDelta
    lastScrollTopRef.current = currentScrollTop

    // Show scrollbar if scrolled far enough or scrolling
    if (alwaysShowWhenScrolling || scrollDistanceRef.current >= scrollThreshold) {
      setIsScrollbarVisible(true)
      clearHideTimeout()
    }

    // Schedule hide scrollbar after stopping scroll
    scheduleHide()
  }, [scrollThreshold, alwaysShowWhenScrolling, clearHideTimeout, scheduleHide])

  // Handle mouse enter/leave
  const handleMouseEnter = useCallback(() => {
    if (showOnHover) {
      setIsHovering(true)
      // Only show on hover if container can scroll
      const container = containerRef.current
      if (container && container.scrollHeight > container.clientHeight) {
        setIsScrollbarVisible(true)
        clearHideTimeout()
      }
    }
  }, [showOnHover, clearHideTimeout, containerRef])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    scheduleHide()
  }, [scheduleHide])

  // Attach event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
      clearHideTimeout()
    }
  }, [handleScroll, handleMouseEnter, handleMouseLeave, clearHideTimeout, containerRef])

  // Generate className - only add scrollbar-visible when needed
  const scrollbarClassName = isScrollbarVisible ? 'scrollbar-visible' : ''

  return {
    containerRef,
    isScrollbarVisible,
    scrollbarClassName,
    showScrollbar: () => setIsScrollbarVisible(true),
    hideScrollbar: () => setIsScrollbarVisible(false)
  }
}

export default useAutoScrollbar
