/**
 * VoiceProfile - SEO-optimized Voice Profile feature page
 * Design: DNA/Fingerprint theme - "Your Unique Writing DNA"
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

// Lazy load the live demo
const LiveVoiceProfileDemo = lazy(() => import('@components/demos/LiveVoiceProfileDemo'))

// ============================================================================
// HERO BACKGROUND - DNA/Fingerprint Theme
// ============================================================================

const DNAHelixBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Base gradient - Purple/Indigo tones for uniqueness */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/70 via-violet-50/30 to-white dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-900" />
      
      {/* SVG DNA Helix Visualization - Responsive sizing */}
      <svg 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[700px] md:w-[850px] lg:w-[1000px] xl:w-[1100px] h-[450px] sm:h-[570px] md:h-[700px] lg:h-[820px] xl:h-[900px] opacity-100"
        viewBox="0 0 1100 900"
        fill="none"
      >
        <defs>
          {/* DNA strand gradients */}
          <linearGradient id="dnaStrand1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.5)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0.4)" />
          </linearGradient>
          <linearGradient id="dnaStrand2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(167, 139, 250, 0.3)" />
            <stop offset="50%" stopColor="rgba(196, 181, 253, 0.4)" />
            <stop offset="100%" stopColor="rgba(167, 139, 250, 0.3)" />
          </linearGradient>
          
          {/* Center glow */}
          <radialGradient id="centerDNAGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.2)" />
            <stop offset="50%" stopColor="rgba(99, 102, 241, 0.1)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          
          {/* Fingerprint pattern */}
          <pattern id="fingerprintPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(139, 92, 246, 0.08)" strokeWidth="1" />
            <circle cx="30" cy="30" r="18" fill="none" stroke="rgba(139, 92, 246, 0.06)" strokeWidth="1" />
            <circle cx="30" cy="30" r="11" fill="none" stroke="rgba(139, 92, 246, 0.04)" strokeWidth="1" />
          </pattern>
        </defs>
        
        {/* Fingerprint background pattern - subtle */}
        <rect x="0" y="0" width="1100" height="900" fill="url(#fingerprintPattern)" opacity="0.5" />
        
        {/* DNA Double Helix - Left side */}
        <g transform="translate(200, 100)">
          {/* First strand */}
          <path 
            d="M0 0 Q50 50 0 100 Q-50 150 0 200 Q50 250 0 300 Q-50 350 0 400 Q50 450 0 500 Q-50 550 0 600 Q50 650 0 700" 
            stroke="url(#dnaStrand1)" 
            strokeWidth="3" 
            fill="none"
            strokeLinecap="round"
          />
          {/* Second strand (offset) */}
          <path 
            d="M0 0 Q-50 50 0 100 Q50 150 0 200 Q-50 250 0 300 Q50 350 0 400 Q-50 450 0 500 Q50 550 0 600 Q-50 650 0 700" 
            stroke="url(#dnaStrand2)" 
            strokeWidth="3" 
            fill="none"
            strokeLinecap="round"
          />
          {/* Connecting bars (base pairs) */}
          {[50, 150, 250, 350, 450, 550, 650].map((y, i) => (
            <line 
              key={i}
              x1={i % 2 === 0 ? -35 : 35} 
              y1={y} 
              x2={i % 2 === 0 ? 35 : -35} 
              y2={y} 
              stroke="rgba(139, 92, 246, 0.25)" 
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
          {/* Data points on helix */}
          {[
            [-30, 50], [30, 150], [-30, 250], [30, 350], [-30, 450], [30, 550], [-30, 650]
          ].map(([x, y], i) => (
            <g key={`point-${i}`}>
              <circle cx={x} cy={y} r="6" fill="rgba(139, 92, 246, 0.4)" />
              <circle cx={x} cy={y} r="3" fill="rgba(139, 92, 246, 0.8)" />
            </g>
          ))}
        </g>
        
        {/* DNA Double Helix - Right side (mirrored, smaller) */}
        <g transform="translate(900, 150) scale(0.7)">
          <path 
            d="M0 0 Q40 40 0 80 Q-40 120 0 160 Q40 200 0 240 Q-40 280 0 320 Q40 360 0 400 Q-40 440 0 480 Q40 520 0 560" 
            stroke="url(#dnaStrand1)" 
            strokeWidth="2.5" 
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path 
            d="M0 0 Q-40 40 0 80 Q40 120 0 160 Q-40 200 0 240 Q40 280 0 320 Q-40 360 0 400 Q40 440 0 480 Q-40 520 0 560" 
            stroke="url(#dnaStrand2)" 
            strokeWidth="2.5" 
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
        </g>
        
        {/* Center focal area - Profile visualization hint */}
        <ellipse cx="550" cy="450" rx="200" ry="250" fill="url(#centerDNAGlow)" />
        
        {/* Floating data particles */}
        {[
          [450, 300, 4], [650, 350, 3], [500, 500, 5], [600, 550, 3],
          [480, 400, 4], [620, 420, 3], [530, 480, 4], [570, 380, 3],
          [400, 450, 3], [700, 480, 4]
        ].map(([x, y, r], i) => (
          <g key={`particle-${i}`}>
            <circle cx={x} cy={y} r={r + 4} fill="rgba(139, 92, 246, 0.1)" />
            <circle cx={x} cy={y} r={r} fill="rgba(139, 92, 246, 0.5)" />
          </g>
        ))}
        
        {/* Connecting lines between particles - neural network style */}
        <g stroke="rgba(139, 92, 246, 0.1)" strokeWidth="1">
          <line x1="450" y1="300" x2="500" y2="500" />
          <line x1="650" y1="350" x2="600" y2="550" />
          <line x1="480" y1="400" x2="620" y2="420" />
          <line x1="530" y1="480" x2="570" y2="380" />
          <line x1="500" y1="500" x2="620" y2="420" />
        </g>
        
        {/* Fingerprint center icon hint */}
        <g transform="translate(550, 450)">
          <circle cx="0" cy="0" r="60" fill="none" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="45" fill="none" stroke="rgba(139, 92, 246, 0.12)" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(139, 92, 246, 0.1)" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="15" fill="none" stroke="rgba(139, 92, 246, 0.08)" strokeWidth="1.5" />
        </g>
      </svg>
      
      {/* Ambient glow - purple - Responsive */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[450px] md:w-[550px] lg:w-[650px] xl:w-[700px] h-[350px] sm:h-[450px] md:h-[550px] lg:h-[650px] xl:h-[700px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      
      {/* Secondary glow - left - Responsive */}
      <div 
        className="absolute top-1/3 left-1/5 w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px] h-[200px] sm:h-[270px] md:h-[340px] lg:h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
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
}

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

const StatCard = ({ value, label, suffix = '', prefix = '' }) => {
  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0
  const { count, ref } = useAnimatedCounter(numericValue, 1500)
  
  // Determine display value
  const displayValue = value.includes('+') 
    ? `${prefix}${count}+` 
    : value.includes('%') 
    ? `${count}%`
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
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
        
        <div className="text-center">
          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            {displayValue}
          </div>
          <div className="text-xs sm:text-sm text-text-muted mt-0.5 sm:mt-1 font-medium">{label}</div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// DNA STRAND ANIMATION COMPONENT
// ============================================================================

const DNAStrandIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M4 4C4 4 8 8 12 8C16 8 20 4 20 4" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <path 
      d="M4 12C4 12 8 16 12 16C16 16 20 12 20 12" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <path 
      d="M4 20C4 20 8 24 12 24C16 24 20 20 20 20" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
      opacity="0.5"
    />
    <circle cx="8" cy="6" r="1.5" fill="currentColor" />
    <circle cx="16" cy="6" r="1.5" fill="currentColor" />
    <circle cx="8" cy="14" r="1.5" fill="currentColor" />
    <circle cx="16" cy="14" r="1.5" fill="currentColor" />
  </svg>
)



// ============================================================================
// INTERACTIVE PROFILE BUILDER PREVIEW
// ============================================================================

const ProfileBuilderPreview = ({ t }) => {
  const [activeStep, setActiveStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const steps = [
    {
      icon: 'file-text',
      title: t('features.voiceProfile.preview.step1', 'Add Writing Samples'),
      desc: t('features.voiceProfile.preview.step1Desc', 'Paste emails, posts, or any text you\'ve written'),
      visual: 'samples'
    },
    {
      icon: 'cpu',
      title: t('features.voiceProfile.preview.step2', 'AI Analyzes Patterns'),
      desc: t('features.voiceProfile.preview.step2Desc', 'Deep learning extracts your unique style'),
      visual: 'analyzing'
    },
    {
      icon: 'fingerprint',
      title: t('features.voiceProfile.preview.step3', 'Profile Generated'),
      desc: t('features.voiceProfile.preview.step3Desc', 'Your writing DNA is captured'),
      visual: 'profile'
    }
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setActiveStep((prev) => (prev + 1) % steps.length)
        setIsAnimating(false)
      }, 300)
    }, 4000)
    
    return () => clearInterval(interval)
  }, [steps.length])
  
  return (
    <div className="relative bg-gradient-to-br from-indigo-50 via-violet-50/50 to-white dark:from-slate-800 dark:via-indigo-900/20 dark:to-slate-900 rounded-2xl sm:rounded-3xl border border-indigo-200/50 dark:border-indigo-500/20 overflow-hidden">
      {/* Background decoration - Responsive */}
      <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-gradient-to-bl from-violet-200/40 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 sm:w-36 md:w-48 h-24 sm:h-36 md:h-48 bg-gradient-to-tr from-indigo-200/40 to-transparent rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative p-4 sm:p-6 md:p-8 lg:p-10">
        {/* Steps indicator - Responsive */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-5 sm:mb-6 md:mb-8">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`
                flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300
                ${activeStep === index 
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30' 
                  : 'bg-white dark:bg-slate-700 text-text-secondary hover:bg-indigo-50 dark:hover:bg-slate-600'
                }
              `}
            >
              <Icon name={step.icon} size="sm" className={activeStep === index ? 'icon-white' : ''} />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">{step.title}</span>
              <span className="text-xs sm:text-sm font-medium sm:hidden">{index + 1}</span>
            </button>
          ))}
        </div>
        
        {/* Visual area - Responsive */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="min-h-[250px] sm:min-h-[280px] md:min-h-[300px] flex items-center justify-center"
          >
            {activeStep === 0 && (
              <div className="w-full max-w-md sm:max-w-lg">
                <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl overflow-hidden">
                  <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                    <div className="flex gap-1 sm:gap-1.5">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400" />
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-400" />
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-500 ml-1 sm:ml-2">{t('features.voiceProfile.preview.sampleInput', 'Your Writing Sample')}</span>
                  </div>
                  <div className="p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-3">
                    {[
                      { type: 'email', text: t('features.voiceProfile.preview.sampleEmail', '"Hey team, just wanted to share some thoughts..."') },
                      { type: 'blog', text: t('features.voiceProfile.preview.sampleBlog', '"Here\'s the thing about productivity..."') },
                      { type: 'social', text: t('features.voiceProfile.preview.sampleSocial', '"Honestly, this changed everything for me..."') }
                    ].map((sample, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-md sm:rounded-lg border border-indigo-100 dark:border-indigo-500/20"
                      >
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                          <Icon name={sample.type === 'email' ? 'mail' : sample.type === 'blog' ? 'file-text' : 'message-circle'} size="xs" className="icon-indigo sm:hidden" />
                          <Icon name={sample.type === 'email' ? 'mail' : sample.type === 'blog' ? 'file-text' : 'message-circle'} size="sm" className="icon-indigo hidden sm:block" />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 italic">{sample.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeStep === 1 && (
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto mb-4 sm:mb-5 md:mb-6 relative"
                >
                  <div className="absolute inset-0 rounded-full border-3 sm:border-4 border-indigo-200 dark:border-indigo-800" />
                  <div className="absolute inset-0 rounded-full border-3 sm:border-4 border-transparent border-t-indigo-500 border-r-violet-500" />
                  <div className="absolute inset-3 sm:inset-4 rounded-full border-3 sm:border-4 border-transparent border-b-purple-500 border-l-indigo-400" style={{ animationDirection: 'reverse' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon name="cpu" size="xl" className="icon-indigo sm:hidden" />
                    <Icon name="cpu" size="2xl" className="icon-indigo hidden sm:block" />
                  </div>
                </motion.div>
                <div className="space-y-1.5 sm:space-y-2">
                  {[
                    t('features.voiceProfile.preview.analyzing1', 'Analyzing vocabulary patterns...'),
                    t('features.voiceProfile.preview.analyzing2', 'Detecting sentence structures...'),
                    t('features.voiceProfile.preview.analyzing3', 'Identifying tone markers...')
                  ].map((text, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 2, delay: i * 0.7, repeat: Infinity }}
                      className="text-xs sm:text-sm text-gray-500 dark:text-gray-400"
                    >
                      {text}
                    </motion.p>
                  ))}
                </div>
              </div>
            )}
            
            {activeStep === 2 && (
              <div className="w-full max-w-sm sm:max-w-md">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xl p-4 sm:p-5 md:p-6"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <Icon name="fingerprint" size="xl" className="icon-white sm:hidden" />
                      <Icon name="fingerprint" size="2xl" className="icon-white hidden sm:block" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">{t('features.voiceProfile.preview.yourProfile', 'Your Voice Profile')}</h4>
                      <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">{t('features.voiceProfile.preview.ready', 'Ready to use')}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[
                      { label: t('demo.formality', 'Formality'), value: 65 },
                      { label: t('demo.creativity', 'Creativity'), value: 78 },
                      { label: t('demo.empathy', 'Empathy'), value: 85 },
                      { label: t('demo.directness', 'Directness'), value: 72 }
                    ].map((metric, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="p-2 sm:p-3 bg-gray-50 dark:bg-slate-700 rounded-lg sm:rounded-xl"
                      >
                        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">{metric.label}</div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="flex-1 h-1.5 sm:h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${metric.value}%` }}
                              transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                            />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">{metric.value}%</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2"
                  >
                    {[
                      t('demo.traits.conversational', 'Conversational'),
                      t('demo.traits.empathetic', 'Empathetic'),
                      t('demo.traits.clear', 'Clear')
                    ].map((trait, i) => (
                      <span key={i} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] sm:text-xs font-medium rounded-full">
                        {trait}
                      </span>
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Step description - Responsive */}
        <div className="text-center mt-4 sm:mt-5 md:mt-6">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1.5 sm:mb-2">{steps[activeStep].title}</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{steps[activeStep].desc}</p>
        </div>
      </div>
    </div>
  )
}


// ============================================================================
// MAIN COMPONENT
// ============================================================================

function VoiceProfile() {
  const { t } = useTranslation()
  const [openFaq, setOpenFaq] = useState(null)

  const benefits = [
    { icon: 'fingerprint', title: t('features.voiceProfile.benefits.unique.title', 'Unique Identity'), description: t('features.voiceProfile.benefits.unique.desc', 'Create content that sounds authentically like you, every time') },
    { icon: 'bar-chart-2', title: t('features.voiceProfile.benefits.analysis.title', 'Deep Analysis'), description: t('features.voiceProfile.benefits.analysis.desc', 'Understand your writing patterns, vocabulary, and style preferences') },
    { icon: 'refresh-cw', title: t('features.voiceProfile.benefits.consistent.title', 'Consistent Voice'), description: t('features.voiceProfile.benefits.consistent.desc', 'Maintain your tone across all content, from emails to blog posts') },
    { icon: 'cpu', title: t('features.voiceProfile.benefits.ai.title', 'AI Integration'), description: t('features.voiceProfile.benefits.ai.desc', 'Use your profile with AI Workspace for personalized content generation') },
  ]

  const useCases = [
    { 
      icon: 'user', 
      title: t('features.voiceProfile.useCases.personal.title', 'Personal Branding'), 
      description: t('features.voiceProfile.useCases.personal.desc', 'Build a consistent personal brand across all your content'),
      quote: t('features.voiceProfile.useCases.personal.quote', '"My LinkedIn posts finally sound like me, not a robot."'),
      stat: '10K+',
      statLabel: t('features.voiceProfile.useCases.personal.statLabel', 'creators'),
      color: 'indigo',
      featured: true
    },
    { 
      icon: 'briefcase', 
      title: t('features.voiceProfile.useCases.business.title', 'Business Communication'), 
      description: t('features.voiceProfile.useCases.business.desc', 'Ensure all team communications match your brand voice'),
      quote: t('features.voiceProfile.useCases.business.quote', '"Our brand voice is now consistent across 50+ team members."'),
      stat: '500+',
      statLabel: t('features.voiceProfile.useCases.business.statLabel', 'companies'),
      color: 'violet'
    },
    { 
      icon: 'edit-3', 
      title: t('features.voiceProfile.useCases.content.title', 'Content Creation'), 
      description: t('features.voiceProfile.useCases.content.desc', 'Generate blog posts, articles, and copy that sound like you'),
      quote: t('features.voiceProfile.useCases.content.quote', '"I write 3x faster and it still sounds authentically me."'),
      stat: '1M+',
      statLabel: t('features.voiceProfile.useCases.content.statLabel', 'articles'),
      color: 'purple',
      featured: true
    },
    { 
      icon: 'users', 
      title: t('features.voiceProfile.useCases.team.title', 'Team Collaboration'), 
      description: t('features.voiceProfile.useCases.team.desc', 'Share profiles to maintain consistent voice across your team'),
      quote: t('features.voiceProfile.useCases.team.quote', '"Onboarding new writers is now seamless with shared profiles."'),
      stat: '50K+',
      statLabel: t('features.voiceProfile.useCases.team.statLabel', 'teams'),
      color: 'blue'
    },
  ]

  const howItWorks = [
    { step: 1, title: t('features.voiceProfile.howItWorks.step1.title', 'Upload Samples'), desc: t('features.voiceProfile.howItWorks.step1.desc', 'Provide 3-5 writing samples (emails, posts, articles) that represent your style'), icon: 'upload' },
    { step: 2, title: t('features.voiceProfile.howItWorks.step2.title', 'AI Analysis'), desc: t('features.voiceProfile.howItWorks.step2.desc', 'Our AI analyzes vocabulary, sentence structure, tone, and unique patterns'), icon: 'cpu' },
    { step: 3, title: t('features.voiceProfile.howItWorks.step3.title', 'Profile Created'), desc: t('features.voiceProfile.howItWorks.step3.desc', 'Get a detailed profile with metrics, traits, and signature characteristics'), icon: 'fingerprint' },
    { step: 4, title: t('features.voiceProfile.howItWorks.step4.title', 'Use Everywhere'), desc: t('features.voiceProfile.howItWorks.step4.desc', 'Apply your profile to humanization, AI Workspace, and content generation'), icon: 'zap' },
  ]

  const faqs = [
    { q: t('features.voiceProfile.faq.q1', 'How many writing samples do I need?'), a: t('features.voiceProfile.faq.a1', 'We recommend 3-5 writing samples of at least 200 words each. More samples lead to more accurate profiles. The samples should represent your typical writing style.') },
    { q: t('features.voiceProfile.faq.q2', 'What types of content work best?'), a: t('features.voiceProfile.faq.a2', 'Any content you\'ve written works! Emails, blog posts, social media posts, articles, or even chat messages. The key is that it represents how you naturally write.') },
    { q: t('features.voiceProfile.faq.q3', 'Can I have multiple voice profiles?'), a: t('features.voiceProfile.faq.a3', 'Yes! Pro users can create multiple profiles for different contexts - one for professional communication, another for casual content, etc.') },
    { q: t('features.voiceProfile.faq.q4', 'How accurate is the voice matching?'), a: t('features.voiceProfile.faq.a4', 'Our voice matching achieves 90%+ similarity to your original writing style. The more samples you provide, the more accurate the matching becomes.') },
    { q: t('features.voiceProfile.faq.q5', 'Is my writing data secure?'), a: t('features.voiceProfile.faq.a5', 'Absolutely. Your writing samples are encrypted and used only to create your profile. We never share your data with third parties.') },
  ]

  return (
    <>
      <PageSEO 
        pageKey="voice-profile" 
        faqs={faqs} 
        howToSteps={howItWorks}
      />
      <main className="relative" itemScope itemType="https://schema.org/WebPage">
        {/* ================================================================== */}
        {/* HERO SECTION - DNA/Fingerprint Theme - Responsive */}
        {/* ================================================================== */}
        <section className="relative min-h-[85vh] sm:min-h-[88vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden pt-16 sm:pt-12 md:pt-8 pb-12 sm:pb-14 md:pb-16">
          <DNAHelixBackground />
          
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
                    { label: t('nav.voiceProfile') },
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
                className="relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-500/10 via-violet-500/15 to-purple-500/10 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-semibold rounded-full border border-indigo-200/50 dark:border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(99, 102, 241, 0.1)',
                    '0 0 30px rgba(139, 92, 246, 0.2)',
                    '0 0 20px rgba(99, 102, 241, 0.1)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Icon name="fingerprint" size="sm" className="icon-indigo" />
                {t('features.voiceProfile.badge', 'Your Unique Writing DNA')}
                <motion.span 
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-indigo-500 rounded-full"
                />
              </motion.span>
            </motion.div>
            
            {/* Main Headline - Responsive Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-text-primary mb-4 sm:mb-5 md:mb-6 leading-[1.1] tracking-tight"
            >
              {t('voiceProfile.title', 'Voice Profile')}
            </motion.h1>
            
            {/* Subtitle with gradient - Responsive */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-5 sm:mb-6 md:mb-8"
            >
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                {t('features.voiceProfile.heroHighlight', 'Capture Your Authentic Voice')}
              </span>
            </motion.p>
            
            {/* Description - Responsive */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-text-secondary mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-xl sm:max-w-2xl mx-auto px-2"
            >
              {t('voiceProfile.description', 'Capture your unique writing style and create content that sounds authentically you. Your writing DNA, decoded by AI.')}
            </motion.p>

            {/* Stats Row - Responsive Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 md:mb-10 max-w-xs sm:max-w-xl md:max-w-2xl mx-auto"
            >
              <StatCard value="90%+" label={t('features.voiceProfile.stats.accuracy', 'Voice Match')} />
              <StatCard value="5" label={t('features.voiceProfile.stats.metrics', 'Style Metrics')} suffix="+" />
              <StatCard value="3" label={t('features.voiceProfile.stats.samples', 'Min Samples')} />
              <StatCard value="<30s" label={t('features.voiceProfile.stats.speed', 'Analysis')} />
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
                className="group relative inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold text-sm sm:text-base overflow-hidden shadow-xl shadow-indigo-500/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">{t('features.voiceProfile.cta.create', 'Create Your Profile')}</span>
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
                { icon: 'shield', text: t('features.voiceProfile.trust.secure', 'Data encrypted') },
                { icon: 'zap', text: t('features.voiceProfile.trust.fast', 'Instant analysis') },
                { icon: 'lock', text: t('features.voiceProfile.trust.private', 'Never shared') },
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
              className="flex flex-col items-center gap-2 text-text-muted hover:text-indigo-600 transition-all cursor-pointer"
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


        {/* ================================================================== */}
        {/* INTERACTIVE DEMO SECTION - Responsive */}
        {/* ================================================================== */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 relative">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <motion.div
              id="demo"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
                  {t('features.voiceProfile.demo.title', 'Explore Voice Profiles')}
                </h2>
                <p className="text-base sm:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
                  {t('features.voiceProfile.demo.subtitle', 'See how different writing styles are captured and visualized')}
                </p>
              </div>
              
              <Suspense fallback={
                <div className="h-[400px] sm:h-[500px] md:h-[600px] bg-bg-secondary rounded-xl sm:rounded-2xl border border-gray-200 flex items-center justify-center">
                  <ThreeDotsLoading size="lg" />
                </div>
              }>
                <LiveVoiceProfileDemo />
              </Suspense>
            </motion.div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* PROFILE BUILDER PREVIEW SECTION - Responsive */}
        {/* ================================================================== */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-bg-secondary relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-indigo-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-40 sm:w-56 md:w-72 lg:w-80 h-40 sm:h-56 md:h-72 lg:h-80 bg-violet-500/5 rounded-full blur-3xl" />
            {/* SVG Background Pattern */}
            <img 
              src="/images/backgrounds/bg-wave-5.svg" 
              alt="" 
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-100"
            />
          </div>
          
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative">
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-indigo-600 text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 border border-gray-200 shadow-sm"
              >
                <Icon name="wand-sparkles" size="sm" className="icon-indigo" />
                {t('features.voiceProfile.builderBadge', 'Profile Builder')}
              </motion.span>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
                {t('features.voiceProfile.builderTitle', 'See How It Works')}
              </h2>
              <p className="text-sm sm:text-base text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
                {t('features.voiceProfile.builderDesc', 'Watch your writing transform into a unique voice profile in three simple steps')}
              </p>
            </div>
            
            <ProfileBuilderPreview t={t} />
          </div>
        </section>

        {/* ================================================================== */}
        {/* HOW IT WORKS SECTION - Responsive */}
        {/* ================================================================== */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 relative">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 shadow-lg shadow-indigo-500/20"
              >
                <Icon name="git-branch" size="sm" className="icon-white" />
                {t('features.voiceProfile.processBadge', 'Simple Process')}
              </motion.span>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
                {t('features.voiceProfile.howItWorksTitle', 'How Voice Profile Works')}
              </h2>
              <p className="text-sm sm:text-base text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
                {t('features.voiceProfile.howItWorksDesc', 'Create your unique writing DNA in four simple steps')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {howItWorks.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="p-4 sm:p-5 md:p-6 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
                    {/* Step number */}
                    <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-base sm:text-lg mb-3 sm:mb-4 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                      {item.step}
                    </div>
                    
                    {/* Icon */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
                      <Icon name={item.icon} size="md" className="icon-indigo" />
                    </div>
                    
                    <h3 className="font-semibold text-sm sm:text-base text-text-primary mb-1.5 sm:mb-2">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-text-secondary">{item.desc}</p>
                  </div>
                  
                  {/* Connector arrow */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <Icon name="chevron-right" size="md" className="text-indigo-300" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* BENEFITS SECTION - Responsive */}
        {/* ================================================================== */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-bg-secondary">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
                {t('features.voiceProfile.whyCreate', 'Why Create a Voice Profile?')}
              </h2>
              <p className="text-sm sm:text-base text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
                {t('features.voiceProfile.whyCreateDesc', 'Unlock the power of personalized AI writing')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 sm:p-5 md:p-6 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <Icon name={benefit.icon} size="lg" className="icon-indigo sm:hidden" />
                    <Icon name={benefit.icon} size="xl" className="icon-indigo hidden sm:block" />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg text-text-primary mb-1.5 sm:mb-2">{benefit.title}</h3>
                  <p className="text-sm sm:text-base text-text-secondary">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* USE CASES SECTION - Responsive */}
        {/* ================================================================== */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 shadow-lg shadow-indigo-500/20"
              >
                <Icon name="target" size="sm" className="icon-white" />
                {t('features.voiceProfile.useCasesBadge', 'Use Cases')}
              </motion.span>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
                {t('features.voiceProfile.useCasesTitle', 'Perfect For')}
              </h2>
              <p className="text-sm sm:text-base text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
                {t('features.voiceProfile.useCasesDesc', 'Join thousands of professionals who use Voice Profile to maintain their authentic voice')}
              </p>
            </div>
            
            {/* Bento Grid Layout - Responsive 4 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {useCases.map((useCase, index) => {
                const colorClasses = {
                  indigo: {
                    bg: 'from-indigo-50 to-indigo-100/50 dark:from-indigo-950/50 dark:to-indigo-900/30',
                    border: 'border-indigo-200/50 dark:border-indigo-500/30 hover:border-indigo-300 dark:hover:border-indigo-500/50',
                    icon: 'from-indigo-500 to-indigo-600',
                    iconShadow: 'shadow-indigo-500/30',
                    stat: 'text-indigo-600 dark:text-indigo-400',
                    quote: 'border-indigo-200 dark:border-indigo-500/30'
                  },
                  violet: {
                    bg: 'from-violet-50 to-violet-100/50 dark:from-violet-950/50 dark:to-violet-900/30',
                    border: 'border-violet-200/50 dark:border-violet-500/30 hover:border-violet-300 dark:hover:border-violet-500/50',
                    icon: 'from-violet-500 to-violet-600',
                    iconShadow: 'shadow-violet-500/30',
                    stat: 'text-violet-600 dark:text-violet-400',
                    quote: 'border-violet-200 dark:border-violet-500/30'
                  },
                  purple: {
                    bg: 'from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30',
                    border: 'border-purple-200/50 dark:border-purple-500/30 hover:border-purple-300 dark:hover:border-purple-500/50',
                    icon: 'from-purple-500 to-purple-600',
                    iconShadow: 'shadow-purple-500/30',
                    stat: 'text-purple-600 dark:text-purple-400',
                    quote: 'border-purple-200 dark:border-purple-500/30'
                  },
                  blue: {
                    bg: 'from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30',
                    border: 'border-blue-200/50 dark:border-blue-500/30 hover:border-blue-300 dark:hover:border-blue-500/50',
                    icon: 'from-blue-500 to-blue-600',
                    iconShadow: 'shadow-blue-500/30',
                    stat: 'text-blue-600 dark:text-blue-400',
                    quote: 'border-blue-200 dark:border-blue-500/30'
                  }
                }
                const colors = colorClasses[useCase.color] || colorClasses.indigo
                
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className={`
                      group relative p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border bg-gradient-to-br overflow-hidden transition-all duration-300
                      ${colors.bg} ${colors.border}
                      hover:shadow-xl hover:shadow-black/5
                    `}
                  >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 bg-white/30 dark:bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative">
                      {/* Header with icon and stat - Responsive */}
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <motion.div 
                          className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br ${colors.icon} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg ${colors.iconShadow}`}
                          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon name={useCase.icon} size="md" className="icon-white sm:hidden" />
                          <Icon name={useCase.icon} size="lg" className="icon-white hidden sm:block" />
                        </motion.div>
                        
                        {/* Stat badge - Responsive */}
                        <div className="text-right">
                          <div className={`text-lg sm:text-xl font-bold ${colors.stat}`}>{useCase.stat}</div>
                          <div className="text-[10px] sm:text-xs text-text-muted">{useCase.statLabel}</div>
                        </div>
                      </div>
                      
                      {/* Title & Description - Responsive */}
                      <h3 className="font-bold text-sm sm:text-base text-text-primary mb-1 sm:mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {useCase.title}
                      </h3>
                      <p className="text-text-secondary text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed line-clamp-2">
                        {useCase.description}
                      </p>
                      
                      {/* Quote - Responsive */}
                      <div className={`p-2 sm:p-2.5 bg-white/60 dark:bg-slate-800/60 rounded-md sm:rounded-lg border ${colors.quote}`}>
                        <p className="text-[10px] sm:text-xs text-text-secondary italic line-clamp-2">
                          {useCase.quote}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            
            {/* Bottom CTA - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 sm:mt-10 md:mt-12 text-center"
            >
              <p className="text-sm sm:text-base text-text-muted mb-3 sm:mb-4">
                {t('features.voiceProfile.useCases.cta', 'Ready to find your voice?')}
              </p>
              <a 
                href="https://app.graphosai.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:scale-105"
              >
                {t('features.voiceProfile.useCases.ctaButton', 'Create Your Profile')}
                <Icon name="arrow-right" size="sm" className="icon-white" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* QUALITY SCORE SECTION - Responsive */}
        {/* ================================================================== */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-bg-secondary relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 sm:w-56 md:w-72 lg:w-80 h-40 sm:h-56 md:h-72 lg:h-80 bg-indigo-500/5 rounded-full blur-3xl" />
            {/* SVG Background Pattern */}
            <img 
              src="/images/backgrounds/bg-wave-6.svg" 
              alt="" 
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-100"
            />
          </div>
          
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 shadow-lg shadow-emerald-500/20"
              >
                <Icon name="award" size="sm" className="icon-white" />
                {t('features.voiceProfile.qualityBadge', 'Quality Assurance')}
              </motion.span>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
                {t('features.voiceProfile.qualityTitle', 'Profile Quality Score')}
              </h2>
              <p className="text-sm sm:text-base text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
                {t('features.voiceProfile.qualityDesc', 'Our AI evaluates your writing samples to ensure the best possible voice profile accuracy')}
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
              {/* Quality Score Visual - Responsive */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 p-4 sm:p-6 md:p-8 shadow-xl">
                  {/* Score Circle - Responsive */}
                  <div className="flex items-center justify-center mb-6 sm:mb-8">
                    <div className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-100 dark:text-slate-700" />
                        <motion.circle 
                          cx="100" cy="100" r="85" fill="none" stroke="url(#scoreGradient)" strokeWidth="10" strokeLinecap="round"
                          initial={{ strokeDasharray: '0 534' }}
                          whileInView={{ strokeDasharray: '454 534' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, ease: 'easeOut' }}
                        />
                        <defs>
                          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span 
                          className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-500 to-indigo-500 bg-clip-text text-transparent"
                          initial={{ opacity: 0, scale: 0.5 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 }}
                        >
                          85
                        </motion.span>
                        <span className="text-xs sm:text-sm text-text-muted">{t('features.voiceProfile.quality.outOf', 'out of 100')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Rating Badge - Responsive */}
                  <div className="text-center mb-4 sm:mb-6">
                    <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full font-semibold text-sm sm:text-base">
                      <Icon name="star" size="sm" className="icon-emerald" />
                      {t('features.voiceProfile.quality.excellent', 'Excellent Profile')}
                    </span>
                  </div>
                  
                  {/* Score Breakdown - Responsive */}
                  <div className="space-y-2 sm:space-y-3">
                    {[
                      { label: t('features.voiceProfile.quality.diversity', 'Sample Diversity'), value: 90, color: 'emerald' },
                      { label: t('features.voiceProfile.quality.length', 'Content Length'), value: 85, color: 'indigo' },
                      { label: t('features.voiceProfile.quality.consistency', 'Style Consistency'), value: 80, color: 'violet' }
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-text-secondary">{item.label}</span>
                          <span className="font-medium text-text-primary">{item.value}%</span>
                        </div>
                        <div className="h-1.5 sm:h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.value}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                            className={`h-full rounded-full ${
                              item.color === 'emerald' ? 'bg-emerald-500' :
                              item.color === 'indigo' ? 'bg-indigo-500' : 'bg-violet-500'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
              
              {/* Quality Ratings Explanation - Responsive */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-3 sm:space-y-4"
              >
                <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-4 sm:mb-6">
                  {t('features.voiceProfile.quality.ratingsTitle', 'Quality Ratings')}
                </h3>
                
                {[
                  { rating: 'Excellent', range: '80-100', color: 'emerald', icon: 'trophy', iconClass: 'icon-emerald', desc: t('features.voiceProfile.quality.excellentDesc', 'Highly accurate voice matching with rich style data') },
                  { rating: 'Good', range: '60-79', color: 'blue', icon: 'thumbs-up', iconClass: 'icon-blue', desc: t('features.voiceProfile.quality.goodDesc', 'Reliable profile with good style representation') },
                  { rating: 'Fair', range: '40-59', color: 'amber', icon: 'alert-circle', iconClass: 'icon-amber', desc: t('features.voiceProfile.quality.fairDesc', 'Basic profile, consider adding more samples') },
                  { rating: 'Needs Work', range: '0-39', color: 'red', icon: 'alert-triangle', iconClass: 'icon-red', desc: t('features.voiceProfile.quality.needsWorkDesc', 'Add more diverse samples for better accuracy') }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-slate-700"
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      item.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-500/20' :
                      item.color === 'blue' ? 'bg-blue-100 dark:bg-blue-500/20' :
                      item.color === 'amber' ? 'bg-amber-100 dark:bg-amber-500/20' :
                      'bg-red-100 dark:bg-red-500/20'
                    }`}>
                      <Icon name={item.icon} size="sm" className={`${item.iconClass} sm:hidden`} />
                      <Icon name={item.icon} size="md" className={`${item.iconClass} hidden sm:block`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                        <span className="font-semibold text-sm sm:text-base text-text-primary">{item.rating}</span>
                        <span className="text-[10px] sm:text-xs text-text-muted px-1.5 sm:px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">{item.range}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-text-secondary">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
                
                {/* Tips - Responsive */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg sm:rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                  <h4 className="font-semibold text-sm sm:text-base text-indigo-700 dark:text-indigo-400 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                    <Icon name="lightbulb" size="sm" className="icon-indigo" />
                    {t('features.voiceProfile.quality.tipsTitle', 'Tips for Better Score')}
                  </h4>
                  <ul className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-300 space-y-0.5 sm:space-y-1">
                    <li>• {t('features.voiceProfile.quality.tip1', 'Add 5+ writing samples for best results')}</li>
                    <li>• {t('features.voiceProfile.quality.tip2', 'Include different content types (emails, posts, articles)')}</li>
                    <li>• {t('features.voiceProfile.quality.tip3', 'Use samples with at least 200 words each')}</li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* DETAILED METRICS SHOWCASE SECTION - Responsive */}
        {/* ================================================================== */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 shadow-lg shadow-violet-500/20"
              >
                <Icon name="sliders" size="sm" className="icon-white" />
                {t('features.voiceProfile.metricsBadge', 'Deep Analysis')}
              </motion.span>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
                {t('features.voiceProfile.metricsTitle', 'What We Analyze')}
              </h2>
              <p className="text-sm sm:text-base text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
                {t('features.voiceProfile.metricsDesc', 'Our AI captures every nuance of your writing style through comprehensive analysis')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {[
                {
                  icon: 'type',
                  title: t('features.voiceProfile.metrics.sentenceStarters', 'Sentence Starters'),
                  desc: t('features.voiceProfile.metrics.sentenceStartersDesc', 'How you typically begin sentences - subject-first, adverbs, questions'),
                  examples: [
                    t('features.voiceProfile.metrics.sentenceStartersEx1', '"I think..."'),
                    t('features.voiceProfile.metrics.sentenceStartersEx2', '"However..."'),
                    t('features.voiceProfile.metrics.sentenceStartersEx3', '"The key is..."')
                  ],
                  color: 'indigo'
                },
                {
                  icon: 'link',
                  title: t('features.voiceProfile.metrics.transitions', 'Transition Preferences'),
                  desc: t('features.voiceProfile.metrics.transitionsDesc', 'Your preferred connecting words and phrases'),
                  examples: [
                    t('features.voiceProfile.metrics.transitionsEx1', '"but"'),
                    t('features.voiceProfile.metrics.transitionsEx2', '"therefore"'),
                    t('features.voiceProfile.metrics.transitionsEx3', '"on the other hand"')
                  ],
                  color: 'violet'
                },
                {
                  icon: 'edit-2',
                  title: t('features.voiceProfile.metrics.punctuation', 'Punctuation Style'),
                  desc: t('features.voiceProfile.metrics.punctuationDesc', 'Your unique punctuation patterns and preferences'),
                  examples: [
                    t('features.voiceProfile.metrics.punctuationEx1', 'Em-dashes'),
                    t('features.voiceProfile.metrics.punctuationEx2', 'Semicolons'),
                    t('features.voiceProfile.metrics.punctuationEx3', 'Exclamation marks')
                  ],
                  color: 'purple'
                },
                {
                  icon: 'book-open',
                  title: t('features.voiceProfile.metrics.vocabulary', 'Vocabulary Patterns'),
                  desc: t('features.voiceProfile.metrics.vocabularyDesc', 'Common phrases, preferred words, and expressions'),
                  examples: [
                    t('features.voiceProfile.metrics.vocabularyEx1', '"honestly"'),
                    t('features.voiceProfile.metrics.vocabularyEx2', '"let me explain"'),
                    t('features.voiceProfile.metrics.vocabularyEx3', '"here\'s the thing"')
                  ],
                  color: 'blue'
                },
                {
                  icon: 'align-left',
                  title: t('features.voiceProfile.metrics.sentenceLength', 'Sentence Structure'),
                  desc: t('features.voiceProfile.metrics.sentenceLengthDesc', 'Typical length, complexity, and rhythm of your sentences'),
                  examples: [
                    t('features.voiceProfile.metrics.sentenceLengthEx1', 'Short & punchy'),
                    t('features.voiceProfile.metrics.sentenceLengthEx2', 'Medium flow'),
                    t('features.voiceProfile.metrics.sentenceLengthEx3', 'Complex & detailed')
                  ],
                  color: 'cyan'
                },
                {
                  icon: 'heart',
                  title: t('features.voiceProfile.metrics.tone', 'Emotional Markers'),
                  desc: t('features.voiceProfile.metrics.toneDesc', 'How you express opinions, feelings, and emphasis'),
                  examples: [
                    t('features.voiceProfile.metrics.toneEx1', '"I feel..."'),
                    t('features.voiceProfile.metrics.toneEx2', '"In my opinion..."'),
                    t('features.voiceProfile.metrics.toneEx3', '"Absolutely!"')
                  ],
                  color: 'pink'
                }
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-4 sm:p-5 md:p-6 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-transform group-hover:scale-110 ${
                    metric.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-500/20' :
                    metric.color === 'violet' ? 'bg-violet-100 dark:bg-violet-500/20' :
                    metric.color === 'purple' ? 'bg-purple-100 dark:bg-purple-500/20' :
                    metric.color === 'blue' ? 'bg-blue-100 dark:bg-blue-500/20' :
                    metric.color === 'cyan' ? 'bg-cyan-100 dark:bg-cyan-500/20' :
                    'bg-pink-100 dark:bg-pink-500/20'
                  }`}>
                    <Icon name={metric.icon} size="md" className={`icon-${metric.color} sm:hidden`} />
                    <Icon name={metric.icon} size="lg" className={`icon-${metric.color} hidden sm:block`} />
                  </div>
                  
                  <h3 className="font-semibold text-base sm:text-lg text-text-primary mb-1.5 sm:mb-2">{metric.title}</h3>
                  <p className="text-text-secondary text-xs sm:text-sm mb-3 sm:mb-4">{metric.desc}</p>
                  
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {metric.examples.map((example, i) => (
                      <span key={i} className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-slate-700 text-text-secondary text-[10px] sm:text-xs rounded-md">
                        {example}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* INTEGRATION SECTION - Responsive */}
        {/* ================================================================== */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-bg-secondary relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-indigo-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-40 sm:w-56 md:w-72 lg:w-80 h-40 sm:h-56 md:h-72 lg:h-80 bg-violet-500/5 rounded-full blur-3xl" />
            {/* SVG Background Pattern */}
            <img 
              src="/images/backgrounds/bg-wave-10.svg" 
              alt="" 
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-100"
            />
          </div>
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 shadow-lg shadow-indigo-500/20"
              >
                <Icon name="puzzle" size="sm" className="icon-white" />
                {t('features.voiceProfile.integrationBadge', 'Seamless Integration')}
              </motion.span>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
                {t('features.voiceProfile.integrationTitle', 'Use Your Voice Everywhere')}
              </h2>
              <p className="text-sm sm:text-base text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
                {t('features.voiceProfile.integrationDesc', 'Your Voice Profile integrates seamlessly with all Graphos AI features')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {/* Humanization Integration - Responsive */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-amber-900/20 rounded-xl sm:rounded-2xl border border-amber-200/50 dark:border-amber-500/20 p-4 sm:p-6 md:p-8 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <Icon name="wand-sparkles" size="lg" className="icon-white sm:hidden" />
                      <Icon name="wand-sparkles" size="xl" className="icon-white hidden sm:block" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-text-primary">{t('features.voiceProfile.integration.humanize', 'Humanization')}</h3>
                      <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">{t('features.voiceProfile.integration.humanizeTag', 'Rewrite in your voice')}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6">
                    {t('features.voiceProfile.integration.humanizeDesc', 'Transform AI-generated content to match your unique writing style. The humanizer uses your Voice Profile to ensure every rewrite sounds authentically like you.')}
                  </p>
                  
                  <div className="bg-white dark:bg-slate-700 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-amber-200 dark:border-amber-500/30">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      <Icon name="arrow-right" size="sm" className="icon-amber" />
                      <span className="text-xs sm:text-sm font-medium text-text-primary">{t('features.voiceProfile.integration.example', 'Example')}</span>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <p className="text-gray-500 line-through">{t('features.voiceProfile.examples.before', '"The implementation of sustainable practices is important."')}</p>
                      <p className="text-gray-800 dark:text-gray-200">{t('features.voiceProfile.examples.after', '"Here\'s the thing - going green isn\'t just a trend, it\'s essential."')}</p>
                    </div>
                  </div>
                  
                  <a href="/features/humanization" className="inline-flex items-center gap-2 mt-4 sm:mt-6 text-sm sm:text-base text-amber-600 dark:text-amber-400 font-medium hover:gap-3 transition-all">
                    {t('features.voiceProfile.integration.learnMore', 'Learn more')}
                    <Icon name="arrow-right" size="sm" />
                  </a>
                </div>
              </motion.div>
              
              {/* AI Workspace Integration - Responsive */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-blue-900/20 rounded-xl sm:rounded-2xl border border-blue-200/50 dark:border-blue-500/20 p-4 sm:p-6 md:p-8 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 bg-blue-200/30 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Icon name="message-square" size="lg" className="icon-white sm:hidden" />
                      <Icon name="message-square" size="xl" className="icon-white hidden sm:block" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-text-primary">{t('features.voiceProfile.integration.workspace', 'AI Workspace')}</h3>
                      <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">{t('features.voiceProfile.integration.workspaceTag', 'Chat with your voice')}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6">
                    {t('features.voiceProfile.integration.workspaceDesc', 'Generate content that sounds like you from the start. Select your Voice Profile in AI Workspace and every response will match your writing style.')}
                  </p>
                  
                  <div className="bg-white dark:bg-slate-700 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-blue-500/30">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                        <Icon name="user" size="xs" className="icon-indigo" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-text-primary">{t('features.voiceProfile.integration.prompt', 'Write a product description')}</span>
                    </div>
                    <div className="flex items-start gap-1.5 sm:gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Icon name="Gemini" size="xs" className="icon-white" />
                      </div>
                      <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 italic">{t('features.voiceProfile.examples.aiResponse', '"Okay, here\'s the thing about this product - it\'s honestly a game-changer..."')}</p>
                    </div>
                  </div>
                  
                  <a href="/features/ai-workspace" className="inline-flex items-center gap-2 mt-4 sm:mt-6 text-sm sm:text-base text-blue-600 dark:text-blue-400 font-medium hover:gap-3 transition-all">
                    {t('features.voiceProfile.integration.learnMore', 'Learn more')}
                    <Icon name="arrow-right" size="sm" />
                  </a>
                </div>
              </motion.div>
            </div>
            
            {/* Multi-language Support - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6 sm:mt-8 p-4 sm:p-5 md:p-6 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700"
            >
              <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                  <Icon name="globe" size="xl" className="icon-white sm:hidden" />
                  <Icon name="globe" size="2xl" className="icon-white hidden sm:block" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1.5 sm:mb-2">
                    {t('features.voiceProfile.multiLang.title', '15+ Languages Supported')}
                  </h3>
                  <p className="text-sm sm:text-base text-text-secondary">
                    {t('features.voiceProfile.multiLang.desc', 'Create Voice Profiles in English, Vietnamese, Chinese, Japanese, Korean, Spanish, French, German, and many more. Your writing style is captured accurately regardless of language.')}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                  {[
                    { flag: 'us', name: 'English' },
                    { flag: 'vn', name: 'Vietnamese' },
                    { flag: 'cn', name: 'Chinese' },
                    { flag: 'jp', name: 'Japanese' },
                    { flag: 'kr', name: 'Korean' },
                    { flag: 'es', name: 'Spanish' },
                    { flag: 'fr', name: 'French' },
                    { flag: 'de', name: 'German' }
                  ].map((lang, i) => (
                    <span 
                      key={i} 
                      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-600 shadow-sm flex items-center justify-center"
                      title={lang.name}
                    >
                      <span 
                        className={`fi fis fi-${lang.flag} rounded-full`} 
                        style={{ fontSize: '32px' }} 
                      />
                    </span>
                  ))}
                  <span className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 border-2 border-white dark:border-slate-600 shadow-sm">
                    +7
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* FAQ SECTION - Responsive */}
        {/* ================================================================== */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 pb-20 sm:pb-24 md:pb-32 lg:pb-40 relative overflow-hidden bg-bg-secondary">
          {/* Background decoration - Responsive */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 right-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-indigo-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 sm:w-56 md:w-72 lg:w-80 h-40 sm:h-56 md:h-72 lg:h-80 bg-violet-500/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
            {/* Section Header - Responsive */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-bg-primary text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <Icon name="help-circle" size="sm" className="icon-indigo" />
                {t('features.voiceProfile.faqBadge', 'FAQ')}
              </motion.span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3 sm:mb-4">
                {t('features.voiceProfile.faqTitle', 'Frequently Asked Questions')}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
                {t('features.voiceProfile.faqSubtitle', 'Everything you need to know about Voice Profile')}
              </p>
            </div>

            {/* FAQ List - Using optimized CSS grid animation */}
            <FAQAccordion 
              faqs={faqs} 
              openFaq={openFaq} 
              setOpenFaq={setOpenFaq} 
              accentColor="indigo"
            />

            {/* Contact CTA Card - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 sm:mt-10 md:mt-12 p-5 sm:p-6 md:p-8 bg-bg-primary rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Icon name="message-circle" size="lg" className="icon-indigo sm:hidden" />
                <Icon name="message-circle" size="xl" className="icon-indigo hidden sm:block" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1.5 sm:mb-2">
                {t('faq.stillHaveQuestions', "Still have questions?")}
              </h3>
              <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6 max-w-md mx-auto">
                {t('faq.contactDescription', "Can't find what you're looking for? Our support team is here to help.")}
              </p>
              <motion.a
                href="mailto:Support@graphosai.com"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-indigo-500 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:bg-indigo-600 transition-all shadow-sm hover:shadow-md"
              >
                <Icon name="mail" size="sm" className="icon-white" />
                {t('faq.contactSupport', 'Contact Support')}
              </motion.a>
            </motion.div>
          </div>

          {/* Related Features */}
          <RelatedFeatures currentFeature="voiceProfile" />

          {/* Final CTA - Responsive */}
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mt-12 sm:mt-16 md:mt-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl sm:rounded-3xl md:rounded-[2rem] overflow-hidden"
            >
              {/* Solid Background - Indigo/Violet gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600" />
            
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
                    {t('features.voiceProfile.ctaBadge', 'Capture your unique voice')}
                  </span>
                  <Icon name="fingerprint" size="sm" className="icon-white opacity-80" />
                </motion.div>

                {/* Headline - Responsive */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-5 md:mb-6 leading-tight"
                >
                  {t('features.voiceProfile.ctaTitle', 'Ready to Create Your Voice Profile?')}
                </motion.h2>

                {/* Description - Responsive */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 md:mb-10 max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-2"
                >
                  {t('features.voiceProfile.ctaDesc', 'Join thousands of writers who use Voice Profile to maintain their authentic voice. Start free today.')}
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
                    className="group inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-white text-indigo-600 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg shadow-sm hover:shadow-lg transition-all"
                  >
                    <span>{t('cta.getStartedFree', 'Get Started Free')}</span>
                    <Icon name="arrow-right" size="sm" className="icon-indigo group-hover:translate-x-0.5 transition-transform sm:hidden" />
                    <Icon name="arrow-right" size="md" className="icon-indigo group-hover:translate-x-0.5 transition-transform hidden sm:block" />
                  </motion.a>
                  <motion.a
                    href="https://chrome.google.com/webstore"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg border border-white/[0.15] hover:bg-white/15 hover:border-white/[0.25] transition-all"
                  >
                    <Icon name="chrome" size="sm" className="icon-white sm:hidden" />
                    <Icon name="chrome" size="md" className="icon-white hidden sm:block" />
                    {t('cta.installExtension', 'Chrome Extension')}
                  </motion.a>
                </motion.div>

                {/* Trust indicators - Responsive */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-2 sm:gap-y-3 text-xs sm:text-sm text-white/70"
                >
                  {[
                    { icon: 'gift', text: t('features.voiceProfile.trustIndicator1', 'No credit card required') },
                    { icon: 'clock', text: t('features.voiceProfile.trustIndicator2', 'Setup in 30 seconds') },
                    { icon: 'infinity', text: t('features.voiceProfile.trustIndicator3', 'Credits never expire') }
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
                      <span className="whitespace-nowrap">{item.text}</span>
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
                className="fill-slate-100 dark:fill-slate-800"
              />
              <path 
                d="M0 50C240 75 480 25 720 50C960 75 1200 25 1440 50V80H0V50Z" 
                className="fill-slate-200 dark:fill-slate-900"
              />
            </svg>
          </div>
        </section>
      </main>
    </>
  )
}

export default VoiceProfile






