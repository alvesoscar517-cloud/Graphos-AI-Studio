/**
 * HeroSection - Premium hero with stunning visuals and micro-interactions
 * Enhanced: Dec 2025 - Performance optimized, reduced motion support
 */
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState, memo, useMemo } from 'react'
import Icon from '@components/common/Icon'

// Animated typing effect with gradient cursor - memoized
const TypeWriter = memo(({ texts, className }) => {
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
        className="inline-block w-0.5 h-6 md:h-7 bg-primary ml-1 align-middle rounded-full"
      />
    </span>
  )
})

TypeWriter.displayName = 'TypeWriter'

// Modern grid background - Linear/Vercel style - memoized for performance
const GridBackground = memo(() => {
  // Use CSS variables for better performance
  const gridStyle = useMemo(() => ({
    backgroundImage: `
      linear-gradient(to right, var(--color-border-light) 1px, transparent 1px),
      linear-gradient(to bottom, var(--color-border-light) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px'
  }), [])

  const fadeStyle = useMemo(() => ({
    background: `radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, var(--color-bg-primary) 100%)`
  }), [])

  const glowStyle = useMemo(() => ({
    background: `radial-gradient(ellipse at center, var(--color-primary) 0%, transparent 70%)`,
    filter: 'blur(80px)',
    willChange: 'transform' // GPU hint
  }), [])

  const accentStyle = useMemo(() => ({
    background: `radial-gradient(circle at center, #6366f1 0%, transparent 70%)`,
    filter: 'blur(60px)',
    willChange: 'transform' // GPU hint
  }), [])

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-primary to-bg-secondary" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.4]" style={gridStyle} />
      
      {/* Radial fade overlay - fades grid at edges */}
      <div className="absolute inset-0" style={fadeStyle} />
      
      {/* Primary glow spot behind content - always visible */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] opacity-30"
        style={glowStyle}
      />
      
      {/* Secondary accent glow */}
      <div 
        className="absolute top-1/2 left-1/4 w-[400px] h-[400px] opacity-20"
        style={accentStyle}
      />
    </div>
  )
})

GridBackground.displayName = 'GridBackground'

const HeroSection = memo(() => {
  const { t } = useTranslation()
  const containerRef = useRef(null)

  // Memoize typing texts to prevent re-renders
  const typingTexts = useMemo(() => [
    t('hero.typing.detect', 'Detect AI content instantly'),
    t('hero.typing.humanize', 'Humanize your writing'),
    t('hero.typing.voice', 'Write in your unique voice'),
    t('hero.typing.workspace', 'Chat with AI, your way')
  ], [t])

  // Memoize trust items
  const trustItems = useMemo(() => [
    { icon: 'gift', text: t('heroTrust.free', 'Free to start') },
    { icon: 'credit-card', text: t('heroTrust.noCard', 'No credit card required') },
    { icon: 'chrome', text: t('heroTrust.extension', 'Chrome extension included') }
  ], [t])

  return (
    <section ref={containerRef} className="relative min-h-[85vh] sm:min-h-[90vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden py-16 sm:py-20 lg:py-0">
      {/* Background */}
      <GridBackground />

      {/* Main Content */}
      <div className="relative w-full w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center z-10">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="mb-6 sm:mb-8"
        >
          <span className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-5 py-2 sm:py-2.5 bg-bg-primary text-primary text-xs sm:text-sm font-semibold rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
            <motion.span 
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-primary rounded-full"
            />
            {t('hero.badge', 'AI Writing Assistant')}
            <Icon name="Gemini" size="sm" className="icon-primary hidden sm:block" />
          </span>
        </motion.div>

        {/* Main Headline with gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-text-primary mb-4 sm:mb-6 leading-[1.15] sm:leading-[1.1] tracking-tight px-2 sm:px-0"
        >
          {t('hero.title', 'Write Authentically')}
          <br />
          <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
            {t('hero.titleHighlight', 'With AI That Gets You')}
          </span>
        </motion.h1>

        {/* Typing Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="h-10 sm:h-12 mb-6 sm:mb-8"
        >
          <TypeWriter 
            texts={typingTexts} 
            className="text-base sm:text-xl md:text-2xl text-text-secondary font-medium"
          />
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base sm:text-lg md:text-xl text-text-secondary mb-8 sm:mb-10 max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-2 sm:px-0"
        >
          {t('hero.description', 'Detect AI content, humanize your writing, and create content that sounds authentically like you. All in one powerful platform.')}
        </motion.p>

        {/* CTA Buttons with unified styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4 sm:px-0"
        >
          <motion.a
            href="https://app.graphosai.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-white rounded-xl font-semibold text-base sm:text-lg shadow-sm hover:shadow-lg hover:bg-primary-hover transition-all w-full sm:w-auto"
          >
            <span>{t('cta.getStartedFree', 'Get Started Free')}</span>
            <Icon name="arrow-right" size="md" className="icon-white group-hover:translate-x-0.5 transition-transform" />
          </motion.a>
          <motion.a
            href="#showcase"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-bg-primary text-text-primary rounded-xl font-semibold text-base sm:text-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md transition-all w-full sm:w-auto"
          >
            <Icon name="play-circle" size="md" className="group-hover:scale-105 transition-transform" />
            {t('cta.seeItInAction', 'See It In Action')}
          </motion.a>
        </motion.div>

        {/* Trust Indicators with icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-text-muted px-2 sm:px-0"
        >
          {trustItems.map((item, i) => (
            <motion.div 
              key={item.icon}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-bg-primary"
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
          href="#showcase"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-text-muted hover:text-primary transition-all cursor-pointer"
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
  )
})

HeroSection.displayName = 'HeroSection'

export default HeroSection



