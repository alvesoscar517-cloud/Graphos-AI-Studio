/**
 * Deviations - Landing page for Deviations feature
 * Design: Alert/Warning Theme - "Find Style Inconsistencies"
 * Theme Color: Orange/Amber - representing alerts, warnings, and attention
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
const LiveDeviationsDemo = lazy(() => import('@components/demos/LiveDeviationsDemo'))

// ============================================================================
// HERO BACKGROUND - Alert/Warning Theme
// ============================================================================

const DeviationBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-10">
    {/* Base gradient - Orange/Amber tones for alerts */}
    <div className="absolute inset-0 bg-gradient-to-b from-orange-50/70 via-amber-50/30 to-white dark:from-slate-950 dark:via-orange-950/20 dark:to-slate-900" />
    
    {/* SVG Deviation Visualization */}
    <svg 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[900px] opacity-100"
      viewBox="0 0 1100 900"
      fill="none"
    >
      <defs>
        {/* Deviation gradient */}
        <linearGradient id="deviationGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(249, 115, 22, 0.3)" />
          <stop offset="50%" stopColor="rgba(245, 158, 11, 0.4)" />
          <stop offset="100%" stopColor="rgba(249, 115, 22, 0.3)" />
        </linearGradient>
        
        {/* Center glow */}
        <radialGradient id="centerDeviationGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(249, 115, 22, 0.2)" />
          <stop offset="50%" stopColor="rgba(245, 158, 11, 0.1)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        
        {/* Alert ring gradient */}
        <linearGradient id="alertRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(249, 115, 22, 0.6)" />
          <stop offset="100%" stopColor="rgba(245, 158, 11, 0.8)" />
        </linearGradient>
      </defs>
      
      {/* Left side - Text with highlighted deviations */}
      <g opacity="0.5">
        {[200, 250, 300, 350, 400, 450, 500, 550, 600].map((y, i) => (
          <g key={`text-${i}`}>
            <line 
              x1="100" 
              y1={y} 
              x2={180 + Math.random() * 100} 
              y2={y} 
              stroke={i === 2 || i === 5 || i === 7 ? "rgba(249, 115, 22, 0.5)" : "rgba(148, 163, 184, 0.3)"} 
              strokeWidth="6"
              strokeLinecap="round"
            />
            {(i === 2 || i === 5 || i === 7) && (
              <circle cx="90" cy={y} r="4" fill="rgba(249, 115, 22, 0.6)" />
            )}
          </g>
        ))}
        <rect x="80" y="180" width="220" height="460" rx="8" fill="none" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="2" strokeDasharray="8 4" />
        <text x="190" y="170" textAnchor="middle" fill="rgba(148, 163, 184, 0.4)" fontSize="12" fontWeight="500">YOUR TEXT</text>
      </g>
      
      {/* Center - Alert zone with warning triangle */}
      <ellipse cx="550" cy="450" rx="180" ry="220" fill="url(#centerDeviationGlow)" />
      
      {/* Alert triangle visualization */}
      <g transform="translate(550, 450)">
        {/* Outer ring */}
        <circle cx="0" cy="0" r="100" fill="none" stroke="rgba(249, 115, 22, 0.15)" strokeWidth="12" />
        {/* Alert arc */}
        <circle 
          cx="0" cy="0" r="100" 
          fill="none" 
          stroke="url(#alertRingGradient)" 
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="534"
          strokeDashoffset="160"
          transform="rotate(-90)"
        />
        {/* Inner circles */}
        <circle cx="0" cy="0" r="75" fill="none" stroke="rgba(249, 115, 22, 0.1)" strokeWidth="1" />
        <circle cx="0" cy="0" r="50" fill="none" stroke="rgba(249, 115, 22, 0.08)" strokeWidth="1" />
        {/* Warning triangle */}
        <path 
          d="M0 -30 L26 20 L-26 20 Z" 
          fill="none" 
          stroke="rgba(249, 115, 22, 0.5)" 
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <text x="0" y="10" textAnchor="middle" fill="rgba(249, 115, 22, 0.6)" fontSize="20" fontWeight="700">!</text>
      </g>
      
      {/* Right side - Severity levels */}
      <g opacity="0.6">
        <rect x="820" y="320" width="180" height="260" rx="16" fill="none" stroke="rgba(249, 115, 22, 0.25)" strokeWidth="2" />
        {/* Severity bars */}
        <g>
          <rect x="840" y="360" width="140" height="40" rx="8" fill="rgba(239, 68, 68, 0.15)" />
          <text x="910" y="385" textAnchor="middle" fill="rgba(239, 68, 68, 0.6)" fontSize="10" fontWeight="500">SEVERE</text>
        </g>
        <g>
          <rect x="840" y="420" width="140" height="40" rx="8" fill="rgba(245, 158, 11, 0.15)" />
          <text x="910" y="445" textAnchor="middle" fill="rgba(245, 158, 11, 0.6)" fontSize="10" fontWeight="500">MODERATE</text>
        </g>
        <g>
          <rect x="840" y="480" width="140" height="40" rx="8" fill="rgba(59, 130, 246, 0.15)" />
          <text x="910" y="505" textAnchor="middle" fill="rgba(59, 130, 246, 0.6)" fontSize="10" fontWeight="500">MILD</text>
        </g>
        <text x="910" y="310" textAnchor="middle" fill="rgba(249, 115, 22, 0.4)" fontSize="12" fontWeight="500">SEVERITY</text>
      </g>
      
      {/* Connection lines - deviation flow */}
      <g>
        <path 
          d="M300 300 Q400 350 450 400" 
          stroke="url(#deviationGradient)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 4"
        />
        <path 
          d="M300 450 Q400 450 450 450" 
          stroke="url(#deviationGradient)" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M300 550 Q400 500 450 480" 
          stroke="url(#deviationGradient)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 4"
        />
        
        <path 
          d="M650 400 Q700 360 820 360" 
          stroke="url(#deviationGradient)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 4"
        />
        <path 
          d="M650 450 Q700 440 820 440" 
          stroke="url(#deviationGradient)" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M650 500 Q700 500 820 500" 
          stroke="url(#deviationGradient)" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 4"
        />
      </g>
      
      {/* Alert particles */}
      {[
        [420, 380, 4], [480, 420, 3], [520, 480, 4], [580, 420, 3],
        [620, 480, 4], [460, 520, 3], [540, 380, 3], [600, 520, 4]
      ].map(([x, y, r], i) => (
        <g key={`particle-${i}`}>
          <circle cx={x} cy={y} r={r + 4} fill="rgba(249, 115, 22, 0.1)" />
          <circle cx={x} cy={y} r={r} fill="rgba(249, 115, 22, 0.5)" />
        </g>
      ))}
    </svg>
    
    {/* Ambient glow - orange */}
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, rgba(249, 115, 22, 0.1) 0%, transparent 70%)',
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
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
        
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
            {displayValue}
          </div>
          <div className="text-xs text-text-muted mt-1 font-medium whitespace-nowrap">{label}</div>
        </div>
      </div>
    </motion.div>
  )
}


// ============================================================================
// SEVERITY EXPLANATION SECTION
// ============================================================================

const SeverityExplanationSection = ({ t }) => {
  const [activeSeverity, setActiveSeverity] = useState('moderate')
  
  const severities = [
    { 
      id: 'mild', 
      label: t('features.deviations.severity.mild', 'Mild'), 
      color: 'blue', 
      icon: 'info',
      desc: t('features.deviations.severity.mildDesc', 'Small style differences that are barely noticeable'),
      example: t('features.deviations.severity.mildExample', 'Slightly different word choice or sentence length'),
      threshold: '0.4 - 0.5'
    },
    { 
      id: 'moderate', 
      label: t('features.deviations.severity.moderate', 'Moderate'), 
      color: 'amber', 
      icon: 'alert-circle',
      desc: t('features.deviations.severity.moderateDesc', 'Noticeable style differences that may affect consistency'),
      example: t('features.deviations.severity.moderateExample', 'Different tone or formality level'),
      threshold: '0.3 - 0.4'
    },
    { 
      id: 'severe', 
      label: t('features.deviations.severity.severe', 'Severe'), 
      color: 'red', 
      icon: 'alert-triangle',
      desc: t('features.deviations.severity.severeDesc', 'Significant style mismatch that clearly differs from your voice'),
      example: t('features.deviations.severity.severeExample', 'Completely different writing style or vocabulary'),
      threshold: '< 0.3'
    },
  ]
  
  const colorClasses = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-100 dark:bg-blue-500/20', border: 'border-l-blue-500', stroke: '#3b82f6' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-100 dark:bg-amber-500/20', border: 'border-l-amber-500', stroke: '#f59e0b' },
    red: { bg: 'bg-red-500', text: 'text-red-500', light: 'bg-red-100 dark:bg-red-500/20', border: 'border-l-red-500', stroke: '#ef4444' },
  }

  const currentSeverity = severities.find(s => s.id === activeSeverity)

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-content-lg mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-full mb-4 shadow-lg shadow-orange-500/20"
          >
            <Icon name="layers" size="sm" className="icon-white" />
            {t('features.deviations.severity.badge', 'Severity Levels')}
          </motion.span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            {t('features.deviations.severity.title', 'Understanding Deviation Severity')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t('features.deviations.severity.subtitle', 'We classify deviations into three levels to help you prioritize improvements')}
          </p>
        </div>
        
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-slate-700/50 p-6 md:p-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Visual Display */}
            <div className="relative">
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background circles */}
                  {severities.map((sev, i) => (
                    <circle 
                      key={sev.id}
                      cx="50" cy="50" r={42 - i * 12} 
                      fill="none" 
                      stroke={activeSeverity === sev.id ? colorClasses[sev.color].stroke : 'currentColor'}
                      strokeWidth={activeSeverity === sev.id ? 8 : 2}
                      className={activeSeverity === sev.id ? '' : 'text-gray-200 dark:text-slate-700'}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    key={activeSeverity}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`w-16 h-16 rounded-2xl ${colorClasses[currentSeverity.color].light} flex items-center justify-center`}
                  >
                    <Icon name={currentSeverity.icon} size="xl" className={`icon-${currentSeverity.color}`} />
                  </motion.div>
                </div>
              </div>
              
              {/* Current Severity Label */}
              <motion.div 
                key={currentSeverity.label}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center"
              >
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colorClasses[currentSeverity.color].light}`}>
                  <Icon name={currentSeverity.icon} size="sm" className={`icon-${currentSeverity.color}`} />
                  <span className={`font-semibold ${colorClasses[currentSeverity.color].text}`}>{currentSeverity.label}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{currentSeverity.desc}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">"{currentSeverity.example}"</p>
              </motion.div>
            </div>
          
            {/* Severity List */}
            <div className="space-y-3">
              {severities.map((severity, index) => {
                const isActive = activeSeverity === severity.id
                return (
                  <motion.button
                    key={severity.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveSeverity(severity.id)}
                    className={`w-full p-4 rounded-xl transition-all text-left ${
                      isActive
                        ? `border-l-4 ${colorClasses[severity.color].border} bg-white dark:bg-slate-800 shadow-sm`
                        : 'border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:border-gray-300 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${colorClasses[severity.color].light} flex items-center justify-center`}>
                        <Icon name={severity.icon} size="lg" className={`icon-${severity.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${isActive ? colorClasses[severity.color].text : 'text-gray-800 dark:text-gray-200'}`}>{severity.label}</span>
                          <span className={`text-sm font-medium ${colorClasses[severity.color].text}`}>{severity.threshold}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{severity.desc}</p>
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
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-content-lg mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-full mb-4 shadow-lg shadow-orange-500/20"
          >
            <Icon name="zap" size="sm" className="icon-white" />
            {t('features.deviations.howItWorks.badge', 'How It Works')}
          </motion.span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            {t('features.deviations.howItWorks.title', 'Intelligent Deviation Detection')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t('features.deviations.howItWorks.subtitle', 'Our AI analyzes each sentence against your Voice Profile to find inconsistencies')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-orange-300 to-transparent z-0" />
              )}
              
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {step.step}
                </div>
                
                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <Icon name={step.icon} size="xl" className="icon-orange" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
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
    <section className="py-20 lg:py-28 overflow-hidden bg-bg-secondary">
      <div className="max-w-content-lg mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-full mb-4 shadow-lg shadow-orange-500/20"
          >
            <Icon name="target" size="sm" className="icon-white" />
            {t('features.deviations.useCases.badge', 'Use Cases')}
          </motion.span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            {t('features.deviations.useCases.title', 'Perfect For Every Writer')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t('features.deviations.useCases.subtitle', 'Find and fix style inconsistencies in any type of content')}
          </p>
        </div>
        
        {/* Use case cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {useCases.map((useCase, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedCase(index)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                selectedCase === index
                  ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                selectedCase === index
                  ? 'bg-gradient-to-br from-orange-500 to-amber-500'
                  : 'bg-orange-100 dark:bg-orange-500/20'
              }`}>
                <Icon name={useCase.icon} size="lg" className={selectedCase === index ? 'icon-white' : 'icon-orange'} />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{useCase.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{useCase.description}</p>
            </motion.button>
          ))}
        </div>
        
        {/* Selected use case detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-orange-50 via-amber-50/50 to-white dark:from-slate-800 dark:via-orange-900/20 dark:to-slate-900 rounded-3xl border border-orange-200/50 dark:border-orange-500/20 p-8"
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Icon name={useCases[selectedCase].icon} size="xl" className="icon-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{useCases[selectedCase].title}</h3>
                    <p className="text-sm text-orange-600 dark:text-orange-400">{t('features.deviations.useCases.spotlight', 'Featured Use Case')}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{useCases[selectedCase].description}</p>
                <div className="flex flex-wrap gap-2">
                  {useCases[selectedCase].benefits?.map((benefit, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-500/20 rounded-full text-sm text-orange-700 dark:text-orange-300 font-medium">
                      <Icon name="check" size="xs" className="icon-orange" />
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="quote" size="sm" className="icon-orange" />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('features.deviations.useCases.example', 'Example')}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">{useCases[selectedCase].example}</p>
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
    stat: ['3', '<2s', '95%', '40%'][i],
    statLabel: [
      t('features.deviations.benefits.levels.stat', 'Severity Levels'),
      t('features.deviations.benefits.speed.stat', 'Per Sentence'),
      t('features.deviations.benefits.accuracy.stat', 'Accuracy'),
      t('features.deviations.benefits.improve.stat', 'Improvement')
    ][i]
  }))

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-content-lg mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-full mb-4 shadow-lg shadow-orange-500/20"
          >
            <Icon name="star" size="sm" className="icon-white" />
            {t('features.deviations.benefits.badge', 'Benefits')}
          </motion.span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            {t('features.deviations.benefits.title', 'Why Use Deviation Detection?')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t('features.deviations.benefits.subtitle', 'Identify and fix style inconsistencies before they affect your content')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {enhancedBenefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-2xl hover:border-orange-200 dark:hover:border-orange-500/30 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {index + 1}
              </div>
              
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
                  <Icon name={benefit.icon} size="xl" className="icon-white" />
                </div>
                
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {benefit.stat}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{benefit.statLabel}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{benefit.description}</p>
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
    <section className="py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-bg-primary text-orange-600 text-sm font-semibold rounded-full mb-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <Icon name="help-circle" size="sm" className="icon-orange" />
            {t('features.deviations.faq.badge', 'FAQ')}
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t('features.deviations.faq.title', 'Frequently Asked Questions')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            {t('features.deviations.faq.desc', 'Everything you need to know about Deviation Detection')}
          </p>
        </div>

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
                    openFaq === index ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white' : 'bg-bg-secondary text-orange-600 group-hover:bg-orange-500/10'
                  }`}>
                    <span className="text-sm font-bold">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <span className={`text-base font-semibold transition-colors ${
                    openFaq === index ? 'text-orange-600' : 'text-text-primary group-hover:text-orange-600'
                  }`}>
                    {faq.q}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: openFaq === index ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
                >
                  <Icon name="chevron-down" size="sm" className={openFaq === index ? 'text-orange-600' : 'text-text-muted'} />
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-8 bg-bg-primary rounded-2xl border border-gray-200 dark:border-gray-700 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/10 rounded-xl flex items-center justify-center">
            <Icon name="message-circle" size="xl" className="icon-orange" />
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm hover:shadow-md"
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-orange-500/5 rounded-full blur-3xl" 
        />
      </div>

      <div className="relative max-w-content-lg mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2rem] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600" />
          
          {/* Wave SVG at top */}
          <div className="absolute top-0 left-0 right-0 rotate-180">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 80L48 74.7C96 69 192 59 288 53.3C384 48 480 48 576 53.3C672 59 768 69 864 69.3C960 69 1056 59 1152 53.3C1248 48 1344 48 1392 48L1440 48V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" fill="rgba(255,255,255,0.08)"/>
            </svg>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgba(255,255,255,0.1)"/>
              <path d="M0 120L60 115C120 110 240 100 360 95C480 90 600 90 720 92C840 94 960 98 1080 100C1200 102 1320 102 1380 102L1440 102V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgba(255,255,255,0.15)"/>
            </svg>
          </div>

          <div className="relative p-10 md:p-14 lg:p-20 text-center">
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
                {t('features.deviations.ctaBadge', 'Start detecting in seconds')}
              </span>
              <Icon name="alert-triangle" size="sm" className="icon-white opacity-80" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
            >
              {t('features.deviations.cta.title', 'Ready to Find Style Inconsistencies?')}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              {t('features.deviations.cta.subtitle', 'Start analyzing your content for style deviations today. No credit card required.')}
            </motion.p>

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
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg shadow-sm hover:shadow-lg transition-all"
              >
                <span>{t('cta.getStartedFree', 'Get Started Free')}</span>
                <Icon name="arrow-right" size="md" className="icon-orange group-hover:translate-x-0.5 transition-transform" />
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

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/70"
            >
              {[
                { icon: 'check-circle', text: t('cta.noCard', 'No credit card required') },
                { icon: 'zap', text: t('features.deviations.cta.instant', '100 free credits') },
                { icon: 'shield', text: t('features.deviations.cta.privacy', 'Privacy first') }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <Icon name={item.icon} size="sm" className="icon-white opacity-70" />
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

function Deviations() {
  const { t } = useTranslation()
  const [openFaq, setOpenFaq] = useState(null)

  const benefits = [
    { icon: 'layers', title: t('features.deviations.benefits.levels.title', 'Severity Levels'), description: t('features.deviations.benefits.levels.desc', 'Classify deviations as mild, moderate, or severe to prioritize fixes') },
    { icon: 'zap', title: t('features.deviations.benefits.speed.title', 'Fast Detection'), description: t('features.deviations.benefits.speed.desc', 'Analyze each sentence in under 2 seconds with AI-powered detection') },
    { icon: 'target', title: t('features.deviations.benefits.accuracy.title', 'High Accuracy'), description: t('features.deviations.benefits.accuracy.desc', 'Dynamic thresholds based on your Voice Profile for precise detection') },
    { icon: 'trending-up', title: t('features.deviations.benefits.improve.title', 'Actionable Insights'), description: t('features.deviations.benefits.improve.desc', 'Get suggestions to fix deviations and improve style consistency') },
  ]

  const useCases = [
    { 
      icon: 'edit-3', 
      title: t('features.deviations.useCases.content.title', 'Content Review'), 
      description: t('features.deviations.useCases.content.desc', 'Find sentences that don\'t match your brand voice before publishing'),
      benefits: [t('features.deviations.useCases.content.b1', 'Quality control'), t('features.deviations.useCases.content.b2', 'Brand consistency'), t('features.deviations.useCases.content.b3', 'Time savings')],
      example: t('features.deviations.useCases.content.example', '"Found 3 severe deviations in paragraph 2 - the formal tone doesn\'t match your conversational style."')
    },
    { 
      icon: 'users', 
      title: t('features.deviations.useCases.team.title', 'Team Writing'), 
      description: t('features.deviations.useCases.team.desc', 'Ensure all team members write consistently with your brand guidelines'),
      benefits: [t('features.deviations.useCases.team.b1', 'Unified voice'), t('features.deviations.useCases.team.b2', 'Training tool'), t('features.deviations.useCases.team.b3', 'Onboarding')],
      example: t('features.deviations.useCases.team.example', '"New writer has 5 moderate deviations - share the Voice Profile to help them match the team style."')
    },
    { 
      icon: 'cpu', 
      title: t('features.deviations.useCases.ai.title', 'AI Content Check'), 
      description: t('features.deviations.useCases.ai.desc', 'Identify which parts of AI-generated content need humanization'),
      benefits: [t('features.deviations.useCases.ai.b1', 'Authenticity'), t('features.deviations.useCases.ai.b2', 'Personalization'), t('features.deviations.useCases.ai.b3', 'Trust')],
      example: t('features.deviations.useCases.ai.example', '"ChatGPT output has 8 deviations - use AI Rewrite on the severe ones first."')
    },
    { 
      icon: 'book-open', 
      title: t('features.deviations.useCases.learning.title', 'Style Learning'), 
      description: t('features.deviations.useCases.learning.desc', 'Understand which aspects of your writing vary the most'),
      benefits: [t('features.deviations.useCases.learning.b1', 'Self-awareness'), t('features.deviations.useCases.learning.b2', 'Improvement'), t('features.deviations.useCases.learning.b3', 'Growth')],
      example: t('features.deviations.useCases.learning.example', '"Your conclusions tend to deviate more than introductions - focus on maintaining tone at the end."')
    },
  ]

  const howItWorks = [
    { step: 1, title: t('features.deviations.howItWorks.step1.title', 'Select Profile'), desc: t('features.deviations.howItWorks.step1.desc', 'Choose the Voice Profile to compare against'), icon: 'user' },
    { step: 2, title: t('features.deviations.howItWorks.step2.title', 'Input Text'), desc: t('features.deviations.howItWorks.step2.desc', 'Paste or write the text you want to analyze'), icon: 'file-text' },
    { step: 3, title: t('features.deviations.howItWorks.step3.title', 'AI Analysis'), desc: t('features.deviations.howItWorks.step3.desc', 'Each sentence is compared using vector similarity'), icon: 'cpu' },
    { step: 4, title: t('features.deviations.howItWorks.step4.title', 'View Results'), desc: t('features.deviations.howItWorks.step4.desc', 'See deviations highlighted with severity levels'), icon: 'alert-triangle' },
  ]

  const faqs = [
    { q: t('features.deviations.faq.q1', 'What are Deviations?'), a: t('features.deviations.faq.a1', 'Deviations are sentences in your text that don\'t match your unique writing style captured in your Voice Profile. Our AI compares each sentence against your profile and identifies those that differ significantly in tone, vocabulary, or structure.') },
    { q: t('features.deviations.faq.q2', 'How are severity levels determined?'), a: t('features.deviations.faq.a2', 'We use dynamic thresholds based on your Voice Profile. Mild deviations (0.4-0.5 similarity) are barely noticeable. Moderate deviations (0.3-0.4) are noticeable differences. Severe deviations (<0.3) are significant style mismatches that clearly differ from your voice.') },
    { q: t('features.deviations.faq.q3', 'How is this different from Compatibility Score?'), a: t('features.deviations.faq.a3', 'Compatibility Score gives you an overall percentage of how well your text matches your style. Deviations goes deeper by identifying exactly which sentences deviate and how severely, so you know exactly what to fix.') },
    { q: t('features.deviations.faq.q4', 'Can I fix deviations automatically?'), a: t('features.deviations.faq.a4', 'Yes! After identifying deviations, you can click on any highlighted sentence to see suggestions. You can also use our AI Rewrite feature to automatically transform deviant sentences to match your Voice Profile.') },
    { q: t('features.deviations.faq.q5', 'How many credits does deviation detection cost?'), a: t('features.deviations.faq.a5', 'Deviation detection is included in the text analysis cost: 2 base credits plus 0.002 credits per word. A typical 500-word analysis costs about 3 credits and includes both Compatibility Score and Deviation detection.') },
    { q: t('features.deviations.faq.q6', 'What if I have no deviations?'), a: t('features.deviations.faq.a6', 'Great news! If no deviations are found, it means your text matches your Voice Profile well. You\'ll see a success message confirming your text is consistent with your writing style.') },
  ]

  return (
    <>
      <SEOHead
        title={t('deviations.meta.title', 'Deviations - Find Style Inconsistencies | Graphos AI')}
        description={t('deviations.meta.description', 'Identify sentences that deviate from your writing style. Get severity levels, suggestions, and fix inconsistencies to maintain your unique voice.')}
        keywords={['deviations', 'style inconsistencies', 'writing style', 'voice profile', 'style analysis', 'text comparison', 'severity levels']}
      />
      <StructuredData
        type="SoftwareApplication"
        data={{
          name: 'Graphos Deviations',
          description: t('deviations.meta.description'),
          url: 'https://graphosai.com/features/deviations',
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
        {/* Hero Section */}
        <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-8 pb-16">
          <DeviationBackground />
          
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
                { label: t('nav.deviations', 'Deviations') },
              ]}
            />
          </motion.div>
          
          <div className="max-w-content-lg mx-auto px-4 sm:px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="mb-8"
            >
              <motion.span 
                className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500/10 via-orange-500/15 to-amber-500/10 text-orange-600 dark:text-orange-400 text-sm font-semibold rounded-full border border-orange-500/20 shadow-lg shadow-orange-500/10"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(249, 115, 22, 0.1)',
                    '0 0 30px rgba(249, 115, 22, 0.2)',
                    '0 0 20px rgba(249, 115, 22, 0.1)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Icon name="alert-triangle" size="sm" className="icon-orange" />
                {t('features.deviations.badge', 'Style Detection')}
              </motion.span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-[1.1] tracking-tight"
            >
              {t('features.deviations.title', 'Deviations')}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                {t('features.deviations.heroHighlight', 'Find Style Inconsistencies')}
              </span>
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary mb-10 leading-relaxed max-w-2xl mx-auto"
            >
              {t('features.deviations.description', 'Identify exactly which sentences deviate from your writing style. Get severity levels and suggestions to maintain consistency.')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12"
            >
              <StatCard value="3" label={t('features.deviations.stats.levels', 'Severity Levels')} />
              <StatCard value="95%" label={t('features.deviations.stats.accuracy', 'Detection Accuracy')} />
              <StatCard value="<2s" label={t('features.deviations.stats.speed', 'Per Sentence')} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.a
                href="https://app.graphosai.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
              >
                <span>{t('cta.getStartedFree', 'Get Started Free')}</span>
                <Icon name="arrow-right" size="md" className="icon-white group-hover:translate-x-0.5 transition-transform" />
              </motion.a>
              <motion.a
                href="#demo"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 rounded-xl font-bold text-lg border border-orange-200 dark:border-orange-500/30 hover:border-orange-300 dark:hover:border-orange-500/50 transition-all shadow-sm"
              >
                <Icon name="play-circle" size="md" className="icon-orange" />
                {t('cta.tryDemo', 'Try Demo')}
              </motion.a>
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
              className="flex flex-col items-center gap-2 text-text-muted hover:text-orange-500 transition-all cursor-pointer"
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

        {/* Demo Section */}
        <section id="demo" className="py-20 lg:py-28 scroll-mt-24">
          <div className="max-w-content-lg mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-full mb-4 shadow-lg shadow-orange-500/20"
              >
                <Icon name="play" size="sm" className="icon-white" />
                {t('features.deviations.demo.badge', 'Interactive Demo')}
              </motion.span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
                {t('features.deviations.demo.title', 'See Deviations in Action')}
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                {t('features.deviations.demo.subtitle', 'Try our deviation detection with sample texts and see how it identifies style inconsistencies')}
              </p>
            </div>
            
            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              </div>
            }>
              <LiveDeviationsDemo />
            </Suspense>
          </div>
        </section>

        {/* Severity Explanation */}
        <SeverityExplanationSection t={t} />

        {/* How It Works */}
        <HowItWorksSection t={t} steps={howItWorks} />

        {/* Use Cases */}
        <UseCasesSection t={t} useCases={useCases} />

        {/* Benefits */}
        <BenefitsSection t={t} benefits={benefits} />

        {/* Pricing */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        }>
          <PricingSection />
        </Suspense>

        {/* FAQ */}
        <FAQSection t={t} faqs={faqs} openFaq={openFaq} setOpenFaq={setOpenFaq} />

        {/* CTA */}
        <CTASection t={t} />
      </div>
    </>
  )
}

export default Deviations
