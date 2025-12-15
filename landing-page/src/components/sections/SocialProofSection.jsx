/**
 * SocialProofSection - Company logos and user stats
 * Enhanced: Dec 2025 - Animated stats, improved visual hierarchy
 */
import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import Marquee from 'react-fast-marquee'
import Icon from '@components/common/Icon'

// Placeholder company names - replace with actual logos when available
const COMPANIES = [
  { name: 'TechCorp', logo: null },
  { name: 'StartupXYZ', logo: null },
  { name: 'MediaHub', logo: null },
  { name: 'EduPlatform', logo: null },
  { name: 'ContentPro', logo: null },
  { name: 'WriterStudio', logo: null },
  { name: 'DataFlow', logo: null },
  { name: 'CloudSync', logo: null },
  { name: 'DevTools', logo: null },
  { name: 'AILabs', logo: null },
  { name: 'CreativeHub', logo: null },
  { name: 'SmartDocs', logo: null }
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
    <section className="py-16 lg:py-20 bg-bg-primary relative">
      <div className="max-w-content-lg mx-auto px-4">
        {/* Stats Row - Enhanced with cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16"
        >
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative p-6 bg-bg-primary rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group"
            >
              {/* Icon with white background and border */}
              <div className="w-14 h-14 mx-auto mb-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name={stat.icon} size="xl" className={stat.iconColor} />
              </div>
              
              {/* Animated value */}
              <div className={`text-3xl md:text-4xl font-bold mb-2 text-center ${stat.textColor}`}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              
              {/* Label */}
              <div className="text-sm text-text-secondary text-center font-medium">
                {t(`socialProof.stats.${stat.label}`, stat.label)}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="w-24 h-px bg-gray-200 dark:bg-gray-700 mx-auto mb-12" />

        {/* Trusted By Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm text-text-muted mb-8 font-medium uppercase tracking-wider">
            {t('socialProof.trustedBy', 'Trusted by writers and teams at')}
          </p>
          
          {/* Company Logos - Infinite scrolling with react-fast-marquee */}
          <div className="mb-12">
            <Marquee
              speed={25}
              gradient={false}
              pauseOnHover={true}
              play={true}
            >
              {COMPANIES.map((company) => (
                <div
                  key={company.name}
                  className="flex-shrink-0 px-6 py-3 mx-3 bg-bg-primary rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  {company.logo ? (
                    <img 
                      src={company.logo} 
                      alt={company.name} 
                      className="h-8 w-auto grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all" 
                    />
                  ) : (
                    <span className="text-base font-semibold text-text-muted hover:text-text-primary transition-colors whitespace-nowrap">
                      {company.name}
                    </span>
                  )}
                </div>
              ))}
            </Marquee>
          </div>

          {/* User Types */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <p className="text-sm text-text-muted mb-4 font-medium">
              {t('socialProof.perfectFor', 'Perfect for')}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              {USER_TYPES.map((item, i) => (
                <motion.span
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium bg-bg-primary border-gray-200 dark:border-gray-700 text-text-secondary hover:border-gray-300 dark:hover:border-gray-600 hover:text-text-primary hover:shadow-sm transition-all"
                >
                  <Icon name={item.icon} size="sm" />
                  {t(`socialProof.userTypes.${item.label}`, item.label)}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default SocialProofSection
