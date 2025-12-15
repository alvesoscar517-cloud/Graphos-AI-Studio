/**
 * ProductShowcaseSection - Premium interactive demo showcase
 * Enhanced: Dec 2025 - Better tabs, gradient accents, smoother animations
 */
import { useState, Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '@components/common/Icon'
import LoadingSpinner from '@components/common/LoadingSpinner'

const LiveAIDetectionDemo = lazy(() => import('@components/demos/LiveAIDetectionDemo'))
const LiveHumanizationDemo = lazy(() => import('@components/demos/LiveHumanizationDemo'))
const LiveVoiceProfileDemo = lazy(() => import('@components/demos/LiveVoiceProfileDemo'))
const LiveWorkspaceDemo = lazy(() => import('@components/demos/LiveWorkspaceDemo'))

const FEATURES = [
  { id: 'ai-detection', icon: 'shield-check', component: LiveAIDetectionDemo },
  { id: 'humanization', icon: 'wand-sparkles', component: LiveHumanizationDemo },
  { id: 'voice-profile', icon: 'mic', component: LiveVoiceProfileDemo },
  { id: 'workspace', icon: 'message-square', component: LiveWorkspaceDemo }
]

const ProductShowcaseSection = () => {
  const { t } = useTranslation()
  const [activeFeature, setActiveFeature] = useState('ai-detection')
  const ActiveComponent = FEATURES.find(f => f.id === activeFeature)?.component

  return (
    <section id="showcase" className="py-20 lg:py-28 bg-bg-secondary/50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 12, repeat: Infinity }} className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-content-lg mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <motion.span initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary text-sm font-semibold rounded-full mb-4 border border-gray-200 shadow-sm">
            <Icon name="play-circle" size="sm" className="icon-primary" />
            {t('showcase.badge', 'Interactive Demo')}
          </motion.span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">{t('showcase.title', 'Experience the Real Product')}</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">{t('showcase.subtitle', 'Try our features right here. No sign-up required.')}</p>
        </motion.div>

        {/* Feature Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-wrap justify-center gap-3 mb-10">
          {FEATURES.map((feature, index) => (
            <motion.button
              key={feature.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFeature(feature.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeFeature === feature.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-bg-primary text-text-secondary hover:bg-bg-hover border border-gray-200'
              }`}
            >
              <Icon name={feature.icon} size="md" className={activeFeature === feature.id ? 'icon-white' : ''} />
              <span className="hidden sm:inline">{t(`nav.${feature.id.replace('-', '')}`, feature.id)}</span>
            </motion.button>
          ))}
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
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <LoadingSpinner />
                <span className="text-sm text-text-muted">Loading demo...</span>
              </div>
            }>
              {ActiveComponent && <ActiveComponent />}
            </Suspense>
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-12">
          <p className="text-text-secondary mb-5">{t('showcase.ctaText', 'Ready to experience the full power?')}</p>
          <motion.a
            href="https://app.graphosai.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-primary/25 hover:shadow-2xl transition-all"
          >
            {t('cta.tryFree', 'Try Free Now')}
            <Icon name="arrow-right" size="md" className="icon-white" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default ProductShowcaseSection
