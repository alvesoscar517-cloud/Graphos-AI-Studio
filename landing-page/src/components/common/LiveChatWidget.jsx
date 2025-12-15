/**
 * LiveChatWidget - Floating chat button for support
 * Enhanced: Dec 2025 - Animated, expandable quick actions
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from './Icon'

const QUICK_ACTIONS = [
  { icon: 'mail', label: 'emailSupport', href: 'mailto:support@graphosai.com' },
  { icon: 'help-circle', label: 'faq', href: '#faq' },
  { icon: 'book-open', label: 'docs', href: 'https://docs.graphosai.com', external: true }
]

const LiveChatWidget = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute bottom-16 right-0 w-72 bg-bg-primary rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mb-2"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-blue-600 p-4 text-white">
              <h3 className="font-bold text-lg">{t('chat.title', 'Need Help?')}</h3>
              <p className="text-sm text-white/80">{t('chat.subtitle', 'We\'re here to assist you')}</p>
            </div>

            {/* Quick Actions */}
            <div className="p-4 space-y-2">
              {QUICK_ACTIONS.map((action) => (
                <motion.a
                  key={action.label}
                  href={action.href}
                  target={action.external ? '_blank' : undefined}
                  rel={action.external ? 'noopener noreferrer' : undefined}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 p-3 bg-bg-secondary rounded-xl hover:bg-bg-hover transition-colors group"
                  onClick={() => !action.external && setIsOpen(false)}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon name={action.icon} size="md" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {t(`chat.actions.${action.label}`, action.label)}
                  </span>
                  <Icon name="chevron-right" size="sm" className="text-text-muted ml-auto" />
                </motion.a>
              ))}
            </div>

            {/* Response time */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {t('chat.responseTime', 'Usually responds within 2 hours')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          isOpen 
            ? 'bg-bg-secondary border border-gray-200' 
            : 'bg-gradient-to-r from-primary to-blue-600 shadow-primary/30'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon 
            name={isOpen ? 'x' : 'message-circle'} 
            size="lg" 
            className={isOpen ? 'text-text-primary' : 'text-white'} 
          />
        </motion.div>
      </motion.button>

      {/* Notification dot when closed */}
      {!isOpen && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-bg-primary"
        />
      )}
    </div>
  )
}

export default LiveChatWidget
