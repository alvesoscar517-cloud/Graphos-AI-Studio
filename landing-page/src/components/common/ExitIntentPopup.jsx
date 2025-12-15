/**
 * ExitIntentPopup - Shows special offer when user tries to leave
 * Enhanced: Dec 2025 - Glassmorphism, smooth animations
 */
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from './Icon'

const STORAGE_KEY = 'graphos_exit_popup_shown'
const POPUP_COOLDOWN_DAYS = 7

const ExitIntentPopup = () => {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const shouldShowPopup = useCallback(() => {
    const lastShown = localStorage.getItem(STORAGE_KEY)
    if (!lastShown) return true
    
    const daysSinceShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24)
    return daysSinceShown > POPUP_COOLDOWN_DAYS
  }, [])

  const handleMouseLeave = useCallback((e) => {
    // Only trigger when mouse leaves from top of viewport
    if (e.clientY <= 0 && shouldShowPopup() && !isVisible) {
      setIsVisible(true)
      localStorage.setItem(STORAGE_KEY, Date.now().toString())
    }
  }, [shouldShowPopup, isVisible])

  useEffect(() => {
    // Only add listener on desktop
    if (window.innerWidth < 768) return
    
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [handleMouseLeave])

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) {
      setIsSubmitted(true)
      // Here you would typically send to your email service
      setTimeout(() => setIsVisible(false), 2000)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 z-[10000]"
          >
            <div className="relative bg-bg-primary rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Gradient header */}
              <div className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                >
                  <Icon name="gift" size="xl" className="icon-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {t('exitPopup.title', 'Wait! Get 50 Bonus Credits')}
                </h3>
                <p className="text-white/80 text-sm">
                  {t('exitPopup.subtitle', 'Subscribe to our newsletter and get 50 extra credits on your first purchase!')}
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 bg-green-500/10 rounded-full flex items-center justify-center">
                      <Icon name="check-circle" size="xl" className="text-green-500" />
                    </div>
                    <p className="text-text-primary font-semibold">
                      {t('exitPopup.success', 'Awesome! Check your email for the bonus code.')}
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('exitPopup.emailPlaceholder', 'Enter your email')}
                          className="w-full px-4 py-3 bg-bg-secondary border border-gray-200 rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                        />
                      </div>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
                      >
                        {t('exitPopup.cta', 'Claim My Bonus Credits')}
                      </motion.button>
                    </form>

                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Icon name="shield-check" size="xs" className="text-green-500" />
                        {t('exitPopup.noSpam', 'No spam')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="mail" size="xs" className="text-blue-500" />
                        {t('exitPopup.unsubscribe', 'Unsubscribe anytime')}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <Icon name="x" size="sm" />
              </button>

              {/* No thanks link */}
              {!isSubmitted && (
                <div className="pb-4 text-center">
                  <button
                    onClick={handleClose}
                    className="text-sm text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {t('exitPopup.noThanks', 'No thanks, I\'ll pay full price')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ExitIntentPopup
