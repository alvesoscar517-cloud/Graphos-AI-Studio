/**
 * ProductShowcaseSection - Premium interactive demo showcase
 * Enhanced: Dec 2025 - Performance optimized, better lazy loading
 */
import { useState, Suspense, lazy, memo, useMemo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '@components/common/Icon'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { usePrefersReducedMotion } from '@hooks/useOptimizedAnimation'
import { useAnimateOnScroll } from '@hooks/useIntersectionObserver'
import { requestIdleCallback } from '@utils/performance'

// Lazy load demos with prefetch hints
const LiveAIDetectionDemo = lazy(() => import('@components/demos/LiveAIDetectionDemo'))
const LiveHumanizationDemo = lazy(() => import('@components/demos/LiveHumanizationDemo'))
const LiveVoiceProfileDemo = lazy(() => import('@components/demos/LiveVoiceProfileDemo'))
const LiveRewriteDemo = lazy(() => import('@components/demos/LiveRewriteDemo'))
const LiveCompatibilityDemo = lazy(() => import('@components/demos/LiveCompatibilityDemo'))
const LiveDeviationsDemo = lazy(() => import('@components/demos/LiveDeviationsDemo'))
const LiveStatisticsDemo = lazy(() => import('@components/demos/LiveStatisticsDemo'))
const LiveWorkspaceDemo = lazy(() => import('@components/demos/LiveWorkspaceDemo'))

// Preload map for prefetching
const DEMO_IMPORTS = {
  'ai-detection': () => import('@components/demos/LiveAIDetectionDemo'),
  'humanization': () => import('@components/demos/LiveHumanizationDemo'),
  'voice-profile': () => import('@components/demos/LiveVoiceProfileDemo'),
  'rewrite': () => import('@components/demos/LiveRewriteDemo'),
  'compatibility': () => import('@components/demos/LiveCompatibilityDemo'),
  'deviations': () => import('@components/demos/LiveDeviationsDemo'),
  'statistics': () => import('@components/demos/LiveStatisticsDemo'),
  'workspace': () => import('@components/demos/LiveWorkspaceDemo')
}

const FEATURES = [
  { 
    id: 'ai-detection', 
    icon: 'shield-check', 
    component: LiveAIDetectionDemo,
    iconColor: 'icon-blue',
    bgActive: 'bg-blue-500',
    bgHover: 'hover:bg-blue-50 dark:hover:bg-blue-500/10',
    textInactive: 'text-blue-600 dark:text-blue-400',
    borderActive: 'border-blue-500',
    shadow: 'shadow-blue-500/25'
  },
  { 
    id: 'humanization', 
    icon: 'wand-sparkles', 
    component: LiveHumanizationDemo,
    iconColor: 'icon-amber',
    bgActive: 'bg-amber-500',
    bgHover: 'hover:bg-amber-50 dark:hover:bg-amber-500/10',
    textInactive: 'text-amber-600 dark:text-amber-400',
    borderActive: 'border-amber-500',
    shadow: 'shadow-amber-500/25'
  },
  { 
    id: 'voice-profile', 
    icon: 'mic', 
    component: LiveVoiceProfileDemo,
    iconColor: 'icon-violet',
    bgActive: 'bg-violet-500',
    bgHover: 'hover:bg-violet-50 dark:hover:bg-violet-500/10',
    textInactive: 'text-violet-600 dark:text-violet-400',
    borderActive: 'border-violet-500',
    shadow: 'shadow-violet-500/25'
  },
  { 
    id: 'rewrite', 
    icon: 'edit-3', 
    component: LiveRewriteDemo,
    iconColor: 'icon-emerald',
    bgActive: 'bg-emerald-500',
    bgHover: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
    textInactive: 'text-emerald-600 dark:text-emerald-400',
    borderActive: 'border-emerald-500',
    shadow: 'shadow-emerald-500/25'
  },
  { 
    id: 'compatibility', 
    icon: 'target', 
    component: LiveCompatibilityDemo,
    iconColor: 'icon-teal',
    bgActive: 'bg-teal-500',
    bgHover: 'hover:bg-teal-50 dark:hover:bg-teal-500/10',
    textInactive: 'text-teal-600 dark:text-teal-400',
    borderActive: 'border-teal-500',
    shadow: 'shadow-teal-500/25'
  },
  { 
    id: 'deviations', 
    icon: 'alert-triangle', 
    component: LiveDeviationsDemo,
    iconColor: 'icon-orange',
    bgActive: 'bg-orange-500',
    bgHover: 'hover:bg-orange-50 dark:hover:bg-orange-500/10',
    textInactive: 'text-orange-600 dark:text-orange-400',
    borderActive: 'border-orange-500',
    shadow: 'shadow-orange-500/25'
  },
  { 
    id: 'statistics', 
    icon: 'bar-chart-2', 
    component: LiveStatisticsDemo,
    iconColor: 'icon-indigo',
    bgActive: 'bg-indigo-500',
    bgHover: 'hover:bg-indigo-50 dark:hover:bg-indigo-500/10',
    textInactive: 'text-indigo-600 dark:text-indigo-400',
    borderActive: 'border-indigo-500',
    shadow: 'shadow-indigo-500/25'
  },
  { 
    id: 'workspace', 
    icon: 'message-square', 
    component: LiveWorkspaceDemo,
    iconColor: 'icon-cyan',
    bgActive: 'bg-cyan-500',
    bgHover: 'hover:bg-cyan-50 dark:hover:bg-cyan-500/10',
    textInactive: 'text-cyan-600 dark:text-cyan-400',
    borderActive: 'border-cyan-500',
    shadow: 'shadow-cyan-500/25'
  }
]

const ProductShowcaseSection = memo(() => {
  const { t } = useTranslation()
  const [activeFeature, setActiveFeature] = useState('ai-detection')
  const prefersReducedMotion = usePrefersReducedMotion()
  const [sectionRef, isVisible] = useAnimateOnScroll(0.05)
  
  const ActiveComponent = useMemo(() => 
    FEATURES.find(f => f.id === activeFeature)?.component,
    [activeFeature]
  )

  // Prefetch adjacent demos when section is visible
  useEffect(() => {
    if (!isVisible) return
    
    // Prefetch next 2 demos in idle time
    const currentIndex = FEATURES.findIndex(f => f.id === activeFeature)
    const nextFeatures = [
      FEATURES[(currentIndex + 1) % FEATURES.length]?.id,
      FEATURES[(currentIndex + 2) % FEATURES.length]?.id
    ].filter(Boolean)

    nextFeatures.forEach(featureId => {
      requestIdleCallback(() => {
        DEMO_IMPORTS[featureId]?.()
      }, { timeout: 3000 })
    })
  }, [activeFeature, isVisible])

  // Handle feature change with prefetch
  const handleFeatureChange = useCallback((featureId) => {
    setActiveFeature(featureId)
  }, [])

  return (
    <section 
      ref={sectionRef}
      id="showcase" 
      className="py-12 sm:py-16 lg:py-20 xl:py-28 bg-bg-secondary/50 relative overflow-hidden"
    >
      {/* Background - only animate when visible and motion allowed */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {isVisible && !prefersReducedMotion ? (
          <>
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
              transition={{ duration: 10, repeat: Infinity }} 
              className="absolute top-0 left-1/4 w-[300px] sm:w-[400px] lg:w-[500px] h-[300px] sm:h-[400px] lg:h-[500px] bg-primary/5 rounded-full blur-3xl" 
            />
            <motion.div 
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }} 
              transition={{ duration: 12, repeat: Infinity }} 
              className="absolute bottom-0 right-1/4 w-[250px] sm:w-[350px] lg:w-[400px] h-[250px] sm:h-[350px] lg:h-[400px] bg-purple-500/5 rounded-full blur-3xl" 
            />
          </>
        ) : (
          <>
            <div className="absolute top-0 left-1/4 w-[300px] sm:w-[400px] lg:w-[500px] h-[300px] sm:h-[400px] lg:h-[500px] bg-primary/5 rounded-full blur-3xl opacity-40" />
            <div className="absolute bottom-0 right-1/4 w-[250px] sm:w-[350px] lg:w-[400px] h-[250px] sm:h-[350px] lg:h-[400px] bg-purple-500/5 rounded-full blur-3xl opacity-30" />
          </>
        )}
        {/* SVG Background Pattern - lazy load */}
        {isVisible && (
          <img 
            src="/images/backgrounds/bg-wave-1.svg" 
            alt="" 
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover opacity-100"
          />
        )}
      </div>

      <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-10 lg:mb-12">
          <motion.span initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-primary text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 border border-gray-200 shadow-sm">
            <Icon name="play-circle" size="sm" className="icon-primary" />
            {t('showcase.badge', 'Interactive Demo')}
          </motion.span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-3 sm:mb-4">{t('showcase.title', 'Experience the Real Product')}</h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2 sm:px-0">{t('showcase.subtitle', 'Try our features right here. No sign-up required.')}</p>
        </motion.div>

        {/* Feature Tabs - Centered on all screens */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="mb-6 sm:mb-8 lg:mb-10"
        >
          <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 px-2 sm:px-0">
            {FEATURES.map((feature, index) => {
              const isActive = activeFeature === feature.id
              return (
                <motion.button
                  key={feature.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                  onClick={() => handleFeatureChange(feature.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                    isActive
                      ? `${feature.bgActive} text-white ${feature.borderActive} shadow-lg ${feature.shadow}`
                      : `bg-bg-primary ${feature.textInactive} border-gray-200 dark:border-gray-700 ${feature.bgHover}`
                  }`}
                >
                  <Icon 
                    name={feature.icon} 
                    size="sm" 
                    className={isActive ? 'icon-white' : feature.iconColor} 
                  />
                  <span className="hidden sm:inline">{t(`nav.${feature.id.replace(/-/g, '')}`, feature.id)}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Demo Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={
              <div className="flex items-center justify-center h-64 sm:h-80 lg:h-96">
                <LoadingSpinner size="md" />
              </div>
            }>
              {ActiveComponent && <ActiveComponent />}
            </Suspense>
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-8 sm:mt-10 lg:mt-12">
          <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-5">{t('showcase.ctaText', 'Ready to experience the full power?')}</p>
          <motion.a
            href="https://app.graphosai.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg shadow-xl shadow-primary/25 hover:shadow-2xl transition-all w-full sm:w-auto max-w-xs sm:max-w-none"
          >
            {t('cta.tryFree', 'Try Free Now')}
            <Icon name="arrow-right" size="md" className="icon-white" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
})

ProductShowcaseSection.displayName = 'ProductShowcaseSection'

export default ProductShowcaseSection



