/**
 * Features - SEO-optimized Features hub page
 * Design: Modern grid layout with feature cards and visual hierarchy
 * Enhanced: Dec 2025 - Full SEO optimization
 */
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageSEO from '@components/seo/PageSEO'
import Breadcrumb from '@components/common/Breadcrumb'
import Icon from '@components/common/Icon'

// ============================================================================
// HERO BACKGROUND - Features Grid Theme
// ============================================================================

const FeaturesHeroBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-10">
    {/* Base gradient */}
    <div className="absolute inset-0 bg-gradient-to-b from-violet-50/70 via-indigo-50/30 to-white dark:from-slate-950 dark:via-violet-950/20 dark:to-slate-900" />
    
    {/* SVG Grid Pattern */}
    <svg 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] md:w-[1000px] lg:w-[1200px] h-[500px] sm:h-[650px] md:h-[800px] lg:h-[900px] opacity-100"
      viewBox="0 0 1200 900"
      fill="none"
    >
      <defs>
        <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
          <stop offset="50%" stopColor="rgba(99, 102, 241, 0.2)" />
          <stop offset="100%" stopColor="rgba(139, 92, 246, 0.3)" />
        </linearGradient>
        <radialGradient id="centerGridGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(139, 92, 246, 0.15)" />
          <stop offset="50%" stopColor="rgba(99, 102, 241, 0.08)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      
      {/* Grid lines - horizontal */}
      {[150, 250, 350, 450, 550, 650, 750].map((y, i) => (
        <line key={`h-${i}`} x1="100" y1={y} x2="1100" y2={y} stroke="rgba(139, 92, 246, 0.1)" strokeWidth="1" />
      ))}
      
      {/* Grid lines - vertical */}
      {[200, 350, 500, 650, 800, 950].map((x, i) => (
        <line key={`v-${i}`} x1={x} y1="100" x2={x} y2="800" stroke="rgba(139, 92, 246, 0.1)" strokeWidth="1" />
      ))}
      
      {/* Feature nodes */}
      {[
        [350, 250], [650, 250], [950, 250],
        [200, 450], [500, 450], [800, 450], [1000, 450],
        [350, 650], [650, 650]
      ].map(([x, y], i) => (
        <g key={`node-${i}`}>
          <rect x={x - 40} y={y - 30} width="80" height="60" rx="12" fill="rgba(139, 92, 246, 0.08)" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="1" />
          <circle cx={x} cy={y} r="8" fill="rgba(139, 92, 246, 0.3)" />
          <circle cx={x} cy={y} r="4" fill="rgba(139, 92, 246, 0.6)" />
        </g>
      ))}
      
      {/* Connection lines */}
      <g stroke="url(#gridGradient)" strokeWidth="1.5" opacity="0.4">
        <path d="M350 280 Q400 350 350 420" fill="none" />
        <path d="M650 280 Q600 350 500 420" fill="none" />
        <path d="M650 280 Q700 350 800 420" fill="none" />
        <path d="M350 480 Q400 550 350 620" fill="none" />
        <path d="M800 480 Q750 550 650 620" fill="none" />
      </g>
      
      {/* Center glow */}
      <ellipse cx="600" cy="450" rx="300" ry="250" fill="url(#centerGridGlow)" />
    </svg>
    
    {/* Ambient glow */}
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[500px] md:w-[600px] lg:w-[700px] h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }}
    />
    
    {/* Edge fade */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-slate-900" />
    <div 
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(ellipse 85% 75% at 50% 50%, transparent 0%, var(--color-bg-primary) 100%)',
      }}
    />
  </div>
)

// ============================================================================
// FEATURE DATA
// ============================================================================

const featuresData = [
  {
    key: 'aiDetection',
    href: '/features/ai-detection',
    icon: 'shield-check',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    hoverTextColor: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    stats: '98% accuracy',
    creditCost: '~2-5 credits'
  },
  {
    key: 'humanization',
    href: '/features/humanization',
    icon: 'wand-sparkles',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    hoverTextColor: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    stats: 'Natural output',
    creditCost: '~2-8 credits'
  },
  {
    key: 'voiceProfile',
    href: '/features/voice-profile',
    icon: 'mic',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    hoverTextColor: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    stats: 'Your unique style',
    creditCost: '~8-25 credits'
  },
  {
    key: 'aiWorkspace',
    href: '/features/ai-workspace',
    icon: 'message-square',
    color: 'cyan',
    gradient: 'from-cyan-500 to-teal-600',
    hoverTextColor: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
    stats: 'Chat in your voice',
    creditCost: '~1-3 credits'
  },
  {
    key: 'rewrite',
    href: '/features/rewrite',
    icon: 'edit-3',
    color: 'orange',
    gradient: 'from-orange-500 to-amber-600',
    hoverTextColor: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
    stats: 'Transform text',
    creditCost: '~3-10 credits'
  },
  {
    key: 'compatibilityScore',
    href: '/features/compatibility-score',
    icon: 'target',
    color: 'rose',
    gradient: 'from-rose-500 to-red-600',
    hoverTextColor: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
    stats: 'Style matching',
    creditCost: '~1-3 credits'
  },
  {
    key: 'deviations',
    href: '/features/deviations',
    icon: 'alert-triangle',
    color: 'amber',
    gradient: 'from-amber-500 to-yellow-600',
    hoverTextColor: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    stats: 'Find inconsistencies',
    creditCost: '~1-3 credits'
  },
  {
    key: 'statistics',
    href: '/features/statistics',
    icon: 'bar-chart-2',
    color: 'sky',
    gradient: 'from-sky-500 to-blue-600',
    hoverTextColor: 'group-hover:text-sky-600 dark:group-hover:text-sky-400',
    stats: 'Writing metrics',
    creditCost: '~1-2 credits'
  },
]

// ============================================================================
// FEATURE CARD COMPONENT
// ============================================================================

const FeatureCard = ({ feature, index }) => {
  const { t } = useTranslation()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link
        to={feature.href}
        className="group block relative h-full"
      >
        <div className="relative p-5 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 overflow-hidden h-full hover:shadow-xl hover:-translate-y-1">
          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
          
          {/* Icon */}
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`
              relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl 
              bg-gradient-to-br ${feature.gradient} 
              flex items-center justify-center mb-4 sm:mb-5 
              shadow-lg group-hover:shadow-xl transition-shadow
            `}
          >
            <Icon name={feature.icon} size="lg" className="icon-white sm:!w-6 sm:!h-6 lg:!w-7 lg:!h-7" />
          </motion.div>

          {/* Content */}
          <h3 className={`relative text-lg sm:text-xl lg:text-2xl font-bold text-text-primary mb-2 sm:mb-3 transition-colors ${feature.hoverTextColor}`}>
            {t(`nav.${feature.key}`)}
          </h3>
          <p className="relative text-sm sm:text-base text-text-secondary mb-4 sm:mb-5 leading-relaxed line-clamp-3">
            {t(`${feature.key}.description`)}
          </p>

          {/* Stats & Credits */}
          <div className="relative flex items-center justify-between gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col gap-1.5">
              <span className={`
                inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold 
                bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent
              `}>
                <Icon name="trending-up" size="xs" className="text-green-500" />
                {feature.stats}
              </span>
              <span className="text-[10px] sm:text-xs text-text-muted flex items-center gap-1">
                <Icon name="coins" size="xs" className="text-amber-500" />
                {feature.creditCost}
              </span>
            </div>
            <motion.span 
              className={`
                flex items-center gap-1 text-sm font-semibold 
                bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent
                opacity-0 group-hover:opacity-100 transition-all
              `}
              whileHover={{ x: 3 }}
            >
              {t('cta.learnMore', 'Learn more')}
              <Icon name="arrow-right" size="sm" className="group-hover:translate-x-1 transition-transform" />
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ============================================================================
// MAIN FEATURES PAGE
// ============================================================================

function Features() {
  const { t } = useTranslation()

  return (
    <>
      <PageSEO pageKey="features" />

      <div className="relative">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] sm:min-h-[65vh] lg:min-h-[70vh] flex items-center justify-center overflow-hidden pt-16 sm:pt-12 md:pt-8 pb-8 sm:pb-10 md:pb-12">
          <FeaturesHeroBackground />
          
          {/* Breadcrumb */}
          <div className="absolute top-4 sm:top-5 md:top-6 left-0 right-0 z-20">
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Breadcrumb
                  items={[
                    { label: t('nav.home'), href: '/' },
                    { label: t('nav.features') },
                  ]}
                />
              </motion.div>
            </div>
          </div>
          
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 text-center relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="mb-5 sm:mb-6 md:mb-8"
            >
              <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-violet-500/10 via-indigo-500/15 to-purple-500/10 text-violet-600 dark:text-violet-400 text-xs sm:text-sm font-semibold rounded-full border border-violet-500/20 shadow-lg shadow-violet-500/10">
                <Icon name="sparkles" size="sm" className="icon-violet" />
                {t('featuresPage.badge', '8 Powerful Tools')}
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-text-primary mb-4 sm:mb-5 md:mb-6 leading-[1.1] tracking-tight"
            >
              {t('featuresPage.title', 'All Features')}
            </motion.h1>
            
            {/* Subtitle with gradient */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-5 sm:mb-6 md:mb-8"
            >
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {t('featuresPage.subtitle', 'Everything You Need to Write Better')}
              </span>
            </motion.p>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-text-secondary mb-6 sm:mb-8 leading-relaxed max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto px-2"
            >
              {t('featuresPage.description', 'From AI detection to content humanization, voice profiling to smart rewriting — discover the complete toolkit for authentic, human-like writing.')}
            </motion.p>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6"
            >
              {[
                { icon: 'layers', text: t('featuresPage.stats.features', '8 Features') },
                { icon: 'globe', text: t('featuresPage.stats.languages', '15+ Languages') },
                { icon: 'chrome', text: t('featuresPage.stats.extension', 'Chrome Extension') },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <Icon name={item.icon} size="sm" className="text-violet-500" />
                  <span className="text-sm font-medium text-text-primary">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Grid Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden bg-bg-secondary">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-violet-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 sm:w-80 h-48 sm:h-80 bg-indigo-500/5 rounded-full blur-3xl" />
          </div>

          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-14"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 text-sm font-semibold rounded-full mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <Icon name="grid" size="sm" />
                {t('featuresPage.gridBadge', 'Explore Features')}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
                {t('featuresPage.gridTitle', 'Choose Your Tool')}
              </h2>
              <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto">
                {t('featuresPage.gridSubtitle', 'Click on any feature to learn more and try it out')}
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {featuresData.map((feature, index) => (
                <FeatureCard key={feature.key} feature={feature} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pt-0 pb-12 sm:pb-16 lg:pb-20 xl:pb-28 bg-bg-secondary/50 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] lg:w-[900px] h-[500px] sm:h-[700px] lg:h-[900px] bg-violet-500/5 rounded-full blur-3xl" 
            />
          </div>

          <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl sm:rounded-3xl lg:rounded-[2rem] overflow-hidden"
            >
              {/* Solid Background - Violet gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700" />
              
              {/* Wave SVG at bottom */}
              <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                  <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgba(255,255,255,0.1)"/>
                  <path d="M0 120L60 115C120 110 240 100 360 95C480 90 600 90 720 92C840 94 960 98 1080 100C1200 102 1320 102 1380 102L1440 102V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgba(255,255,255,0.15)"/>
                </svg>
              </div>
              
              {/* Wave SVG at top */}
              <div className="absolute top-0 left-0 right-0 rotate-180">
                <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                  <path d="M0 80L48 74.7C96 69 192 59 288 53.3C384 48 480 48 576 53.3C672 59 768 69 864 69.3C960 69 1056 59 1152 53.3C1248 48 1344 48 1392 48L1440 48V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" fill="rgba(255,255,255,0.08)"/>
                </svg>
              </div>

              <div className="relative p-6 sm:p-8 md:p-10 lg:p-14 xl:p-20 text-center">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm rounded-full mb-5 sm:mb-6 lg:mb-8 border border-white/[0.15]"
                >
                  <motion.span 
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white rounded-full"
                  />
                  <span className="text-white/90 text-xs sm:text-sm font-semibold">
                    {t('cta.badge', 'Start for free today')}
                  </span>
                  <Icon name="sparkles" size="sm" className="icon-white opacity-80 hidden sm:block" />
                </motion.div>

                {/* Headline */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-5 lg:mb-6 leading-tight px-2 sm:px-0"
                >
                  {t('featuresPage.cta.title', 'Ready to Get Started?')}
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 lg:mb-10 max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-2 sm:px-0"
                >
                  {t('featuresPage.cta.description', 'Join thousands of writers who use Graphos AI Studio to create authentic content.')}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 lg:mb-10 px-4 sm:px-0"
                >
                  <motion.a
                    href="https://app.graphosai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-violet-600 rounded-xl font-bold text-base sm:text-lg shadow-sm hover:shadow-lg transition-all w-full sm:w-auto"
                  >
                    <span>{t('cta.getStartedFree', 'Get Started Free')}</span>
                    <Icon name="arrow-right" size="md" className="text-violet-600 group-hover:translate-x-0.5 transition-transform" />
                  </motion.a>
                  <motion.a
                    href="https://chrome.google.com/webstore"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold text-base sm:text-lg border border-white/[0.15] hover:bg-white/15 hover:border-white/[0.25] transition-all w-full sm:w-auto"
                  >
                    <Icon name="chrome" size="md" className="icon-white" />
                    {t('cta.installExtension', 'Install Extension')}
                  </motion.a>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-2 sm:gap-y-3 text-xs sm:text-sm text-white/70"
                >
                  {[
                    { icon: 'gift', text: t('cta.trust.free', 'Free forever plan') },
                    { icon: 'credit-card', text: t('cta.trust.noCard', 'No credit card') },
                    { icon: 'clock', text: t('cta.trust.setup', '2-minute setup') }
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="flex items-center gap-1.5 sm:gap-2"
                    >
                      <Icon name={item.icon} size="sm" className="icon-white opacity-80" />
                      <span>{item.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Wave divider to Footer */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
            <svg 
              viewBox="0 0 1440 80" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto block"
              preserveAspectRatio="none"
            >
              <path 
                d="M0 40C240 70 480 10 720 40C960 70 1200 10 1440 40V80H0V40Z" 
                className="fill-slate-100"
              />
              <path 
                d="M0 50C240 75 480 25 720 50C960 75 1200 25 1440 50V80H0V50Z" 
                className="fill-slate-200"
              />
            </svg>
          </div>
        </section>
      </div>
    </>
  )
}

export default Features
