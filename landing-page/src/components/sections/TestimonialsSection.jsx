/**
 * TestimonialsSection - Premium testimonials with stats and carousel
 * Enhanced: Dec 2025 - Performance optimized, lazy loading images
 * Updated: Localized avatars and names based on user's locale
 */
import { useState, useEffect, memo, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '@components/common/Icon'
import { usePrefersReducedMotion } from '@hooks/useOptimizedAnimation'
import { useAnimateOnScroll } from '@hooks/useIntersectionObserver'
import { getLocalizedTestimonials } from '@utils/localizedAvatars'

// Base testimonial data (quotes and features only - names/avatars come from localization)
const TESTIMONIAL_BASE = [
  {
    id: 1,
    quoteKey: 'testimonials.quotes.1',
    defaultQuote: "Graphos AI has completely changed how I write content. The voice profile feature is incredible - it actually sounds like me!",
    roleKey: 'testimonials.roles.contentCreator',
    defaultRole: "Content Creator",
    rating: 5,
    feature: 'voiceProfile'
  },
  {
    id: 2,
    quoteKey: 'testimonials.quotes.2',
    defaultQuote: "As a professor, I use the AI detection daily. It's accurate and helps me maintain academic integrity in my classes.",
    roleKey: 'testimonials.roles.professor',
    defaultRole: "University Professor",
    rating: 5,
    feature: 'aiDetection'
  },
  {
    id: 3,
    quoteKey: 'testimonials.quotes.3',
    defaultQuote: "The humanization feature saved me hours of editing. My AI-assisted drafts now read naturally and authentically.",
    roleKey: 'testimonials.roles.marketingManager',
    defaultRole: "Marketing Manager",
    rating: 5,
    feature: 'humanization'
  },
  {
    id: 4,
    quoteKey: 'testimonials.quotes.4',
    defaultQuote: "Finally, an AI tool that helps me write faster without losing my personal touch. The workspace is intuitive and powerful.",
    roleKey: 'testimonials.roles.freelanceWriter',
    defaultRole: "Freelance Writer",
    rating: 5,
    feature: 'workspace'
  },
  {
    id: 5,
    quoteKey: 'testimonials.quotes.5',
    defaultQuote: "I was skeptical at first, but the accuracy of the AI detection is impressive. It's become essential for my editorial work.",
    roleKey: 'testimonials.roles.editor',
    defaultRole: "Editor-in-Chief",
    rating: 5,
    feature: 'aiDetection'
  },
  {
    id: 6,
    quoteKey: 'testimonials.quotes.6',
    defaultQuote: "The Chrome extension makes it so easy to use anywhere. I can check and humanize content without leaving my workflow.",
    roleKey: 'testimonials.roles.socialMediaManager',
    defaultRole: "Social Media Manager",
    rating: 5,
    feature: 'extension'
  }
]

const FEATURE_ICONS = {
  voiceProfile: 'mic',
  aiDetection: 'shield-check',
  humanization: 'wand-sparkles',
  workspace: 'message-square',
  extension: 'chrome'
}

// SVG icons for stats with customizable colors
const StatIcon = ({ type, color }) => {
  const icons = {
    users: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    'file-text': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    target: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    star: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    )
  }
  return icons[type] || null
}

const STATS = [
  { value: '50K+', labelKey: 'stats.activeusers', defaultLabel: 'Active Users', icon: 'users', color: '#3B82F6' },
  { value: '2M+', labelKey: 'stats.textsanalyzed', defaultLabel: 'Texts Analyzed', icon: 'file-text', color: '#10B981' },
  { value: '98%', labelKey: 'stats.accuracyrate', defaultLabel: 'Accuracy Rate', icon: 'target', color: '#8B5CF6' },
  { value: '4.9', labelKey: 'stats.userrating', defaultLabel: 'User Rating', icon: 'star', color: '#F59E0B' }
]

// Memoized star rating component
const StarRating = memo(({ rating }) => (
  <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
    {[0, 1, 2, 3, 4].map((i) => (
      <svg
        key={i}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={i < rating ? '#FBBF24' : 'none'}
        stroke={i < rating ? '#FBBF24' : '#D1D5DB'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="sm:w-4 sm:h-4"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
))

StarRating.displayName = 'StarRating'

const TestimonialCard = memo(({ testimonial, t }) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  
  const motionProps = prefersReducedMotion ? {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  } : {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    whileHover: { y: -2 }
  }

  return (
    <motion.div
      {...motionProps}
      className="bg-bg-primary rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 transition-all hover:shadow-md group h-full flex flex-col"
    >
      {/* Feature Badge */}
      {testimonial.feature && FEATURE_ICONS[testimonial.feature] && (
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-md sm:rounded-lg bg-bg-primary flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm">
            <Icon name={FEATURE_ICONS[testimonial.feature]} size="sm" className="icon-primary" />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-wide">
            {t(`nav.${testimonial.feature}`, testimonial.feature)}
          </span>
        </div>
      )}

      {/* Rating - memoized */}
      <StarRating rating={testimonial.rating} />

      {/* Quote */}
      <p className="text-text-primary text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 group-hover:text-text-primary/90 flex-grow">
        "{t(testimonial.quoteKey, testimonial.defaultQuote)}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-2.5 sm:gap-3 mt-auto">
        <img 
          src={testimonial.avatar} 
          alt={testimonial.author}
          className="w-10 sm:w-12 h-10 sm:h-12 rounded-full object-cover shadow-lg flex-shrink-0 ring-2 ring-white dark:ring-gray-800"
          loading="lazy"
          decoding="async"
          width="48"
          height="48"
        />
        <div className="min-w-0">
          <div className="font-semibold text-sm sm:text-base text-text-primary truncate">{testimonial.author}</div>
          <div className="text-xs sm:text-sm text-text-muted truncate">{t(testimonial.roleKey, testimonial.defaultRole)}</div>
        </div>
      </div>
    </motion.div>
  )
})

TestimonialCard.displayName = 'TestimonialCard'

const TestimonialsSection = memo(() => {
  const { t, i18n } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(true) // Default paused - user controls navigation
  const prefersReducedMotion = usePrefersReducedMotion()
  const [sectionRef, isVisible] = useAnimateOnScroll(0.1)

  // Get localized testimonials based on current language
  const localizedPersonas = useMemo(() => 
    getLocalizedTestimonials(i18n.language),
    [i18n.language]
  )

  // Merge base testimonial data with localized names/avatars
  const TESTIMONIALS = useMemo(
    () =>
      TESTIMONIAL_BASE.map((base, index) => ({
        ...base,
        author: localizedPersonas[index]?.name || base.defaultRole,
        avatar:
          localizedPersonas[index]?.avatar ||
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      })),
    [localizedPersonas]
  )

  const totalPages = useMemo(() => Math.ceil(TESTIMONIALS.length / 3), [TESTIMONIALS.length])
  const visibleTestimonials = useMemo(() => 
    TESTIMONIALS.slice(activeIndex * 3, activeIndex * 3 + 3),
    [activeIndex, TESTIMONIALS]
  )

  // Optional: Auto-play only when user explicitly enables it and section is visible
  useEffect(() => {
    if (isPaused || !isVisible || prefersReducedMotion) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalPages)
    }, 6000)
    return () => clearInterval(interval)
  }, [isPaused, totalPages, isVisible, prefersReducedMotion])

  const goToNext = useCallback(() => setActiveIndex((prev) => (prev + 1) % totalPages), [totalPages])
  const goToPrev = useCallback(() => setActiveIndex((prev) => (prev - 1 + totalPages) % totalPages), [totalPages])

  return (
    <section 
      ref={sectionRef}
      className="py-12 sm:py-16 lg:py-20 xl:py-28 bg-bg-secondary/50 relative overflow-hidden"
    >
      {/* Background - only render decorations when visible */}
      {isVisible && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 sm:w-80 h-48 sm:h-80 bg-amber-500/5 rounded-full blur-3xl" />
        </div>
      )}

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-8"
        >
          {/* Badge - on top */}
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-bg-primary text-primary text-xs sm:text-sm font-semibold rounded-full border border-gray-200 dark:border-gray-700 shadow-sm mb-3 sm:mb-4"
          >
            <Icon name="heart" size="sm" className="icon-primary" />
            {t('testimonials.badge', 'Testimonials')}
          </motion.span>
          
          {/* Title and Subtitle */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-3 sm:mb-4">
            {t('testimonials.title', 'Loved by Writers Worldwide')}
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2 sm:px-0">
            {t('testimonials.subtitle', 'See what our users have to say about their experience with Graphos AI Studio.')}
          </p>
        </motion.div>

        {/* Stats Grid - no background, colored icon and text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10 lg:mb-12"
        >
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.labelKey}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2, scale: 1.01 }}
              className="text-center p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 bg-bg-primary hover:shadow-md transition-all group"
            >
              <div className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                <StatIcon type={stat.icon} color={stat.color} />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-0.5 sm:mb-1" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-text-secondary">
                {t(stat.labelKey, stat.defaultLabel)}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Grid with Navigation */}
        <div className="relative">
          {/* Navigation Arrows - Hidden on mobile */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-12 z-10 w-8 sm:w-10 h-8 sm:h-10 bg-bg-primary rounded-full border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center hover:bg-bg-hover hover:border-gray-300 hover:shadow-md transition-all hidden lg:flex"
            aria-label="Previous testimonials"
          >
            <Icon name="chevron-left" size="md" className="text-text-secondary" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-12 z-10 w-8 sm:w-10 h-8 sm:h-10 bg-bg-primary rounded-full border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center hover:bg-bg-hover hover:border-gray-300 hover:shadow-md transition-all hidden lg:flex"
            aria-label="Next testimonials"
          >
            <Icon name="chevron-right" size="md" className="text-text-secondary" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            <AnimatePresence mode="wait">
              {visibleTestimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} t={t} />
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination with Auto-play toggle */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 lg:mt-10">
            {/* Dots */}
            <div className="flex gap-1.5 sm:gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 sm:h-2.5 rounded-full transition-all ${
                    index === activeIndex ? 'w-6 sm:w-10 bg-primary' : 'w-2 sm:w-2.5 bg-black/[0.1] dark:bg-white/[0.15] hover:bg-text-muted'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Auto-play toggle */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`ml-2 sm:ml-4 p-1.5 sm:p-2 rounded-lg border transition-all ${
                isPaused 
                  ? 'bg-bg-secondary border-gray-200 dark:border-gray-700 text-text-muted hover:text-primary' 
                  : 'bg-primary/10 border-primary/25 text-primary'
              }`}
              aria-label={isPaused ? 'Enable auto-play' : 'Disable auto-play'}
              title={isPaused ? 'Enable auto-play' : 'Auto-playing'}
            >
              <Icon name={isPaused ? 'play' : 'pause'} size="sm" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
})

TestimonialsSection.displayName = 'TestimonialsSection'

export default TestimonialsSection



