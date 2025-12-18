/**
 * ChromeExtensionSection - Premium Chrome Extension showcase
 * Enhanced: Dec 2025 - Coming Soon design with improved layout
 */
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '@components/common/Icon'
import ThreeDotsLoading from '@components/common/ThreeDotsLoading'

// Get extension features with i18n support
const getExtensionFeatures = (t) => [
  {
    id: 'detect',
    icon: 'shield-check',
    titleKey: 'extension.features.detect.title',
    descKey: 'extension.features.detect.desc',
    defaultTitle: 'Instant AI Detection',
    defaultDesc: 'Select any text on the web and instantly check if it was AI-generated.',
    demo: { 
      action: t('extension.demo.detect.action', 'Detecting AI content...'), 
      result: t('extension.demo.detect.result', '87% AI Probability'), 
      icon: 'alert-triangle', 
      color: 'text-amber-500' 
    }
  },
  {
    id: 'humanize',
    icon: 'wand-sparkles',
    titleKey: 'extension.features.humanize.title',
    descKey: 'extension.features.humanize.desc',
    defaultTitle: 'One-Click Humanization',
    defaultDesc: 'Transform AI text into natural, human-sounding content instantly.',
    demo: { 
      action: t('extension.demo.humanize.action', 'Humanizing text...'), 
      result: t('extension.demo.humanize.result', 'Text humanized!'), 
      icon: 'check-circle', 
      color: 'text-green-500' 
    }
  },
  {
    id: 'write',
    icon: 'edit-3',
    titleKey: 'extension.features.write.title',
    descKey: 'extension.features.write.desc',
    defaultTitle: 'Write in Your Voice',
    defaultDesc: 'Generate content that matches your unique writing style anywhere.',
    demo: { 
      action: t('extension.demo.write.action', 'Generating in your voice...'), 
      result: t('extension.demo.write.result', 'Content ready!'), 
      icon: 'sparkles', 
      color: 'text-purple-500' 
    }
  },
  {
    id: 'workspace',
    icon: 'message-square',
    titleKey: 'extension.features.workspace.title',
    descKey: 'extension.features.workspace.desc',
    defaultTitle: 'AI Workspace',
    defaultDesc: 'Chat with AI in your unique voice, right from any webpage.',
    demo: { 
      action: t('extension.demo.workspace.action', 'Opening workspace...'), 
      result: t('extension.demo.workspace.result', 'Ready to chat!'), 
      icon: 'message-circle', 
      color: 'text-blue-500' 
    }
  }
]

const SUPPORTED_SITES = [
  { name: 'Gmail', icon: 'mail', color: 'text-red-500' },
  { name: 'Google Docs', icon: 'file-text', color: 'text-blue-500' },
  { name: 'LinkedIn', icon: 'linkedin', color: 'text-blue-600' },
  { name: 'Twitter/X', icon: 'twitter', color: 'text-sky-500' },
  { name: 'Medium', icon: 'book-open', color: 'text-gray-700' },
  { name: 'Notion', icon: 'layout', color: 'text-gray-800' }
]

function ChromeExtensionSection() {
  const { t, i18n } = useTranslation()
  const [activeFeature, setActiveFeature] = useState('detect')
  
  // Get i18n extension features - re-compute when language changes
  const EXTENSION_FEATURES = useMemo(() => getExtensionFeatures(t), [t, i18n.language])
  const [isAnimating, setIsAnimating] = useState(false)

  const handleFeatureClick = (featureId) => {
    if (featureId === activeFeature) return
    setIsAnimating(true)
    setActiveFeature(featureId)
    setTimeout(() => setIsAnimating(false), 1500)
  }

  const currentFeature = EXTENSION_FEATURES.find(f => f.id === activeFeature)

  return (
    <section className="pt-6 sm:pt-8 lg:pt-10 pb-12 sm:pb-16 lg:pb-20 xl:pb-28 bg-bg-secondary relative overflow-hidden">
      {/* Background - shared with FeaturesSection */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 sm:w-80 h-48 sm:h-80 bg-purple-500/5 rounded-full blur-3xl" />

      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10 lg:mb-12"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-bg-primary text-primary text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <Icon name="chrome" size="sm" className="icon-primary" />
            {t('extension.badge', 'Chrome Extension')}
          </motion.span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-3 sm:mb-4">
            {t('extension.title', 'Use Graphos AI Anywhere')}
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2 sm:px-0">
            {t('extension.subtitle', 'Our Chrome extension brings AI detection and humanization to every website you visit.')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 xl:gap-12 items-start">
          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-2 sm:space-y-3 flex flex-col"
          >
            {EXTENSION_FEATURES.map((feature, index) => (
              <motion.button
                key={feature.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 2 }}
                onClick={() => handleFeatureClick(feature.id)}
                className={`w-full text-left p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl border transition-all ${
                  activeFeature === feature.id
                    ? 'bg-bg-primary border-primary/25 shadow-md'
                    : 'bg-bg-primary border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-10 sm:w-11 lg:w-12 h-10 sm:h-11 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 transition-all border ${
                    activeFeature === feature.id 
                      ? 'bg-bg-primary border-gray-200 dark:border-gray-700 shadow-sm' 
                      : 'bg-bg-secondary border-transparent'
                  }`}>
                    <Icon name={feature.icon} size="md" className="icon-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className={`font-bold text-sm sm:text-base mb-0.5 sm:mb-1 transition-colors ${activeFeature === feature.id ? 'text-primary' : 'text-text-primary'}`}>
                      {t(feature.titleKey, feature.defaultTitle)}
                    </h4>
                    <p className="text-xs sm:text-sm text-text-secondary line-clamp-2">
                      {t(feature.descKey, feature.defaultDesc)}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}

            {/* Coming Soon CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pt-3 sm:pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-primary text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-sm cursor-default w-full sm:w-auto"
              >
                <Icon name="clock" size="md" className="icon-white" />
                {t('extension.comingSoonCta', 'Coming Soon')}
              </motion.div>
              <p className="text-[10px] sm:text-xs text-text-muted mt-2 sm:mt-3 text-center sm:text-left">
                * {t('extension.comingSoonNote', 'We\'re working hard to bring this to you')}
              </p>
            </motion.div>
          </motion.div>

          {/* Browser Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex flex-col justify-between"
          >
            {/* Browser Window */}
            <div className="bg-bg-primary rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
              {/* Browser Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-bg-secondary border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-bg-tertiary rounded-md px-4 py-2 text-sm text-text-muted flex items-center gap-2">
                    <Icon name="lock" size="sm" className="text-green-500" />
                    <span>example.com/article</span>
                  </div>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer overflow-hidden"
                >
                  <img src="/icons/content.svg" alt="Graphos" className="w-8 h-8 rounded-md" />
                </motion.div>
              </div>

              {/* Page Content */}
              <div className="p-6 relative bg-gradient-to-b from-bg-primary to-bg-secondary/30">
                {/* Simulated article */}
                <div className="space-y-3 mb-5">
                  <div className="h-5 bg-bg-secondary rounded w-2/3" />
                  <div className="h-3 bg-bg-secondary/70 rounded w-full" />
                  <div className="h-3 bg-bg-secondary/70 rounded w-5/6" />
                </div>

                {/* Selected text */}
                <motion.div 
                  animate={{ boxShadow: ['0 0 0 0 rgba(0,113,227,0)', '0 0 0 3px rgba(0,113,227,0.15)', '0 0 0 0 rgba(0,113,227,0)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-4 bg-primary/5 border border-primary/20 rounded-lg mb-5"
                >
                  <p className="text-base text-text-primary leading-relaxed">
                    "{t('extension.demo.sampleText', 'The implementation of artificial intelligence in modern systems represents a paradigm shift...')}"
                  </p>
                </motion.div>

                {/* Extension Popup - Horizontal layout */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="w-full bg-bg-primary rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-4"
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <img src="/icons/content.svg" alt="Graphos" className="w-6 h-6 rounded" />
                        <span className="text-base font-bold text-text-primary">Graphos AI</span>
                      </div>
                      <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                        {t('extension.preview', 'Preview')}
                      </span>
                    </div>

                    {/* Result and actions in horizontal layout */}
                    <div className="flex items-center gap-3">
                      {isAnimating ? (
                        <div className="flex-1 flex items-center gap-3 py-2.5 px-4 bg-bg-secondary rounded-lg">
                          <ThreeDotsLoading size="sm" />
                          <span className="text-sm sm:text-base text-text-secondary">{currentFeature?.demo.action}</span>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center gap-3 py-2.5 px-4 bg-bg-secondary rounded-lg">
                          <Icon name={currentFeature?.demo.icon} size="md" className={currentFeature?.demo.color} />
                          <span className="text-sm sm:text-base font-medium text-text-primary">{currentFeature?.demo.result}</span>
                        </div>
                      )}
                      <button className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-all whitespace-nowrap">
                        {t('extension.popup.apply', 'Apply')}
                      </button>
                      <button className="p-2.5 bg-bg-secondary text-text-secondary rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-bg-hover transition-all">
                        <Icon name="more-horizontal" size="md" />
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Supported Sites */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6 sm:mt-8 text-center"
            >
              <p className="text-[10px] sm:text-xs text-text-muted mb-3 sm:mb-4 font-medium">{t('extension.willWorkOn', 'Will work seamlessly on')}:</p>
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                {SUPPORTED_SITES.map(site => (
                  <motion.div 
                    key={site.name}
                    whileHover={{ scale: 1.02, y: -1 }}
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-bg-primary rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium text-text-secondary border border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm transition-all cursor-default"
                  >
                    <Icon name={site.icon} size="xs" className={site.color} />
                    <span className="hidden xs:inline sm:inline">{site.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ChromeExtensionSection



