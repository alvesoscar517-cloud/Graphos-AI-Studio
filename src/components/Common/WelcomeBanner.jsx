/**
 * Welcome Banner Carousel
 * Shows promotional banners after user login
 * - Auto-slides through images
 * - Close button to dismiss
 * - Blur backdrop like other modals
 * - Shows once per session after login
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../stores/authStore'

// SVG Icons
const XIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ChevronLeftIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
)

// Banner images - place in public/banners/
const BANNER_IMAGES = [
  { id: 1, src: '/banners/banner-1.jpg', alt: 'Welcome Banner 1' },
  { id: 2, src: '/banners/banner-2.jpg', alt: 'Welcome Banner 2' },
  { id: 3, src: '/banners/banner-3.jpg', alt: 'Welcome Banner 3' }
]

const AUTO_SLIDE_INTERVAL = 5000 // 5 seconds per slide
const BANNER_SHOWN_KEY = 'welcome_banner_shown_session'

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const loadedCount = useRef(0)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [wasAuthenticated, setWasAuthenticated] = useState(false)


  // Preload images
  useEffect(() => {
    if (BANNER_IMAGES.length === 0) return
    loadedCount.current = 0
    BANNER_IMAGES.forEach((banner) => {
      const img = new Image()
      img.onload = img.onerror = () => {
        loadedCount.current++
        if (loadedCount.current >= BANNER_IMAGES.length) setImagesLoaded(true)
      }
      img.src = banner.src
    })
  }, [])

  // Clear flag on logout
  useEffect(() => {
    if (!isAuthenticated && wasAuthenticated) sessionStorage.removeItem(BANNER_SHOWN_KEY)
    setWasAuthenticated(isAuthenticated)
  }, [isAuthenticated, wasAuthenticated])

  // Show banner on login
  useEffect(() => {
    if (!isAuthenticated || !imagesLoaded) return
    const hasShown = sessionStorage.getItem(BANNER_SHOWN_KEY)
    if (!hasShown) {
      const timer = setTimeout(() => {
        setIsVisible(true)
        sessionStorage.setItem(BANNER_SHOWN_KEY, 'true')
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, imagesLoaded])

  // Auto-slide with visibility handling
  useEffect(() => {
    if (!isVisible || isPaused || BANNER_IMAGES.length <= 1) return
    
    let intervalId = null
    let lastSlideTime = Date.now()
    
    const startInterval = () => {
      if (intervalId) clearInterval(intervalId)
      intervalId = setInterval(() => {
        lastSlideTime = Date.now()
        setCurrentIndex((prev) => (prev + 1) % BANNER_IMAGES.length)
      }, AUTO_SLIDE_INTERVAL)
    }
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Tab became visible - check if we need to slide immediately
        const elapsed = Date.now() - lastSlideTime
        if (elapsed >= AUTO_SLIDE_INTERVAL) {
          // Enough time passed, slide now and restart interval
          setCurrentIndex((prev) => (prev + 1) % BANNER_IMAGES.length)
          lastSlideTime = Date.now()
        }
        startInterval()
      } else {
        // Tab hidden - clear interval to prevent memory issues
        if (intervalId) {
          clearInterval(intervalId)
          intervalId = null
        }
      }
    }
    
    // Start interval immediately
    startInterval()
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      if (intervalId) clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isVisible, isPaused])

  const handleClose = useCallback(() => setIsVisible(false), [])
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + BANNER_IMAGES.length) % BANNER_IMAGES.length)
  }, [])
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % BANNER_IMAGES.length)
  }, [])

  // Keyboard
  useEffect(() => {
    if (!isVisible) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, handleClose, handlePrev, handleNext])

  // Test function
  useEffect(() => {
    // @ts-ignore
    window.showWelcomeBanner = () => setIsVisible(true)
    return () => {
      // @ts-ignore
      delete window.showWelcomeBanner
    }
  }, [])

  if (BANNER_IMAGES.length === 0) return null

  return (
    <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/25 backdrop-blur-[2px]"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-[95vw] max-w-5xl mx-2 sm:mx-4"
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 w-7 h-7 sm:w-8 sm:h-8 
                             flex items-center justify-center rounded-full
                             bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <XIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </button>

                {/* Image container */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.img
                      key={currentIndex}
                      src={BANNER_IMAGES[currentIndex].src}
                      alt={BANNER_IMAGES[currentIndex].alt}
                      initial={{ opacity: 0, scale: 1.1, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      className="absolute inset-0 w-full h-full object-cover"
                      draggable={false}
                    />
                  </AnimatePresence>

                  {/* Navigation arrows */}
                  {BANNER_IMAGES.length > 1 && (
                    <>
                      <button
                        onClick={handlePrev}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 
                                   w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full
                                   bg-white/20 hover:bg-white/40 backdrop-blur-sm
                                   transition-all duration-200 hover:scale-110"
                      >
                        <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-lg" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 
                                   w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full
                                   bg-white/20 hover:bg-white/40 backdrop-blur-sm
                                   transition-all duration-200 hover:scale-110"
                      >
                        <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-lg" />
                      </button>
                    </>
                  )}

                  {/* Progress dots */}
                  {BANNER_IMAGES.length > 1 && (
                    <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 
                                    flex gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm">
                      {BANNER_IMAGES.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`rounded-full transition-all duration-300 ${
                            index === currentIndex
                              ? 'bg-white w-5 sm:w-6 h-1.5 sm:h-2'
                              : 'bg-white/50 hover:bg-white/80 w-1.5 sm:w-2 h-1.5 sm:h-2'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
    </AnimatePresence>
  )
}

export default WelcomeBanner
