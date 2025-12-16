/**
 * AIWorkspace - Landing page for AI Workspace feature
 * Design: Neural Network/Brain theme - "Your AI Writing Partner"
 * Enhanced: Dec 2025 - Breakthrough design with neural visualization
 */
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, lazy, Suspense, useEffect, useRef } from 'react'
import SEOHead from '@components/seo/SEOHead'
import StructuredData from '@components/seo/StructuredData'
import Breadcrumb from '@components/common/Breadcrumb'
import Icon from '@components/common/Icon'

// Lazy load components
const LiveWorkspaceDemo = lazy(() => import('@components/demos/LiveWorkspaceDemo'))
const PricingSection = lazy(() => import('@components/sections/PricingSection'))

// ============================================================================
// HERO BACKGROUND - Neural Network/Brain Theme
// ============================================================================

const NeuralNetworkBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-10">
    {/* Base gradient - Cyan/Teal tones for AI/Tech feel */}
    <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/70 via-teal-50/30 to-white dark:from-slate-950 dark:via-cyan-950/20 dark:to-slate-900" />
    
    {/* SVG Neural Network Visualization */}
    <svg 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[900px] opacity-100"
      viewBox="0 0 1100 900"
      fill="none"
    >
      <defs>
        {/* Neural connection gradient */}
        <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(6, 182, 212, 0.3)" />
          <stop offset="50%" stopColor="rgba(20, 184, 166, 0.4)" />
          <stop offset="100%" stopColor="rgba(6, 182, 212, 0.3)" />
        </linearGradient>
        
        {/* Center glow */}
        <radialGradient id="centerNeuralGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(6, 182, 212, 0.2)" />
          <stop offset="50%" stopColor="rgba(20, 184, 166, 0.1)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        
        {/* Node glow */}
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(6, 182, 212, 0.8)" />
          <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
        </radialGradient>
      </defs>
      
      {/* Neural Network Connections - Layer 1 to Layer 2 */}
      <g stroke="url(#neuralGradient)" strokeWidth="1.5" opacity="0.6">
        {/* Input layer connections */}
        <path d="M200 200 Q350 250 400 300" fill="none" />
        <path d="M200 300 Q350 320 400 350" fill="none" />
        <path d="M200 400 Q350 400 400 400" fill="none" />
        <path d="M200 500 Q350 480 400 450" fill="none" />
        <path d="M200 600 Q350 550 400 500" fill="none" />
        <path d="M200 700 Q350 620 400 550" fill="none" />
        
        {/* Hidden layer 1 to Hidden layer 2 */}
        <path d="M400 300 Q500 350 550 380" fill="none" />
        <path d="M400 350 Q500 380 550 400" fill="none" />
        <path d="M400 400 Q500 420 550 450" fill="none" />
        <path d="M400 450 Q500 460 550 480" fill="none" />
        <path d="M400 500 Q500 500 550 520" fill="none" />
        <path d="M400 550 Q500 540 550 550" fill="none" />
        
        {/* Hidden layer 2 to Output */}
        <path d="M550 380 Q650 400 700 420" fill="none" />
        <path d="M550 400 Q650 420 700 440" fill="none" />
        <path d="M550 450 Q650 450 700 460" fill="none" />
        <path d="M550 480 Q650 480 700 480" fill="none" />
        <path d="M550 520 Q650 500 700 500" fill="none" />
        <path d="M550 550 Q650 520 700 520" fill="none" />
        
        {/* Output to final */}
        <path d="M700 420 Q800 440 900 450" fill="none" />
        <path d="M700 460 Q800 460 900 460" fill="none" />
        <path d="M700 500 Q800 480 900 470" fill="none" />
      </g>
      
      {/* Neural Nodes - Input Layer */}
      {[200, 300, 400, 500, 600, 700].map((y, i) => (
        <g key={`input-${i}`}>
          <circle cx="200" cy={y} r="12" fill="rgba(6, 182, 212, 0.15)" />
          <circle cx="200" cy={y} r="6" fill="rgba(6, 182, 212, 0.5)" />
          <circle cx="200" cy={y} r="3" fill="rgba(6, 182, 212, 0.9)" />
        </g>
      ))}
      
      {/* Neural Nodes - Hidden Layer 1 */}
      {[300, 350, 400, 450, 500, 550].map((y, i) => (
        <g key={`hidden1-${i}`}>
          <circle cx="400" cy={y} r="10" fill="rgba(20, 184, 166, 0.15)" />
          <circle cx="400" cy={y} r="5" fill="rgba(20, 184, 166, 0.5)" />
          <circle cx="400" cy={y} r="2.5" fill="rgba(20, 184, 166, 0.9)" />
        </g>
      ))}
      
      {/* Neural Nodes - Hidden Layer 2 */}
      {[380, 400, 450, 480, 520, 550].map((y, i) => (
        <g key={`hidden2-${i}`}>
          <circle cx="550" cy={y} r="10" fill="rgba(6, 182, 212, 0.15)" />
          <circle cx="550" cy={y} r="5" fill="rgba(6, 182, 212, 0.5)" />
          <circle cx="550" cy={y} r="2.5" fill="rgba(6, 182, 212, 0.9)" />
        </g>
      ))}
      
      {/* Neural Nodes - Output Layer */}
      {[420, 460, 500].map((y, i) => (
        <g key={`output-${i}`}>
          <circle cx="700" cy={y} r="14" fill="rgba(20, 184, 166, 0.2)" />
          <circle cx="700" cy={y} r="7" fill="rgba(20, 184, 166, 0.5)" />
          <circle cx="700" cy={y} r="3.5" fill="rgba(20, 184, 166, 0.9)" />
        </g>
      ))}
      
      {/* Final Output Node - Larger */}
      <g>
        <circle cx="900" cy="460" r="20" fill="rgba(6, 182, 212, 0.15)" />
        <circle cx="900" cy="460" r="12" fill="rgba(6, 182, 212, 0.3)" />
        <circle cx="900" cy="460" r="6" fill="rgba(6, 182, 212, 0.7)" />
      </g>
      
      {/* Center focal glow */}
      <ellipse cx="550" cy="450" rx="200" ry="180" fill="url(#centerNeuralGlow)" />
      
      {/* Floating data particles */}
      {[
        [280, 250, 3], [320, 350, 2], [450, 320, 3], [480, 420, 2],
        [520, 500, 3], [620, 380, 2], [650, 480, 3], [780, 440, 2],
        [350, 550, 2], [600, 550, 3]
      ].map(([x, y, r], i) => (
        <g key={`particle-${i}`}>
          <circle cx={x} cy={y} r={r + 3} fill="rgba(6, 182, 212, 0.1)" />
          <circle cx={x} cy={y} r={r} fill="rgba(6, 182, 212, 0.4)" />
        </g>
      ))}
      
      {/* Chat bubble hint in center */}
      <g transform="translate(550, 450)">
        <rect x="-30" y="-20" width="60" height="40" rx="8" fill="rgba(6, 182, 212, 0.1)" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1" />
        <circle cx="-10" cy="0" r="3" fill="rgba(6, 182, 212, 0.4)" />
        <circle cx="0" cy="0" r="3" fill="rgba(6, 182, 212, 0.5)" />
        <circle cx="10" cy="0" r="3" fill="rgba(6, 182, 212, 0.4)" />
      </g>
    </svg>
    
    {/* Ambient glow - cyan */}
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }}
    />
    
    {/* Secondary glow */}
    <div 
      className="absolute top-1/3 right-1/4 w-[300px] h-[400px] pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, rgba(20, 184, 166, 0.08) 0%, transparent 70%)',
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
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
        
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            {displayValue}
          </div>
          <div className="text-sm text-text-muted mt-1 font-medium">{label}</div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// TYPING ANIMATION COMPONENT
// ============================================================================

const TypingAnimation = ({ texts, className }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentFullText = texts[currentTextIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentFullText.length) {
          setDisplayText(currentFullText.slice(0, displayText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setCurrentTextIndex((prev) => (prev + 1) % texts.length)
        }
      }
    }, isDeleting ? 30 : 80)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentTextIndex, texts])

  return (
    <span className={className}>
      {displayText}
      <motion.span 
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        className="inline-block w-0.5 h-6 md:h-7 bg-cyan-500 ml-1 align-middle rounded-full"
      />
    </span>
  )
}


// ============================================================================
// QUICK ACTIONS SHOWCASE SECTION
// ============================================================================

const QuickActionsShowcase = ({ t, quickActions }) => {
  const [hoveredAction, setHoveredAction] = useState(null)
  
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-content-lg mx-auto px-4 sm:px-6 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-semibold rounded-full mb-4 shadow-lg shadow-cyan-500/20"
          >
            <Icon name="zap" size="sm" className="icon-white" />
            {t('features.aiWorkspace.quickActionsBadge', 'One-Click Templates')}
          </motion.span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            {t('features.aiWorkspace.quickActionsTitle', 'Quick Actions')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t('features.aiWorkspace.quickActionsDesc', 'Start writing instantly with pre-built templates for common tasks')}
          </p>
        </div>
        
        {/* Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredAction(index)}
              onMouseLeave={() => setHoveredAction(null)}
              className="group relative"
            >
              <div className={`
                relative p-6 bg-white dark:bg-slate-800 rounded-xl border transition-all duration-300 cursor-pointer
                ${hoveredAction === index 
                  ? 'border-cyan-300 dark:border-cyan-500/50 shadow-lg -translate-y-1' 
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-md'
                }
              `}>
                <div className="relative">
                  {/* Icon */}
                  <div className={`
                    w-11 h-11 rounded-lg flex items-center justify-center mb-4 transition-all duration-300
                    ${hoveredAction === index 
                      ? 'bg-cyan-500 shadow-md' 
                      : 'bg-cyan-50 dark:bg-cyan-500/10'
                    }
                  `}>
                    <Icon 
                      name={action.icon} 
                      size="md" 
                      className={hoveredAction === index ? 'icon-white' : 'icon-cyan'} 
                    />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-semibold text-text-primary mb-1">{action.label}</h3>
                  <p className="text-sm text-text-secondary">{action.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* More actions hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-text-muted">
            {t('features.aiWorkspace.moreActions', '+ 20 more templates available in the app')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================================
// USE CASES MARQUEE SECTION
// ============================================================================

const UseCasesMarqueeSection = ({ t, useCases }) => {
  const [selectedCase, setSelectedCase] = useState(0)
  
  const extendedUseCases = useCases.map((uc, i) => ({
    ...uc,
    color: ['cyan', 'teal', 'emerald', 'sky'][i % 4],
    example: [
      t('features.aiWorkspace.useCases.email.example', '"Draft a follow-up email" → Professional, personalized email in your voice'),
      t('features.aiWorkspace.useCases.content.example', '"Write a blog intro" → Engaging content that sounds like you'),
      t('features.aiWorkspace.useCases.social.example', '"Create a LinkedIn post" → Authentic social content'),
      t('features.aiWorkspace.useCases.business.example', '"Draft a proposal" → Professional documents in your style'),
    ][i % 4],
    stats: [
      { label: t('features.aiWorkspace.useCases.email.stat', 'Time saved'), value: '80%' },
      { label: t('features.aiWorkspace.useCases.content.stat', 'Content quality'), value: '+65%' },
      { label: t('features.aiWorkspace.useCases.social.stat', 'Engagement'), value: '+45%' },
      { label: t('features.aiWorkspace.useCases.business.stat', 'Productivity'), value: '3x' },
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-semibold rounded-full mb-4 shadow-lg shadow-cyan-500/20"
          >
            <Icon name="target" size="sm" className="icon-white" />
            {t('features.aiWorkspace.useCasesBadge', 'Use Cases')}
          </motion.span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            {t('features.aiWorkspace.useCasesTitle', 'Perfect For')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t('features.aiWorkspace.useCasesDesc', 'See how AI Workspace transforms your workflow')}
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
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 border-transparent text-white shadow-xl shadow-cyan-500/30' 
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-cyan-300 text-text-primary'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                    ${isSelected 
                      ? 'bg-white/20' 
                      : 'bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-500/20 dark:to-teal-500/20'
                    }
                  `}>
                    <Icon name={item.icon} size="md" className={isSelected ? 'icon-white' : 'icon-cyan'} />
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
            <div className="relative bg-gradient-to-br from-cyan-50 via-teal-50/50 to-white dark:from-slate-800 dark:via-cyan-900/20 dark:to-slate-900 rounded-3xl border border-cyan-200/50 dark:border-cyan-500/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative p-8 md:p-10">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  {/* Left: Info */}
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <motion.div 
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-500/30"
                      >
                        <Icon name={extendedUseCases[selectedCase].icon} size="2xl" className="icon-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-bold text-text-primary">
                          {extendedUseCases[selectedCase].title}
                        </h3>
                        <p className="text-cyan-600 dark:text-cyan-400 font-medium">
                          {t('features.aiWorkspace.useCases.spotlight', 'Spotlight')}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-text-secondary text-lg leading-relaxed mb-6">
                      {extendedUseCases[selectedCase].description}
                    </p>
                    
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-700 rounded-xl border border-cyan-200 dark:border-cyan-500/30 shadow-sm">
                      <Icon name="trending-up" size="sm" className="icon-cyan" />
                      <span className="text-sm text-text-secondary">{extendedUseCases[selectedCase].stats.label}:</span>
                      <span className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">
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
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">AI Workspace</span>
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
                      className="absolute -top-3 -right-3 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-xs font-bold rounded-full shadow-lg"
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
                          ? 'w-8 bg-gradient-to-r from-cyan-500 to-teal-500' 
                          : 'bg-gray-300 dark:bg-slate-600 hover:bg-cyan-300'
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
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-content-lg mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-cyan-600 text-sm font-semibold rounded-full mb-4 border border-gray-200 shadow-sm"
          >
            <Icon name="layers" size="sm" className="icon-cyan" />
            {t('features.aiWorkspace.howItWorksBadge', 'Simple Process')}
          </motion.span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            {t('features.aiWorkspace.howItWorksTitle', 'How AI Workspace Works')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t('features.aiWorkspace.howItWorksDesc', 'Get personalized AI responses in three simple steps')}
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Steps */}
          <div className="relative">
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-cyan-500 via-teal-500 to-emerald-500 rounded-full hidden md:block" />
            
            <div className="space-y-4">
              {howItWorks.map((item, index) => {
                const colors = [
                  { gradient: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-500/10', border: 'border-cyan-100 dark:border-cyan-500/20' },
                  { gradient: 'from-teal-500 to-teal-600', bg: 'bg-teal-50 dark:bg-teal-500/10', border: 'border-teal-100 dark:border-teal-500/20' },
                  { gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
                ][index % 3]
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="relative flex gap-4 md:gap-5"
                  >
                    {/* Step number */}
                    <div className={`
                      relative z-10 w-12 h-12 rounded-full bg-gradient-to-br ${colors.gradient} 
                      flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0
                    `}>
                      {item.step}
                    </div>
                    
                    {/* Content */}
                    <div className={`flex-1 p-5 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm`}>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                          <Icon name={item.icon} size="sm" className="icon-cyan" />
                        </div>
                        <h3 className="font-semibold text-text-primary text-base">{item.title}</h3>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
          
          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden">
              {/* Window header */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-gray-500 ml-2">AI Workspace</span>
              </div>
              
              {/* Chat preview - matching real app ChatMessage.jsx */}
              <div className="p-6 space-y-4">
                {/* User message - matches real app: bg-bg-secondary border border-border-light rounded-2xl */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-2xl px-4 py-3">
                    <p className="text-sm text-text-primary">{t('features.aiWorkspace.chatExample.user', 'Help me write a professional email declining a meeting invitation')}</p>
                  </div>
                </div>
                
                {/* AI response - matches real app: no background, just text */}
                <div className="flex justify-start">
                  <div className="w-full">
                    <p className="text-sm text-text-primary whitespace-pre-line leading-relaxed">{t('features.aiWorkspace.chatExample.ai', `Hey there,

Thanks so much for thinking of me for the meeting next Tuesday! I really appreciate the invite.

Unfortunately, I've got a conflict that day – my calendar is packed with back-to-back commitments I can't move around.

Would it be possible to catch up another time?

Best,
[Your name]`)}</p>
                    
                    {/* Action buttons - matches real app */}
                    <div className="flex items-center gap-1 mt-3">
                      <button className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      </button>
                      <button className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                          <path d="M16 16h5v5" />
                        </svg>
                      </button>
                      <button className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        </svg>
                      </button>
                      <button className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// BENEFITS SECTION
// ============================================================================

const BenefitsSection = ({ t, benefits }) => {
  return (
    <section className="py-20 lg:py-28 bg-bg-secondary relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-content-lg mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-cyan-600 text-sm font-semibold rounded-full mb-4 border border-gray-200 shadow-sm"
          >
            <Icon name="star" size="sm" className="icon-cyan" />
            {t('features.aiWorkspace.benefitsBadge', 'Key Benefits')}
          </motion.span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            {t('features.aiWorkspace.whyUse', 'Why Use AI Workspace?')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t('features.aiWorkspace.whyUseDesc', 'Experience the future of personalized AI writing assistance')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-500/50 hover:shadow-xl transition-all duration-300">
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-500/20 dark:to-teal-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon name={benefit.icon} size="xl" className="icon-cyan" />
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2 text-lg">{benefit.title}</h3>
                  <p className="text-text-secondary">{benefit.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// COMPARISON TABLE SECTION
// ============================================================================

const ComparisonSection = ({ t, comparisonData }) => {
  // Icons for each feature row
  const featureIcons = ['fingerprint', 'zap', 'brain', 'globe', 'download', 'history', 'shield-check', 'image']
  
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-content-lg mx-auto px-4 sm:px-6 relative">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 text-cyan-600 text-sm font-semibold rounded-full mb-4 border border-cyan-500/20 shadow-sm"
          >
            <Icon name="trophy" size="sm" className="icon-cyan" />
            {t('features.aiWorkspace.comparisonBadge', 'Why Choose Us')}
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t('features.aiWorkspace.comparisonTitle', 'How We Compare')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg mb-6">
            {t('features.aiWorkspace.comparisonDesc', 'See why Graphos AI Workspace stands out from the competition')}
          </p>
          
          {/* Win Counter Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full border border-green-500/20"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span className="text-sm font-bold">
              {t('features.aiWorkspace.comparisonWins', '8 key advantages over competitors')}
            </span>
          </motion.div>
        </div>

        {/* Comparison Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl"
        >
          {/* Table Header */}
          <div className="grid grid-cols-3 bg-bg-secondary border-b border-gray-200 dark:border-gray-700">
            <div className="p-4 md:p-5 text-sm font-semibold text-text-secondary flex items-center gap-2">
              <Icon name="list" size="sm" className="text-text-muted" />
              {t('features.aiWorkspace.comparison.feature', 'Feature')}
            </div>
            {/* Graphos column with highlight */}
            <div className="p-4 md:p-5 text-center border-l border-gray-200 dark:border-gray-700 bg-gradient-to-b from-cyan-500/10 to-cyan-500/5">
              <div className="flex items-center justify-center gap-2">
                <img src="/logo.svg" alt="Graphos AI" className="w-7 h-7 rounded-lg shadow-sm" />
                <span className="font-bold text-cyan-600 text-lg">Graphos AI</span>
              </div>
              <span className="text-xs text-cyan-600/70 mt-0.5 block">{t('features.aiWorkspace.comparison.ourSolution', 'Our Solution')}</span>
            </div>
            <div className="p-4 md:p-5 text-center border-l border-gray-200 dark:border-gray-700">
              <span className="text-text-secondary font-medium block">
                {t('features.aiWorkspace.comparison.others', 'Others')}
              </span>
              <span className="text-xs text-text-muted mt-0.5 block">{t('features.aiWorkspace.comparison.competitors', 'Competitors')}</span>
            </div>
          </div>

          {/* Table Body */}
          {comparisonData.map((row, index) => {
            const isCheckmark = row.us === '✓'
            const isOthersX = row.others === '✗'
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`grid grid-cols-3 group hover:bg-cyan-500/5 transition-all duration-200 ${
                  index !== comparisonData.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                }`}
              >
                {/* Feature Name */}
                <div className="py-4 px-4 md:px-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors shrink-0">
                    <Icon 
                      name={featureIcons[index] || 'check'} 
                      size="sm" 
                      className="text-text-muted group-hover:text-cyan-600 transition-colors" 
                    />
                  </div>
                  <span className="text-sm md:text-base font-medium text-text-primary group-hover:text-cyan-600 transition-colors">
                    {row.feature}
                  </span>
                </div>
                
                {/* Graphos Value */}
                <div className="py-4 px-4 md:px-5 flex items-center justify-center border-l border-gray-100 dark:border-gray-800 bg-gradient-to-b from-cyan-500/[0.03] to-transparent">
                  {isCheckmark ? (
                    <motion.div 
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 shadow-md shadow-cyan-500/30 flex items-center justify-center"
                    >
                      <Icon name="check" size="sm" className="icon-white" />
                    </motion.div>
                  ) : (
                    <span className="text-sm md:text-base font-bold text-cyan-600 bg-cyan-500/10 px-3 py-1.5 rounded-full">
                      {row.us}
                    </span>
                  )}
                </div>
                
                {/* Others Value */}
                <div className="py-4 px-4 md:px-5 flex items-center justify-center border-l border-gray-100 dark:border-gray-800">
                  {isOthersX ? (
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Icon name="x" size="sm" className="text-gray-400" />
                    </div>
                  ) : (
                    <span className="text-sm md:text-base text-text-muted">
                      {row.others}
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}


// ============================================================================
// TESTIMONIALS SECTION
// ============================================================================

const TestimonialsSection = ({ t, testimonials }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])
  
  return (
    <section className="py-20 lg:py-28 bg-bg-secondary relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-content-lg mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-cyan-600 text-sm font-semibold rounded-full mb-4 border border-gray-200 shadow-sm"
          >
            <Icon name="users" size="sm" className="icon-cyan" />
            {t('features.aiWorkspace.testimonialsBadge', 'What Users Say')}
          </motion.span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            {t('features.aiWorkspace.testimonialsTitle', 'Loved by Writers Everywhere')}
          </h2>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-xl border border-gray-200 dark:border-slate-700"
            >
              {/* Quote icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-500/20 dark:to-teal-500/20 rounded-xl flex items-center justify-center mb-6">
                <Icon name="quote" size="lg" className="icon-cyan" />
              </div>
              
              {/* Quote */}
              <p className="text-lg md:text-xl text-text-primary leading-relaxed mb-8 italic">
                "{testimonials[activeIndex].quote}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-4">
                <img 
                  src={testimonials[activeIndex].avatar} 
                  alt={testimonials[activeIndex].author}
                  className="w-14 h-14 rounded-full object-cover border-2 border-cyan-200 dark:border-cyan-500/30"
                />
                <div>
                  <div className="font-semibold text-text-primary">{testimonials[activeIndex].author}</div>
                  <div className="text-sm text-text-secondary">{testimonials[activeIndex].role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`
                  w-2.5 h-2.5 rounded-full transition-all duration-300
                  ${activeIndex === index 
                    ? 'w-8 bg-gradient-to-r from-cyan-500 to-teal-500' 
                    : 'bg-gray-300 dark:bg-slate-600 hover:bg-cyan-300'
                  }
                `}
              />
            ))}
          </div>
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
    <section className="py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-bg-primary text-cyan-600 text-sm font-semibold rounded-full mb-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <Icon name="help-circle" size="sm" className="icon-cyan" />
            {t('features.aiWorkspace.faqBadge', 'FAQ')}
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t('features.aiWorkspace.faqTitle', 'Frequently Asked Questions')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            {t('features.aiWorkspace.faqDesc', 'Everything you need to know about AI Workspace')}
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
                    openFaq === index ? 'bg-gradient-to-br from-cyan-400 to-teal-500 text-white' : 'bg-bg-secondary text-cyan-600 group-hover:bg-cyan-500/10'
                  }`}>
                    <span className="text-sm font-bold">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <span className={`text-base font-semibold transition-colors ${
                    openFaq === index ? 'text-cyan-600' : 'text-text-primary group-hover:text-cyan-600'
                  }`}>
                    {faq.q}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: openFaq === index ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
                >
                  <Icon name="chevron-down" size="sm" className={openFaq === index ? 'text-cyan-600' : 'text-text-muted'} />
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
          <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/10 rounded-xl flex items-center justify-center">
            <Icon name="message-circle" size="xl" className="icon-cyan" />
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-shadow"
          >
            <Icon name="mail" size="sm" className="icon-white" />
            {t('faq.contactUs', 'Contact Support')}
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-cyan-500/5 rounded-full blur-3xl" 
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
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-teal-500 to-cyan-600" />
          
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
                {t('features.aiWorkspace.ctaBadge', 'Start writing in your voice')}
              </span>
              <Icon name="sparkles" size="sm" className="icon-white opacity-80" />
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
            >
              {t('features.aiWorkspace.ctaTitle', 'Start Using AI Workspace')}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              {t('features.aiWorkspace.ctaDesc', 'Chat with AI in your unique writing style. Create authentic content that sounds like you.')}
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
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-cyan-600 rounded-xl font-bold text-lg shadow-sm hover:shadow-lg transition-all"
              >
                <span>{t('cta.getStartedFree', 'Get Started Free')}</span>
                <Icon name="arrow-right" size="md" className="icon-cyan group-hover:translate-x-0.5 transition-transform" />
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
                { icon: 'zap', text: t('cta.instant', 'Instant access') },
                { icon: 'shield', text: t('cta.privacy', 'Privacy first') }
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

function AIWorkspace() {
  const { t } = useTranslation()
  const [openFaq, setOpenFaq] = useState(null)

  // Quick Actions data
  const quickActions = [
    { icon: 'mail', label: t('features.aiWorkspace.actions.email.label', 'Write Email'), description: t('features.aiWorkspace.actions.email.desc', 'Compose professional emails in your voice') },
    { icon: 'file-text', label: t('features.aiWorkspace.actions.blog.label', 'Blog Post'), description: t('features.aiWorkspace.actions.blog.desc', 'Create engaging blog content') },
    { icon: 'briefcase', label: t('features.aiWorkspace.actions.proposal.label', 'Business Proposal'), description: t('features.aiWorkspace.actions.proposal.desc', 'Draft compelling proposals') },
    { icon: 'share-2', label: t('features.aiWorkspace.actions.social.label', 'Social Media'), description: t('features.aiWorkspace.actions.social.desc', 'Craft posts that resonate') },
    { icon: 'message-circle', label: t('features.aiWorkspace.actions.reply.label', 'Quick Reply'), description: t('features.aiWorkspace.actions.reply.desc', 'Generate thoughtful responses') },
    { icon: 'edit-3', label: t('features.aiWorkspace.actions.rewrite.label', 'Rewrite'), description: t('features.aiWorkspace.actions.rewrite.desc', 'Improve existing content') },
  ]

  // Benefits data
  const benefits = [
    { icon: 'message-circle', title: t('features.aiWorkspace.benefits.natural.title', 'Natural Conversations'), description: t('features.aiWorkspace.benefits.natural.desc', 'Chat with AI that understands your style and preferences') },
    { icon: 'fingerprint', title: t('features.aiWorkspace.benefits.voice.title', 'Your Voice'), description: t('features.aiWorkspace.benefits.voice.desc', 'All outputs match your unique writing profile automatically') },
    { icon: 'brain', title: t('features.aiWorkspace.benefits.context.title', 'Context Aware'), description: t('features.aiWorkspace.benefits.context.desc', 'AI remembers your preferences and conversation history') },
    { icon: 'zap', title: t('features.aiWorkspace.benefits.quick.title', 'Quick Actions'), description: t('features.aiWorkspace.benefits.quick.desc', 'One-click templates for common writing tasks') },
  ]

  // Use Cases data
  const useCases = [
    { icon: 'mail', title: t('features.aiWorkspace.useCases.email.title', 'Email Communication'), description: t('features.aiWorkspace.useCases.email.desc', 'Draft, reply, and follow up on emails that sound like you wrote them') },
    { icon: 'file-text', title: t('features.aiWorkspace.useCases.content.title', 'Content Creation'), description: t('features.aiWorkspace.useCases.content.desc', 'Generate blog posts, articles, and marketing copy in your voice') },
    { icon: 'share-2', title: t('features.aiWorkspace.useCases.social.title', 'Social Media'), description: t('features.aiWorkspace.useCases.social.desc', 'Create engaging posts for LinkedIn, Twitter, and more') },
    { icon: 'briefcase', title: t('features.aiWorkspace.useCases.business.title', 'Business Writing'), description: t('features.aiWorkspace.useCases.business.desc', 'Proposals, reports, and presentations that match your brand') },
  ]

  // How It Works data
  const howItWorks = [
    { step: 1, title: t('features.aiWorkspace.howItWorks.step1.title', 'Start a Conversation'), desc: t('features.aiWorkspace.howItWorks.step1.desc', 'Type your request or use a quick action template'), icon: 'message-square' },
    { step: 2, title: t('features.aiWorkspace.howItWorks.step2.title', 'AI Generates Response'), desc: t('features.aiWorkspace.howItWorks.step2.desc', 'Our AI creates content tailored to your voice profile'), icon: 'cpu' },
    { step: 3, title: t('features.aiWorkspace.howItWorks.step3.title', 'Review & Refine'), desc: t('features.aiWorkspace.howItWorks.step3.desc', 'Edit, regenerate, or ask for adjustments'), icon: 'edit-3' },
  ]

  // FAQ data
  const faqs = [
    { q: t('features.aiWorkspace.faq.q1', 'How does AI Workspace use my voice profile?'), a: t('features.aiWorkspace.faq.a1', 'When you chat with AI Workspace, it automatically applies your voice profile to all generated content. This means every email, post, or article will sound like you wrote it.') },
    { q: t('features.aiWorkspace.faq.q2', 'Can I use it without a voice profile?'), a: t('features.aiWorkspace.faq.a2', 'Yes! You can use AI Workspace without a voice profile, and it will generate content in a neutral, professional tone. However, creating a voice profile significantly improves personalization.') },
    { q: t('features.aiWorkspace.faq.q3', 'What types of content can I create?'), a: t('features.aiWorkspace.faq.a3', 'AI Workspace can help with emails, blog posts, social media content, business proposals, product descriptions, marketing copy, and much more. Use quick actions or describe what you need.') },
    { q: t('features.aiWorkspace.faq.q4', 'Is my conversation history saved?'), a: t('features.aiWorkspace.faq.a4', 'Your conversation history is saved locally and can be accessed across sessions. You can clear it anytime from settings. We prioritize your privacy.') },
    { q: t('features.aiWorkspace.faq.q5', 'Can I edit the generated content?'), a: t('features.aiWorkspace.faq.a5', 'Absolutely! All generated content is fully editable. You can refine, expand, or ask the AI to regenerate with different parameters.') },
    { q: t('features.aiWorkspace.faq.q6', 'What AI models are available?'), a: t('features.aiWorkspace.faq.a6', 'AI Workspace uses advanced Gemini models including Gemini 2.5 Flash for fast responses and Gemini 2.5 Pro for complex tasks. You can switch models based on your needs.') },
    { q: t('features.aiWorkspace.faq.q7', 'How many credits does it cost?'), a: t('features.aiWorkspace.faq.a7', 'Credits are calculated based on input and output tokens. Shorter conversations cost less. You can see the credit cost for each message in real-time.') },
  ]

  // Comparison data
  const comparisonData = [
    { feature: t('features.aiWorkspace.comparison.voiceMatch', 'Voice Profile Integration'), us: '✓', others: '✗' },
    { feature: t('features.aiWorkspace.comparison.quickActions', 'Quick Action Templates'), us: '20+', others: '5-10' },
    { feature: t('features.aiWorkspace.comparison.context', 'Context Memory'), us: '✓', others: t('features.aiWorkspace.comparison.limited', 'Limited') },
    { feature: t('features.aiWorkspace.comparison.languages', 'Languages'), us: '15+', others: '3-5' },
    { feature: t('features.aiWorkspace.comparison.export', 'Export Options'), us: '✓', others: '✗' },
    { feature: t('features.aiWorkspace.comparison.history', 'Conversation History'), us: '✓', others: '✗' },
    { feature: t('features.aiWorkspace.comparison.humanize', 'Anti-AI Detection'), us: '✓', others: '✗' },
    { feature: t('features.aiWorkspace.comparison.multimodal', 'Image Understanding'), us: '✓', others: '✗' },
  ]

  // Testimonials data
  const testimonials = [
    {
      quote: t('features.aiWorkspace.testimonials.writer.quote', 'AI Workspace has completely transformed how I write. The voice profile feature means every email sounds exactly like me, even when AI helps draft it.'),
      author: t('features.aiWorkspace.testimonials.writer.author', 'Sarah Chen'),
      role: t('features.aiWorkspace.testimonials.writer.role', 'Content Writer'),
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face'
    },
    {
      quote: t('features.aiWorkspace.testimonials.marketer.quote', 'The quick actions save me hours every week. I can draft social posts, emails, and blog intros in minutes instead of hours.'),
      author: t('features.aiWorkspace.testimonials.marketer.author', 'Michael Torres'),
      role: t('features.aiWorkspace.testimonials.marketer.role', 'Marketing Manager'),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      quote: t('features.aiWorkspace.testimonials.entrepreneur.quote', 'As a non-native English speaker, AI Workspace helps me communicate professionally while keeping my authentic voice. Game changer!'),
      author: t('features.aiWorkspace.testimonials.entrepreneur.author', 'Emma Williams'),
      role: t('features.aiWorkspace.testimonials.entrepreneur.role', 'Entrepreneur'),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
    }
  ]

  // Typing animation texts
  const typingTexts = [
    t('features.aiWorkspace.typing.email', 'Write emails in your voice'),
    t('features.aiWorkspace.typing.blog', 'Create blog posts instantly'),
    t('features.aiWorkspace.typing.social', 'Craft social media content'),
    t('features.aiWorkspace.typing.business', 'Draft business proposals'),
  ]

  return (
    <>
      <SEOHead
        title={t('aiWorkspace.meta.title', 'AI Workspace - Chat with AI in Your Voice | Graphos AI')}
        description={t('aiWorkspace.meta.description', 'AI Workspace lets you chat with AI that writes in your unique voice. Create emails, blog posts, social content, and more with personalized AI assistance.')}
        keywords={['AI workspace', 'AI chat', 'writing assistant', 'AI writing', 'content generation', 'AI copywriter', 'voice profile', 'personalized AI']}
      />
      <StructuredData
        type="SoftwareApplication"
        data={{
          name: 'Graphos AI Workspace',
          description: t('aiWorkspace.meta.description'),
          url: 'https://graphosai.com/features/ai-workspace',
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
            acceptedAnswer: { '@type': 'Answer', text: faq.a }
          }))
        }}
      />

      <div className="relative">
        {/* Hero Section */}
        <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-8 pb-16">
          <NeuralNetworkBackground />
          
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
                { label: t('nav.aiWorkspace') },
              ]}
            />
          </motion.div>
          
          <div className="max-w-content-lg mx-auto px-4 sm:px-6 text-center relative z-10">
            {/* Animated Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="mb-8"
            >
              <motion.span 
                className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500/10 via-cyan-500/15 to-teal-500/10 text-cyan-600 dark:text-cyan-400 text-sm font-semibold rounded-full border border-cyan-500/20 shadow-lg shadow-cyan-500/10"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(6, 182, 212, 0.1)',
                    '0 0 30px rgba(6, 182, 212, 0.2)',
                    '0 0 20px rgba(6, 182, 212, 0.1)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
                </span>
                {t('features.aiWorkspace.badge', 'AI That Writes Like You')}
              </motion.span>
            </motion.div>
            
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-[1.1] tracking-tight"
            >
              {t('aiWorkspace.title', 'AI Workspace')}
            </motion.h1>
            
            {/* Typing Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="h-12 mb-6"
            >
              <TypingAnimation 
                texts={typingTexts} 
                className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent"
              />
            </motion.div>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary mb-10 leading-relaxed max-w-2xl mx-auto"
            >
              {t('aiWorkspace.description', 'Chat with AI in your unique writing style. Create emails, blog posts, social content, and more with personalized AI assistance.')}
            </motion.p>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 max-w-2xl mx-auto"
            >
              <StatCard value="20+" label={t('features.aiWorkspace.stats.templates', 'Templates')} />
              <StatCard value="15+" label={t('features.aiWorkspace.stats.languages', 'Languages')} />
              <StatCard value="3x" label={t('features.aiWorkspace.stats.faster', 'Faster')} />
              <StatCard value="90%" label={t('features.aiWorkspace.stats.voiceMatch', 'Voice Match')} />
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
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-semibold text-base overflow-hidden shadow-xl shadow-cyan-500/30"
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
                { icon: 'credit-card', text: t('features.aiWorkspace.trust.noCard', 'No credit card required') },
                { icon: 'zap', text: t('features.aiWorkspace.trust.instant', 'Instant access') },
                { icon: 'shield', text: t('features.aiWorkspace.trust.privacy', 'Privacy first') },
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
              className="flex flex-col items-center gap-2 text-text-muted hover:text-cyan-500 transition-all cursor-pointer"
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
              <div className="text-center mb-10">
                <motion.span 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  whileInView={{ opacity: 1, scale: 1 }} 
                  viewport={{ once: true }} 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-success text-sm font-semibold rounded-full mb-4 border border-gray-200 shadow-sm"
                >
                  <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  {t('demo.liveDemo', 'Live Demo')}
                </motion.span>
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                  {t('features.aiWorkspace.demo.title', 'Try AI Workspace Now')}
                </h2>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                  {t('features.aiWorkspace.demo.subtitle', 'Experience personalized AI writing assistance. No sign-up required.')}
                </p>
              </div>
              
              <Suspense fallback={
                <div className="h-[600px] bg-bg-secondary rounded-2xl border border-gray-200 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    <span className="text-sm text-text-muted">{t('common.loading', 'Loading...')}</span>
                  </div>
                </div>
              }>
                <LiveWorkspaceDemo />
              </Suspense>
            </motion.div>
          </div>
        </section>

        {/* Quick Actions Section */}
        <QuickActionsShowcase t={t} quickActions={quickActions} />

        {/* How It Works Section */}
        <HowItWorksSection t={t} howItWorks={howItWorks} />

        {/* Use Cases Section */}
        <UseCasesMarqueeSection t={t} useCases={useCases} />

        {/* Benefits Section */}
        <BenefitsSection t={t} benefits={benefits} />

        {/* Comparison Section */}
        <ComparisonSection t={t} comparisonData={comparisonData} />

        {/* Testimonials Section */}
        <TestimonialsSection t={t} testimonials={testimonials} />

        {/* Pricing Section */}
        <Suspense fallback={
          <div className="py-20 flex items-center justify-center">
            <div className="w-10 h-10 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        }>
          <PricingSection />
        </Suspense>

        {/* FAQ Section */}
        <FAQSection t={t} faqs={faqs} openFaq={openFaq} setOpenFaq={setOpenFaq} />

        {/* CTA Section */}
        <CTASection t={t} />
      </div>
    </>
  )
}

export default AIWorkspace
