/**
 * Rewrite - Landing page for AI Rewrite feature
 * Design: Transformation/Metamorphosis Theme - "Transform Your Words"
 * Theme Color: Emerald/Green - representing growth and transformation
 * Created: Dec 2025
 */
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, lazy, Suspense, useEffect, useRef } from 'react'
import SEOHead from '@components/seo/SEOHead'
import StructuredData from '@components/seo/StructuredData'
import Breadcrumb from '@components/common/Breadcrumb'
import Icon from '@components/common/Icon'

// Lazy load components
const PricingSection = lazy(() => import('@components/sections/PricingSection'))
const LiveRewriteDemo = lazy(() => import('@components/demos/LiveRewriteDemo'))

// ============================================================================
// HERO BACKGROUND - Transformation/Metamorphosis Theme
// ============================================================================

const TransformationBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-10">
    {/* Base gradient - Emerald/Green tones for transformation */}
    <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/70 via-green-50/30 to-white dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-900" />
    
    {/* SVG Transformation Visualization */}
    <svg 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[900px] opacity-100"
      viewBox="0 0 1100 900"
      fill="none"
    >
      <defs>
        {/* Transformation flow gradient */}
        <linearGradient id="transformGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
          <stop offset="50%" stopColor="rgba(52, 211, 153, 0.4)" />
          <stop offset="100%" stopColor="rgba(16, 185, 129, 0.3)" />
        </linearGradient>
        
        {/* Center glow */}
        <radialGradient id="centerTransformGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(16, 185, 129, 0.2)" />
          <stop offset="50%" stopColor="rgba(52, 211, 153, 0.1)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        
        {/* Arrow gradient */}
        <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(16, 185, 129, 0.6)" />
          <stop offset="100%" stopColor="rgba(52, 211, 153, 0.8)" />
        </linearGradient>
      </defs>
      
      {/* Left side - Original text representation (rigid/mechanical) */}
      <g opacity="0.5">
        {/* Horizontal lines - representing original text */}
        {[200, 260, 320, 380, 440, 500, 560, 620].map((y, i) => (
          <line 
            key={`orig-${i}`}
            x1="100" 
            y1={y} 
            x2={200 + Math.random() * 80} 
            y2={y} 
            stroke="rgba(148, 163, 184, 0.3)" 
            strokeWidth="8"
            strokeLinecap="round"
          />
        ))}
        {/* Text block indicator */}
        <rect x="80" y="180" width="200" height="480" rx="8" fill="none" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="2" strokeDasharray="8 4" />
      </g>
      
      {/* Center transformation zone */}
      <ellipse cx="550" cy="450" rx="180" ry="250" fill="url(#centerTransformGlow)" />
      
      {/* Transformation flow arrows */}
      <g>
        {/* Main flow paths */}
        <path 
          d="M320 250 Q450 280 550 320 Q650 360 750 340" 
          stroke="url(#transformGradient)" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M320 350 Q450 370 550 400 Q650 430 750 410" 
          stroke="url(#transformGradient)" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M320 450 Q450 450 550 450 Q650 450 750 450" 
          stroke="url(#transformGradient)" 
          strokeWidth="4" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M320 550 Q450 530 550 500 Q650 470 750 490" 
          stroke="url(#transformGradient)" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M320 650 Q450 620 550 580 Q650 540 750 560" 
          stroke="url(#transformGradient)" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Arrow heads */}
        <polygon points="750,340 730,330 730,350" fill="rgba(16, 185, 129, 0.5)" />
        <polygon points="750,410 730,400 730,420" fill="rgba(16, 185, 129, 0.5)" />
        <polygon points="750,450 730,440 730,460" fill="rgba(16, 185, 129, 0.6)" />
        <polygon points="750,490 730,480 730,500" fill="rgba(16, 185, 129, 0.5)" />
        <polygon points="750,560 730,550 730,570" fill="rgba(16, 185, 129, 0.5)" />
      </g>
      
      {/* Right side - Transformed text (organic/flowing) */}
      <g opacity="0.6">
        {/* Flowing lines - representing transformed text */}
        {[320, 380, 440, 500, 560].map((y, i) => (
          <path 
            key={`trans-${i}`}
            d={`M800 ${y} Q850 ${y + (i % 2 === 0 ? 10 : -10)} 900 ${y} Q950 ${y + (i % 2 === 0 ? -5 : 5)} ${950 + Math.random() * 50} ${y}`}
            stroke="rgba(16, 185, 129, 0.4)" 
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
        ))}
        {/* Text block indicator - organic shape */}
        <rect x="780" y="300" width="220" height="300" rx="16" fill="none" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="2" />
      </g>
      
      {/* Transformation particles */}
      {[
        [400, 300, 4], [480, 350, 3], [520, 420, 5], [560, 480, 3],
        [600, 380, 4], [640, 520, 3], [450, 500, 4], [580, 350, 3],
        [500, 550, 3], [620, 450, 4]
      ].map(([x, y, r], i) => (
        <g key={`particle-${i}`}>
          <circle cx={x} cy={y} r={r + 4} fill="rgba(16, 185, 129, 0.1)" />
          <circle cx={x} cy={y} r={r} fill="rgba(16, 185, 129, 0.5)" />
        </g>
      ))}
      
      {/* Center transformation icon hint */}
      <g transform="translate(550, 450)">
        <circle cx="0" cy="0" r="40" fill="rgba(16, 185, 129, 0.1)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="2" />
        <path 
          d="M-15 0 L10 0 M5 -8 L15 0 L5 8" 
          stroke="rgba(16, 185, 129, 0.6)" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
    
    {/* Ambient glow - emerald */}
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }}
    />
    
    {/* Secondary glow */}
    <div 
      className="absolute top-1/3 right-1/4 w-[300px] h-[400px] pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, rgba(52, 211, 153, 0.08) 0%, transparent 70%)',
        filter: 'blur(50px)',
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
// STAT CARD COMPONENT
// ============================================================================

const StatCard = ({ value, label, suffix = '' }) => {
  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0
  const { count, ref } = useAnimatedCounter(numericValue, 1500)
  
  const displayValue = value.includes('+') 
    ? `${count}+` 
    : value.includes('%') 
    ? `${count}%`
    : value.includes('x')
    ? `${count}x`
    : `${count}${suffix}`

  return (
    <motion.div
      ref={ref}
      className="relative group"
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="relative px-6 py-4 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-white/10 shadow-lg shadow-black/5">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
        
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 bg-clip-text text-transparent">
            {displayValue}
          </div>
          <div className="text-xs text-text-muted mt-1 font-medium whitespace-nowrap">{label}</div>
        </div>
      </div>
    </motion.div>
  )
}




// ============================================================================
// TRANSFORMATION SHOWCASE SECTION - Creative Design
// ============================================================================

const TransformationShowcase = ({ t }) => {
  const [activeExample, setActiveExample] = useState(0)
  const [showAfter, setShowAfter] = useState(false)

  const examples = [
    {
      style: t('features.rewrite.showcase.formal.style', 'Formal → Conversational'),
      icon: 'message-circle',
      before: t('features.rewrite.showcase.formal.before', 'The implementation of sustainable practices in corporate environments has become increasingly important in recent years.'),
      after: t('features.rewrite.showcase.formal.after', "You know what's been on my mind lately? How companies are finally getting serious about going green. It's about time, right?"),
      improvement: '+85%',
      metric: t('features.rewrite.showcase.formal.metric', 'Engagement')
    },
    {
      style: t('features.rewrite.showcase.wordy.style', 'Wordy → Concise'),
      icon: 'scissors',
      before: t('features.rewrite.showcase.wordy.before', 'I am writing to inform you that I would like to request a meeting at your earliest convenience to discuss the possibility of exploring potential collaboration opportunities.'),
      after: t('features.rewrite.showcase.wordy.after', "Let's schedule a meeting to discuss collaboration opportunities. When works best for you?"),
      improvement: '-60%',
      metric: t('features.rewrite.showcase.wordy.metric', 'Word count')
    },
    {
      style: t('features.rewrite.showcase.passive.style', 'Passive → Active'),
      icon: 'zap',
      before: t('features.rewrite.showcase.passive.before', 'The report was completed by the team and it was submitted to the manager for review.'),
      after: t('features.rewrite.showcase.passive.after', 'The team completed the report and submitted it to the manager for review.'),
      improvement: '+40%',
      metric: t('features.rewrite.showcase.passive.metric', 'Clarity')
    },
    {
      style: t('features.rewrite.showcase.generic.style', 'Generic → Personal'),
      icon: 'user',
      before: t('features.rewrite.showcase.generic.before', 'Thank you for your purchase. We hope you enjoy the product.'),
      after: t('features.rewrite.showcase.generic.after', 'Thanks so much for your order! I personally packed this one—hope it brings you as much joy as it brought me creating it.'),
      improvement: '+120%',
      metric: t('features.rewrite.showcase.generic.metric', 'Connection')
    }
  ]

  // Auto transform after delay
  useEffect(() => {
    setShowAfter(false)
    const timer = setTimeout(() => setShowAfter(true), 1500)
    return () => clearTimeout(timer)
  }, [activeExample])

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/80 via-green-50/50 to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900" />
      <div className="absolute top-1/4 left-[10%] w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-[10%] w-96 h-96 bg-green-400/15 rounded-full blur-3xl" />
      
      <div className="max-w-content-lg mx-auto px-4 sm:px-6 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-semibold rounded-full mb-4 shadow-lg shadow-emerald-500/20"
          >
            <Icon name="sparkles" size="sm" className="icon-white" />
            {t('features.rewrite.showcase.badge', 'See The Magic')}
          </motion.span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            {t('features.rewrite.showcase.title', 'Real Transformations')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t('features.rewrite.showcase.subtitle', 'Watch how AI Rewrite transforms your text while preserving your message')}
          </p>
        </div>
        
        {/* Style selector tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {examples.map((example, index) => (
            <motion.button
              key={index}
              onClick={() => setActiveExample(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all
                ${activeExample === index 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30' 
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-emerald-300'
                }
              `}
            >
              <Icon name={example.icon} size="sm" className={activeExample === index ? 'icon-white' : 'icon-emerald'} />
              <span className="hidden sm:inline">{example.style}</span>
            </motion.button>
          ))}
        </div>
        
        {/* Before/After Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Before Card */}
          <div className="relative">
            <div className="absolute -top-3 left-4 z-10">
              <span className="px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full">
                BEFORE
              </span>
            </div>
            <div className="min-h-[180px] p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {examples[activeExample].before}
              </p>
            </div>
          </div>
          
          {/* After Card */}
          <div className="relative">
            <div className="absolute -top-3 left-4 z-10">
              <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-emerald-500/30">
                AFTER
              </span>
            </div>
            <div className="min-h-[180px] p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border-2 border-emerald-200 dark:border-emerald-500/30 shadow-lg">
              {showAfter ? (
                <div>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {examples[activeExample].after}
                  </p>
                  <div className="mt-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                      examples[activeExample].improvement.startsWith('+') 
                        ? 'bg-emerald-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      <Icon name={examples[activeExample].improvement.startsWith('+') ? 'trending-up' : 'trending-down'} size="xs" className="icon-white" />
                      {examples[activeExample].improvement} {examples[activeExample].metric}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[120px]">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-500 rounded-full"
                    />
                      <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Transforming...</span>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
        
        {/* Center Arrow (desktop only) */}
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-16 z-20">
          <motion.div
            animate={!showAfter ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.8, repeat: showAfter ? 0 : Infinity }}
            className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/40"
          >
            <Icon name="arrow-right" size="md" className="icon-white" />
          </motion.div>
        </div>
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a 
            href="#demo" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all"
          >
            <Icon name="edit-3" size="sm" className="icon-white" />
            <span>{t('features.rewrite.showcase.cta', 'Try It Yourself')}</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}


// ============================================================================
// USE CASES SECTION
// ============================================================================

const UseCasesSection = ({ t, useCases }) => {
  const [selectedCase, setSelectedCase] = useState(0)
  
  const extendedUseCases = useCases.map((uc, i) => ({
    ...uc,
    color: ['emerald', 'teal', 'green', 'lime'][i % 4],
    example: [
      t('features.rewrite.useCases.email.example', '"I wanted to reach out regarding..." → "Hey! Quick question about..."'),
      t('features.rewrite.useCases.content.example', '"This article discusses..." → "Ever wondered why...? Let me tell you..."'),
      t('features.rewrite.useCases.academic.example', '"It can be observed that..." → "The data clearly shows..."'),
      t('features.rewrite.useCases.social.example', '"We are pleased to announce..." → "Big news! 🎉 We just launched..."'),
    ][i % 4],
    stats: [
      { label: t('features.rewrite.useCases.email.stat', 'Response rate'), value: '+45%' },
      { label: t('features.rewrite.useCases.content.stat', 'Read time'), value: '+60%' },
      { label: t('features.rewrite.useCases.academic.stat', 'Clarity score'), value: '+35%' },
      { label: t('features.rewrite.useCases.social.stat', 'Engagement'), value: '+80%' },
    ][i % 4]
  }))
  
  const marqueeItems = [...extendedUseCases, ...extendedUseCases, ...extendedUseCases]
  
  return (
    <section className="py-20 lg:py-28 overflow-hidden bg-bg-secondary">
      <div className="max-w-content-lg mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-semibold rounded-full mb-4 shadow-lg shadow-emerald-500/20"
          >
            <Icon name="target" size="sm" className="icon-white" />
            {t('features.rewrite.useCasesBadge', 'Use Cases')}
          </motion.span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            {t('features.rewrite.useCasesTitle', 'Perfect For Every Situation')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t('features.rewrite.useCasesDesc', 'Transform any type of content to match your voice and purpose')}
          </p>
        </div>
        
        {/* Marquee */}
        <div className="relative mb-10">
          <motion.div 
            className="flex gap-4"
            animate={{ x: [0, '-33.33%'] }}
            transition={{ x: { duration: 25, repeat: Infinity, ease: 'linear' } }}
            style={{ width: 'fit-content' }}
          >
            {marqueeItems.map((item, index) => {
              const isSelected = selectedCase === index % extendedUseCases.length
              return (
                <motion.button
                  key={index}
                  onClick={() => setSelectedCase(index % extendedUseCases.length)}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all duration-300 flex-shrink-0
                    ${isSelected 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 border-transparent text-white shadow-xl shadow-emerald-500/30' 
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-emerald-300 text-text-primary'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                    ${isSelected 
                      ? 'bg-white/20' 
                      : 'bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-500/20 dark:to-green-500/20'
                    }
                  `}>
                    <Icon name={item.icon} size="md" className={isSelected ? 'icon-white' : 'icon-emerald'} />
                  </div>
                  <span className="font-semibold whitespace-nowrap">{item.title}</span>
                </motion.button>
              )
            })}
          </motion.div>
        </div>
        
        {/* Spotlight */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCase}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-emerald-50 via-green-50/50 to-white dark:from-slate-800 dark:via-emerald-900/20 dark:to-slate-900 rounded-3xl border border-emerald-200/50 dark:border-emerald-500/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative p-8 md:p-10">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  {/* Left: Info */}
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <motion.div 
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30"
                      >
                        <Icon name={extendedUseCases[selectedCase].icon} size="2xl" className="icon-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-bold text-text-primary">
                          {extendedUseCases[selectedCase].title}
                        </h3>
                        <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {t('features.rewrite.useCases.spotlight', 'Spotlight')}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-text-secondary text-lg leading-relaxed mb-6">
                      {extendedUseCases[selectedCase].description}
                    </p>
                    
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-700 rounded-xl border border-emerald-200 dark:border-emerald-500/30 shadow-sm">
                      <Icon name="trending-up" size="sm" className="icon-emerald" />
                      <span className="text-sm text-text-secondary">{extendedUseCases[selectedCase].stats.label}:</span>
                      <span className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                        {extendedUseCases[selectedCase].stats.value}
                      </span>
                    </div>
                  </div>
                  
                  {/* Right: Example */}
                  <div className="relative">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-400" />
                          <div className="w-3 h-3 rounded-full bg-yellow-400" />
                          <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {t('features.rewrite.useCases.preview', 'Transformation Preview')}
                        </span>
                      </div>
                      
                      <div className="p-5">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {extendedUseCases[selectedCase].example}
                        </p>
                      </div>
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="absolute -top-3 -right-3 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold rounded-full shadow-lg"
                    >
                      {extendedUseCases[selectedCase].stats.value}
                    </motion.div>
                  </div>
                </div>
                
                {/* Navigation dots */}
                <div className="flex justify-center gap-2 mt-8">
                  {extendedUseCases.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCase(index)}
                      className={`
                        w-2.5 h-2.5 rounded-full transition-all duration-300
                        ${selectedCase === index 
                          ? 'w-8 bg-gradient-to-r from-emerald-500 to-green-500' 
                          : 'bg-gray-300 dark:bg-slate-600 hover:bg-emerald-300'
                        }
                      `}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}


// ============================================================================
// HOW IT WORKS SECTION
// ============================================================================

const HowItWorksSection = ({ t, howItWorks }) => {
  return (
    <section className="py-20 lg:py-28 bg-bg-secondary relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-content-lg mx-auto px-4 sm:px-6 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 text-sm font-semibold rounded-full mb-4 border border-emerald-200 dark:border-emerald-500/30 shadow-sm"
          >
            <Icon name="layers" size="sm" className="icon-emerald" />
            {t('features.rewrite.howItWorksBadge', 'Simple Process')}
          </motion.span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            {t('features.rewrite.howItWorksTitle', 'How AI Rewrite Works')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t('features.rewrite.howItWorksDesc', 'Transform your text in three simple steps')}
          </p>
        </div>
        
        {/* Steps - Horizontal Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {howItWorks.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line (desktop) */}
              {index < howItWorks.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-emerald-300 to-transparent z-0" style={{ width: 'calc(100% - 2rem)' }} />
              )}
              
              {/* Card */}
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow h-full">
                {/* Step number badge */}
                <div className="absolute -top-4 left-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <span className="text-white font-bold text-sm">{item.step}</span>
                  </div>
                </div>
                
                {/* Icon */}
                <div className="mt-4 mb-4">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Icon name={item.icon} size="xl" className="icon-emerald" />
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-semibold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl shadow-xl shadow-emerald-500/20"
        >
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '<2s', label: t('features.rewrite.stats.speed', 'Speed'), icon: 'zap' },
              { value: '90%+', label: t('features.rewrite.stats.accuracy', 'Style Match'), icon: 'target' },
              { value: '15+', label: t('features.rewrite.stats.languages', 'Languages'), icon: 'globe' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Icon name={stat.icon} size="lg" className="icon-white" />
                  <span className="text-2xl md:text-3xl font-bold text-white">{stat.value}</span>
                </div>
                <div className="text-xs md:text-sm text-white/80 whitespace-nowrap">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================================
// BENEFITS SECTION
// ============================================================================

const BenefitsSection = ({ t, benefits }) => {
  return (
    <section className="py-20 lg:py-28 bg-bg-secondary">
      <div className="max-w-content-lg mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 text-sm font-semibold rounded-full mb-4 border border-gray-200 shadow-sm"
          >
            <Icon name="star" size="sm" className="icon-emerald" />
            {t('features.rewrite.benefitsBadge', 'Why Choose Us')}
          </motion.span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            {t('features.rewrite.benefitsTitle', 'Powerful Features')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t('features.rewrite.benefitsDesc', 'Everything you need to transform your writing')}
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors">
                  <Icon name={benefit.icon} size="lg" className="icon-emerald group-hover:icon-white transition-all" />
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{benefit.title}</h3>
                <p className="text-sm text-text-secondary">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


// ============================================================================
// VOICE PROFILE INTEGRATION SECTION
// ============================================================================

const VoiceProfileIntegration = ({ t }) => {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-content-lg mx-auto px-4 sm:px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true }} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-full mb-4 shadow-lg shadow-emerald-500/20"
            >
              <Icon name="link" size="sm" className="icon-white" />
              {t('features.rewrite.integration.badge', 'Powerful Integration')}
            </motion.span>
            
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
              {t('features.rewrite.integration.title', 'Powered by Your Voice Profile')}
            </h2>
            
            <p className="text-lg text-text-secondary mb-6 leading-relaxed">
              {t('features.rewrite.integration.desc', 'AI Rewrite uses your Voice Profile to transform text into your unique writing style. The more you use it, the better it understands your voice.')}
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                { icon: 'fingerprint', text: t('features.rewrite.integration.feature1', 'Matches your vocabulary and tone') },
                { icon: 'bar-chart-2', text: t('features.rewrite.integration.feature2', 'Learns from your writing patterns') },
                { icon: 'refresh-cw', text: t('features.rewrite.integration.feature3', 'Consistent voice across all content') },
                { icon: 'shield', text: t('features.rewrite.integration.feature4', 'Bypasses AI detection naturally') },
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={item.icon} size="sm" className="icon-emerald" />
                  </div>
                  <span className="text-text-secondary">{item.text}</span>
                </motion.li>
              ))}
            </ul>
            
            <div className="flex flex-wrap gap-4">
              <a 
                href="/features/voice-profile"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
              >
                <Icon name="fingerprint" size="sm" className="icon-white" />
                {t('features.rewrite.integration.cta1', 'Create Voice Profile')}
              </a>
              <a 
                href="#demo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-text-primary rounded-xl font-semibold border border-gray-200 dark:border-slate-700 hover:border-emerald-300 transition-all"
              >
                <Icon name="play-circle" size="sm" />
                {t('features.rewrite.integration.cta2', 'Try Demo')}
              </a>
            </div>
          </motion.div>
          
          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-emerald-50 via-green-50/50 to-white dark:from-slate-800 dark:via-emerald-900/20 dark:to-slate-900 rounded-3xl border border-emerald-200/50 dark:border-emerald-500/20 p-8 overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-200/30 dark:bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-200/30 dark:bg-teal-500/10 rounded-full blur-3xl" />
              </div>
              
              {/* Connection visualization */}
              <div className="relative flex items-center justify-center gap-6 md:gap-10">
                {/* Voice Profile */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-center"
                >
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-3">
                      <Icon name="fingerprint" size="2xl" className="icon-white" />
                    </div>
                    {/* Pulse ring */}
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-2xl border-2 border-emerald-400"
                    />
                  </div>
                  <span className="text-sm font-medium text-text-secondary">Voice Profile</span>
                </motion.div>
                
                {/* Connection line with animated particles */}
                <div className="flex-1 relative h-12 flex items-center">
                  <div className="w-full h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 rounded-full opacity-30" />
                  {/* Animated dot 1 */}
                  <motion.div
                    animate={{ x: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"
                  />
                  {/* Animated dot 2 */}
                  <motion.div
                    animate={{ x: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.7 }}
                    className="absolute left-0 w-2 h-2 bg-teal-400 rounded-full shadow-lg shadow-teal-400/50"
                  />
                  {/* Animated dot 3 */}
                  <motion.div
                    animate={{ x: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 1.4 }}
                    className="absolute left-0 w-2.5 h-2.5 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
                  />
                </div>
                
                {/* Rewrite */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="text-center"
                >
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-3">
                      <Icon name="edit-3" size="2xl" className="icon-white" />
                    </div>
                    {/* Pulse ring */}
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      className="absolute inset-0 rounded-2xl border-2 border-green-400"
                    />
                  </div>
                  <span className="text-sm font-medium text-text-secondary">AI Rewrite</span>
                </motion.div>
              </div>
              
              {/* Result preview */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="relative mt-8 p-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-xl border border-emerald-200/50 dark:border-emerald-500/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Icon name="check" size="xs" className="icon-emerald" />
                  </div>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {t('features.rewrite.integration.result', 'Result: Sounds exactly like you!')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed">
                  "Your text has been transformed to match your unique writing style, vocabulary preferences, and tone..."
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// FAQ SECTION
// ============================================================================

const FAQSection = ({ t, faqs }) => {
  const [openFaq, setOpenFaq] = useState(null)
  
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-bg-primary text-emerald-600 text-sm font-semibold rounded-full mb-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <Icon name="help-circle" size="sm" className="icon-emerald" />
            {t('features.rewrite.faqBadge', 'FAQ')}
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t('features.rewrite.faqTitle', 'Frequently Asked Questions')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            {t('features.rewrite.faqDesc', 'Everything you need to know about AI Rewrite')}
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`group rounded-2xl border transition-all overflow-hidden ${
                openFaq === index 
                  ? 'bg-bg-primary border-gray-200 dark:border-gray-700 shadow-md' 
                  : 'bg-bg-primary border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-4 pr-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    openFaq === index ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white' : 'bg-bg-secondary text-emerald-600 group-hover:bg-emerald-500/10'
                  }`}>
                    <span className="text-sm font-bold">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <span className={`text-base font-semibold transition-colors ${
                    openFaq === index ? 'text-emerald-600' : 'text-text-primary group-hover:text-emerald-600'
                  }`}>
                    {faq.q}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: openFaq === index ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
                >
                  <Icon name="chevron-down" size="sm" className={openFaq === index ? 'text-emerald-600' : 'text-text-muted'} />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pl-[4.5rem]">
                      <p className="text-text-secondary leading-relaxed">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-8 bg-bg-primary rounded-2xl border border-gray-200 dark:border-gray-700 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <Icon name="message-circle" size="xl" className="icon-emerald" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">
            {t('faq.stillHaveQuestions', "Still have questions?")}
          </h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            {t('faq.contactDescription', "Can't find what you're looking for? Our support team is here to help.")}
          </p>
          <motion.a
            href="mailto:support@graphosai.com"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm hover:shadow-md"
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
    <section className="pt-0 pb-20 lg:pb-28 bg-bg-secondary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-emerald-500/5 rounded-full blur-3xl" 
        />
      </div>

      <div className="relative max-w-content-lg mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2rem] overflow-hidden"
        >
          {/* Solid Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500" />
          
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

          <div className="relative p-10 md:p-14 lg:p-20 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/[0.15]"
            >
              <motion.span 
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2.5 h-2.5 bg-white rounded-full"
              />
              <span className="text-white/90 text-sm font-semibold">
                {t('features.rewrite.ctaBadge', 'Start transforming in seconds')}
              </span>
              <Icon name="edit-3" size="sm" className="icon-white opacity-80" />
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
            >
              {t('features.rewrite.cta.title', 'Ready to Transform Your Writing?')}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              {t('features.rewrite.cta.desc', 'Start rewriting your content in your unique voice today. No credit card required.')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
            >
              <motion.a
                href="https://app.graphosai.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold text-lg shadow-sm hover:shadow-lg transition-all"
              >
                <span>{t('cta.getStartedFree', 'Get Started Free')}</span>
                <Icon name="arrow-right" size="md" className="icon-emerald group-hover:translate-x-0.5 transition-transform" />
              </motion.a>
              <motion.a
                href="#demo"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold text-lg border border-white/[0.15] hover:bg-white/15 hover:border-white/[0.25] transition-all"
              >
                <Icon name="play-circle" size="md" className="icon-white" />
                {t('cta.tryDemo', 'Try Demo')}
              </motion.a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/70"
            >
              {[
                { icon: 'check-circle', text: t('cta.noCard', 'No credit card required') },
                { icon: 'zap', text: t('features.rewrite.cta.trust2', '100 free credits') },
                { icon: 'shield', text: t('features.rewrite.cta.trust3', 'Privacy first') }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-2"
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
  )
}


// ============================================================================
// MAIN COMPONENT
// ============================================================================

function Rewrite() {
  const { t } = useTranslation()

  const benefits = [
    { icon: 'zap', title: t('features.rewrite.benefits.speed.title', 'Lightning Fast'), description: t('features.rewrite.benefits.speed.desc', 'Transform your text in seconds, not minutes') },
    { icon: 'fingerprint', title: t('features.rewrite.benefits.voice.title', 'Your Voice'), description: t('features.rewrite.benefits.voice.desc', 'Maintains your unique writing style and personality') },
    { icon: 'shield', title: t('features.rewrite.benefits.undetectable.title', 'Undetectable'), description: t('features.rewrite.benefits.undetectable.desc', 'Bypasses AI detection while keeping content natural') },
    { icon: 'globe', title: t('features.rewrite.benefits.languages.title', 'Multi-language'), description: t('features.rewrite.benefits.languages.desc', 'Support for 15+ languages with native quality') },
  ]

  const useCases = [
    { 
      icon: 'mail', 
      title: t('features.rewrite.useCases.email.title', 'Email Writing'), 
      description: t('features.rewrite.useCases.email.desc', 'Transform formal emails into friendly messages or vice versa')
    },
    { 
      icon: 'file-text', 
      title: t('features.rewrite.useCases.content.title', 'Content Creation'), 
      description: t('features.rewrite.useCases.content.desc', 'Rewrite blog posts, articles, and marketing copy in your voice')
    },
    { 
      icon: 'graduation-cap', 
      title: t('features.rewrite.useCases.academic.title', 'Academic Writing'), 
      description: t('features.rewrite.useCases.academic.desc', 'Polish essays and papers while maintaining academic tone')
    },
    { 
      icon: 'message-circle', 
      title: t('features.rewrite.useCases.social.title', 'Social Media'), 
      description: t('features.rewrite.useCases.social.desc', 'Create engaging posts that sound authentically you')
    },
  ]

  const howItWorks = [
    { step: 1, title: t('features.rewrite.howItWorks.step1.title', 'Paste Your Text'), desc: t('features.rewrite.howItWorks.step1.desc', 'Enter the text you want to transform'), icon: 'clipboard' },
    { step: 2, title: t('features.rewrite.howItWorks.step2.title', 'Select Your Profile'), desc: t('features.rewrite.howItWorks.step2.desc', 'Choose your Voice Profile for personalized results'), icon: 'user' },
    { step: 3, title: t('features.rewrite.howItWorks.step3.title', 'Get Transformed Text'), desc: t('features.rewrite.howItWorks.step3.desc', 'Receive rewritten content that sounds like you'), icon: 'check-circle' },
  ]

  const faqs = [
    { q: t('features.rewrite.faq.q1', 'How does AI Rewrite work?'), a: t('features.rewrite.faq.a1', 'AI Rewrite uses your Voice Profile to understand your unique writing style. It then transforms any text to match your vocabulary, tone, and sentence patterns while preserving the original meaning.') },
    { q: t('features.rewrite.faq.q2', 'Do I need a Voice Profile to use Rewrite?'), a: t('features.rewrite.faq.a2', 'While you can use basic rewriting without a profile, having a Voice Profile significantly improves results. It allows the AI to match your specific writing style rather than using generic transformations.') },
    { q: t('features.rewrite.faq.q3', 'Will the rewritten text pass AI detection?'), a: t('features.rewrite.faq.a3', 'Yes! Our AI Rewrite is designed to produce natural, human-like text. When combined with your Voice Profile, the output typically scores very low on AI detection tools.') },
    { q: t('features.rewrite.faq.q4', 'What languages are supported?'), a: t('features.rewrite.faq.a4', 'We support 15+ languages including English, Vietnamese, Spanish, French, German, and more. The AI automatically detects the input language and maintains quality in the output.') },
    { q: t('features.rewrite.faq.q5', 'How many credits does rewriting cost?'), a: t('features.rewrite.faq.a5', 'Rewriting costs approximately 1.5 credits base + 0.0008 credits per word. The exact cost depends on text length and the AI model selected.') },
    { q: t('features.rewrite.faq.q6', 'Can I rewrite long documents?'), a: t('features.rewrite.faq.a6', 'Yes! You can rewrite documents up to 50,000 characters. For longer documents, we recommend using our AI Studio which provides a full editor experience.') },
  ]

  return (
    <>
      <SEOHead
        title={t('features.rewrite.meta.title', 'AI Rewrite - Transform Text in Your Voice | Graphos AI')}
        description={t('features.rewrite.meta.description', 'Transform any text to match your unique writing style. AI-powered rewriting that sounds authentically you. Bypass AI detection naturally.')}
        keywords={['AI rewrite', 'text transformation', 'writing style', 'content rewriting', 'AI writing assistant', 'humanize text', 'voice profile']}
      />
      <StructuredData
        type="SoftwareApplication"
        data={{
          name: 'Graphos AI Rewrite',
          description: t('features.rewrite.meta.description'),
          url: 'https://graphosai.com/features/rewrite',
          applicationCategory: 'ProductivityApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            ratingCount: '1850'
          }
        }}
      />
      <StructuredData
        type="FAQPage"
        data={{
          mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.a
            }
          }))
        }}
      />

      <div className="relative">
        {/* Hero Section */}
        <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-8 pb-16">
          <TransformationBackground />
          
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute top-6 left-4 sm:left-6 lg:left-8 z-20"
          >
            <Breadcrumb
              items={[
                { label: t('nav.home'), href: '/' },
                { label: t('nav.features'), href: '#' },
                { label: t('features.rewrite.title', 'AI Rewrite') },
              ]}
            />
          </motion.div>
          
          <div className="max-w-content-lg mx-auto px-4 sm:px-6 text-center relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="mb-8"
            >
              <motion.span 
                className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/15 to-green-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(16, 185, 129, 0.1)',
                    '0 0 30px rgba(16, 185, 129, 0.2)',
                    '0 0 20px rgba(16, 185, 129, 0.1)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                {t('features.rewrite.badge', 'Voice-Powered Transformation')}
              </motion.span>
            </motion.div>
            
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-[1.1] tracking-tight"
            >
              {t('features.rewrite.title', 'AI Rewrite')}
            </motion.h1>
            
            {/* Subtitle with gradient */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent">
                {t('features.rewrite.heroHighlight', 'Transform Your Words')}
              </span>
            </motion.p>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary mb-10 leading-relaxed max-w-2xl mx-auto"
            >
              {t('features.rewrite.heroDesc', 'Transform any text to match your unique writing style. Powered by your Voice Profile for authentic, undetectable results.')}
            </motion.p>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 max-w-2xl mx-auto"
            >
              <StatCard value="<2s" label={t('features.rewrite.stats.speed', 'Speed')} />
              <StatCard value="90%+" label={t('features.rewrite.stats.accuracy', 'Style Match')} />
              <StatCard value="15+" label={t('features.rewrite.stats.languages', 'Languages')} />
              <StatCard value="50K+" label={t('features.rewrite.stats.users', 'Happy Users')} />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
            >
              <motion.a
                href="https://app.graphosai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold text-base overflow-hidden shadow-xl shadow-emerald-500/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">{t('cta.getStartedFree', 'Get Started Free')}</span>
                <Icon name="arrow-right" size="sm" className="icon-white relative group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <motion.a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-text-primary rounded-xl font-semibold text-base hover:bg-white dark:hover:bg-white/20 transition-all shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon name="play-circle" size="sm" />
                {t('cta.tryDemo', 'Try Demo')}
              </motion.a>
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4 text-sm"
            >
              {[
                { icon: 'credit-card', text: t('features.rewrite.trust.noCard', 'No credit card required') },
                { icon: 'zap', text: t('features.rewrite.trust.instant', 'Instant results') },
                { icon: 'shield', text: t('features.rewrite.trust.privacy', 'Privacy first') },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-bg-primary"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <Icon name={item.icon} size="sm" color="gray-medium" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
          >
            <motion.a
              href="#demo"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2 text-text-muted hover:text-emerald-500 transition-all cursor-pointer"
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

        {/* Live Demo Section */}
        <section className="py-20 lg:py-28 relative">
          <div className="max-w-content-lg mx-auto px-4 sm:px-6">
            <motion.div
              id="demo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="scroll-mt-24"
            >
              {/* Section Header */}
              <div className="text-center mb-10">
                <motion.span 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  whileInView={{ opacity: 1, scale: 1 }} 
                  viewport={{ once: true }} 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 text-sm font-semibold rounded-full mb-4 border border-gray-200 shadow-sm"
                >
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  {t('demo.liveDemo', 'Live Demo')}
                </motion.span>
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                  {t('features.rewrite.demo.sectionTitle', 'Try AI Rewrite Now')}
                </h2>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                  {t('features.rewrite.demo.sectionDesc', 'Experience the power of AI-driven text transformation. No sign-up required.')}
                </p>
              </div>
              
              <Suspense fallback={
                <div className="h-[600px] bg-bg-secondary rounded-2xl border border-gray-200 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                    <span className="text-sm text-text-muted">{t('common.loading', 'Loading...')}</span>
                  </div>
                </div>
              }>
                <LiveRewriteDemo />
              </Suspense>
              
              {/* Demo Tips */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <Icon name="lightbulb" size="sm" className="icon-emerald" />
                  <span>{t('features.rewrite.demo.tip1', 'Try different samples to see various transformations')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="toggle-right" size="sm" className="icon-emerald" />
                  <span>{t('features.rewrite.demo.tip2', 'Toggle options to customize output')}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Transformation Showcase */}
        <TransformationShowcase t={t} />

        {/* How It Works */}
        <HowItWorksSection t={t} howItWorks={howItWorks} />

        {/* Benefits */}
        <BenefitsSection t={t} benefits={benefits} />

        {/* Use Cases */}
        <UseCasesSection t={t} useCases={useCases} />

        {/* Voice Profile Integration */}
        <VoiceProfileIntegration t={t} />

        {/* Pricing */}
        <Suspense fallback={
          <div className="py-20 flex items-center justify-center">
            <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        }>
          <PricingSection />
        </Suspense>

        {/* FAQ */}
        <FAQSection t={t} faqs={faqs} />

        {/* CTA */}
        <CTASection t={t} />
      </div>
    </>
  )
}

export default Rewrite
