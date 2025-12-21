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
    key: 'rewrite',
    href: '/features/rewrite',
    icon: 'edit-3',
    statsKey: 'features.stats.transform',
    defaultStats: 'Transform text',
    creditCost: '~3-10 credits'
  },
  {
    key: 'compatibilityScore',
    href: '/features/compatibility-score',
    icon: 'target',
    statsKey: 'features.stats.match',
    defaultStats: 'Style matching',
    creditCost: '~1-3 credits'
  },
  {
    key: 'deviations',
    href: '/features/deviations',
    icon: 'alert-triangle',
    statsKey: 'features.stats.find',
    defaultStats: 'Find inconsistencies',
    creditCost: '~1-3 credits'
  },
  {
    key: 'statistics',
    href: '/features/statistics',
    icon: 'bar-chart-2',
    statsKey: 'features.stats.analyze',
    defaultStats: 'Writing metrics',
    creditCost: '~1-2 credits'
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
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link
        to={feature.href}
        className="group block relative p-4 sm:p-5 lg:p-6 bg-bg-primary rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 transition-all overflow-hidden hover:shadow-lg h-full"
      >
        {/* Gradient background on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Icon with unified style */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="relative w-11 sm:w-12 lg:w-14 h-11 sm:h-12 lg:h-14 rounded-lg sm:rounded-xl bg-bg-primary flex items-center justify-center mb-3 sm:mb-4 lg:mb-5 border border-gray-200 dark:border-gray-700 shadow-sm group-hover:shadow-md transition-all"
        >
          <Icon name={feature.icon} size="lg" className="icon-primary sm:!w-6 sm:!h-6" />
        </motion.div>

        {/* Content */}
        <h3 className="relative text-base sm:text-lg font-bold text-text-primary mb-1.5 sm:mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {t(`nav.${feature.key}`)}
        </h3>
        <p className="relative text-xs sm:text-sm text-text-secondary mb-3 sm:mb-4 lg:mb-5 leading-relaxed line-clamp-2 sm:line-clamp-3">
          {t(`${feature.key}.description`)}
        </p>

        {/* Stats & Credits */}
        <div className="relative flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1 sm:gap-1.5 min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold text-text-primary bg-bg-secondary px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg border border-gray-100 dark:border-gray-800 truncate">
              <Icon name="trending-up" size="xs" className="text-green-500 flex-shrink-0" />
              <span className="truncate">{t(feature.statsKey, feature.defaultStats)}</span>
            </span>
            {feature.creditCost && (
              <span className="text-[9px] sm:text-[10px] text-text-muted px-2 sm:px-3 flex items-center gap-1">
                <Icon name="coins" size="xs" className="text-amber-500" />
                {feature.creditCost}
              </span>
            )}
          </div>
          <span className="hidden sm:flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
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
    <section id="features" className="pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-10 lg:pb-14 relative overflow-hidden bg-bg-secondary">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 sm:w-80 h-48 sm:h-80 bg-purple-500/5 rounded-full blur-3xl" />
        {/* SVG Background Pattern */}
        <img 
          src="/images/backgrounds/bg-wave-6.svg" 
          alt="" 
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-100"
        />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-bg-primary text-primary text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <Icon name="sparkles" size="sm" className="icon-primary" />
            {t('nav.features', 'Features')}
          </motion.span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-3 sm:mb-4">
            {t('home.features.title', 'Powerful Features')}
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2 sm:px-0">
            {t('home.features.subtitle', 'Everything you need to write authentic, human-like content with AI assistance.')}
          </p>
        </motion.div>

        {/* Features Grid - 8 features in 2 rows */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
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
          className="mt-8 sm:mt-10 lg:mt-14 p-4 sm:p-6 lg:p-8 bg-bg-primary rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 relative overflow-hidden"
        >
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-5 text-center sm:text-left">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-12 sm:w-14 h-12 sm:h-14 bg-bg-primary rounded-lg sm:rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0"
              >
                <Icon name="chrome" size="lg" className="icon-primary sm:!w-6 sm:!h-6" />
              </motion.div>
              <div>
                <h4 className="font-bold text-base sm:text-lg text-text-primary mb-0.5 sm:mb-1">
                  {t('features.extension.title', 'Chrome Extension Available')}
                </h4>
                <p className="text-xs sm:text-sm text-text-secondary">
                  {t('features.extension.description', 'Use Graphos AI anywhere on the web with our free extension')}
                </p>
              </div>
            </div>
            <motion.a
              href="https://chromewebstore.google.com/detail/nedkeccobejcenjdkegndfejblbjplol"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-bg-primary text-text-primary rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:bg-bg-hover border border-gray-200 dark:border-gray-700 hover:border-gray-300 transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
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



