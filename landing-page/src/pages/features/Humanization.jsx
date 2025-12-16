import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, lazy, Suspense, useEffect, useRef } from 'react'
import SEOHead from '@components/seo/SEOHead'
import StructuredData from '@components/seo/StructuredData'
import Breadcrumb from '@components/common/Breadcrumb'
import Icon from '@components/common/Icon'

// Lazy load the live demo
const LiveHumanizationDemo = lazy(() => import('@components/demos/LiveHumanizationDemo'))

// ============================================================================
// HERO BACKGROUND - Transformation/Metamorphosis Theme
// ============================================================================

// Animated DNA-like transformation helix
const TransformationBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-10">
    {/* Base gradient - warm tones for humanization */}
    <div className="absolute inset-0 bg-gradient-to-b from-amber-100/80 via-orange-50/40 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900" />
    
    {/* SVG Transformation Visual */}
    <svg 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px] opacity-100"
      viewBox="0 0 1000 800"
      fill="none"
    >
      <defs>
        {/* Gradient for AI side (cold/mechanical) */}
        <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(148, 163, 184, 0.4)" />
          <stop offset="100%" stopColor="rgba(148, 163, 184, 0.1)" />
        </linearGradient>
        
        {/* Gradient for Human side (warm/organic) */}
        <linearGradient id="humanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(251, 191, 36, 0.1)" />
          <stop offset="100%" stopColor="rgba(251, 146, 60, 0.3)" />
        </linearGradient>
        
        {/* Center transformation glow */}
        <radialGradient id="transformGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(251, 191, 36, 0.25)" />
          <stop offset="50%" stopColor="rgba(251, 146, 60, 0.1)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        
        {/* Particle glow */}
        <radialGradient id="particleGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(251, 191, 36, 0.8)" />
          <stop offset="100%" stopColor="rgba(251, 191, 36, 0)" />
        </radialGradient>
      </defs>
      
      {/* Left side - AI/Mechanical patterns (grid-like) */}
      <g opacity="0.5">
        {/* Horizontal lines - rigid */}
        {[150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650].map((y, i) => (
          <line 
            key={`h-${i}`}
            x1="50" 
            y1={y} 
            x2="400" 
            y2={y} 
            stroke="rgba(148, 163, 184, 0.2)" 
            strokeWidth="1"
            strokeDasharray={i % 2 === 0 ? "none" : "4 4"}
          />
        ))}
        {/* Vertical lines - rigid */}
        {[100, 150, 200, 250, 300, 350].map((x, i) => (
          <line 
            key={`v-${i}`}
            x1={x} 
            y1="150" 
            x2={x} 
            y2="650" 
            stroke="rgba(148, 163, 184, 0.15)" 
            strokeWidth="1"
          />
        ))}
        {/* Binary-like dots */}
        {[
          [120, 180], [180, 220], [140, 280], [200, 320], [160, 380],
          [220, 420], [140, 480], [180, 540], [200, 580], [160, 620]
        ].map(([x, y], i) => (
          <circle key={`dot-${i}`} cx={x} cy={y} r="3" fill="rgba(148, 163, 184, 0.3)" />
        ))}
      </g>
      
      {/* Center transformation zone */}
      <ellipse cx="500" cy="400" rx="180" ry="280" fill="url(#transformGlow)" />
      
      {/* Transformation flow lines - morphing from straight to organic */}
      <g>
        {/* Flow paths from AI to Human */}
        <path 
          d="M350 200 Q450 200 500 250 Q550 300 650 320" 
          stroke="rgba(251, 191, 36, 0.3)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M350 300 Q450 310 500 350 Q550 390 650 380" 
          stroke="rgba(251, 191, 36, 0.25)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M350 400 Q450 400 500 400 Q550 400 650 420" 
          stroke="rgba(251, 191, 36, 0.35)" 
          strokeWidth="2.5" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M350 500 Q450 490 500 450 Q550 410 650 460" 
          stroke="rgba(251, 191, 36, 0.25)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M350 600 Q450 600 500 550 Q550 500 650 520" 
          stroke="rgba(251, 191, 36, 0.3)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
      </g>
      
      {/* Right side - Human/Organic patterns (flowing curves) */}
      <g opacity="0.6">
        {/* Organic flowing curves */}
        <path 
          d="M600 150 Q700 200 750 180 Q800 160 850 200 Q900 240 950 220" 
          stroke="rgba(251, 146, 60, 0.25)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M620 250 Q680 300 720 280 Q780 260 820 300 Q880 340 920 320" 
          stroke="rgba(251, 146, 60, 0.2)" 
          strokeWidth="1.5" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M640 350 Q700 380 760 360 Q820 340 860 380 Q900 420 940 400" 
          stroke="rgba(251, 146, 60, 0.25)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M620 450 Q680 490 740 470 Q800 450 840 490 Q880 530 920 510" 
          stroke="rgba(251, 146, 60, 0.2)" 
          strokeWidth="1.5" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M600 550 Q660 590 720 570 Q780 550 820 590 Q860 630 900 610" 
          stroke="rgba(251, 146, 60, 0.25)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M620 650 Q680 680 740 660 Q800 640 840 680 Q880 720 920 700" 
          stroke="rgba(251, 146, 60, 0.2)" 
          strokeWidth="1.5" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Organic dots - scattered naturally */}
        {[
          [680, 220], [750, 310], [820, 260], [700, 400], [780, 380],
          [850, 450], [720, 520], [800, 560], [860, 620], [740, 680]
        ].map(([x, y], i) => (
          <circle 
            key={`organic-${i}`} 
            cx={x} 
            cy={y} 
            r={2 + Math.random() * 2} 
            fill="rgba(251, 146, 60, 0.4)" 
          />
        ))}
      </g>
      
      {/* Center transformation particles */}
      <g>
        {[
          [480, 350, 4], [520, 380, 3], [490, 420, 5], [510, 450, 3],
          [470, 400, 4], [530, 360, 3], [500, 480, 4], [485, 320, 3]
        ].map(([x, y, r], i) => (
          <circle 
            key={`particle-${i}`} 
            cx={x} 
            cy={y} 
            r={r} 
            fill="url(#particleGlow)"
          />
        ))}
      </g>
      
      {/* Arrow indicator in center */}
      <g transform="translate(500, 400)">
        <path 
          d="M-30 0 L20 0 M10 -10 L20 0 L10 10" 
          stroke="rgba(251, 146, 60, 0.5)" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
    
    {/* Ambient glow - warm */}
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.08) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }}
    />
    
    {/* Secondary glow - right side */}
    <div 
      className="absolute top-1/3 right-1/4 w-[300px] h-[300px] pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, rgba(251, 146, 60, 0.1) 0%, transparent 70%)',
        filter: 'blur(40px)',
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
// USE CASES MARQUEE + SPOTLIGHT SECTION
// ============================================================================

const UseCasesMarqueeSection = ({ t, useCases }) => {
  const [selectedCase, setSelectedCase] = useState(0)
  
  // Extended use cases with more details for spotlight
  const extendedUseCases = [
    { 
      ...useCases[0], 
      color: 'amber',
      example: t('features.humanization.useCases.content.example', '"The implementation of sustainable practices..." → "You know what\'s been on my mind lately? How companies are finally..."'),
      stats: { label: t('features.humanization.useCases.content.stat', 'Blog engagement'), value: '+65%' }
    },
    { 
      ...useCases[1], 
      color: 'orange',
      example: t('features.humanization.useCases.email.example', '"I am writing to inform you..." → "Hey! Just wanted to reach out about..."'),
      stats: { label: t('features.humanization.useCases.email.stat', 'Open rate increase'), value: '+40%' }
    },
    { 
      ...useCases[2], 
      color: 'yellow',
      example: t('features.humanization.useCases.academic.example', '"Research indicates that..." → "Studies have consistently shown, and here\'s what\'s fascinating..."'),
      stats: { label: t('features.humanization.useCases.academic.stat', 'Readability score'), value: '+35%' }
    },
    { 
      ...useCases[3], 
      color: 'rose',
      example: t('features.humanization.useCases.social.example', '"This product offers numerous benefits..." → "Okay but can we talk about how amazing this is? 🔥"'),
      stats: { label: t('features.humanization.useCases.social.stat', 'Engagement boost'), value: '+80%' }
    },
  ]
  
  // Duplicate for seamless loop
  const marqueeItems = [...extendedUseCases, ...extendedUseCases, ...extendedUseCases]
  
  return (
    <section className="py-20 lg:py-28 overflow-hidden">
      <div className="max-w-content-lg mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full mb-4 shadow-lg shadow-amber-500/20"
          >
            <Icon name="target" size="sm" className="icon-white" />
            {t('features.humanization.useCasesBadge', 'Use Cases')}
          </motion.span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            {t('features.humanization.useCasesTitle', 'Perfect For')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t('features.humanization.useCasesDesc', 'Click any use case to see how humanization transforms your content')}
          </p>
        </div>
        
        {/* Marquee Container */}
        <div 
          className="relative mb-10"
        >
          {/* Marquee Track */}
          <motion.div 
            className="flex gap-4"
            animate={{ 
              x: [0, '-33.33%'] 
            }}
            transition={{ 
              x: {
                duration: 25,
                repeat: Infinity,
                ease: 'linear',
              }
            }}
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
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-transparent text-white shadow-xl shadow-amber-500/30' 
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-amber-300 text-text-primary'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                    ${isSelected 
                      ? 'bg-white/20' 
                      : 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/20'
                    }
                  `}>
                    <Icon 
                      name={item.icon} 
                      size="md" 
                      className={isSelected ? 'icon-white' : 'icon-amber'} 
                    />
                  </div>
                  <span className="font-semibold whitespace-nowrap">{item.title}</span>
                  

                </motion.button>
              )
            })}
          </motion.div>
        </div>
        
        {/* Spotlight Showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCase}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-amber-100/90 via-orange-100/60 to-amber-50/80 dark:from-slate-800 dark:via-slate-800/50 dark:to-slate-900 rounded-3xl border border-amber-300/60 dark:border-amber-500/20 overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-300/40 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-300/40 to-transparent rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative p-8 md:p-10">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  {/* Left: Info */}
                  <div>
                    {/* Icon & Title */}
                    <div className="flex items-center gap-4 mb-6">
                      <motion.div 
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30"
                      >
                        <Icon name={extendedUseCases[selectedCase].icon} size="2xl" className="icon-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-bold text-text-primary">
                          {extendedUseCases[selectedCase].title}
                        </h3>
                        <p className="text-amber-600 dark:text-amber-400 font-medium">
                          {t('features.humanization.useCases.spotlight', 'Spotlight')}
                        </p>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-text-secondary text-lg leading-relaxed mb-6">
                      {extendedUseCases[selectedCase].description}
                    </p>
                    
                    {/* Stats badge */}
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-700 rounded-xl border border-amber-200 dark:border-amber-500/30 shadow-sm">
                      <Icon name="trending-up" size="sm" className="icon-amber" />
                      <span className="text-sm text-text-secondary">{extendedUseCases[selectedCase].stats.label}:</span>
                      <span className="text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                        {extendedUseCases[selectedCase].stats.value}
                      </span>
                    </div>
                  </div>
                  
                  {/* Right: Example transformation */}
                  <div className="relative">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl overflow-hidden">
                      {/* Window header */}
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-400" />
                          <div className="w-3 h-3 rounded-full bg-yellow-400" />
                          <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {t('features.humanization.useCases.preview', 'Transformation Preview')}
                        </span>
                      </div>
                      
                      {/* Content */}
                      <div className="p-5">
                        {/* Before */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded bg-gray-100 dark:bg-slate-600 flex items-center justify-center">
                              <Icon name="cpu" size="xs" color="gray-medium" />
                            </div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">AI Generated</span>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-through opacity-70">
                              {extendedUseCases[selectedCase].example.split('→')[0].replace(/"/g, '').trim()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Arrow */}
                        <div className="flex justify-center my-3">
                          <motion.div
                            animate={{ y: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
                          >
                            <Icon name="arrow-down" size="sm" className="icon-white" />
                          </motion.div>
                        </div>
                        
                        {/* After */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                              <Icon name="sparkles" size="xs" className="icon-amber" />
                            </div>
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Humanized</span>
                          </div>
                          <div className="p-3 bg-gradient-to-r from-amber-100/90 to-orange-100/80 dark:from-amber-500/15 dark:to-orange-500/15 rounded-lg border border-amber-300/70 dark:border-amber-500/30">
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              {extendedUseCases[selectedCase].example.split('→')[1]?.replace(/"/g, '').trim() || ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="absolute -top-3 -right-3 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg"
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
                          ? 'w-8 bg-gradient-to-r from-amber-500 to-orange-500' 
                          : 'bg-gray-300 dark:bg-slate-600 hover:bg-amber-300'
                        }
                      `}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <a 
            href="#demo" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
          >
            <Icon name="wand-sparkles" size="sm" className="icon-white" />
            <span>{t('features.humanization.tryYourContent', 'Try With Your Content')}</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================================
// SPARKLE PARTICLES COMPONENT
// ============================================================================

const SparkleParticles = ({ isActive }) => {
  if (!isActive) return null
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2"
          initial={{ 
            opacity: 0,
            scale: 0,
            x: '50%',
            y: '50%'
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: `${20 + Math.random() * 60}%`,
            y: `${20 + Math.random() * 60}%`
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.1,
            ease: 'easeOut'
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path 
              d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z" 
              fill="url(#sparkleGradient)"
            />
            <defs>
              <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================================================
// REAL TRANSFORMATIONS SECTION - Interactive Word Morphing Design
// ============================================================================

const RealTransformationsSection = ({ t, beforeAfterExamples }) => {
  const [activeExample, setActiveExample] = useState(0)
  const [isTransforming, setIsTransforming] = useState(false)
  const [showAfter, setShowAfter] = useState(false)
  const [highlightedWords, setHighlightedWords] = useState([])
  const [morphProgress, setMorphProgress] = useState(0)
  
  // Extended examples with word-level transformations
  const transformationExamples = [
    {
      style: beforeAfterExamples[0]?.style || 'Casual & Conversational',
      icon: 'message-circle',
      color: 'amber',
      before: beforeAfterExamples[0]?.before || 'The implementation of sustainable practices in corporate environments has become increasingly important in recent years.',
      after: beforeAfterExamples[0]?.after || "You know what's been on my mind lately? How companies are finally getting serious about going green.",
      // Key phrase transformations to highlight
      transforms: [
        { from: 'The implementation of', to: "You know what's been on my mind?" },
        { from: 'sustainable practices', to: 'going green' },
        { from: 'corporate environments', to: 'companies' },
        { from: 'increasingly important', to: 'getting serious' },
      ]
    },
    {
      style: beforeAfterExamples[1]?.style || 'Personal & Authentic',
      icon: 'heart',
      color: 'rose',
      before: beforeAfterExamples[1]?.before || 'Research indicates that regular physical exercise contributes significantly to mental health improvement.',
      after: beforeAfterExamples[1]?.after || "Here's something I've learned: working out really does help with stress. My anxiety has gotten so much better since I started moving more.",
      transforms: [
        { from: 'Research indicates', to: "Here's something I've learned" },
        { from: 'regular physical exercise', to: 'working out' },
        { from: 'contributes significantly', to: 'really does help' },
        { from: 'mental health improvement', to: 'stress & anxiety' },
      ]
    },
    {
      style: 'Professional & Engaging',
      icon: 'briefcase',
      color: 'blue',
      before: 'Artificial intelligence technology presents both opportunities and challenges for the modern workforce.',
      after: "AI is changing everything about how we work, and honestly? It's both exciting and a little scary.",
      transforms: [
        { from: 'Artificial intelligence technology', to: 'AI' },
        { from: 'presents both', to: "It's both" },
        { from: 'opportunities and challenges', to: 'exciting and scary' },
        { from: 'modern workforce', to: 'how we work' },
      ]
    }
  ]
  
  const currentExample = transformationExamples[activeExample]
  
  // Handle transformation animation with smoother timing
  const handleTransform = () => {
    if (isTransforming) return
    
    setIsTransforming(true)
    setShowAfter(false)
    setMorphProgress(0)
    setHighlightedWords([])
    
    // Animate through each transformation with staggered timing
    const transforms = currentExample.transforms
    let currentIndex = 0
    
    const animateTransform = () => {
      if (currentIndex < transforms.length) {
        setHighlightedWords(prev => [...prev, currentIndex])
        // Smooth progress with easing feel
        setMorphProgress(Math.round((currentIndex + 1) / transforms.length * 100))
        currentIndex++
        // Variable timing for more natural feel
        const delay = 500 + Math.random() * 200
        setTimeout(animateTransform, delay)
      } else {
        // Final reveal with slight delay for dramatic effect
        setTimeout(() => {
          setShowAfter(true)
          setIsTransforming(false)
        }, 500)
      }
    }
    
    // Initial delay before starting
    setTimeout(animateTransform, 400)
  }
  
  // Reset animation
  const handleReset = () => {
    setShowAfter(false)
    setHighlightedWords([])
    setMorphProgress(0)
  }
  
  // Change example
  const handleExampleChange = (index) => {
    setActiveExample(index)
    handleReset()
  }
  
  return (
    <section className="py-20 lg:py-28 overflow-hidden">
      <div className="max-w-content-lg mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full mb-4 shadow-lg shadow-amber-500/20"
          >
            <Icon name="wand-sparkles" size="sm" className="icon-white" />
            {t('features.humanization.examplesTitle', 'See the Difference')}
          </motion.span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            {t('features.humanization.transformations', 'Real Transformations')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t('features.humanization.transformationsDesc', 'See how AI-generated text transforms into natural, human-like writing')}
          </p>
        </div>
        
        {/* Style Selector Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {transformationExamples.map((example, index) => (
            <motion.button
              key={index}
              onClick={() => handleExampleChange(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300
                ${activeExample === index 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600'
                }
              `}
            >
              <Icon name={example.icon} size="sm" className={activeExample === index ? 'icon-white' : ''} />
              {example.style}
            </motion.button>
          ))}
        </div>
        
        {/* Main Transformation Card */}
        <motion.div
          key={activeExample}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <div className="relative bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
            {/* Card Header - Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-400 to-orange-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Icon name={currentExample.icon} size="md" className="icon-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{currentExample.style}</h3>
                  <p className="text-xs text-white/70">{t('features.humanization.watchTransform', 'Watch the transformation')}</p>
                </div>
              </div>
              
              {/* Transform Button */}
              <motion.button
                onClick={showAfter ? handleReset : handleTransform}
                disabled={isTransforming}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all
                  ${showAfter 
                    ? 'bg-white/20 text-white hover:bg-white/30' 
                    : 'bg-white text-amber-600 shadow-lg hover:bg-gray-50'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isTransforming ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Icon name="loader" size="sm" className="icon-amber" />
                    </motion.div>
                    {t('features.humanization.transforming', 'Transforming...')}
                  </>
                ) : showAfter ? (
                  <>
                    <Icon name="rotate-ccw" size="sm" className="icon-white" />
                    {t('features.humanization.reset', 'Reset')}
                  </>
                ) : (
                  <>
                    <Icon name="wand-sparkles" size="sm" className="icon-amber" />
                    {t('features.humanization.transform', 'Transform')}
                  </>
                )}
              </motion.button>
            </div>
            
            {/* Content Area */}
            <div className="grid lg:grid-cols-2 min-h-[300px]">
              {/* Before Panel */}
              <div className="relative p-6 lg:p-8 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-slate-200 flex items-center justify-center">
                    <Icon name="cpu" size="xs" color="gray-medium" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('demo.before', 'Before')} - AI Generated
                  </span>
                </div>
                
                <div className="text-base text-slate-600 leading-relaxed relative">
                  {/* Full text with inline highlights */}
                  <p className="relative z-10">
                    {currentExample.before.split(/(\s+)/).map((word, wordIdx) => {
                      // Check if this word is part of any transform phrase
                      let transformIdx = -1
                      let isPartOfTransform = false
                      
                      currentExample.transforms.forEach((transform, tIdx) => {
                        if (currentExample.before.includes(transform.from)) {
                          const startPos = currentExample.before.indexOf(transform.from)
                          const endPos = startPos + transform.from.length
                          const currentPos = currentExample.before.split(/(\s+)/).slice(0, wordIdx).join('').length
                          
                          if (currentPos >= startPos && currentPos < endPos) {
                            transformIdx = tIdx
                            isPartOfTransform = true
                          }
                        }
                      })
                      
                      const isHighlighted = isPartOfTransform && highlightedWords.includes(transformIdx)
                      
                      return (
                        <span
                          key={wordIdx}
                          className={`
                            transition-all duration-300 inline
                            ${isHighlighted ? 'bg-amber-200/80 text-amber-900 px-0.5 rounded' : ''}
                            ${isPartOfTransform && showAfter ? 'line-through opacity-50' : ''}
                          `}
                        >
                          {word}
                        </span>
                      )
                    })}
                  </p>
                  
                  {/* Floating transformation tooltips */}
                  <AnimatePresence>
                    {highlightedWords.length > 0 && !showAfter && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 p-3 bg-gradient-to-r from-amber-200/90 to-orange-200/70 rounded-xl border border-amber-300/80"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="arrow-right" size="sm" className="icon-amber flex-shrink-0" />
                          <span className="text-amber-800">
                            <span className="line-through opacity-60">
                              {currentExample.transforms[highlightedWords[highlightedWords.length - 1]]?.from}
                            </span>
                            {' → '}
                            <span className="font-semibold">
                              {currentExample.transforms[highlightedWords[highlightedWords.length - 1]]?.to}
                            </span>
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
              </div>
              
              {/* After Panel */}
              <div className="relative p-6 lg:p-8 bg-white overflow-hidden">
                {/* Sparkle particles on completion */}
                <SparkleParticles isActive={showAfter} />
                
                <div className="flex items-center gap-2 mb-4">
                  <motion.div 
                    className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
                    animate={showAfter ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon name="sparkles" size="xs" className="icon-white" />
                  </motion.div>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                    {t('demo.after', 'After')} - Humanized
                  </span>
                </div>
                
                <AnimatePresence mode="wait">
                  {showAfter ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="text-base text-gray-800 leading-relaxed relative z-10"
                    >
                      {/* Typewriter-like reveal */}
                      {currentExample.after.split(' ').map((word, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02, duration: 0.2 }}
                          className="inline"
                        >
                          {word}{' '}
                        </motion.span>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      {/* Animated skeleton lines */}
                      {[85, 92, 78, 65].map((width, idx) => (
                        <motion.div 
                          key={idx}
                          className="h-4 rounded-md bg-amber-100/50 relative overflow-hidden"
                          style={{ width: `${width}%` }}
                          animate={isTransforming ? { opacity: [0.5, 1, 0.5] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.2 }}
                        >
                          {isTransforming && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/50 to-transparent"
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            />
                          )}
                        </motion.div>
                      ))}
                      <p className="text-sm text-amber-500/70 mt-4 italic">
                        {isTransforming 
                          ? t('features.humanization.analyzing', 'Analyzing patterns...') 
                          : t('features.humanization.clickTransform', 'Click "Transform" to see the magic ✨')
                        }
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Success indicator with animation */}
                <AnimatePresence>
                  {showAfter && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-full shadow-sm"
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon name="check-circle" size="xs" className="icon-green" />
                      </motion.div>
                      {t('features.humanization.humanized', 'Humanized')}
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <a 
            href="#demo" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-amber-300/80 text-amber-600 rounded-xl font-medium hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-orange-100/60 hover:border-amber-400 transition-all shadow-sm"
          >
            <Icon name="play-circle" size="sm" className="icon-amber" />
            <span>{t('features.humanization.tryYourself', 'Try it yourself')}</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================================
// STAT CARD COMPONENT - Warm theme for Humanization
// ============================================================================

const StatCard = ({ value, label, icon }) => {
  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0
  const { count, ref } = useAnimatedCounter(numericValue, 1500)
  
  const displayValue = value.includes('+') 
    ? `${count}+` 
    : value.includes('%') 
    ? `${count}%`
    : value.includes('<')
    ? `<${count}s`
    : `${count}`

  return (
    <motion.div
      ref={ref}
      className="relative group"
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="relative px-5 py-3 bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-amber-200/50 dark:border-amber-500/20 shadow-lg shadow-amber-500/5">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
        
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
            {displayValue}
          </div>
          <div className="text-xs text-text-muted mt-0.5 font-medium">{label}</div>
        </div>
      </div>
    </motion.div>
  )
}

function Humanization() {
  const { t } = useTranslation()
  const [openFaq, setOpenFaq] = useState(null)

  const benefits = [
    { icon: 'sparkles', title: t('features.humanization.benefits.natural.title', 'Natural Flow'), description: t('features.humanization.benefits.natural.desc', 'Transform robotic text into conversational, engaging content that reads naturally') },
    { icon: 'user', title: t('features.humanization.benefits.meaning.title', 'Preserve Meaning'), description: t('features.humanization.benefits.meaning.desc', 'Keep your message intact while improving readability and authenticity') },
    { icon: 'sliders', title: t('features.humanization.benefits.styles.title', 'Multiple Styles'), description: t('features.humanization.benefits.styles.desc', 'Choose from casual, professional, academic, or match your voice profile') },
    { icon: 'zap', title: t('features.humanization.benefits.instant.title', 'Instant Results'), description: t('features.humanization.benefits.instant.desc', 'Get humanized content in seconds with one click') },
  ]

  const useCases = [
    { icon: 'file-text', title: t('features.humanization.useCases.content.title', 'Content Creation'), description: t('features.humanization.useCases.content.desc', 'Transform AI drafts into authentic blog posts, articles, and marketing copy') },
    { icon: 'mail', title: t('features.humanization.useCases.email.title', 'Email Writing'), description: t('features.humanization.useCases.email.desc', 'Make AI-assisted emails sound personal and genuine') },
    { icon: 'graduation-cap', title: t('features.humanization.useCases.academic.title', 'Academic Writing'), description: t('features.humanization.useCases.academic.desc', 'Refine AI-generated research summaries to match academic standards') },
    { icon: 'share-2', title: t('features.humanization.useCases.social.title', 'Social Media'), description: t('features.humanization.useCases.social.desc', 'Create engaging social posts that connect with your audience') },
  ]

  const beforeAfterExamples = [
    {
      before: t('features.humanization.examples.ex1.before', 'The implementation of sustainable practices in corporate environments has become increasingly important in recent years.'),
      after: t('features.humanization.examples.ex1.after', "You know what's been on my mind lately? How companies are finally getting serious about going green."),
      style: t('features.humanization.examples.ex1.style', 'Casual & Conversational')
    },
    {
      before: t('features.humanization.examples.ex2.before', 'Research indicates that regular physical exercise contributes significantly to mental health improvement.'),
      after: t('features.humanization.examples.ex2.after', "Here's something I've learned: working out really does help with stress. My anxiety has gotten so much better since I started moving more."),
      style: t('features.humanization.examples.ex2.style', 'Personal & Authentic')
    }
  ]

  const faqs = [
    { q: t('features.humanization.faq.q1', 'How does content humanization work?'), a: t('features.humanization.faq.a1', 'Our AI analyzes the input text and rewrites it using natural language patterns, varied sentence structures, personal pronouns, and conversational elements that are characteristic of human writing.') },
    { q: t('features.humanization.faq.q2', 'Will the meaning of my content change?'), a: t('features.humanization.faq.a2', 'No. Our humanization preserves the core meaning and key points of your content while transforming the writing style to sound more natural and authentic.') },
    { q: t('features.humanization.faq.q3', 'Can I customize the writing style?'), a: t('features.humanization.faq.a3', 'Yes! You can choose from multiple styles (casual, professional, academic) or use your Voice Profile to match your unique writing style.') },
    { q: t('features.humanization.faq.q4', 'Will humanized content pass AI detection?'), a: t('features.humanization.faq.a4', 'Our humanization significantly reduces AI detection scores by introducing natural writing patterns. However, we recommend using it ethically and transparently.') },
    { q: t('features.humanization.faq.q5', 'Is there a word limit?'), a: t('features.humanization.faq.a5', 'Free users can humanize up to 500 words per request. Pro users have higher limits up to 5,000 words per request.') },
  ]

  const comparisonData = [
    { feature: t('features.humanization.comparison.quality', 'Output Quality'), us: t('features.humanization.comparison.excellent', 'Excellent'), others: t('features.humanization.comparison.good', 'Good') },
    { feature: t('features.humanization.comparison.voiceMatch', 'Voice Profile Match'), us: '✓', others: '✗' },
    { feature: t('features.humanization.comparison.styles', 'Style Options'), us: '5+', others: '2-3' },
    { feature: t('features.humanization.comparison.meaning', 'Meaning Preservation'), us: '98%', others: '85%' },
    { feature: t('features.humanization.comparison.speed', 'Processing Speed'), us: '<3s', others: '5-10s' },
    { feature: t('features.humanization.comparison.languages', 'Languages'), us: '15+', others: '3-5' },
  ]

  return (
    <>
      <SEOHead
        title={t('humanization.meta.title')}
        description={t('humanization.meta.description')}
        keywords={['content humanization', 'humanize AI text', 'natural writing', 'AI to human', 'rewrite AI content', 'make AI text human']}
      />
      <StructuredData
        type="SoftwareApplication"
        data={{
          name: 'Graphos Content Humanization',
          description: t('humanization.meta.description'),
          url: 'https://graphosai.com/features/humanization',
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
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
        {/* ================================================================== */}
        {/* HERO SECTION - Transformation Theme */}
        {/* ================================================================== */}
        <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-8 pb-16">
          <TransformationBackground />
          
          {/* Breadcrumb - Left aligned */}
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
                { label: t('nav.humanization') },
              ]}
            />
          </motion.div>
          
          <div className="max-w-content-lg mx-auto px-4 sm:px-6 text-center relative z-10">
            {/* Animated Badge - Warm theme */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="mb-8"
            >
              <motion.span 
                className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-200/90 via-orange-200/80 to-amber-200/90 dark:from-amber-500/15 dark:via-orange-500/20 dark:to-amber-500/15 text-amber-800 dark:text-amber-400 text-sm font-semibold rounded-full border border-amber-300/80 dark:border-amber-500/30 shadow-lg shadow-amber-500/20"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(251, 191, 36, 0.1)',
                    '0 0 35px rgba(251, 191, 36, 0.2)',
                    '0 0 20px rgba(251, 191, 36, 0.1)',
                  ],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <motion.span 
                  className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {t('features.humanization.badge', 'AI to Human in Seconds')}
                <Icon name="wand-sparkles" size="sm" className="icon-amber" />
              </motion.span>
            </motion.div>
            
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-[1.1] tracking-tight"
            >
              {t('humanization.title', 'Content Humanization')}
            </motion.h1>
            
            {/* Subtitle with warm gradient */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                {t('features.humanization.heroHighlight', 'Natural & Authentic')}
              </span>
            </motion.p>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary mb-10 leading-relaxed max-w-2xl mx-auto"
            >
              {t('humanization.description', 'Transform AI text into natural, authentic human writing.')}
            </motion.p>

            {/* Stats Row - Warm theme */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 max-w-2xl mx-auto"
            >
              <StatCard value="98%" label={t('features.humanization.stats.meaning', 'Meaning Preserved')} />
              <StatCard value="<3s" label={t('features.humanization.stats.speed', 'Processing')} />
              <StatCard value="15+" label={t('features.humanization.stats.languages', 'Languages')} />
              <StatCard value="5+" label={t('features.humanization.stats.styles', 'Writing Styles')} />
            </motion.div>

            {/* CTA Buttons - Warm theme */}
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
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-base overflow-hidden shadow-xl shadow-amber-500/25"
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
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-amber-200 dark:border-amber-500/30 text-text-primary rounded-xl font-semibold text-base hover:bg-white dark:hover:bg-white/20 hover:border-amber-300 transition-all shadow-lg"
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
              className="flex flex-wrap items-center justify-center gap-3 text-sm"
            >
              {[
                { icon: 'shield-check', text: t('features.humanization.trust.preserve', 'Preserves meaning') },
                { icon: 'zap', text: t('features.humanization.trust.instant', 'Instant results') },
                { icon: 'user', text: t('features.humanization.trust.voice', 'Match your voice') },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-amber-200/60 dark:border-amber-500/20 bg-white/60 dark:bg-white/5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <Icon name={item.icon} size="sm" className="icon-amber" />
                  <span className="text-text-secondary">{item.text}</span>
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
              className="flex flex-col items-center gap-2 text-text-muted hover:text-amber-600 transition-all cursor-pointer"
            >
              <span className="text-xs font-medium">{t('hero.scroll', 'Scroll to explore')}</span>
              <div className="w-6 h-10 rounded-full border border-amber-300/60 dark:border-amber-500/30 flex items-start justify-center p-1.5">
                <motion.div 
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-amber-500 rounded-full"
                />
              </div>
            </motion.a>
          </motion.div>
        </section>

        {/* ================================================================== */}
        {/* LIVE DEMO SECTION */}
        {/* ================================================================== */}
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-success text-sm font-semibold rounded-full mb-4 border border-gray-200 shadow-sm"
                >
                  <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  {t('demo.liveDemo', 'Live Demo')}
                </motion.span>
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                  {t('features.humanization.demo.title', 'See the Transformation')}
                </h2>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                  {t('features.humanization.demo.subtitle', 'Watch AI text transform into natural, human-like writing in real-time.')}
                </p>
              </div>
              
              <Suspense fallback={
                <div className="h-[520px] bg-bg-secondary rounded-2xl border border-gray-200 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                    <span className="text-sm text-text-muted">{t('common.loading', 'Loading...')}</span>
                  </div>
                </div>
              }>
                <LiveHumanizationDemo />
              </Suspense>
            </motion.div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* HOW IT WORKS SECTION */}
        {/* ================================================================== */}
        <section className="py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-br from-amber-400/10 to-orange-400/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-gradient-to-tl from-orange-400/10 to-amber-400/5 rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-content-lg mx-auto px-4 sm:px-6 relative">
            <div className="text-center mb-12">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-amber-600 text-sm font-semibold rounded-full mb-4 border border-amber-200 shadow-sm"
              >
                <Icon name="wand-sparkles" size="sm" className="icon-amber" />
                {t('features.humanization.howItWorks.badge', 'Simple Process')}
              </motion.span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
                {t('features.humanization.howItWorks.title', 'How Humanization Works')}
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                {t('features.humanization.howItWorks.subtitle', 'Transform your AI content in three simple steps')}
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left: Steps with Timeline */}
              <div className="relative">
                {/* Vertical Timeline Line */}
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-amber-400 via-orange-500 to-amber-600 rounded-full hidden md:block" />
                
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: t('features.humanization.howItWorks.step1.title', 'Paste Your Text'),
                      desc: t('features.humanization.howItWorks.step1.desc', 'Enter or paste the AI-generated content you want to humanize'),
                      icon: 'clipboard'
                    },
                    {
                      step: 2,
                      title: t('features.humanization.howItWorks.step2.title', 'Choose Your Style'),
                      desc: t('features.humanization.howItWorks.step2.desc', 'Select from casual, professional, academic, or use your Voice Profile'),
                      icon: 'sliders'
                    },
                    {
                      step: 3,
                      title: t('features.humanization.howItWorks.step3.title', 'Get Natural Content'),
                      desc: t('features.humanization.howItWorks.step3.desc', 'Receive humanized text that sounds authentic and natural'),
                      icon: 'sparkles'
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 }}
                      className="relative flex gap-5"
                    >
                      {/* Step number circle */}
                      <div className="relative z-10 flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                          <Icon name={item.icon} size="md" className="icon-white" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                            {t('common.step', 'Step')} {item.step}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">{item.title}</h3>
                        <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Right: Visual illustration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
                  {/* Mock window header */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs text-gray-500 ml-2">Humanization Preview</span>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    {/* Before */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
                          <Icon name="cpu" size="xs" color="gray-medium" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">AI Generated</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 line-through opacity-60">
                          The implementation of sustainable practices has become increasingly important...
                        </p>
                      </div>
                    </div>
                    
                    {/* Arrow */}
                    <div className="flex justify-center my-3">
                      <motion.div
                        animate={{ y: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
                      >
                        <Icon name="arrow-down" size="sm" className="icon-white" />
                      </motion.div>
                    </div>
                    
                    {/* After */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center">
                          <Icon name="user" size="xs" className="icon-amber" />
                        </div>
                        <span className="text-xs font-medium text-amber-600">Humanized</span>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-amber-100/90 to-orange-100/70 rounded-lg border border-amber-300/70">
                        <p className="text-sm text-gray-800">
                          You know what's been on my mind lately? How companies are finally getting serious about going green...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* BEFORE/AFTER EXAMPLES - Interactive Word Morphing Design */}
        {/* ================================================================== */}
        <RealTransformationsSection t={t} beforeAfterExamples={beforeAfterExamples} />

        {/* ================================================================== */}
        {/* BENEFITS SECTION - Split Screen Comparison Design */}
        {/* ================================================================== */}
        <section className="py-20 lg:py-28 bg-bg-secondary overflow-hidden">
          <div className="max-w-content-lg mx-auto px-4 sm:px-6">
            {/* Header */}
            <div className="text-center mb-16">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full mb-4 shadow-lg shadow-amber-500/20"
              >
                <Icon name="git-compare" size="sm" className="icon-white" />
                {t('features.humanization.benefitsBadge', 'The Difference')}
              </motion.span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
                {t('features.humanization.whyHumanize', 'Why Humanize Your Content?')}
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                {t('features.humanization.whyHumanizeDesc', 'Transform robotic AI text into engaging, authentic content')}
              </p>
            </div>
            
            {/* Split Screen Comparison */}
            <div className="relative">
              {/* Center divider line - Desktop */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-400 to-transparent z-10" />
              
              {/* Center transformation icon */}
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', duration: 0.8 }}
                className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full items-center justify-center shadow-xl shadow-amber-500/30"
              >
                <Icon name="arrow-right" size="lg" className="icon-white" />
              </motion.div>
              
              <div className="grid lg:grid-cols-2 gap-6 lg:gap-0">
                
                {/* LEFT SIDE - Without Humanization (Problems) */}
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="relative lg:pr-12"
                >
                  {/* Side label */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
                      <Icon name="cpu" size="md" color="gray-medium" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-600">{t('features.humanization.without', 'Without Humanization')}</h3>
                      <p className="text-xs text-slate-400">{t('features.humanization.aiContent', 'Raw AI Content')}</p>
                    </div>
                  </div>
                  
                  {/* Problem items */}
                  <div className="space-y-4">
                    {[
                      { icon: 'alert-circle', title: t('features.humanization.problems.robotic.title', 'Robotic & Stiff'), desc: t('features.humanization.problems.robotic.desc', 'Text sounds mechanical and unnatural to readers') },
                      { icon: 'eye-off', title: t('features.humanization.problems.detectable.title', 'Easily Detectable'), desc: t('features.humanization.problems.detectable.desc', 'AI detection tools flag content immediately') },
                      { icon: 'users', title: t('features.humanization.problems.generic.title', 'Generic Voice'), desc: t('features.humanization.problems.generic.desc', 'Lacks personality and unique writing style') },
                      { icon: 'trending-down', title: t('features.humanization.problems.engagement.title', 'Low Engagement'), desc: t('features.humanization.problems.engagement.desc', 'Readers disconnect from impersonal content') },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="group flex gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
                      >
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors">
                          <Icon name={item.icon} size="md" color="gray-medium" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-700 mb-0.5">{item.title}</h4>
                          <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
                {/* Mobile divider */}
                <div className="lg:hidden flex items-center justify-center py-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
                  <div className="mx-4 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Icon name="arrow-down" size="md" className="icon-white lg:hidden" />
                    <Icon name="arrow-right" size="md" className="icon-white hidden lg:block" />
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
                </div>
                
                {/* RIGHT SIDE - With Humanization (Solutions) */}
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="relative lg:pl-12"
                >
                  {/* Side label */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                      <Icon name="sparkles" size="md" className="icon-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-600">{t('features.humanization.with', 'With Humanization')}</h3>
                      <p className="text-xs text-amber-500">{t('features.humanization.humanContent', 'Natural Human Content')}</p>
                    </div>
                  </div>
                  
                  {/* Solution items */}
                  <div className="space-y-4">
                    {[
                      { icon: 'sparkles', title: t('features.humanization.benefits.natural.title', 'Natural Flow'), desc: t('features.humanization.benefits.natural.desc', 'Transform robotic text into conversational, engaging content'), stat: '95%', statLabel: t('features.humanization.moreEngaging', 'more engaging') },
                      { icon: 'shield-check', title: t('features.humanization.benefits.meaning.title', 'Preserve Meaning'), desc: t('features.humanization.benefits.meaning.desc', 'Keep your message intact while improving readability'), stat: '98%', statLabel: t('features.humanization.accuracy', 'accuracy') },
                      { icon: 'sliders', title: t('features.humanization.benefits.styles.title', 'Multiple Styles'), desc: t('features.humanization.benefits.styles.desc', 'Choose from casual, professional, academic styles'), stat: '5+', statLabel: t('features.humanization.styles', 'styles') },
                      { icon: 'zap', title: t('features.humanization.benefits.instant.title', 'Instant Results'), desc: t('features.humanization.benefits.instant.desc', 'Get humanized content in seconds with one click'), stat: '<3s', statLabel: t('features.humanization.processing', 'processing') },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="group flex gap-4 p-4 bg-gradient-to-r from-amber-100/90 via-orange-100/70 to-amber-50/80 rounded-xl border border-amber-300/70 hover:border-amber-400 hover:shadow-md transition-all"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          <Icon name={item.icon} size="md" className="icon-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-gray-800 mb-0.5">{item.title}</h4>
                            <span className="flex-shrink-0 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                              {item.stat}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
              </div>
            </div>
            
            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <a 
                href="#demo" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
              >
                <Icon name="wand-sparkles" size="sm" className="icon-white" />
                <span>{t('features.humanization.tryNow', 'Try Humanization Now')}</span>
              </a>
            </motion.div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* USE CASES SECTION - Marquee + Spotlight Design */}
        {/* ================================================================== */}
        <UseCasesMarqueeSection t={t} useCases={useCases} />

        {/* ================================================================== */}
        {/* COMPARISON TABLE - Enhanced */}
        {/* ================================================================== */}
        <section className="py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
          </div>
          <div className="max-w-content-lg mx-auto px-4 sm:px-6 relative">
            {/* Section Header */}
            <div className="text-center mb-12">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 text-sm font-semibold rounded-full mb-4 border border-amber-500/20 shadow-sm"
              >
                <Icon name="trophy" size="sm" className="icon-amber" />
                {t('features.humanization.comparisonBadge', 'Why Choose Us')}
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                {t('features.humanization.comparisonTitle', 'How We Compare')}
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto text-lg mb-6">
                {t('features.humanization.comparisonDesc', 'See why Graphos AI leads in content humanization')}
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
                  {t('features.humanization.comparisonWins', '6 key advantages over competitors')}
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
                  {t('features.humanization.comparison.feature', 'Feature')}
                </div>
                {/* Graphos column with highlight */}
                <div className="p-4 md:p-5 text-center border-l border-gray-200 dark:border-gray-700 bg-gradient-to-b from-amber-500/10 to-amber-500/5">
                  <div className="flex items-center justify-center gap-2">
                    <img src="/logo.svg" alt="Graphos AI" className="w-7 h-7 rounded-lg shadow-sm" />
                    <span className="font-bold text-amber-600 text-lg">Graphos AI</span>
                  </div>
                  <span className="text-xs text-amber-600/70 mt-0.5 block">{t('features.humanization.comparison.ourSolution', 'Our Solution')}</span>
                </div>
                <div className="p-4 md:p-5 text-center border-l border-gray-200 dark:border-gray-700">
                  <span className="text-text-secondary font-medium block">
                    {t('features.humanization.comparison.others', 'Others')}
                  </span>
                  <span className="text-xs text-text-muted mt-0.5 block">{t('features.humanization.comparison.competitors', 'Competitors')}</span>
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
                    className={`grid grid-cols-3 group hover:bg-amber-500/5 transition-all duration-200 ${
                      index !== comparisonData.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                    }`}
                  >
                    {/* Feature Name */}
                    <div className="py-4 px-4 md:px-5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center group-hover:bg-amber-500/10 transition-colors shrink-0">
                        <Icon 
                          name={index === 0 ? 'sparkles' : index === 1 ? 'user' : index === 2 ? 'sliders' : index === 3 ? 'shield-check' : index === 4 ? 'zap' : 'globe'} 
                          size="sm" 
                          className="text-text-muted group-hover:text-amber-600 transition-colors" 
                        />
                      </div>
                      <span className="text-sm md:text-base font-medium text-text-primary group-hover:text-amber-600 transition-colors">
                        {row.feature}
                      </span>
                    </div>
                    
                    {/* Graphos Value */}
                    <div className="py-4 px-4 md:px-5 flex items-center justify-center border-l border-gray-100 dark:border-gray-800 bg-gradient-to-b from-amber-500/[0.03] to-transparent">
                      {isCheckmark ? (
                        <motion.div 
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/30 flex items-center justify-center"
                        >
                          <Icon name="check" size="sm" className="icon-white" />
                        </motion.div>
                      ) : (
                        <span className="text-sm md:text-base font-bold text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-full">
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

            {/* Bottom Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6"
            >
              <div className="inline-flex items-center gap-4 px-5 py-3 bg-bg-secondary/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face" alt="User" className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="User" className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
                  <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=40&h=40&fit=crop&crop=face" alt="User" className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
                </div>
                <span className="text-sm text-text-secondary">
                  <span className="font-semibold text-text-primary">50K+</span> {t('features.humanization.comparison.usersCount', 'users trust us')}
                </span>
              </div>
              
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-bg-secondary/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-semibold text-text-primary">4.9/5</span>
                <span className="text-sm text-text-muted">{t('features.humanization.comparison.rating', 'average rating')}</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* TESTIMONIALS SECTION */}
        {/* ================================================================== */}
        <section className="py-20 lg:py-28">
          <div className="max-w-content-lg mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-200/90 to-orange-200/80 text-amber-800 text-sm font-semibold rounded-full mb-4 border border-amber-300/80"
              >
                <Icon name="message-circle" size="sm" className="icon-amber" />
                {t('features.humanization.testimonials.badge', 'User Stories')}
              </motion.span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
                {t('features.humanization.testimonials.title', 'Loved by Content Creators')}
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                {t('features.humanization.testimonials.subtitle', 'See what our users say about content humanization')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  quote: t('features.humanization.testimonials.content.quote', 'This tool has transformed how I create content. My blog posts now sound genuinely human and engage readers much better.'),
                  author: t('features.humanization.testimonials.content.author', 'Sarah Chen'),
                  role: t('features.humanization.testimonials.content.role', 'Content Creator'),
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
                },
                {
                  quote: t('features.humanization.testimonials.marketing.quote', 'Our marketing emails now feel personal and authentic. Open rates have increased by 40% since we started using Graphos.'),
                  author: t('features.humanization.testimonials.marketing.author', 'Michael Torres'),
                  role: t('features.humanization.testimonials.marketing.role', 'Marketing Director'),
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
                },
                {
                  quote: t('features.humanization.testimonials.academic.quote', 'Perfect for refining AI-assisted research summaries. The academic style option maintains professionalism while adding natural flow.'),
                  author: t('features.humanization.testimonials.academic.author', 'Dr. Emma Williams'),
                  role: t('features.humanization.testimonials.academic.role', 'Research Professor'),
                  avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&crop=face'
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative p-6 bg-white rounded-2xl border border-gray-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300"
                >
                  {/* Quote icon */}
                  <div className="absolute -top-3 -left-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Icon name="quote" size="sm" className="icon-white" />
                  </div>
                  
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <p className="text-text-secondary text-sm leading-relaxed mb-6">"{testimonial.quote}"</p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{testimonial.author}</p>
                      <p className="text-xs text-text-muted">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* FAQ SECTION - Enhanced */}
        {/* ================================================================== */}
        <section className="py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
            {/* Section Header */}
            <div className="text-center mb-12">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-bg-primary text-amber-600 text-sm font-semibold rounded-full mb-4 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <Icon name="help-circle" size="sm" className="icon-amber" />
                {t('features.humanization.faqBadge', 'FAQ')}
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                {t('features.humanization.faqTitle', 'Frequently Asked Questions')}
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto text-lg">
                {t('features.humanization.faqDesc', 'Everything you need to know about content humanization')}
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
                        openFaq === index ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-bg-secondary text-amber-600 group-hover:bg-amber-500/10'
                      }`}>
                        <span className="text-sm font-bold">{String(index + 1).padStart(2, '0')}</span>
                      </div>
                      <span className={`text-base font-semibold transition-colors ${
                        openFaq === index ? 'text-amber-600' : 'text-text-primary group-hover:text-amber-600'
                      }`}>
                        {faq.q}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
                    >
                      <Icon name="chevron-down" size="sm" className={openFaq === index ? 'text-amber-600' : 'text-text-muted'} />
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
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <Icon name="message-circle" size="xl" className="icon-amber" />
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md"
              >
                <Icon name="mail" size="sm" className="icon-white" />
                {t('faq.contactSupport', 'Contact Support')}
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* FINAL CTA SECTION */}
        {/* ================================================================== */}
        <section className="pt-0 pb-20 lg:pb-28 bg-bg-secondary relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-amber-500/5 rounded-full blur-3xl" 
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
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600" />
              
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
                    {t('features.humanization.ctaBadge', 'Start humanizing in seconds')}
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
                  {t('features.humanization.ctaTitle', 'Ready to Humanize Your Content?')}
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                  {t('features.humanization.ctaDesc', 'Transform AI text into natural, engaging writing that sounds authentically human.')}
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
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-amber-600 rounded-xl font-bold text-lg shadow-sm hover:shadow-lg transition-all"
                  >
                    <span>{t('cta.getStartedFree', 'Get Started Free')}</span>
                    <Icon name="arrow-right" size="md" className="icon-amber group-hover:translate-x-0.5 transition-transform" />
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
                    { icon: 'zap', text: t('cta.instant', 'Instant results') },
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
      </div>
    </>
  )
}

export default Humanization
