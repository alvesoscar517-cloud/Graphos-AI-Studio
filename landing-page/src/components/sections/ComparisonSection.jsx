/**
 * ComparisonSection - Premium comparison table with visual hierarchy
 * Enhanced: Dec 2025 - Better visual design, animated rows, gradient highlights
 */
import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import Icon from '@components/common/Icon'

const COMPARISON_FEATURES = [
  {
    key: 'aiDetection',
    icon: 'scan',
    labelKey: 'comparison.features.aiDetection',
    defaultLabel: 'AI Content Detection',
    tooltipKey: 'comparison.tooltips.aiDetection',
    graphos: { value: true, noteKey: 'comparison.graphosNotes.accuracy98' },
    competitors: { value: 'partial', noteKey: 'comparison.competitorNotes.basicOnly' }
  },
  {
    key: 'humanization',
    icon: 'user-check',
    labelKey: 'comparison.features.humanization',
    defaultLabel: 'Content Humanization',
    tooltipKey: 'comparison.tooltips.humanization',
    graphos: { value: true, noteKey: 'comparison.graphosNotes.voiceMatched' },
    competitors: { value: 'partial', noteKey: 'comparison.competitorNotes.generic' }
  },
  {
    key: 'voiceProfile',
    icon: 'fingerprint',
    labelKey: 'comparison.features.voiceProfile',
    defaultLabel: 'Personal Voice Profile',
    tooltipKey: 'comparison.tooltips.voiceProfile',
    graphos: { value: true, noteKey: 'comparison.graphosNotes.aiAnalyzed' },
    competitors: { value: false }
  },
  {
    key: 'aiRewrite',
    icon: 'edit-3',
    labelKey: 'comparison.features.aiRewrite',
    defaultLabel: 'AI Rewrite in Your Voice',
    tooltipKey: 'comparison.tooltips.aiRewrite',
    graphos: { value: true, noteKey: 'comparison.graphosNotes.voiceMatched' },
    competitors: { value: 'partial', note: 'Generic' }
  },
  {
    key: 'compatibilityScore',
    icon: 'target',
    labelKey: 'comparison.features.compatibilityScore',
    defaultLabel: 'Style Compatibility Score',
    tooltipKey: 'comparison.tooltips.compatibilityScore',
    graphos: { value: true, noteKey: 'comparison.graphosNotes.detailedAnalysis' },
    competitors: { value: false }
  },
  {
    key: 'deviations',
    icon: 'alert-triangle',
    labelKey: 'comparison.features.deviations',
    defaultLabel: 'Style Deviation Detection',
    tooltipKey: 'comparison.tooltips.deviations',
    graphos: { value: true, noteKey: 'comparison.graphosNotes.sentenceLevel' },
    competitors: { value: false }
  },
  {
    key: 'statistics',
    icon: 'bar-chart-2',
    labelKey: 'comparison.features.statistics',
    defaultLabel: 'Writing Statistics',
    tooltipKey: 'comparison.tooltips.statistics',
    graphos: { value: true, noteKey: 'comparison.graphosNotes.comprehensive' },
    competitors: { value: 'partial', noteKey: 'comparison.competitorNotes.basicOnly' }
  },
  {
    key: 'realtimeAnalysis',
    icon: 'zap',
    labelKey: 'comparison.features.realtimeAnalysis',
    defaultLabel: 'Real-time Analysis',
    tooltipKey: 'comparison.tooltips.realtimeAnalysis',
    graphos: { value: true, noteKey: 'comparison.graphosNotes.instant' },
    competitors: { value: true, noteKey: 'comparison.competitorNotes.delayed' }
  },
  {
    key: 'multiLanguage',
    icon: 'globe',
    labelKey: 'comparison.features.multiLanguage',
    defaultLabel: 'Multi-language Support',
    tooltipKey: 'comparison.tooltips.multiLanguage',
    graphos: { value: true, noteKey: 'comparison.graphosNotes.languages15' },
    competitors: { value: 'partial', noteKey: 'comparison.competitorNotes.languages23' }
  },
  {
    key: 'chromeExtension',
    icon: 'chrome',
    labelKey: 'comparison.features.chromeExtension',
    defaultLabel: 'Chrome Extension',
    tooltipKey: 'comparison.tooltips.chromeExtension',
    graphos: { value: true, noteKey: 'comparison.graphosNotes.fullFeatures' },
    competitors: { value: 'partial', noteKey: 'comparison.competitorNotes.limited' }
  },
  {
    key: 'aiWorkspace',
    icon: 'message-square',
    labelKey: 'comparison.features.aiWorkspace',
    defaultLabel: 'AI Chat in Your Voice',
    tooltipKey: 'comparison.tooltips.aiWorkspace',
    graphos: { value: true, noteKey: 'comparison.graphosNotes.voiceMatched' },
    competitors: { value: false }
  },
  {
    key: 'payAsYouGo',
    icon: 'wallet',
    labelKey: 'comparison.features.payAsYouGo',
    defaultLabel: 'Pay-as-you-go Pricing',
    tooltipKey: 'comparison.tooltips.payAsYouGo',
    graphos: { value: true, noteKey: 'comparison.graphosNotes.noSubscription' },
    competitors: { value: false, noteKey: 'comparison.competitorNotes.monthlyOnly' }
  },
  {
    key: 'creditsExpire',
    icon: 'infinity',
    labelKey: 'comparison.features.creditsExpire',
    defaultLabel: 'Credits Never Expire',
    tooltipKey: 'comparison.tooltips.creditsExpire',
    graphos: { value: true, noteKey: 'comparison.graphosNotes.foreverYours' },
    competitors: { value: false, noteKey: 'comparison.competitorNotes.monthlyReset' }
  },
  {
    key: 'freeTier',
    icon: 'gift',
    labelKey: 'comparison.features.freeTier',
    defaultLabel: 'Free Tier',
    tooltipKey: 'comparison.tooltips.freeTier',
    graphos: { value: true, noteKey: 'comparison.graphosNotes.freeCredits100' },
    competitors: { value: 'partial', noteKey: 'comparison.competitorNotes.trialOnly' }
  }
]

// Animated counter hook
const useAnimatedCounter = (end, duration = 1500, startOnView = true) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!startOnView || !isInView) return
    
    let startTime
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [end, duration, isInView, startOnView])

  return { count, ref }
}

// Tooltip component
const Tooltip = ({ children, content }) => {
  const [show, setShow] = useState(false)
  
  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && content && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-xl max-w-xs text-center"
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </motion.div>
      )}
    </div>
  )
}

const FeatureValue = ({ value, noteKey, isGraphos, t }) => {
  const note = noteKey ? t(noteKey) : null;
  if (value === true) {
    return (
      <div className="flex flex-col items-center gap-1">
        <motion.div 
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          className={`w-7 h-7 rounded-full flex items-center justify-center ${
            isGraphos 
              ? 'bg-gradient-to-br from-primary to-primary-hover shadow-md shadow-primary/30' 
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <Icon name="check" size="sm" className={isGraphos ? 'icon-white' : 'text-gray-500'} />
        </motion.div>
        {note && (
          <span className={`text-xs font-medium ${isGraphos ? 'text-primary' : 'text-text-muted'}`}>
            {note}
          </span>
        )}
      </div>
    )
  }
  
  if (value === false) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <Icon name="x" size="sm" className="text-gray-400" />
        </div>
        {note && <span className="text-xs text-text-muted">{note}</span>}
      </div>
    )
  }
  
  // Partial
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
        <Icon name="minus" size="sm" className="text-gray-400" />
      </div>
      {note && <span className="text-xs text-text-muted">{note}</span>}
    </div>
  )
}



function ComparisonSection() {
  const { t } = useTranslation()

  // Count advantages
  const graphosWins = COMPARISON_FEATURES.filter(f => 
    f.graphos.value === true && (f.competitors.value === false || f.competitors.value === 'partial')
  ).length

  // Animated counter for advantages
  const { count: animatedWins, ref: counterRef } = useAnimatedCounter(graphosWins, 1200)

  return (
    <section className="pt-6 sm:pt-8 lg:pt-12 pb-12 sm:pb-16 lg:pb-20 xl:pb-28 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-48 sm:w-80 h-48 sm:h-80 bg-primary/5 rounded-full blur-3xl" />
        {/* SVG Background Pattern */}
        <img 
          src="/images/backgrounds/bg-wave-3.svg" 
          alt="" 
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-100"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
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
            <Icon name="trophy" size="sm" className="icon-primary" />
            {t('comparison.badge', 'Why Choose Us')}
          </motion.span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-3 sm:mb-4">
            {t('comparison.title', 'The Complete AI Writing Solution')}
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto mb-4 sm:mb-6 px-2 sm:px-0">
            {t('comparison.subtitle', 'See how Graphos AI Studio compares to other AI writing tools')}
          </p>
          
          {/* Animated win counter badge */}
          <motion.div
            ref={counterRef}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 bg-green-500/10 text-green-600 rounded-full border border-green-500/20"
          >
            <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4" fill="#22c55e" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span className="text-xs sm:text-sm font-bold">
              {t('comparison.winCount', '{{count}} advantages over competitors', { count: animatedWins })}
            </span>
          </motion.div>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-bg-primary rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl overflow-x-auto"
        >
          {/* Table Header */}
          <div className="grid grid-cols-3 bg-bg-secondary border-b border-gray-200 dark:border-gray-700 min-w-[500px] sm:min-w-0">
            <div className="p-2.5 sm:p-3 lg:p-4 text-xs sm:text-sm font-semibold text-text-secondary flex items-center gap-1.5 sm:gap-2">
              <Icon name="list" size="sm" className="text-text-muted hidden sm:block" />
              {t('comparison.feature', 'Feature')}
            </div>
            {/* Graphos column with highlight */}
            <div className="p-2.5 sm:p-3 lg:p-4 text-center border-l border-gray-200 dark:border-gray-700 bg-gradient-to-b from-primary/10 to-primary/5">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <img src="/logo.svg" alt="Graphos AI" className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 rounded-md sm:rounded-lg shadow-sm" />
                <span className="font-bold text-primary text-sm sm:text-base lg:text-lg">Graphos AI</span>
              </div>
              <span className="text-[10px] sm:text-xs text-primary/70 mt-0.5 block hidden sm:block">{t('comparison.ourSolution', 'Our Solution')}</span>
            </div>
            <div className="p-2.5 sm:p-3 lg:p-4 text-center border-l border-gray-200 dark:border-gray-700">
              <span className="text-text-secondary font-medium block text-xs sm:text-sm lg:text-base">
                {t('comparison.others', 'Other Tools')}
              </span>
              <span className="text-[10px] sm:text-xs text-text-muted mt-0.5 block hidden sm:block">{t('comparison.competitors', 'Competitors')}</span>
            </div>
          </div>

          {/* Table Body - Flat list without categories */}
          <div className="min-w-[500px] sm:min-w-0">
            {COMPARISON_FEATURES.map((feature, index) => (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.02 }}
                className={`grid grid-cols-3 group hover:bg-primary/5 transition-all duration-200 ${
                  index !== COMPARISON_FEATURES.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                }`}
              >
                <div className="py-2 sm:py-2.5 lg:py-3 px-2.5 sm:px-3 lg:px-4 flex items-center gap-2 sm:gap-3">
                  <Tooltip content={t(feature.tooltipKey)}>
                    <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-md sm:rounded-lg bg-bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                      <Icon name={feature.icon} size="sm" className="text-text-muted group-hover:text-primary transition-colors" />
                    </div>
                  </Tooltip>
                  <Tooltip content={t(feature.tooltipKey)}>
                    <span className="text-xs sm:text-sm font-medium text-text-primary group-hover:text-primary transition-colors cursor-help line-clamp-2">
                      {t(feature.labelKey, feature.defaultLabel)}
                    </span>
                  </Tooltip>
                </div>
                <div className="py-2 sm:py-2.5 lg:py-3 px-2 sm:px-3 lg:px-4 flex items-center justify-center border-l border-gray-100 dark:border-gray-800 bg-gradient-to-b from-primary/[0.03] to-transparent">
                  <FeatureValue 
                    value={feature.graphos.value} 
                    noteKey={feature.graphos.noteKey} t={t} 
                    isGraphos={true}
                  />
                </div>
                <div className="py-2 sm:py-2.5 lg:py-3 px-2 sm:px-3 lg:px-4 flex items-center justify-center border-l border-gray-100 dark:border-gray-800">
                  <FeatureValue 
                    value={feature.competitors.value} 
                    noteKey={feature.competitors.noteKey} t={t}
                    isGraphos={false}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 sm:mt-8 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:gap-6 px-4 sm:px-5 lg:px-6 py-3 sm:py-4 bg-bg-secondary/50 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5 sm:-space-x-2">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
                <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="User" className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
                <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="User" className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
              </div>
              <span className="text-xs sm:text-sm text-text-secondary">
                {t('comparison.socialProof.writersCount', '{{count}}+ writers trust us', { count: '10,000' })}
              </span>
            </div>
            <div className="hidden sm:block h-6 sm:h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-1 sm:gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs sm:text-sm font-semibold text-text-primary ml-1">4.9/5</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-10 lg:mt-12"
        >
          <p className="text-sm sm:text-base lg:text-lg text-text-secondary mb-4 sm:mb-5 lg:mb-6">
            {t('comparison.ctaText', 'Experience the difference yourself')}
          </p>
          <motion.a
            href="https://app.graphosai.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-xl font-semibold text-base sm:text-lg shadow-sm hover:shadow-lg hover:bg-primary-hover transition-all w-full sm:w-auto max-w-xs sm:max-w-none"
          >
            {t('cta.tryFree', 'Try Free Now')}
            <Icon name="arrow-right" size="md" className="icon-white" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default ComparisonSection



