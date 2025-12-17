/**
 * SocialProofSection - Company logos and user stats
 * Enhanced: Dec 2025 - Animated stats, improved visual hierarchy
 */
import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import Marquee from 'react-fast-marquee'
import Icon from '@components/common/Icon'

// Fictional company names for display purposes
const COMPANIES = [
  { name: 'Nexora', logo: null },
  { name: 'Veloxity', logo: null },
  { name: 'Zentrix', logo: null },
  { name: 'Luminos', logo: null },
  { name: 'Prismify', logo: null },
  { name: 'Quantiva', logo: null },
  { name: 'Synthexa', logo: null },
  { name: 'Orbitra', logo: null },
  { name: 'Flowmatic', logo: null },
  { name: 'Pixelora', logo: null },
  { name: 'Vortexia', logo: null },
  { name: 'Stratosync', logo: null },
  { name: 'Cloudify', logo: null },
  { name: 'Datavox', logo: null },
  { name: 'Intellicore', logo: null },
  { name: 'Novahub', logo: null },
  { name: 'Sparkline', logo: null },
  { name: 'Teralink', logo: null },
  { name: 'Unifyra', logo: null },
  { name: 'Wavefront', logo: null }
]

const STATS = [
  { value: 50, suffix: 'K+', label: 'activeUsers', icon: 'users', iconColor: 'icon-primary', textColor: 'text-primary' },
  { value: 2, suffix: 'M+', label: 'textsProcessed', icon: 'file-text', iconColor: 'icon-primary', textColor: 'text-primary' },
  { value: 98, suffix: '%', label: 'accuracy', icon: 'target', iconColor: 'icon-primary', textColor: 'text-primary' },
  { value: 15, suffix: '+', label: 'languages', icon: 'globe', iconColor: 'icon-primary', textColor: 'text-primary' }
]

const USER_TYPES = [
  { icon: 'pen-tool', label: 'contentCreators', description: 'Create engaging content' },
  { icon: 'graduation-cap', label: 'students', description: 'Improve academic writing' },
  { icon: 'briefcase', label: 'marketers', description: 'Craft compelling copy' },
  { icon: 'book-open', label: 'educators', description: 'Enhance teaching materials' },
  { icon: 'code', label: 'developers', description: 'Write better documentation' }
]

// Animated counter component
const AnimatedCounter = ({ value, suffix, duration = 2 }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!isInView) return

    let startTime
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * value))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, value, duration])

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  )
}

const SocialProofSection = () => {
  const { t } = useTranslation()

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-bg-primary relative overflow-hidden">
      {/* Stats Row - Inside container */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Stats Row - Enhanced with cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-12 sm:mb-16"
        >
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative p-4 sm:p-6 bg-bg-primary rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group"
            >
              {/* Icon with white background and border */}
              <div className="w-10 sm:w-14 h-10 sm:h-14 mx-auto mb-3 sm:mb-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name={stat.icon} size="lg" className={`${stat.iconColor} sm:!w-6 sm:!h-6`} />
              </div>
              
              {/* Animated value */}
              <div className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 text-center ${stat.textColor}`}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              
              {/* Label */}
              <div className="text-xs sm:text-sm text-text-secondary text-center font-medium">
                {t(`socialProof.stats.${stat.label}`, stat.label)}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="w-16 sm:w-24 h-px bg-gray-200 dark:bg-gray-700 mx-auto mb-8 sm:mb-12" />

        {/* Trusted By Title - Inside container */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs sm:text-sm text-text-muted mb-6 sm:mb-8 font-medium uppercase tracking-wider">
            {t('socialProof.trustedBy', 'Trusted by writers and teams at')}
          </p>
        </motion.div>
      </div>
      
      {/* Company Logos Marquee - FULL WIDTH, outside container */}
      <div className="w-full mb-8 sm:mb-12">
        <Marquee
          speed={30}
          gradient={false}
          pauseOnHover={true}
          play={true}
          direction="left"
        >
          {COMPANIES.map((company) => (
            <div
              key={company.name}
              className="flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 mx-2 sm:mx-3 bg-bg-primary rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              {company.logo ? (
                <img 
                  src={company.logo} 
                  alt={company.name} 
                  className="h-6 sm:h-8 w-auto grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all" 
                />
              ) : (
                <span className="text-sm sm:text-base font-semibold text-text-muted hover:text-text-primary transition-colors whitespace-nowrap">
                  {company.name}
                </span>
              )}
            </div>
          ))}
        </Marquee>
      </div>

      {/* User Types - Back inside container */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative text-center"
        >
          <p className="text-xs sm:text-sm text-text-muted mb-3 sm:mb-4 font-medium">
            {t('socialProof.perfectFor', 'Perfect for')}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {USER_TYPES.map((item, i) => (
              <motion.span
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border text-xs sm:text-sm font-medium bg-bg-primary border-gray-200 dark:border-gray-700 text-text-secondary hover:border-gray-300 dark:hover:border-gray-600 hover:text-text-primary hover:shadow-sm transition-all"
              >
                <Icon name={item.icon} size="sm" />
                <span className="hidden xs:inline sm:inline">{t(`socialProof.userTypes.${item.label}`, item.label)}</span>
                <span className="xs:hidden sm:hidden">{t(`socialProof.userTypes.${item.label}`, item.label).split(' ')[0]}</span>
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default SocialProofSection



