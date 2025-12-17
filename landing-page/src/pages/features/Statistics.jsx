/**
 * Statistics - SEO-optimized Text Statistics feature page
 * Design: Data/Analytics Theme - "Understand Your Writing DNA"
 * Enhanced: Dec 2025 - Full SEO optimization
 */
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, lazy, Suspense, useEffect, useRef } from 'react'
import PageSEO from '@components/seo/PageSEO'
import Breadcrumb from '@components/common/Breadcrumb'
import Icon from '@components/common/Icon'
import RelatedFeatures from '@components/common/RelatedFeatures'
import ThreeDotsLoading from '@components/common/ThreeDotsLoading'
import FAQAccordion from '@components/common/FAQAccordion'

// Lazy load components
const PricingSection = lazy(() => import('@components/sections/PricingSection'))
const LiveStatisticsDemo = lazy(() => import('@components/demos/LiveStatisticsDemo'))

// ============================================================================
// HERO BACKGROUND - Data/Analytics Theme
// ============================================================================

const DataAnalyticsBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-10">
    {/* Base gradient - Indigo/Purple tones for data intelligence */}
    <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/70 via-purple-50/30 to-white dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-900" />
    
    {/* SVG Data Visualization - Responsive sizing */}
    <svg 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] md:w-[900px] lg:w-[1100px] h-[400px] sm:h-[560px] md:h-[720px] lg:h-[900px] opacity-100"
      viewBox="0 0 1100 900"
      fill="none"
    >
      <defs>
        {/* Data gradient */}
        <linearGradient id="dataGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(99, 102, 241, 0.3)" />
          <stop offset="50%" stopColor="rgba(139, 92, 246, 0.4)" />
          <stop offset="100%" stopColor="rgba(99, 102, 241, 0.3)" />
        </linearGradient>
        
        {/* Center glow */}
        <radialGradient id="centerDataGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(99, 102, 241, 0.2)" />
          <stop offset="50%" stopColor="rgba(139, 92, 246, 0.1)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        
        {/* Bar chart gradient */}
        <linearGradient id="barGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
          <stop offset="100%" stopColor="rgba(139, 92, 246, 0.8)" />
        </linearGradient>
      </defs>
      
      {/* Left side - Text document representation */}
      <g opacity="0.5">
        {[200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600].map((y, i) => (
          <line 
            key={`text-${i}`}
            x1="80" 
            y1={y} 
            x2={160 + Math.random() * 120} 
            y2={y} 
            stroke="rgba(148, 163, 184, 0.3)" 
            strokeWidth="5"
            strokeLinecap="round"
          />
        ))}
        <rect x="60" y="180" width="240" height="460" rx="8" fill="none" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="2" strokeDasharray="8 4" />
        <text x="180" y="170" textAnchor="middle" fill="rgba(148, 163, 184, 0.4)" fontSize="12" fontWeight="500">YOUR TEXT</text>
      </g>
      
      {/* Center - Analytics zone */}
      <ellipse cx="550" cy="450" rx="200" ry="240" fill="url(#centerDataGlow)" />
      
      {/* Bar chart visualization */}
      <g transform="translate(450, 300)">
        {/* Chart background */}
        <rect x="0" y="0" width="200" height="200" rx="8" fill="rgba(99, 102, 241, 0.05)" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1" />
        
        {/* Grid lines */}
        {[50, 100, 150].map((y, i) => (
          <line key={`grid-${i}`} x1="20" y1={y} x2="180" y2={y} stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1" strokeDasharray="4 2" />
        ))}
        
        {/* Bars */}
        {[
          { x: 30, h: 120, label: 'Words' },
          { x: 65, h: 80, label: 'Sent.' },
          { x: 100, h: 140, label: 'Vocab' },
          { x: 135, h: 60, label: 'Read.' },
          { x: 170, h: 100, label: 'Para.' }
        ].map((bar, i) => (
          <g key={`bar-${i}`}>
            <rect 
              x={bar.x - 12} 
              y={180 - bar.h} 
              width="24" 
              height={bar.h} 
              rx="4" 
              fill="url(#barGradient)"
            />
          </g>
        ))}
        
        {/* X-axis */}
        <line x1="20" y1="180" x2="180" y2="180" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="2" />
      </g>
      
      {/* Right side - Metrics cards */}
      <g opacity="0.6">
        {/* Metric cards */}
        {[
          { y: 280, value: '4.8', label: 'Avg Word Length' },
          { y: 360, value: '15.2', label: 'Avg Sentence' },
          { y: 440, value: '68%', label: 'Readability' },
          { y: 520, value: '0.55', label: 'Vocabulary' }
        ].map((metric, i) => (
          <g key={`metric-${i}`}>
            <rect x="780" y={metric.y} width="160" height="60" rx="8" fill="rgba(99, 102, 241, 0.08)" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="1" />
            <text x="860" y={metric.y + 28} textAnchor="middle" fill="rgba(99, 102, 241, 0.7)" fontSize="18" fontWeight="700">{metric.value}</text>
            <text x="860" y={metric.y + 46} textAnchor="middle" fill="rgba(99, 102, 241, 0.4)" fontSize="10">{metric.label}</text>
          </g>
        ))}
        <text x="860" y="260" textAnchor="middle" fill="rgba(99, 102, 241, 0.4)" fontSize="12" fontWeight="500">STATISTICS</text>
      </g>
      
      {/* Connection lines - data flow */}
      <g>
        <path 
          d="M300 350 Q380 380 430 400" 
          stroke="url(#dataGradient)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 4"
        />
        <path 
          d="M300 450 Q380 450 430 450" 
          stroke="url(#dataGradient)" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M300 550 Q380 520 430 500" 
          stroke="url(#dataGradient)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 4"
        />
        
        <path 
          d="M670 380 Q720 340 780 320" 
          stroke="url(#dataGradient)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 4"
        />
        <path 
          d="M670 450 Q720 450 780 450" 
          stroke="url(#dataGradient)" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M670 520 Q720 540 780 550" 
          stroke="url(#dataGradient)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 4"
        />
      </g>
      
      {/* Data particles */}
      {[
        [380, 380, 4], [420, 420, 3], [500, 480, 4], [580, 420, 3],
        [620, 480, 4], [440, 520, 3], [520, 380, 3], [600, 520, 4],
        [360, 450, 3], [640, 400, 4]
      ].map(([x, y, r], i) => (
        <g key={`particle-${i}`}>
          <circle cx={x} cy={y} r={r + 4} fill="rgba(99, 102, 241, 0.1)" />
          <circle cx={x} cy={y} r={r} fill="rgba(99, 102, 241, 0.5)" />
        </g>
      ))}
    </svg>
    
    {/* Ambient glow - indigo - Responsive */}
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[450px] md:w-[550px] lg:w-[700px] h-[300px] sm:h-[450px] md:h-[550px] lg:h-[700px] pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }}
    />
    
    {/* Edge fade */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-slate-900" />
    
    {/* Radial fade for edges */}
    <div 
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(ellipse 85% 75% at 50% 50%, transparent 0%, var(--color-bg-primary) 100%)',
      }}
    />
  </div>
)

// ============================================================================
// ANIMATED COUNTER HOOK
// ============================================================================

const useAnimatedCounter = (end, duration = 2000, startOnView = true, decimals = 0) => {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true)
    }
  }, [startOnView])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    let startTime
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const value = easeOutQuart * end
      setCount(decimals > 0 ? parseFloat(value.toFixed(decimals)) : Math.floor(value))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, hasStarted, decimals])

  return { count, ref }
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

const StatCard = ({ value, label, suffix = '' }) => {
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0
  const hasDecimals = value.includes('.')
  const { count, ref } = useAnimatedCounter(numericValue, 1500, true, hasDecimals ? 1 : 0)
  
  const displayValue = value.includes('+') 
    ? `${count}+` 
    : value.includes('%') 
    ? `${count}%`
    : value.includes('x')
    ? `${count}x`
    : value.includes('<')
    ? `<${count}s`
    : `${count}${suffix}`

  return (
    <motion.div
      ref={ref}
      className="relative group"
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="relative px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/50 dark:border-white/10 shadow-lg shadow-black/5">
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
        
        <div className="text-center">
          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {displayValue}
          </div>
          <div className="text-xs sm:text-sm text-text-muted mt-0.5 sm:mt-1 font-medium whitespace-nowrap">{label}</div>
        </div>
      </div>
    </motion.div>
  )
}


// ============================================================================
// METRICS SHOWCASE SECTION
// ============================================================================

const MetricsShowcaseSection = ({ t }) => {
  const [activeMetric, setActiveMetric] = useState(0)
  
  const metrics = [
    { 
      id: 'wordLength',
      icon: 'type',
      title: t('features.statistics.metrics.wordLength.title', 'Average Word Length'),
      value: '4.8',
      unit: t('features.statistics.metrics.wordLength.unit', 'characters'),
      description: t('features.statistics.metrics.wordLength.desc', 'Measures vocabulary complexity. Shorter words = easier reading, longer words = more sophisticated.'),
      benchmark: { min: 4.0, max: 5.5, ideal: 4.8 },
      color: 'indigo'
    },
    { 
      id: 'sentenceLength',
      icon: 'align-left',
      title: t('features.statistics.metrics.sentenceLength.title', 'Average Sentence Length'),
      value: '15.2',
      unit: t('features.statistics.metrics.sentenceLength.unit', 'words'),
      description: t('features.statistics.metrics.sentenceLength.desc', 'Indicates readability and flow. Shorter sentences = punchy, longer = complex ideas.'),
      benchmark: { min: 12, max: 20, ideal: 15 },
      color: 'purple'
    },
    { 
      id: 'readability',
      icon: 'book-open',
      title: t('features.statistics.metrics.readability.title', 'Readability Score'),
      value: '68',
      unit: t('features.statistics.metrics.readability.unit', 'points'),
      description: t('features.statistics.metrics.readability.desc', 'Flesch-Kincaid score. Higher = easier to read. 60-70 is ideal for general audience.'),
      benchmark: { min: 60, max: 80, ideal: 70 },
      color: 'violet'
    },
    { 
      id: 'vocabulary',
      icon: 'book',
      title: t('features.statistics.metrics.vocabulary.title', 'Vocabulary Richness'),
      value: '0.55',
      unit: t('features.statistics.metrics.vocabulary.unit', 'ratio'),
      description: t('features.statistics.metrics.vocabulary.desc', 'Unique words / total words. Higher = more varied vocabulary, lower = more repetition.'),
      benchmark: { min: 0.4, max: 0.7, ideal: 0.55 },
      color: 'fuchsia'
    },
    { 
      id: 'punctuation',
      icon: 'edit-2',
      title: t('features.statistics.metrics.punctuation.title', 'Punctuation Ratio'),
      value: '0.10',
      unit: t('features.statistics.metrics.punctuation.unit', 'per word'),
      description: t('features.statistics.metrics.punctuation.desc', 'Punctuation marks per word. Affects rhythm and pacing of your writing.'),
      benchmark: { min: 0.05, max: 0.15, ideal: 0.1 },
      color: 'pink'
    }
  ]
  
  const currentMetric = metrics[activeMetric]
  
  const colorClasses = {
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-500', light: 'bg-indigo-100 dark:bg-indigo-500/20', gradient: 'from-indigo-500 to-indigo-600' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-500', light: 'bg-purple-100 dark:bg-purple-500/20', gradient: 'from-purple-500 to-purple-600' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-500', light: 'bg-violet-100 dark:bg-violet-500/20', gradient: 'from-violet-500 to-violet-600' },
    fuchsia: { bg: 'bg-fuchsia-500', text: 'text-fuchsia-500', light: 'bg-fuchsia-100 dark:bg-fuchsia-500/20', gradient: 'from-fuchsia-500 to-fuchsia-600' },
    pink: { bg: 'bg-pink-500', text: 'text-pink-500', light: 'bg-pink-100 dark:bg-pink-500/20', gradient: 'from-pink-500 to-pink-600' }
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
      <div className="absolute top-1/4 right-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-40 sm:w-56 md:w-72 lg:w-80 h-40 sm:h-56 md:h-72 lg:h-80 bg-purple-500/5 rounded-full blur-3xl" />
      {/* SVG Background Pattern */}
      <img 
        src="/images/backgrounds/bg-wave-5.svg" 
        alt="" 
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-100"
      />
      
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 shadow-lg shadow-indigo-500/20"
          >
            <Icon name="bar-chart-2" size="sm" className="icon-white" />
            {t('features.statistics.metrics.badge', 'Key Metrics')}
          </motion.span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
            {t('features.statistics.metrics.title', 'Deep Writing Analysis')}
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
            {t('features.statistics.metrics.subtitle', 'Understand every aspect of your writing with comprehensive metrics')}
          </p>
        </div>
        
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-700/50 p-4 sm:p-6 md:p-8">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            {/* Interactive Metric Display */}
            <div className="relative">
              {/* Metric Value Circle - Responsive */}
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 mx-auto mb-4 sm:mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-slate-700" />
                  <motion.circle 
                    cx="50" cy="50" r="42" 
                    fill="none" 
                    strokeWidth="8"
                    strokeLinecap="round"
                    className={colorClasses[currentMetric.color].text}
                    stroke="currentColor"
                    strokeDasharray="263.89"
                    initial={{ strokeDashoffset: 263.89 }}
                    animate={{ strokeDashoffset: 263.89 - (parseFloat(currentMetric.value) / (currentMetric.benchmark.max * 1.2)) * 263.89 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span 
                    key={currentMetric.value}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-3xl sm:text-4xl md:text-5xl font-bold ${colorClasses[currentMetric.color].text}`}
                  >
                    {currentMetric.value}
                  </motion.span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{currentMetric.unit}</span>
                </div>
              </div>
              
              {/* Metric Info - Responsive */}
              <motion.div 
                key={currentMetric.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center"
              >
                <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${colorClasses[currentMetric.color].light}`}>
                  <Icon name={currentMetric.icon} size="sm" className={`icon-${currentMetric.color}`} />
                  <span className={`text-sm sm:text-base font-semibold ${colorClasses[currentMetric.color].text}`}>{currentMetric.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-3 max-w-xs sm:max-w-sm mx-auto px-2">{currentMetric.description}</p>
                
                {/* Benchmark Range - Responsive */}
                <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl">
                  <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">
                    <span>{t('features.statistics.metrics.benchmark', 'Benchmark Range')}</span>
                    <span>{currentMetric.benchmark.min} - {currentMetric.benchmark.max}</span>
                  </div>
                  <div className="relative h-1.5 sm:h-2 bg-gray-200 dark:bg-slate-600 rounded-full">
                    <div 
                      className={`absolute h-full rounded-full bg-gradient-to-r ${colorClasses[currentMetric.color].gradient}`}
                      style={{ 
                        left: `${(currentMetric.benchmark.min / (currentMetric.benchmark.max * 1.2)) * 100}%`,
                        width: `${((currentMetric.benchmark.max - currentMetric.benchmark.min) / (currentMetric.benchmark.max * 1.2)) * 100}%`
                      }}
                    />
                    <div 
                      className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white border-2 border-current rounded-full -top-0.5 transform -translate-x-1/2"
                      style={{ 
                        left: `${(parseFloat(currentMetric.value) / (currentMetric.benchmark.max * 1.2)) * 100}%`,
                        borderColor: colorClasses[currentMetric.color].text.replace('text-', '')
                      }}
                    />
                  </div>
                  <div className="flex justify-center mt-1.5 sm:mt-2">
                    <span className={`text-[10px] sm:text-xs font-medium ${colorClasses[currentMetric.color].text}`}>
                      {t('features.statistics.metrics.ideal', 'Ideal')}: {currentMetric.benchmark.ideal}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Metrics List - Responsive */}
            <div className="space-y-2 sm:space-y-3">
              {metrics.map((metric, index) => {
                const isActive = activeMetric === index
                return (
                  <motion.button
                    key={metric.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveMetric(index)}
                    className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all text-left ${
                      isActive
                        ? `border-l-4 border-l-${metric.color}-500 border-y border-r border-transparent bg-white dark:bg-slate-800 shadow-sm`
                        : 'border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:border-gray-300 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${colorClasses[metric.color].light} flex items-center justify-center flex-shrink-0`}>
                        <Icon name={metric.icon} size="md" className={`icon-${metric.color} sm:hidden`} />
                        <Icon name={metric.icon} size="lg" className={`icon-${metric.color} hidden sm:block`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm sm:text-base font-semibold truncate ${isActive ? colorClasses[metric.color].text : 'text-gray-800 dark:text-gray-200'}`}>{metric.title}</span>
                          <span className={`text-base sm:text-lg font-bold flex-shrink-0 ${colorClasses[metric.color].text}`}>{metric.value}</span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{metric.description}</p>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


// ============================================================================
// BENCHMARK COMPARISON SECTION
// ============================================================================

const BenchmarkSection = ({ t }) => {
  const [selectedStyle, setSelectedStyle] = useState('blog')
  
  const styles = [
    { id: 'blog', label: t('features.statistics.benchmark.styles.blog', 'Blog'), icon: 'edit-3' },
    { id: 'academic', label: t('features.statistics.benchmark.styles.academic', 'Academic'), icon: 'graduation-cap' },
    { id: 'casual', label: t('features.statistics.benchmark.styles.casual', 'Casual'), icon: 'message-circle' },
    { id: 'professional', label: t('features.statistics.benchmark.styles.professional', 'Professional'), icon: 'briefcase' }
  ]
  
  const benchmarks = {
    blog: {
      avgWordLength: { min: 4.0, max: 5.5, ideal: 4.8 },
      avgSentenceLength: { min: 12, max: 20, ideal: 15 },
      readabilityScore: { min: 60, max: 80, ideal: 70 },
      vocabularyRichness: { min: 0.4, max: 0.7, ideal: 0.55 },
      punctuationRatio: { min: 0.05, max: 0.15, ideal: 0.1 }
    },
    academic: {
      avgWordLength: { min: 5.0, max: 7.0, ideal: 5.8 },
      avgSentenceLength: { min: 18, max: 30, ideal: 22 },
      readabilityScore: { min: 30, max: 50, ideal: 40 },
      vocabularyRichness: { min: 0.5, max: 0.8, ideal: 0.65 },
      punctuationRatio: { min: 0.08, max: 0.18, ideal: 0.12 }
    },
    casual: {
      avgWordLength: { min: 3.5, max: 5.0, ideal: 4.2 },
      avgSentenceLength: { min: 8, max: 15, ideal: 12 },
      readabilityScore: { min: 70, max: 90, ideal: 80 },
      vocabularyRichness: { min: 0.35, max: 0.6, ideal: 0.45 },
      punctuationRatio: { min: 0.03, max: 0.12, ideal: 0.08 }
    },
    professional: {
      avgWordLength: { min: 4.5, max: 6.0, ideal: 5.2 },
      avgSentenceLength: { min: 14, max: 22, ideal: 18 },
      readabilityScore: { min: 45, max: 65, ideal: 55 },
      vocabularyRichness: { min: 0.45, max: 0.7, ideal: 0.58 },
      punctuationRatio: { min: 0.06, max: 0.14, ideal: 0.1 }
    }
  }
  
  const metricLabels = {
    avgWordLength: t('features.statistics.benchmark.metrics.wordLength', 'Word Length'),
    avgSentenceLength: t('features.statistics.benchmark.metrics.sentenceLength', 'Sentence Length'),
    readabilityScore: t('features.statistics.benchmark.metrics.readability', 'Readability'),
    vocabularyRichness: t('features.statistics.benchmark.metrics.vocabulary', 'Vocabulary'),
    punctuationRatio: t('features.statistics.benchmark.metrics.punctuation', 'Punctuation')
  }
  
  const currentBenchmark = benchmarks[selectedStyle]

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 shadow-lg shadow-indigo-500/20"
          >
            <Icon name="target" size="sm" className="icon-white" />
            {t('features.statistics.benchmark.badge', 'Industry Standards')}
          </motion.span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
            {t('features.statistics.benchmark.title', 'Compare Against Benchmarks')}
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
            {t('features.statistics.benchmark.subtitle', 'See how your writing compares to industry standards for different content types')}
          </p>
        </div>
        
        {/* Style Selector - Responsive */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {styles.map((style) => (
            <motion.button
              key={style.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedStyle(style.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all ${
                selectedStyle === style.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300'
              }`}
            >
              <Icon name={style.icon} size="sm" className={selectedStyle === style.id ? 'icon-white' : 'icon-indigo'} />
              {style.label}
            </motion.button>
          ))}
        </div>
        
        {/* Benchmark Table - Responsive */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedStyle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-lg"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10">
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('features.statistics.benchmark.table.metric', 'Metric')}
                    </th>
                    <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('features.statistics.benchmark.table.min', 'Min')}
                    </th>
                    <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {t('features.statistics.benchmark.table.ideal', 'Ideal')}
                    </th>
                    <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('features.statistics.benchmark.table.max', 'Max')}
                    </th>
                    <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                      {t('features.statistics.benchmark.table.range', 'Range')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {Object.entries(currentBenchmark).map(([key, value], index) => (
                    <motion.tr 
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">{metricLabels[key]}</span>
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">{value.min}</td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                        <span className="inline-flex items-center justify-center w-12 sm:w-16 py-0.5 sm:py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-bold rounded-md sm:rounded-lg">
                          {value.ideal}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">{value.max}</td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <div className="flex items-center justify-center">
                          <div className="w-24 sm:w-32 h-1.5 sm:h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
                              style={{ width: `${((value.ideal - value.min) / (value.max - value.min)) * 100}%`, marginLeft: `${((value.min) / (value.max * 1.2)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Style Description - Responsive */}
        <motion.div
          key={`desc-${selectedStyle}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 sm:mt-6 p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg sm:rounded-xl border border-indigo-100 dark:border-indigo-500/20"
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <Icon name="info" size="sm" className="icon-indigo mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-indigo-700 dark:text-indigo-300">
              {selectedStyle === 'blog' && t('features.statistics.benchmark.desc.blog', 'Blog writing should be conversational and easy to read. Aim for shorter sentences and accessible vocabulary to engage readers.')}
              {selectedStyle === 'academic' && t('features.statistics.benchmark.desc.academic', 'Academic writing requires precision and formality. Longer sentences and richer vocabulary are expected to convey complex ideas.')}
              {selectedStyle === 'casual' && t('features.statistics.benchmark.desc.casual', 'Casual writing is relaxed and friendly. Short sentences, simple words, and a conversational tone work best.')}
              {selectedStyle === 'professional' && t('features.statistics.benchmark.desc.professional', 'Professional writing balances clarity with sophistication. Moderate sentence length and precise vocabulary convey competence.')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}


// ============================================================================
// HOW IT WORKS SECTION
// ============================================================================

const HowItWorksSection = ({ t, steps }) => {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
      <div className="absolute top-1/4 left-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-40 sm:w-56 md:w-72 lg:w-80 h-40 sm:h-56 md:h-72 lg:h-80 bg-purple-500/5 rounded-full blur-3xl" />

      
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 shadow-lg shadow-indigo-500/20"
          >
            <Icon name="layers" size="sm" className="icon-white" />
            {t('features.statistics.howItWorks.badge', 'How It Works')}
          </motion.span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
            {t('features.statistics.howItWorks.title', 'Instant Text Analysis')}
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
            {t('features.statistics.howItWorks.subtitle', 'Get comprehensive writing statistics in seconds')}
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 sm:top-12 left-full w-full h-0.5 bg-gradient-to-r from-indigo-300 to-transparent z-0" />
              )}
              
              <div className="relative bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow h-full">
                {/* Step number */}
                <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg">
                  {step.step}
                </div>
                
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                  <Icon name={step.icon} size="lg" className="icon-indigo sm:hidden" />
                  <Icon name={step.icon} size="xl" className="icon-indigo hidden sm:block" />
                </div>
                
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1 sm:mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// USE CASES SECTION
// ============================================================================

const UseCasesSection = ({ t, useCases }) => {
  const [selectedCase, setSelectedCase] = useState(0)
  
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 shadow-lg shadow-indigo-500/20"
          >
            <Icon name="users" size="sm" className="icon-white" />
            {t('features.statistics.useCases.badge', 'Use Cases')}
          </motion.span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
            {t('features.statistics.useCases.title', 'Who Benefits From Statistics?')}
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
            {t('features.statistics.useCases.subtitle', 'Writers, educators, and professionals use our statistics to improve their craft')}
          </p>
        </div>
        
        {/* Use case cards - Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
          {useCases.map((useCase, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedCase(index)}
              className={`p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border text-left transition-all ${
                selectedCase === index
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300'
              }`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl mb-2 sm:mb-3 md:mb-4 flex items-center justify-center ${
                selectedCase === index
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-500'
                  : 'bg-indigo-100 dark:bg-indigo-500/20'
              }`}>
                <Icon name={useCase.icon} size="md" className={`${selectedCase === index ? 'icon-white' : 'icon-indigo'} sm:hidden`} />
                <Icon name={useCase.icon} size="lg" className={`${selectedCase === index ? 'icon-white' : 'icon-indigo'} hidden sm:block`} />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mb-0.5 sm:mb-1">{useCase.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{useCase.description}</p>
            </motion.button>
          ))}
        </div>
        
        {/* Selected use case detail - Responsive */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-indigo-50 via-purple-50/50 to-white dark:from-slate-800 dark:via-indigo-900/20 dark:to-slate-900 rounded-2xl sm:rounded-3xl border border-indigo-200/50 dark:border-indigo-500/20 p-4 sm:p-6 md:p-8"
          >
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                    <Icon name={useCases[selectedCase].icon} size="lg" className="icon-white sm:hidden" />
                    <Icon name={useCases[selectedCase].icon} size="xl" className="icon-white hidden sm:block" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">{useCases[selectedCase].title}</h3>
                    <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">{t('features.statistics.useCases.spotlight', 'Featured Use Case')}</p>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">{useCases[selectedCase].description}</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {useCases[selectedCase].benefits?.map((benefit, i) => (
                    <span key={i} className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-full text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                      <Icon name="check" size="xs" className="icon-indigo" />
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  <Icon name="quote" size="sm" className="icon-indigo" />
                  <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{t('features.statistics.useCases.example', 'Example')}</span>
                </div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 italic">{useCases[selectedCase].example}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

// ============================================================================
// BENEFITS SECTION
// ============================================================================

const BenefitsSection = ({ t, benefits }) => {
  const enhancedBenefits = benefits.map((benefit, i) => ({
    ...benefit,
    stat: ['10+', '<1s', '4', '15+'][i],
    statLabel: [
      t('features.statistics.benefits.metrics.stat', 'Metrics'),
      t('features.statistics.benefits.speed.stat', 'Analysis'),
      t('features.statistics.benefits.styles.stat', 'Style Types'),
      t('features.statistics.benefits.languages.stat', 'Languages')
    ][i]
  }))

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-bg-secondary relative overflow-hidden">
      <div className="absolute top-1/3 left-0 w-48 sm:w-56 md:w-64 lg:w-72 h-48 sm:h-56 md:h-64 lg:h-72 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-0 w-56 sm:w-72 md:w-80 lg:w-96 h-56 sm:h-72 md:h-80 lg:h-96 bg-purple-500/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 shadow-lg shadow-indigo-500/20"
          >
            <Icon name="star" size="sm" className="icon-white" />
            {t('features.statistics.benefits.badge', 'Benefits')}
          </motion.span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
            {t('features.statistics.benefits.title', 'Why Use Text Statistics?')}
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
            {t('features.statistics.benefits.subtitle', 'Gain insights that help you write better, faster')}
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {enhancedBenefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {index + 1}
              </div>
              
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                  <Icon name={benefit.icon} size="lg" className="icon-white sm:hidden" />
                  <Icon name={benefit.icon} size="xl" className="icon-white hidden sm:block" />
                </div>
                
                <div className="flex items-baseline gap-1 mb-2 sm:mb-3">
                  <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {benefit.stat}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{benefit.statLabel}</span>
                </div>
                
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1 sm:mb-2">{benefit.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


// ============================================================================
// FAQ SECTION
// ============================================================================

const FAQSection = ({ t, faqs, openFaq, setOpenFaq }) => {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 sm:w-56 md:w-72 lg:w-80 h-40 sm:h-56 md:h-72 lg:h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-bg-primary text-indigo-600 text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <Icon name="help-circle" size="sm" className="icon-indigo" />
            {t('features.statistics.faq.badge', 'FAQ')}
          </motion.span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3 md:mb-4">
            {t('features.statistics.faq.title', 'Frequently Asked Questions')}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
            {t('features.statistics.faq.desc', 'Everything you need to know about Text Statistics')}
          </p>
        </div>

        {/* FAQ List - Using optimized CSS grid animation */}
        <FAQAccordion 
          faqs={faqs} 
          openFaq={openFaq} 
          setOpenFaq={setOpenFaq} 
          accentColor="indigo"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-10 md:mt-12 p-4 sm:p-6 md:p-8 bg-bg-primary rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 text-center"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 bg-indigo-500/10 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Icon name="message-circle" size="lg" className="icon-indigo sm:hidden" />
            <Icon name="message-circle" size="xl" className="icon-indigo hidden sm:block" />
          </div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-text-primary mb-1.5 sm:mb-2">
            {t('faq.stillHaveQuestions', "Still have questions?")}
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-text-secondary mb-4 sm:mb-5 md:mb-6 max-w-md mx-auto px-2">
            {t('faq.contactDescription', "Can't find what you're looking for? Our support team is here to help.")}
          </p>
          <motion.a
            href="mailto:Support@graphosai.com"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:from-indigo-600 hover:to-purple-600 transition-all shadow-sm hover:shadow-md"
          >
            <Icon name="mail" size="sm" className="icon-white" />
            {t('faq.contactSupport', 'Contact Support')}
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================================
// CTA SECTION
// ============================================================================

const CTASection = ({ t }) => {
  return (
    <section className="pt-0 pb-12 sm:pb-16 md:pb-20 lg:pb-28 bg-bg-secondary relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[750px] lg:w-[900px] h-[400px] sm:h-[600px] md:h-[750px] lg:h-[900px] bg-indigo-500/5 rounded-full blur-3xl" 
        />
      </div>

      <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl sm:rounded-3xl md:rounded-[2rem] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600" />
          
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgba(255,255,255,0.1)"/>
              <path d="M0 120L60 115C120 110 240 100 360 95C480 90 600 90 720 92C840 94 960 98 1080 100C1200 102 1320 102 1380 102L1440 102V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgba(255,255,255,0.15)"/>
            </svg>
          </div>
          
          <div className="absolute top-0 left-0 right-0 rotate-180">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 80L48 74.7C96 69 192 59 288 53.3C384 48 480 48 576 53.3C672 59 768 69 864 69.3C960 69 1056 59 1152 53.3C1248 48 1344 48 1392 48L1440 48V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" fill="rgba(255,255,255,0.08)"/>
            </svg>
          </div>

          <div className="relative p-6 sm:p-8 md:p-10 lg:p-14 xl:p-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 bg-white/10 backdrop-blur-sm rounded-full mb-4 sm:mb-6 md:mb-8 border border-white/[0.15]"
            >
              <motion.span 
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full"
              />
              <span className="text-white/90 text-xs sm:text-sm font-semibold">
                {t('features.statistics.ctaBadge', 'Analyze your writing now')}
              </span>
              <Icon name="bar-chart-2" size="sm" className="icon-white opacity-80" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight"
            >
              {t('features.statistics.cta.title', 'Ready to Understand Your Writing?')}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 md:mb-10 max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-2"
            >
              {t('features.statistics.cta.subtitle', 'Get instant insights into your writing style with comprehensive text statistics. No credit card required.')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 md:mb-10 px-4 sm:px-0"
            >
              <motion.a
                href="https://app.graphosai.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-white text-indigo-600 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg shadow-sm hover:shadow-lg transition-all"
              >
                <span>{t('cta.getStartedFree', 'Get Started Free')}</span>
                <Icon name="arrow-right" size="sm" className="icon-indigo group-hover:translate-x-0.5 transition-transform sm:hidden" />
                <Icon name="arrow-right" size="md" className="icon-indigo group-hover:translate-x-0.5 transition-transform hidden sm:block" />
              </motion.a>
              <motion.a
                href="#demo"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg border border-white/[0.15] hover:bg-white/15 hover:border-white/[0.25] transition-all"
              >
                <Icon name="play-circle" size="sm" className="icon-white sm:hidden" />
                <Icon name="play-circle" size="md" className="icon-white hidden sm:block" />
                {t('cta.tryDemo', 'Try Demo')}
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-2 sm:gap-y-3 text-xs sm:text-sm text-white/70"
            >
              {[
                { icon: 'check-circle', text: t('cta.noCard', 'No credit card required') },
                { icon: 'zap', text: t('features.statistics.cta.instant', '100 free credits') },
                { icon: 'shield', text: t('features.statistics.cta.privacy', 'Privacy first') }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-1.5 sm:gap-2"
                >
                  <Icon name={item.icon} size="sm" className="icon-white opacity-70" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

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
            className="fill-slate-100 dark:fill-slate-800"
          />
          <path 
            d="M0 50C240 75 480 25 720 50C960 75 1200 25 1440 50V80H0V50Z" 
            className="fill-slate-200 dark:fill-slate-900"
          />
        </svg>
      </div>
    </section>
  )
}


// ============================================================================
// MAIN COMPONENT
// ============================================================================

function Statistics() {
  const { t } = useTranslation()
  const [openFaq, setOpenFaq] = useState(null)

  const benefits = [
    { icon: 'bar-chart-2', title: t('features.statistics.benefits.metrics.title', 'Comprehensive Metrics'), description: t('features.statistics.benefits.metrics.desc', 'Get 10+ writing metrics including word length, sentence structure, vocabulary richness, and readability scores') },
    { icon: 'zap', title: t('features.statistics.benefits.speed.title', 'Instant Analysis'), description: t('features.statistics.benefits.speed.desc', 'Analyze any text in under a second with our optimized processing engine') },
    { icon: 'target', title: t('features.statistics.benefits.styles.title', 'Style Benchmarks'), description: t('features.statistics.benefits.styles.desc', 'Compare your writing against industry standards for blog, academic, casual, and professional content') },
    { icon: 'globe', title: t('features.statistics.benefits.languages.title', 'Multi-Language'), description: t('features.statistics.benefits.languages.desc', 'Support for 15+ languages with language-specific analysis and benchmarks') },
  ]

  const useCases = [
    { 
      icon: 'edit-3', 
      title: t('features.statistics.useCases.writers.title', 'Content Writers'), 
      description: t('features.statistics.useCases.writers.desc', 'Optimize your content for readability and engagement by understanding your writing patterns'),
      benefits: [t('features.statistics.useCases.writers.b1', 'Better readability'), t('features.statistics.useCases.writers.b2', 'Consistent style'), t('features.statistics.useCases.writers.b3', 'SEO optimization')],
      example: t('features.statistics.useCases.writers.example', '"My blog posts now score 72 readability - perfect for my audience. Sentence length dropped from 22 to 15 words."')
    },
    { 
      icon: 'graduation-cap', 
      title: t('features.statistics.useCases.educators.title', 'Educators'), 
      description: t('features.statistics.useCases.educators.desc', 'Help students improve their writing by providing objective feedback on structure and complexity'),
      benefits: [t('features.statistics.useCases.educators.b1', 'Objective feedback'), t('features.statistics.useCases.educators.b2', 'Track progress'), t('features.statistics.useCases.educators.b3', 'Teaching tool')],
      example: t('features.statistics.useCases.educators.example', '"Students can see exactly how their vocabulary richness compares to academic standards."')
    },
    { 
      icon: 'briefcase', 
      title: t('features.statistics.useCases.professionals.title', 'Professionals'), 
      description: t('features.statistics.useCases.professionals.desc', 'Ensure your business communications are clear, professional, and appropriate for your audience'),
      benefits: [t('features.statistics.useCases.professionals.b1', 'Clear communication'), t('features.statistics.useCases.professionals.b2', 'Professional tone'), t('features.statistics.useCases.professionals.b3', 'Audience fit')],
      example: t('features.statistics.useCases.professionals.example', '"Our team reports now have consistent readability scores between 50-60, perfect for executive summaries."')
    },
    { 
      icon: 'book-open', 
      title: t('features.statistics.useCases.authors.title', 'Authors'), 
      description: t('features.statistics.useCases.authors.desc', 'Analyze your manuscript to ensure consistent voice and appropriate complexity throughout'),
      benefits: [t('features.statistics.useCases.authors.b1', 'Voice consistency'), t('features.statistics.useCases.authors.b2', 'Pacing analysis'), t('features.statistics.useCases.authors.b3', 'Genre fit')],
      example: t('features.statistics.useCases.authors.example', '"Chapter 5 had much longer sentences than the rest - statistics helped me find and fix pacing issues."')
    },
  ]

  const howItWorks = [
    { step: 1, title: t('features.statistics.howItWorks.step1.title', 'Input Text'), desc: t('features.statistics.howItWorks.step1.desc', 'Paste or write the text you want to analyze'), icon: 'file-text' },
    { step: 2, title: t('features.statistics.howItWorks.step2.title', 'Process'), desc: t('features.statistics.howItWorks.step2.desc', 'Our engine analyzes structure, vocabulary, and patterns'), icon: 'cpu' },
    { step: 3, title: t('features.statistics.howItWorks.step3.title', 'Calculate'), desc: t('features.statistics.howItWorks.step3.desc', 'Metrics are computed and compared to benchmarks'), icon: 'calculator' },
    { step: 4, title: t('features.statistics.howItWorks.step4.title', 'Results'), desc: t('features.statistics.howItWorks.step4.desc', 'View detailed statistics with actionable insights'), icon: 'bar-chart-2' },
  ]

  const faqs = [
    { q: t('features.statistics.faq.q1', 'What metrics are included in text statistics?'), a: t('features.statistics.faq.a1', 'We analyze 10+ metrics including average word length, average sentence length, vocabulary richness (unique words ratio), punctuation ratio, readability score (Flesch-Kincaid), total words/sentences/paragraphs, top sentence starters, and transition word usage.') },
    { q: t('features.statistics.faq.q2', 'How is readability score calculated?'), a: t('features.statistics.faq.a2', 'We use the Flesch-Kincaid readability formula which considers average sentence length and syllables per word. Scores range from 0-100, where higher scores indicate easier reading. 60-70 is ideal for general audiences, 30-50 for academic content.') },
    { q: t('features.statistics.faq.q3', 'What are the benchmark style types?'), a: t('features.statistics.faq.a3', 'We provide benchmarks for 4 writing styles: Blog (conversational, easy to read), Academic (formal, complex), Casual (relaxed, simple), and Professional (balanced, clear). Each has different ideal ranges for all metrics.') },
    { q: t('features.statistics.faq.q4', 'Does it support multiple languages?'), a: t('features.statistics.faq.a4', 'Yes! We support 15+ languages including English, Vietnamese, Spanish, French, German, and more. The system automatically detects the language and applies appropriate analysis patterns and benchmarks.') },
    { q: t('features.statistics.faq.q5', 'How can I improve my statistics?'), a: t('features.statistics.faq.a5', 'Use the benchmark comparison to see where your writing differs from ideal ranges. For example, if sentence length is too high, try breaking long sentences. If vocabulary richness is low, use more varied words. Our suggestions help guide improvements.') },
    { q: t('features.statistics.faq.q6', 'Is text statistics part of other features?'), a: t('features.statistics.faq.a6', 'Yes! Text statistics are integrated into AI Detection (to analyze writing patterns), Compatibility Score (to compare against your Voice Profile), and Deviations (to identify style inconsistencies). It\'s a foundational analysis used across the platform.') },
  ]

  return (
    <>
      <PageSEO 
        pageKey="statistics" 
        faqs={faqs}
      />

      <div className="relative">
        {/* Hero Section - Responsive */}
        <section className="relative min-h-[85vh] sm:min-h-[88vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden pt-16 sm:pt-12 md:pt-8 pb-12 sm:pb-14 md:pb-16">
          <DataAnalyticsBackground />
          
          {/* Breadcrumb - Inside container for alignment */}
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
                    { label: t('nav.features'), href: '/features' },
                    { label: t('nav.statistics', 'Statistics') },
                  ]}
                />
              </motion.div>
            </div>
          </div>
          
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 text-center relative z-10">
            {/* Badge - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="mb-5 sm:mb-6 md:mb-8"
            >
              <motion.span 
                className="relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-500/10 via-indigo-500/15 to-purple-500/10 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-semibold rounded-full border border-indigo-500/20 shadow-lg shadow-indigo-500/10"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(99, 102, 241, 0.1)',
                    '0 0 30px rgba(99, 102, 241, 0.2)',
                    '0 0 20px rgba(99, 102, 241, 0.1)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Icon name="bar-chart-2" size="sm" className="icon-indigo" />
                {t('features.statistics.badge', 'Writing Analytics')}
              </motion.span>
            </motion.div>
            
            {/* Main Headline - Responsive */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-text-primary mb-4 sm:mb-5 md:mb-6 leading-[1.1] tracking-tight"
            >
              {t('features.statistics.title', 'Text Statistics')}
            </motion.h1>
            
            {/* Subtitle - Responsive */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-5 sm:mb-6 md:mb-8"
            >
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                {t('features.statistics.heroHighlight', 'Understand Your Writing DNA')}
              </span>
            </motion.p>
            
            {/* Description - Responsive */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-text-secondary mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-xl sm:max-w-2xl mx-auto px-2"
            >
              {t('features.statistics.description', 'Analyze your writing with comprehensive metrics. Get readability scores, vocabulary analysis, sentence patterns, and benchmark comparisons instantly.')}
            </motion.p>

            {/* Stats - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 md:mb-10 max-w-xs sm:max-w-xl md:max-w-2xl mx-auto"
            >
              <StatCard value="10+" label={t('features.statistics.stats.metrics', 'Metrics')} />
              <StatCard value="<1s" label={t('features.statistics.stats.speed', 'Analysis')} />
              <StatCard value="4" label={t('features.statistics.stats.styles', 'Style Types')} />
              <StatCard value="15+" label={t('features.statistics.stats.languages', 'Languages')} />
            </motion.div>

            {/* CTA Buttons - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 md:mb-10 px-4 sm:px-0"
            >
              <motion.a
                href="https://app.graphosai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold text-sm sm:text-base overflow-hidden shadow-xl shadow-indigo-500/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">{t('cta.getStartedFree', 'Get Started Free')}</span>
                <Icon name="arrow-right" size="sm" className="icon-white relative group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <motion.a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-text-primary rounded-xl font-semibold text-sm sm:text-base hover:bg-white dark:hover:bg-white/20 transition-all shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon name="play-circle" size="sm" />
                {t('cta.tryDemo', 'Try Demo')}
              </motion.a>
            </motion.div>
            
            {/* Trust indicators - Responsive */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm px-2"
            >
              {[
                { icon: 'credit-card', text: t('features.statistics.trust.noCard', 'No credit card required') },
                { icon: 'zap', text: t('features.statistics.trust.instant', 'Instant results') },
                { icon: 'shield', text: t('features.statistics.trust.privacy', 'Privacy first') },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-bg-primary"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <Icon name={item.icon} size="sm" color="gray-medium" />
                  <span className="whitespace-nowrap">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Scroll Indicator - Hidden on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 hidden sm:block"
          >
            <motion.a
              href="#demo"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2 text-text-muted hover:text-indigo-500 transition-all cursor-pointer"
            >
              <span className="text-xs font-medium">{t('hero.scroll', 'Scroll to explore')}</span>
              <div className="w-6 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-start justify-center p-1.5">
                <motion.div 
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-current rounded-full"
                />
              </div>
            </motion.a>
          </motion.div>
        </section>

        {/* Live Demo Section - Responsive */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 relative">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <motion.div
              id="demo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="scroll-mt-20 sm:scroll-mt-24"
            >
              <div className="text-center mb-6 sm:mb-8 md:mb-10">
                <motion.span 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  whileInView={{ opacity: 1, scale: 1 }} 
                  viewport={{ once: true }} 
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-success text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 border border-gray-200 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full animate-pulse" />
                  {t('demo.liveDemo', 'Live Demo')}
                </motion.span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3 sm:mb-4">
                  {t('features.statistics.demo.title', 'Try Text Statistics Now')}
                </h2>
                <p className="text-base sm:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
                  {t('features.statistics.demo.subtitle', 'Experience our text analysis technology firsthand. No sign-up required.')}
                </p>
              </div>
              
              <Suspense fallback={
                <div className="h-[400px] sm:h-[480px] md:h-[520px] bg-bg-secondary rounded-xl sm:rounded-2xl border border-gray-200 flex items-center justify-center">
                  <ThreeDotsLoading size="lg" />
                </div>
              }>
                <LiveStatisticsDemo />
              </Suspense>
            </motion.div>
          </div>
        </section>

        {/* Metrics Showcase Section */}
        <MetricsShowcaseSection t={t} />

        {/* Benchmark Section */}
        <BenchmarkSection t={t} />

        {/* How It Works Section */}
        <HowItWorksSection t={t} steps={howItWorks} />

        {/* Use Cases Section */}
        <UseCasesSection t={t} useCases={useCases} />

        {/* Benefits Section */}
        <BenefitsSection t={t} benefits={benefits} />

        {/* Pricing Section */}
        <Suspense fallback={
          <div className="h-64 sm:h-80 md:h-96 flex items-center justify-center">
            <ThreeDotsLoading size="lg" />
          </div>
        }>
          <PricingSection />
        </Suspense>

        {/* FAQ Section */}
        <FAQSection t={t} faqs={faqs} openFaq={openFaq} setOpenFaq={setOpenFaq} />

        {/* Related Features */}
        <RelatedFeatures currentFeature="statistics" />

        {/* CTA Section */}
        <CTASection t={t} />
      </div>
    </>
  )
}

export default Statistics






