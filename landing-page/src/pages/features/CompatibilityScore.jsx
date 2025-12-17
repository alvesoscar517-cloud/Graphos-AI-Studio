/**
 * CompatibilityScore - SEO-optimized Compatibility Score feature page
 * Design: Precision/Analysis Theme - "Know Your Style Match"
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
const LiveCompatibilityDemo = lazy(() => import('@components/demos/LiveCompatibilityDemo'))

// ============================================================================
// HERO BACKGROUND - Analysis/Precision Theme
// ============================================================================

const AnalysisBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-10">
    {/* Base gradient - Teal/Cyan tones for precision */}
    <div className="absolute inset-0 bg-gradient-to-b from-teal-50/70 via-cyan-50/30 to-white dark:from-slate-950 dark:via-teal-950/20 dark:to-slate-900" />
    
    {/* SVG Analysis Visualization - Responsive sizing */}
    <svg 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] md:w-[900px] lg:w-[1100px] h-[400px] sm:h-[560px] md:h-[720px] lg:h-[900px] opacity-100"
      viewBox="0 0 1100 900"
      fill="none"
    >
      <defs>
        {/* Analysis gradient */}
        <linearGradient id="analysisGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(20, 184, 166, 0.3)" />
          <stop offset="50%" stopColor="rgba(6, 182, 212, 0.4)" />
          <stop offset="100%" stopColor="rgba(20, 184, 166, 0.3)" />
        </linearGradient>
        
        {/* Center glow */}
        <radialGradient id="centerAnalysisGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(20, 184, 166, 0.2)" />
          <stop offset="50%" stopColor="rgba(6, 182, 212, 0.1)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        
        {/* Score ring gradient */}
        <linearGradient id="scoreRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(20, 184, 166, 0.6)" />
          <stop offset="100%" stopColor="rgba(6, 182, 212, 0.8)" />
        </linearGradient>
      </defs>
      
      {/* Left side - Text representation */}
      <g opacity="0.5">
        {[200, 250, 300, 350, 400, 450, 500, 550, 600].map((y, i) => (
          <line 
            key={`text-${i}`}
            x1="100" 
            y1={y} 
            x2={180 + Math.random() * 100} 
            y2={y} 
            stroke="rgba(148, 163, 184, 0.3)" 
            strokeWidth="6"
            strokeLinecap="round"
          />
        ))}
        <rect x="80" y="180" width="220" height="460" rx="8" fill="none" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="2" strokeDasharray="8 4" />
        <text x="190" y="170" textAnchor="middle" fill="rgba(148, 163, 184, 0.4)" fontSize="12" fontWeight="500">YOUR TEXT</text>
      </g>
      
      {/* Center - Analysis zone with score circle */}
      <ellipse cx="550" cy="450" rx="180" ry="220" fill="url(#centerAnalysisGlow)" />
      
      {/* Score circle visualization */}
      <g transform="translate(550, 450)">
        {/* Outer ring */}
        <circle cx="0" cy="0" r="100" fill="none" stroke="rgba(20, 184, 166, 0.15)" strokeWidth="12" />
        {/* Score arc - 85% filled */}
        <circle 
          cx="0" cy="0" r="100" 
          fill="none" 
          stroke="url(#scoreRingGradient)" 
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="534"
          strokeDashoffset="80"
          transform="rotate(-90)"
        />
        {/* Inner circles */}
        <circle cx="0" cy="0" r="75" fill="none" stroke="rgba(20, 184, 166, 0.1)" strokeWidth="1" />
        <circle cx="0" cy="0" r="50" fill="none" stroke="rgba(20, 184, 166, 0.08)" strokeWidth="1" />
        {/* Center score text hint */}
        <text x="0" y="8" textAnchor="middle" fill="rgba(20, 184, 166, 0.5)" fontSize="36" fontWeight="700">85</text>
        <text x="0" y="30" textAnchor="middle" fill="rgba(20, 184, 166, 0.3)" fontSize="12">%</text>
      </g>
      
      {/* Right side - Voice Profile representation */}
      <g opacity="0.6">
        {/* Profile icon area */}
        <rect x="820" y="350" width="180" height="200" rx="16" fill="none" stroke="rgba(20, 184, 166, 0.25)" strokeWidth="2" />
        {/* Profile bars */}
        {[380, 420, 460, 500].map((y, i) => (
          <g key={`profile-${i}`}>
            <rect x="840" y={y} width={80 + i * 15} height="8" rx="4" fill="rgba(20, 184, 166, 0.3)" />
          </g>
        ))}
        <text x="910" y="340" textAnchor="middle" fill="rgba(20, 184, 166, 0.4)" fontSize="12" fontWeight="500">VOICE PROFILE</text>
      </g>
      
      {/* Connection lines - analysis flow */}
      <g>
        <path 
          d="M300 350 Q400 380 450 400" 
          stroke="url(#analysisGradient)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 4"
        />
        <path 
          d="M300 450 Q400 450 450 450" 
          stroke="url(#analysisGradient)" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M300 550 Q400 520 450 500" 
          stroke="url(#analysisGradient)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 4"
        />
        
        <path 
          d="M650 400 Q700 380 820 380" 
          stroke="url(#analysisGradient)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 4"
        />
        <path 
          d="M650 450 Q700 450 820 450" 
          stroke="url(#analysisGradient)" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M650 500 Q700 520 820 520" 
          stroke="url(#analysisGradient)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 4"
        />
      </g>
      
      {/* Analysis particles */}
      {[
        [420, 380, 4], [480, 420, 3], [520, 480, 4], [580, 420, 3],
        [620, 480, 4], [460, 520, 3], [540, 380, 3], [600, 520, 4]
      ].map(([x, y, r], i) => (
        <g key={`particle-${i}`}>
          <circle cx={x} cy={y} r={r + 4} fill="rgba(20, 184, 166, 0.1)" />
          <circle cx={x} cy={y} r={r} fill="rgba(20, 184, 166, 0.5)" />
        </g>
      ))}
    </svg>
    
    {/* Ambient glow - teal - Responsive */}
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[450px] md:w-[550px] lg:w-[700px] h-[300px] sm:h-[450px] md:h-[550px] lg:h-[700px] pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, rgba(20, 184, 166, 0.1) 0%, transparent 70%)',
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

const useAnimatedCounter = (end, duration = 2000, startOnView = true) => {
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
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, hasStarted])

  return { count, ref }
}

// ============================================================================
// STAT CARD COMPONENT - Responsive
// ============================================================================

const StatCard = ({ value, label, suffix = '', prefix = '' }) => {
  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0
  const { count, ref } = useAnimatedCounter(numericValue, 1500)
  
  const displayValue = value.includes('+') 
    ? `${prefix}${count}+` 
    : value.includes('%') 
    ? `${count}%`
    : value.includes('x')
    ? `${count}x`
    : value.includes('<')
    ? `<${count}s`
    : `${prefix}${count}${suffix}`

  return (
    <motion.div
      ref={ref}
      className="relative group"
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="relative px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/50 dark:border-white/10 shadow-lg shadow-black/5">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
        
        <div className="text-center">
          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
            {displayValue}
          </div>
          <div className="text-xs sm:text-sm text-text-muted mt-0.5 sm:mt-1 font-medium">{label}</div>
        </div>
      </div>
    </motion.div>
  )
}


// ============================================================================
// SCORE INTERPRETATION SECTION
// ============================================================================

const ScoreInterpretationSection = ({ t }) => {
  const [activeScore, setActiveScore] = useState(85)
  
  const scoreRanges = [
    { min: 90, max: 100, label: t('features.compatibility.scores.veryCompatible', 'Very Compatible'), color: 'emerald', icon: 'check-circle', desc: t('features.compatibility.scores.veryCompatibleDesc', 'Text matches your style excellently') },
    { min: 75, max: 89, label: t('features.compatibility.scores.goodMatch', 'Good Match'), color: 'teal', icon: 'thumbs-up', desc: t('features.compatibility.scores.goodMatchDesc', 'Text mostly matches your style') },
    { min: 50, max: 74, label: t('features.compatibility.scores.average', 'Average'), color: 'amber', icon: 'minus-circle', desc: t('features.compatibility.scores.averageDesc', 'Some style differences detected') },
    { min: 25, max: 49, label: t('features.compatibility.scores.lowMatch', 'Low Match'), color: 'orange', icon: 'alert-circle', desc: t('features.compatibility.scores.lowMatchDesc', 'Significant style differences') },
    { min: 0, max: 24, label: t('features.compatibility.scores.notCompatible', 'Not Compatible'), color: 'red', icon: 'x-circle', desc: t('features.compatibility.scores.notCompatibleDesc', "Text doesn't match your style") },
  ]
  
  const getCurrentRange = (score) => scoreRanges.find(r => score >= r.min && score <= r.max) || scoreRanges[4]
  const currentRange = getCurrentRange(activeScore)
  
  const colorClasses = {
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-100 dark:bg-emerald-500/20', border: 'border-l-emerald-500', stroke: '#10b981' },
    teal: { bg: 'bg-teal-500', text: 'text-teal-500', light: 'bg-teal-100 dark:bg-teal-500/20', border: 'border-l-teal-500', stroke: '#14b8a6' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-100 dark:bg-amber-500/20', border: 'border-l-amber-500', stroke: '#f59e0b' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-100 dark:bg-orange-500/20', border: 'border-l-orange-500', stroke: '#f97316' },
    red: { bg: 'bg-red-500', text: 'text-red-500', light: 'bg-red-100 dark:bg-red-500/20', border: 'border-l-red-500', stroke: '#ef4444' },
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
      <div className="absolute top-1/4 right-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-teal-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-40 sm:w-56 md:w-72 lg:w-80 h-40 sm:h-56 md:h-72 lg:h-80 bg-cyan-500/5 rounded-full blur-3xl" />
      {/* SVG Background Pattern */}
      <img 
        src="/images/backgrounds/bg-wave-11.svg" 
        alt="" 
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-100"
      />
      
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
        {/* Section Header - Responsive */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 shadow-lg shadow-teal-500/20"
          >
            <Icon name="bar-chart-2" size="sm" className="icon-white" />
            {t('features.compatibility.interpretation.badge', 'Score Guide')}
          </motion.span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
            {t('features.compatibility.interpretation.title', 'Understanding Your Score')}
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
            {t('features.compatibility.interpretation.subtitle', 'See what different compatibility scores mean for your writing')}
          </p>
        </div>
        
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-700/50 p-4 sm:p-6 md:p-8">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            {/* Interactive Score Display - Responsive */}
            <div className="relative">
              {/* Score Circle - Responsive */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 mx-auto mb-4 sm:mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-slate-700" />
                  <motion.circle 
                    cx="50" cy="50" r="42" 
                    fill="none" 
                    strokeWidth="8"
                    strokeLinecap="round"
                    stroke={colorClasses[currentRange.color].stroke}
                    strokeDasharray="263.89"
                    initial={{ strokeDashoffset: 263.89 }}
                    animate={{ strokeDashoffset: 263.89 - (activeScore / 100) * 263.89 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span 
                    key={activeScore}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-3xl sm:text-4xl md:text-5xl font-bold ${colorClasses[currentRange.color].text}`}
                  >
                    {activeScore}<span className="text-xl sm:text-2xl md:text-3xl">%</span>
                  </motion.span>
                </div>
              </div>
              
              {/* Score Label - Responsive */}
              <motion.div 
                key={currentRange.label}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center"
              >
                <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${colorClasses[currentRange.color].light}`}>
                  <Icon name={currentRange.icon} size="sm" className={`icon-${currentRange.color}`} />
                  <span className={`text-sm sm:text-base font-semibold ${colorClasses[currentRange.color].text}`}>{currentRange.label}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-3">{currentRange.desc}</p>
              </motion.div>
              
              {/* Slider - Responsive */}
              <div className="mt-6 sm:mt-8 px-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeScore}
                  onChange={(e) => setActiveScore(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-teal-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          
            {/* Score Ranges List - Responsive */}
            <div className="space-y-2 sm:space-y-3">
              {scoreRanges.map((range, index) => {
                const isActive = activeScore >= range.min && activeScore <= range.max
                return (
                  <motion.button
                    key={range.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveScore(Math.floor((range.min + range.max) / 2))}
                    className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all text-left ${
                      isActive
                        ? `border-l-4 ${colorClasses[range.color].border} bg-white dark:bg-slate-800 shadow-sm`
                        : 'border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:border-gray-300 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${colorClasses[range.color].light} flex items-center justify-center flex-shrink-0`}>
                        <Icon name={range.icon} size="md" className={`icon-${range.color} sm:hidden`} />
                        <Icon name={range.icon} size="lg" className={`icon-${range.color} hidden sm:block`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm sm:text-base font-semibold truncate ${isActive ? colorClasses[range.color].text : 'text-gray-800 dark:text-gray-200'}`}>{range.label}</span>
                          <span className={`text-xs sm:text-sm font-medium flex-shrink-0 ${colorClasses[range.color].text}`}>{range.min}-{range.max}%</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{range.desc}</p>
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
// HOW IT WORKS SECTION
// ============================================================================

const HowItWorksSection = ({ t, steps }) => {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
      {/* Background decoration - Responsive */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-40 sm:w-56 md:w-72 lg:w-80 h-40 sm:h-56 md:h-72 lg:h-80 bg-cyan-500/5 rounded-full blur-3xl" />

      </div>
      
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
        {/* Section Header - Responsive */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 shadow-lg shadow-teal-500/20"
          >
            <Icon name="layers" size="sm" className="icon-white" />
            {t('features.compatibility.howItWorks.badge', 'How It Works')}
          </motion.span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
            {t('features.compatibility.howItWorks.title', 'Multi-Layer Analysis')}
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
            {t('features.compatibility.howItWorks.subtitle', 'Our AI combines multiple analysis methods for accurate style matching')}
          </p>
        </div>
        
        {/* Steps Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector line - Hidden on mobile/tablet */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-teal-300 to-transparent z-0" />
              )}
              
              <div className="relative bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
                {/* Step number */}
                <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg">
                  {step.step}
                </div>
                
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-teal-100 dark:bg-teal-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                  <Icon name={step.icon} size="lg" className="icon-teal sm:hidden" />
                  <Icon name={step.icon} size="xl" className="icon-teal hidden sm:block" />
                </div>
                
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1.5 sm:mb-2">{step.title}</h3>
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
        {/* Section Header - Responsive */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 shadow-lg shadow-teal-500/20"
          >
            <Icon name="target" size="sm" className="icon-white" />
            {t('features.compatibility.useCases.badge', 'Use Cases')}
          </motion.span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
            {t('features.compatibility.useCases.title', 'Perfect For Every Scenario')}
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
            {t('features.compatibility.useCases.subtitle', 'Ensure your content always matches your unique voice')}
          </p>
        </div>
        
        {/* Use case cards - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
                  ? 'border-teal-400 bg-teal-50 dark:bg-teal-500/10'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-300'
              }`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl mb-3 sm:mb-4 flex items-center justify-center ${
                selectedCase === index
                  ? 'bg-gradient-to-br from-teal-500 to-cyan-500'
                  : 'bg-teal-100 dark:bg-teal-500/20'
              }`}>
                <Icon name={useCase.icon} size="md" className={`${selectedCase === index ? 'icon-white' : 'icon-teal'} sm:hidden`} />
                <Icon name={useCase.icon} size="lg" className={`${selectedCase === index ? 'icon-white' : 'icon-teal'} hidden sm:block`} />
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
            className="bg-gradient-to-br from-teal-50 via-cyan-50/50 to-white dark:from-slate-800 dark:via-teal-900/20 dark:to-slate-900 rounded-2xl sm:rounded-3xl border border-teal-200/50 dark:border-teal-500/20 p-4 sm:p-6 md:p-8"
          >
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
              <div>
                {/* Icon & Title - Responsive */}
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                    <Icon name={useCases[selectedCase].icon} size="lg" className="icon-white sm:hidden" />
                    <Icon name={useCases[selectedCase].icon} size="xl" className="icon-white hidden sm:block" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">{useCases[selectedCase].title}</h3>
                    <p className="text-xs sm:text-sm text-teal-600 dark:text-teal-400">{t('features.compatibility.useCases.spotlight', 'Featured Use Case')}</p>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">{useCases[selectedCase].description}</p>
                {/* Benefits - Responsive */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {useCases[selectedCase].benefits?.map((benefit, i) => (
                    <span key={i} className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-teal-100 dark:bg-teal-500/20 rounded-full text-xs sm:text-sm text-teal-700 dark:text-teal-300 font-medium">
                      <Icon name="check" size="xs" className="icon-teal" />
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
              {/* Example Card - Responsive */}
              <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  <Icon name="quote" size="sm" className="icon-teal" />
                  <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{t('features.compatibility.useCases.example', 'Example')}</span>
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
// BENEFITS SECTION - Enhanced with stats and better visuals
// ============================================================================

const BenefitsSection = ({ t, benefits }) => {
  // Enhanced benefits with stats
  const enhancedBenefits = benefits.map((benefit, i) => ({
    ...benefit,
    stat: ['2x', '<3s', '3', '20-40%'][i],
    statLabel: [
      t('features.compatibility.benefits.accuracy.stat', 'Analysis Layers'),
      t('features.compatibility.benefits.speed.stat', 'Processing'),
      t('features.compatibility.benefits.detailed.stat', 'Severity Levels'),
      t('features.compatibility.benefits.improve.stat', 'Score Boost')
    ][i]
  }))

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-bg-secondary relative overflow-hidden">
      {/* Background decorations - Responsive */}
      <div className="absolute top-1/3 left-0 w-48 sm:w-60 md:w-72 h-48 sm:h-60 md:h-72 bg-teal-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-0 w-56 sm:w-72 md:w-96 h-56 sm:h-72 md:h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
        {/* Section Header - Responsive */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 shadow-lg shadow-teal-500/20"
          >
            <Icon name="star" size="sm" className="icon-white" />
            {t('features.compatibility.benefits.badge', 'Benefits')}
          </motion.span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
            {t('features.compatibility.benefits.title', 'Why Use Compatibility Score?')}
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
            {t('features.compatibility.benefits.subtitle', 'Maintain consistent voice across all your content')}
          </p>
        </div>
        
        {/* Benefits Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {enhancedBenefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-2xl hover:border-teal-200 dark:hover:border-teal-500/30 transition-all duration-300"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Number badge */}
              <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {index + 1}
              </div>
              
              <div className="relative">
                {/* Icon with gradient - Responsive */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow">
                  <Icon name={benefit.icon} size="lg" className="icon-white sm:hidden" />
                  <Icon name={benefit.icon} size="xl" className="icon-white hidden sm:block" />
                </div>
                
                {/* Stat highlight - Responsive */}
                <div className="flex items-baseline gap-1 mb-2 sm:mb-3">
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    {benefit.stat}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{benefit.statLabel}</span>
                </div>
                
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1.5 sm:mb-2">{benefit.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{benefit.description}</p>
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
      {/* Background decoration - Responsive */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 sm:w-56 md:w-72 lg:w-80 h-40 sm:h-56 md:h-72 lg:h-80 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
        {/* Section Header - Responsive */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-bg-primary text-teal-600 text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <Icon name="help-circle" size="sm" className="icon-teal" />
            {t('features.compatibility.faq.badge', 'FAQ')}
          </motion.span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3 md:mb-4">
            {t('features.compatibility.faq.title', 'Frequently Asked Questions')}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
            {t('features.compatibility.faq.desc', 'Everything you need to know about Compatibility Score')}
          </p>
        </div>

        {/* FAQ List - Using optimized CSS grid animation */}
        <FAQAccordion 
          faqs={faqs} 
          openFaq={openFaq} 
          setOpenFaq={setOpenFaq} 
          accentColor="teal"
        />

        {/* Contact CTA Card - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-10 md:mt-12 p-5 sm:p-6 md:p-8 bg-bg-primary rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 text-center"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 bg-teal-500/10 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Icon name="message-circle" size="lg" className="icon-teal sm:hidden" />
            <Icon name="message-circle" size="xl" className="icon-teal hidden sm:block" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1.5 sm:mb-2">
            {t('faq.stillHaveQuestions', "Still have questions?")}
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-text-secondary mb-4 sm:mb-5 md:mb-6 max-w-md mx-auto px-2">
            {t('faq.contactDescription', "Can't find what you're looking for? Our support team is here to help.")}
          </p>
          <motion.a
            href="mailto:Support@graphosai.com"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:from-teal-600 hover:to-cyan-600 transition-all shadow-sm hover:shadow-md"
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
      {/* Background decoration - Responsive */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[750px] lg:w-[900px] h-[400px] sm:h-[600px] md:h-[750px] lg:h-[900px] bg-teal-500/5 rounded-full blur-3xl" 
        />
      </div>

      <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl sm:rounded-3xl lg:rounded-[2rem] overflow-hidden"
        >
          {/* Solid Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-cyan-500 to-teal-600" />
          
          {/* Wave SVG at bottom - Hidden on mobile */}
          <div className="absolute bottom-0 left-0 right-0 hidden sm:block">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgba(255,255,255,0.1)"/>
              <path d="M0 120L60 115C120 110 240 100 360 95C480 90 600 90 720 92C840 94 960 98 1080 100C1200 102 1320 102 1380 102L1440 102V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgba(255,255,255,0.15)"/>
            </svg>
          </div>
          
          {/* Wave SVG at top - Hidden on mobile */}
          <div className="absolute top-0 left-0 right-0 rotate-180 hidden sm:block">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 80L48 74.7C96 69 192 59 288 53.3C384 48 480 48 576 53.3C672 59 768 69 864 69.3C960 69 1056 59 1152 53.3C1248 48 1344 48 1392 48L1440 48V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" fill="rgba(255,255,255,0.08)"/>
            </svg>
          </div>

          <div className="relative p-6 sm:p-8 md:p-10 lg:p-14 xl:p-20 text-center">
            {/* Badge - Responsive */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm rounded-full mb-5 sm:mb-6 md:mb-8 border border-white/[0.15]"
            >
              <motion.span 
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full"
              />
              <span className="text-white/90 text-xs sm:text-sm font-semibold">
                {t('features.compatibility.ctaBadge', 'Start analyzing in seconds')}
              </span>
              <Icon name="target" size="sm" className="icon-white opacity-80 hidden sm:block" />
            </motion.div>

            {/* Headline - Responsive */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-5 md:mb-6 leading-tight px-2"
            >
              {t('features.compatibility.cta.title', 'Ready to Check Your Style Match?')}
            </motion.h2>

            {/* Description - Responsive */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 md:mb-10 max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-2"
            >
              {t('features.compatibility.cta.subtitle', 'Start analyzing your content against your Voice Profile today. No credit card required.')}
            </motion.p>

            {/* CTA Buttons - Responsive */}
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
                className="group inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-white text-teal-600 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg shadow-sm hover:shadow-lg transition-all"
              >
                <span>{t('cta.getStartedFree', 'Get Started Free')}</span>
                <Icon name="arrow-right" size="sm" className="icon-teal group-hover:translate-x-0.5 transition-transform sm:hidden" />
                <Icon name="arrow-right" size="md" className="icon-teal group-hover:translate-x-0.5 transition-transform hidden sm:block" />
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

            {/* Trust indicators - Responsive */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-2 sm:gap-y-3 text-xs sm:text-sm text-white/70 px-2"
            >
              {[
                { icon: 'check-circle', text: t('cta.noCard', 'No credit card required') },
                { icon: 'zap', text: t('features.compatibility.cta.instant', '100 free credits') },
                { icon: 'shield', text: t('features.compatibility.cta.privacy', 'Privacy first') }
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
                  <span className="whitespace-nowrap">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Wave divider to Footer - Hidden on mobile */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none hidden sm:block">
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

function CompatibilityScore() {
  const { t } = useTranslation()
  const [openFaq, setOpenFaq] = useState(null)

  const benefits = [
    { icon: 'target', title: t('features.compatibility.benefits.accuracy.title', 'Precise Analysis'), description: t('features.compatibility.benefits.accuracy.desc', 'Multi-layer analysis combining vector similarity and statistical comparison') },
    { icon: 'zap', title: t('features.compatibility.benefits.speed.title', 'Fast Results'), description: t('features.compatibility.benefits.speed.desc', 'Get detailed compatibility scores in seconds, not minutes') },
    { icon: 'bar-chart-2', title: t('features.compatibility.benefits.detailed.title', 'Detailed Breakdown'), description: t('features.compatibility.benefits.detailed.desc', 'See exactly which sentences deviate from your style with severity levels') },
    { icon: 'refresh-cw', title: t('features.compatibility.benefits.improve.title', 'Actionable Insights'), description: t('features.compatibility.benefits.improve.desc', 'Get suggestions to improve text and match your voice better') },
  ]

  const useCases = [
    { 
      icon: 'edit-3', 
      title: t('features.compatibility.useCases.content.title', 'Content Review'), 
      description: t('features.compatibility.useCases.content.desc', 'Check if outsourced or AI-generated content matches your brand voice before publishing'),
      benefits: [t('features.compatibility.useCases.content.b1', 'Brand consistency'), t('features.compatibility.useCases.content.b2', 'Quality control'), t('features.compatibility.useCases.content.b3', 'Time savings')],
      example: t('features.compatibility.useCases.content.example', '"This blog post scores 78% - the intro is great but the conclusion needs more of your conversational tone."')
    },
    { 
      icon: 'users', 
      title: t('features.compatibility.useCases.team.title', 'Team Alignment'), 
      description: t('features.compatibility.useCases.team.desc', 'Ensure all team members write in a consistent voice that matches your brand guidelines'),
      benefits: [t('features.compatibility.useCases.team.b1', 'Unified voice'), t('features.compatibility.useCases.team.b2', 'Training tool'), t('features.compatibility.useCases.team.b3', 'Onboarding')],
      example: t('features.compatibility.useCases.team.example', '"New writer\'s draft scores 65% - share the Voice Profile to help them match the team style."')
    },
    { 
      icon: 'cpu', 
      title: t('features.compatibility.useCases.ai.title', 'AI Content Check'), 
      description: t('features.compatibility.useCases.ai.desc', 'Verify that AI-generated content sounds like you before using it'),
      benefits: [t('features.compatibility.useCases.ai.b1', 'Authenticity'), t('features.compatibility.useCases.ai.b2', 'Personalization'), t('features.compatibility.useCases.ai.b3', 'Trust')],
      example: t('features.compatibility.useCases.ai.example', '"ChatGPT output scores 45% - use AI Rewrite to transform it to match your style."')
    },
    { 
      icon: 'book-open', 
      title: t('features.compatibility.useCases.learning.title', 'Style Learning'), 
      description: t('features.compatibility.useCases.learning.desc', 'Understand your writing patterns and improve consistency over time'),
      benefits: [t('features.compatibility.useCases.learning.b1', 'Self-awareness'), t('features.compatibility.useCases.learning.b2', 'Improvement'), t('features.compatibility.useCases.learning.b3', 'Growth')],
      example: t('features.compatibility.useCases.learning.example', '"Your formal emails score 92% but casual posts only 58% - you have two distinct voices!"')
    },
  ]

  const howItWorks = [
    { step: 1, title: t('features.compatibility.howItWorks.step1.title', 'Select Profile'), desc: t('features.compatibility.howItWorks.step1.desc', 'Choose the Voice Profile you want to compare against'), icon: 'user' },
    { step: 2, title: t('features.compatibility.howItWorks.step2.title', 'Input Text'), desc: t('features.compatibility.howItWorks.step2.desc', 'Paste or write the text you want to analyze'), icon: 'file-text' },
    { step: 3, title: t('features.compatibility.howItWorks.step3.title', 'AI Analysis'), desc: t('features.compatibility.howItWorks.step3.desc', 'Our AI compares vector similarity and statistical patterns'), icon: 'cpu' },
    { step: 4, title: t('features.compatibility.howItWorks.step4.title', 'Get Results'), desc: t('features.compatibility.howItWorks.step4.desc', 'View score, deviations, and improvement suggestions'), icon: 'bar-chart-2' },
  ]

  const faqs = [
    { q: t('features.compatibility.faq.q1', 'What is Compatibility Score?'), a: t('features.compatibility.faq.a1', 'Compatibility Score measures how well a piece of text matches your unique writing style captured in your Voice Profile. It combines vector similarity (semantic matching) and statistical analysis (structure, vocabulary, sentence patterns) to give you a comprehensive score from 0-100%.') },
    { q: t('features.compatibility.faq.q2', 'How accurate is the analysis?'), a: t('features.compatibility.faq.a2', 'Our multi-layer analysis achieves high accuracy by combining AI embeddings with statistical comparison. The more samples in your Voice Profile, the more accurate the results. We also provide a confidence score so you know how reliable each analysis is.') },
    { q: t('features.compatibility.faq.q3', 'What do Vector and Statistical scores mean?'), a: t('features.compatibility.faq.a3', 'Vector Score measures semantic similarity - how close the meaning and style of your text is to your profile. Statistical Score analyzes structural patterns like sentence length, vocabulary richness, and punctuation usage. Together they give a complete picture of style matching.') },
    { q: t('features.compatibility.faq.q4', 'What are deviation severities?'), a: t('features.compatibility.faq.a4', 'When analyzing text, we identify sentences that deviate from your style and classify them as Mild (small differences), Moderate (noticeable differences), or Severe (significant style mismatch). This helps you focus on the most important areas to improve.') },
    { q: t('features.compatibility.faq.q5', 'Can I improve low-scoring text?'), a: t('features.compatibility.faq.a5', 'Yes! After seeing your Compatibility Score, you can use our AI Rewrite feature to automatically transform the text to better match your Voice Profile. The rewritten version typically scores 20-40% higher.') },
    { q: t('features.compatibility.faq.q6', 'How many credits does analysis cost?'), a: t('features.compatibility.faq.a6', 'Text analysis costs 2 base credits plus a small amount per word (0.002 credits/word). A typical 500-word analysis costs about 3 credits. Premium users get more credits and priority processing.') },
  ]

  return (
    <>
      <PageSEO 
        pageKey="compatibility-score" 
        faqs={faqs}
      />

      <div className="relative">
        {/* Hero Section - Responsive Centered Layout */}
        <section className="relative min-h-[85vh] sm:min-h-[88vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden pt-16 sm:pt-12 md:pt-8 pb-12 sm:pb-14 md:pb-16">
          <AnalysisBackground />
          
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
                    { label: t('nav.compatibilityScore', 'Compatibility Score') },
                  ]}
                />
              </motion.div>
            </div>
          </div>
          
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 text-center relative z-10">
            {/* Animated Badge - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="mb-5 sm:mb-6 md:mb-8"
            >
              <motion.span 
                className="relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-teal-500/10 via-teal-500/15 to-cyan-500/10 text-teal-600 dark:text-teal-400 text-xs sm:text-sm font-semibold rounded-full border border-teal-500/20 shadow-lg shadow-teal-500/10"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(20, 184, 166, 0.1)',
                    '0 0 30px rgba(20, 184, 166, 0.2)',
                    '0 0 20px rgba(20, 184, 166, 0.1)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-teal-500" />
                </span>
                {t('features.compatibility.badge', 'Style Analysis')}
              </motion.span>
            </motion.div>
            
            {/* Main Headline - Responsive Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-text-primary mb-4 sm:mb-5 md:mb-6 leading-[1.1] tracking-tight"
            >
              {t('features.compatibility.title', 'Compatibility Score')}
            </motion.h1>
            
            {/* Subtitle with gradient - Responsive */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-5 sm:mb-6 md:mb-8"
            >
              <span className="bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                {t('features.compatibility.heroHighlight', 'Know Your Style Match')}
              </span>
            </motion.p>
            
            {/* Description - Responsive */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-text-secondary mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-xl sm:max-w-2xl mx-auto px-2"
            >
              {t('features.compatibility.description', 'Analyze how well your text matches your unique writing style. Get detailed scores, identify deviations, and improve consistency.')}
            </motion.p>

            {/* Enhanced Stats Row - Responsive Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 md:mb-10 max-w-xs sm:max-w-xl md:max-w-2xl mx-auto"
            >
              <StatCard value="2" label={t('features.compatibility.stats.layers', 'Analysis Layers')} suffix="x" />
              <StatCard value="<3s" label={t('features.compatibility.stats.speed', 'Analysis Time')} />
              <StatCard value="3" label={t('features.compatibility.stats.severities', 'Severity Levels')} />
              <StatCard value="95%" label={t('features.compatibility.stats.accuracy', 'Accuracy')} />
            </motion.div>

            {/* Enhanced CTA Buttons - Responsive */}
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
                className="group relative inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold text-sm sm:text-base overflow-hidden shadow-xl shadow-teal-500/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Shine effect */}
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
            
            {/* Enhanced Trust indicators - Responsive */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm px-2"
            >
              {[
                { icon: 'layers', text: t('features.compatibility.trust.multiLayer', 'Multi-layer analysis') },
                { icon: 'zap', text: t('features.compatibility.trust.instant', 'Instant results') },
                { icon: 'shield', text: t('features.compatibility.trust.privacy', 'Privacy first') },
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
              className="flex flex-col items-center gap-2 text-text-muted hover:text-teal-500 transition-all cursor-pointer"
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
              {/* Section Header - Responsive */}
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
                  {t('features.compatibility.demo.title', 'Try Compatibility Score Now')}
                </h2>
                <p className="text-base sm:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
                  {t('features.compatibility.demo.subtitle', 'See how our analysis works with sample texts. No sign-up required.')}
                </p>
              </div>
              
              <Suspense fallback={
                <div className="h-[400px] sm:h-[480px] md:h-[520px] lg:h-[600px] bg-bg-secondary rounded-xl sm:rounded-2xl border border-gray-200 flex items-center justify-center">
                  <ThreeDotsLoading size="lg" />
                </div>
              }>
                <LiveCompatibilityDemo />
              </Suspense>
            </motion.div>
          </div>
        </section>

        {/* Score Interpretation Section */}
        <ScoreInterpretationSection t={t} />

        {/* How It Works Section */}
        <HowItWorksSection t={t} steps={howItWorks} />

        {/* Use Cases Section */}
        <UseCasesSection t={t} useCases={useCases} />

        {/* Benefits Section */}
        <BenefitsSection t={t} benefits={benefits} />

        {/* Pricing Section */}
        <Suspense fallback={
          <div className="h-96 flex items-center justify-center">
            <ThreeDotsLoading size="lg" />
          </div>
        }>
          <PricingSection />
        </Suspense>

        {/* FAQ Section */}
        <FAQSection t={t} faqs={faqs} openFaq={openFaq} setOpenFaq={setOpenFaq} />

        {/* Related Features */}
        <RelatedFeatures currentFeature="compatibilityScore" />

        {/* CTA Section */}
        <CTASection t={t} />
      </div>
    </>
  )
}

export default CompatibilityScore






