/**
 * FeaturesSection - Premium features grid with hover effects and gradients
 * Enhanced: Dec 2025 - Better cards, animated icons, gradient backgrounds
 */
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import Icon from '@components/common/Icon'

const features = [
  {
    key: 'aiDetection',
    href: '/features/ai-detection',
    icon: 'shield-check',
    statsKey: 'features.stats.accuracy',
    defaultStats: '98% accuracy',
    creditCost: '~2-5 credits'
  },
  {
    key: 'humanization',
    href: '/features/humanization',
    icon: 'wand-sparkles',
    statsKey: 'features.stats.natural',
    defaultStats: 'Natural output',
    creditCost: '~2-8 credits'
  },
  {
    key: 'voiceProfile',
    href: '/features/voice-profile',
    icon: 'mic',
    statsKey: 'features.stats.unique',
    defaultStats: 'Your unique style',
    creditCost: '~8-25 credits'
  },
  {
    key: 'aiWorkspace',
    href: '/features/ai-workspace',
    icon: 'message-square',
    statsKey: 'features.stats.chat',
    defaultStats: 'Chat in your voice',
    creditCost: '~1-3 credits'
  },
]

const FeatureCard = ({ feature, index }) => {
  const { t } = useTranslation()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={feature.href}
        className="group block relative p-6 bg-bg-primary rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 transition-all overflow-hidden hover:shadow-lg"
      >
        {/* Gradient background on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Icon with unified style */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="relative w-14 h-14 rounded-xl bg-bg-primary flex items-center justify-center mb-5 border border-gray-200 dark:border-gray-700 shadow-sm group-hover:shadow-md transition-all"
        >
          <Icon name={feature.icon} size="xl" className="icon-primary" />
        </motion.div>

        {/* Content */}
        <h3 className="relative text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
          {t(`nav.${feature.key}`)}
        </h3>
        <p className="relative text-sm text-text-secondary mb-5 leading-relaxed">
          {t(`${feature.key}.description`)}
        </p>

        {/* Stats & Credits */}
        <div className="relative flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary bg-bg-secondary px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
              <Icon name="trending-up" size="xs" className="text-green-500" />
              {t(feature.statsKey, feature.defaultStats)}
            </span>
            {feature.creditCost && (
              <span className="text-[10px] text-text-muted px-3 flex items-center gap-1">
                <Icon name="coins" size="xs" className="text-amber-500" />
                {feature.creditCost}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all">
            {t('cta.learnMore', 'Learn more')}
            <Icon name="arrow-right" size="sm" className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

function FeaturesSection() {
  const { t } = useTranslation()

  return (
    <section id="features" className="pt-20 pb-10 lg:pt-28 lg:pb-14 relative overflow-hidden bg-bg-secondary">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-content-lg mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-bg-primary text-primary text-sm font-semibold rounded-full mb-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <Icon name="sparkles" size="sm" className="icon-primary" />
            {t('nav.features', 'Features')}
          </motion.span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            {t('home.features.title', 'Powerful Features')}
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            {t('home.features.subtitle', 'Everything you need to write authentic, human-like content with AI assistance.')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.key} feature={feature} index={index} />
          ))}
        </div>

        {/* Chrome Extension Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-14 p-6 lg:p-8 bg-bg-primary rounded-2xl border border-gray-200 dark:border-gray-700 relative overflow-hidden"
        >
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-14 h-14 bg-bg-primary rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <Icon name="chrome" size="xl" className="icon-primary" />
              </motion.div>
              <div>
                <h4 className="font-bold text-lg text-text-primary mb-1">
                  {t('features.extension.title', 'Chrome Extension Available')}
                </h4>
                <p className="text-sm text-text-secondary">
                  {t('features.extension.description', 'Use Graphos AI anywhere on the web with our free extension')}
                </p>
              </div>
            </div>
            <motion.a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-bg-primary text-text-primary rounded-xl font-semibold hover:bg-bg-hover border border-gray-200 dark:border-gray-700 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
            >
              <Icon name="download" size="sm" className="icon-primary" />
              {t('features.extension.cta', 'Install Extension')}
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturesSection
