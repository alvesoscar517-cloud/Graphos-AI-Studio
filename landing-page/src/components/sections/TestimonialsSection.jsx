/**
 * TestimonialsSection - Premium testimonials with stats and carousel
 * Enhanced: Dec 2025 - Better cards, animated stats, gradient accents
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '@components/common/Icon'

const TESTIMONIALS = [
  {
    id: 1,
    quoteKey: 'testimonials.quotes.1',
    defaultQuote: "Graphos AI has completely changed how I write content. The voice profile feature is incredible - it actually sounds like me!",
    author: "Sarah M.",
    roleKey: 'testimonials.roles.contentCreator',
    defaultRole: "Content Creator",
    avatar: "SM",
    rating: 5,
    feature: 'voiceProfile'
  },
  {
    id: 2,
    quoteKey: 'testimonials.quotes.2',
    defaultQuote: "As a professor, I use the AI detection daily. It's accurate and helps me maintain academic integrity in my classes.",
    author: "Dr. James K.",
    roleKey: 'testimonials.roles.professor',
    defaultRole: "University Professor",
    avatar: "JK",
    rating: 5,
    feature: 'aiDetection'
  },
  {
    id: 3,
    quoteKey: 'testimonials.quotes.3',
    defaultQuote: "The humanization feature saved me hours of editing. My AI-assisted drafts now read naturally and authentically.",
    author: "Michael R.",
    roleKey: 'testimonials.roles.marketingManager',
    defaultRole: "Marketing Manager",
    avatar: "MR",
    rating: 5,
    feature: 'humanization'
  },
  {
    id: 4,
    quoteKey: 'testimonials.quotes.4',
    defaultQuote: "Finally, an AI tool that helps me write faster without losing my personal touch. The workspace is intuitive and powerful.",
    author: "Emily T.",
    roleKey: 'testimonials.roles.freelanceWriter',
    defaultRole: "Freelance Writer",
    avatar: "ET",
    rating: 5,
    feature: 'workspace'
  },
  {
    id: 5,
    quoteKey: 'testimonials.quotes.5',
    defaultQuote: "I was skeptical at first, but the accuracy of the AI detection is impressive. It's become essential for my editorial work.",
    author: "David L.",
    roleKey: 'testimonials.roles.editor',
    defaultRole: "Editor-in-Chief",
    avatar: "DL",
    rating: 5,
    feature: 'aiDetection'
  },
  {
    id: 6,
    quoteKey: 'testimonials.quotes.6',
    defaultQuote: "The Chrome extension makes it so easy to use anywhere. I can check and humanize content without leaving my workflow.",
    author: "Lisa C.",
    roleKey: 'testimonials.roles.socialMediaManager',
    defaultRole: "Social Media Manager",
    avatar: "LC",
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

const TestimonialCard = ({ testimonial, t }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    whileHover={{ y: -2 }}
    className="bg-bg-primary rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 transition-all hover:shadow-md group"
  >
    {/* Feature Badge */}
    {testimonial.feature && FEATURE_ICONS[testimonial.feature] && (
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-bg-primary flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm">
          <Icon name={FEATURE_ICONS[testimonial.feature]} size="sm" className="icon-primary" />
        </div>
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          {t(`nav.${testimonial.feature}`, testimonial.feature)}
        </span>
      </div>
    )}

    {/* Rating */}
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i < testimonial.rating ? '#FBBF24' : 'none'}
          stroke={i < testimonial.rating ? '#FBBF24' : '#D1D5DB'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>

    {/* Quote */}
    <p className="text-text-primary text-base leading-relaxed mb-6 group-hover:text-text-primary/90">
      "{t(testimonial.quoteKey, testimonial.defaultQuote)}"
    </p>

    {/* Author */}
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-lg">
        {testimonial.avatar}
      </div>
      <div>
        <div className="font-semibold text-text-primary">{testimonial.author}</div>
        <div className="text-sm text-text-muted">{t(testimonial.roleKey, testimonial.defaultRole)}</div>
      </div>
    </div>
  </motion.div>
)

const TestimonialsSection = () => {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(true) // Default paused - user controls navigation

  const totalPages = Math.ceil(TESTIMONIALS.length / 3)
  const visibleTestimonials = TESTIMONIALS.slice(activeIndex * 3, activeIndex * 3 + 3)

  // Optional: Auto-play only when user explicitly enables it
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalPages)
    }, 6000)
    return () => clearInterval(interval)
  }, [isPaused, totalPages])

  const goToNext = () => setActiveIndex((prev) => (prev + 1) % totalPages)
  const goToPrev = () => setActiveIndex((prev) => (prev - 1 + totalPages) % totalPages)

  return (
    <section className="py-20 lg:py-28 bg-bg-secondary/50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-content-lg mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          {/* Badge - on top */}
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-bg-primary text-primary text-sm font-semibold rounded-full border border-gray-200 dark:border-gray-700 shadow-sm mb-4"
          >
            <Icon name="heart" size="sm" className="icon-primary" />
            {t('testimonials.badge', 'Testimonials')}
          </motion.span>
          
          {/* Title and Subtitle */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            {t('testimonials.title', 'Loved by Writers Worldwide')}
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            {t('testimonials.subtitle', 'See what our users have to say about their experience with Graphos AI Studio.')}
          </p>
        </motion.div>

        {/* Stats Grid - no background, colored icon and text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.labelKey}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2, scale: 1.01 }}
              className="text-center p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-bg-primary hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                <StatIcon type={stat.icon} color={stat.color} />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-sm text-text-secondary">
                {t(stat.labelKey, stat.defaultLabel)}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Grid with Navigation */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 w-10 h-10 bg-bg-primary rounded-full border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center hover:bg-bg-hover hover:border-gray-300 hover:shadow-md transition-all hidden md:flex"
            aria-label="Previous testimonials"
          >
            <Icon name="chevron-left" size="md" className="text-text-secondary" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 w-10 h-10 bg-bg-primary rounded-full border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center hover:bg-bg-hover hover:border-gray-300 hover:shadow-md transition-all hidden md:flex"
            aria-label="Next testimonials"
          >
            <Icon name="chevron-right" size="md" className="text-text-secondary" />
          </button>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {visibleTestimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} t={t} />
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination with Auto-play toggle */}
          <div className="flex items-center justify-center gap-4 mt-10">
            {/* Dots */}
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeIndex ? 'w-10 bg-primary' : 'w-2.5 bg-black/[0.1] dark:bg-white/[0.15] hover:bg-text-muted'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Auto-play toggle */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`ml-4 p-2 rounded-lg border transition-all ${
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
}

export default TestimonialsSection
