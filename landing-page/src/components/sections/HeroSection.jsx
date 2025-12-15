/**
 * HeroSection - Premium hero with stunning visuals and micro-interactions
 * Enhanced: Dec 2025 - Glassmorphism, animated gradients, 3D floating badges
 */
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Icon from '@components/common/Icon'

// Animated typing effect with gradient cursor
const TypeWriter = ({ texts, className }) => {
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
}

// Modern grid background - Linear/Vercel style
const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Base gradient */}
    <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-primary to-bg-secondary" />
    
    {/* Grid pattern */}
    <div 
      className="absolute inset-0 opacity-[0.4]"
      style={{
        backgroundImage: `
          linear-gradient(to right, var(--color-border-light) 1px, transparent 1px),
          linear-gradient(to bottom, var(--color-border-light) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px'
      }}
    />
    
    {/* Radial fade overlay - fades grid at edges */}
    <div 
      className="absolute inset-0"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, var(--color-bg-primary) 100%)`
      }}
    />
    
    {/* Subtle glow spot behind content */}
    <div 
      className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] opacity-30"
      style={{
        background: `radial-gradient(ellipse at center, var(--color-primary) 0%, transparent 70%)`,
        filter: 'blur(80px)'
      }}
    />
    
    {/* Secondary accent glow */}
    <div 
      className="absolute top-1/2 left-1/4 w-[400px] h-[400px] opacity-20"
      style={{
        background: `radial-gradient(circle at center, #6366f1 0%, transparent 70%)`,
        filter: 'blur(60px)'
      }}
    />
  </div>
)

const HeroSection = () => {
  const { t } = useTranslation()
  const containerRef = useRef(null)

  const typingTexts = [
    t('hero.typing.detect', 'Detect AI content instantly'),
    t('hero.typing.humanize', 'Humanize your writing'),
    t('hero.typing.voice', 'Write in your unique voice'),
    t('hero.typing.workspace', 'Chat with AI, your way')
  ]

  return (
    <section ref={containerRef} className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <GridBackground />



      {/* Main Content */}
      <div className="relative max-w-content-lg mx-auto px-4 text-center z-10">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-bg-primary text-primary text-sm font-semibold rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
            <motion.span 
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-primary rounded-full"
            />
            {t('hero.badge', 'AI Writing Assistant')}
            <Icon name="Gemini" size="sm" className="icon-primary" />
          </span>
        </motion.div>

        {/* Main Headline with gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-text-primary mb-6 leading-[1.1] tracking-tight"
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
          className="h-12 mb-8"
        >
          <TypeWriter 
            texts={typingTexts} 
            className="text-xl md:text-2xl text-text-secondary font-medium"
          />
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          {t('hero.description', 'Detect AI content, humanize your writing, and create content that sounds authentically like you. All in one powerful platform.')}
        </motion.p>

        {/* CTA Buttons with unified styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <motion.a
            href="https://app.graphosai.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg shadow-sm hover:shadow-lg hover:bg-primary-hover transition-all"
          >
            <span>{t('cta.getStartedFree', 'Get Started Free')}</span>
            <Icon name="arrow-right" size="md" className="icon-white group-hover:translate-x-0.5 transition-transform" />
          </motion.a>
          <motion.a
            href="#showcase"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-bg-primary text-text-primary rounded-xl font-semibold text-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md transition-all"
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
          className="flex flex-wrap items-center justify-center gap-4 text-sm text-text-muted"
        >
          {[
            { icon: 'gift', text: t('heroTrust.free', 'Free to start') },
            { icon: 'credit-card', text: t('heroTrust.noCard', 'No credit card required') },
            { icon: 'chrome', text: t('heroTrust.extension', 'Chrome extension included') }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-bg-primary"
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
}

export default HeroSection
