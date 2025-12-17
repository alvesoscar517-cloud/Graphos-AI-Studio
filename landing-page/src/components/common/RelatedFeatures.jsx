/**
 * RelatedFeatures - Component hiển thị các features liên quan
 * Giúp tạo internal links tốt hơn cho SEO
 * Created: Dec 2025
 */
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import Icon from './Icon'

const ALL_FEATURES = [
  {
    key: 'aiDetection',
    href: '/features/ai-detection',
    icon: 'shield-check',
    gradient: 'from-blue-500 to-indigo-600',
    hoverTextColor: 'group-hover:text-blue-600'
  },
  {
    key: 'humanization',
    href: '/features/humanization',
    icon: 'wand-sparkles',
    gradient: 'from-amber-500 to-orange-600',
    hoverTextColor: 'group-hover:text-amber-600'
  },
  {
    key: 'voiceProfile',
    href: '/features/voice-profile',
    icon: 'mic',
    gradient: 'from-violet-500 to-purple-600',
    hoverTextColor: 'group-hover:text-violet-600'
  },
  {
    key: 'aiWorkspace',
    href: '/features/ai-workspace',
    icon: 'message-square',
    gradient: 'from-cyan-500 to-teal-600',
    hoverTextColor: 'group-hover:text-cyan-600'
  },
  {
    key: 'rewrite',
    href: '/features/rewrite',
    icon: 'edit-3',
    gradient: 'from-emerald-500 to-teal-600',
    hoverTextColor: 'group-hover:text-emerald-600'
  },
  {
    key: 'compatibilityScore',
    href: '/features/compatibility-score',
    icon: 'target',
    gradient: 'from-teal-500 to-cyan-600',
    hoverTextColor: 'group-hover:text-teal-600'
  },
  {
    key: 'deviations',
    href: '/features/deviations',
    icon: 'alert-triangle',
    gradient: 'from-orange-500 to-amber-600',
    hoverTextColor: 'group-hover:text-orange-600'
  },
  {
    key: 'statistics',
    href: '/features/statistics',
    icon: 'bar-chart-2',
    gradient: 'from-indigo-500 to-purple-600',
    hoverTextColor: 'group-hover:text-indigo-600'
  }
]

function RelatedFeatures({ currentFeature, maxItems = 4 }) {
  const { t } = useTranslation()
  
  // Lọc bỏ feature hiện tại và lấy các features liên quan
  const relatedFeatures = ALL_FEATURES
    .filter(f => f.key !== currentFeature)
    .slice(0, maxItems)

  return (
    <section className="pt-12 sm:pt-16 lg:pt-20 pb-0 bg-bg-secondary/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 sm:w-80 h-48 sm:h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
        {/* Header */}
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
            <Icon name="grid" size="sm" className="icon-primary" />
            {t('relatedFeatures.badge', 'Explore More')}
          </motion.span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
            {t('relatedFeatures.title', 'Related Features')}
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto">
            {t('relatedFeatures.subtitle', 'Discover more powerful tools to enhance your writing')}
          </p>
        </motion.div>

        {/* Features Grid - Equal spacing */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {relatedFeatures.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Link
                to={feature.href}
                className="group flex flex-col p-4 sm:p-5 lg:p-6 bg-bg-primary rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-lg transition-all h-full min-h-[180px] sm:min-h-[200px]"
              >
                {/* Icon */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 sm:mb-4 shadow-md flex-shrink-0`}
                >
                  <Icon name={feature.icon} size="md" className="icon-white" />
                </motion.div>

                {/* Content */}
                <h3 className={`text-sm sm:text-base lg:text-lg font-bold text-text-primary mb-1.5 sm:mb-2 ${feature.hoverTextColor} transition-colors line-clamp-1`}>
                  {t(`nav.${feature.key}`)}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 flex-grow">
                  {t(`${feature.key}.description`)}
                </p>

                {/* Learn more link */}
                <span className={`inline-flex items-center gap-1 text-xs sm:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all mt-3 ${feature.hoverTextColor.replace('group-hover:', '')}`}>
                  {t('cta.learnMore', 'Learn more')}
                  <Icon name="arrow-right" size="xs" className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Features Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-10 lg:mt-12 pb-12 sm:pb-16 lg:pb-20"
        >
          <Link
            to="/features"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-bg-primary text-text-primary rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base border border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md transition-all"
          >
            <Icon name="grid" size="sm" />
            {t('nav.viewAllFeatures', 'View All Features')}
            <Icon name="arrow-right" size="sm" className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default RelatedFeatures
