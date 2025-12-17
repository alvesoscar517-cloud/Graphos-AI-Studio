/**
 * FAQAccordion - Reusable FAQ component with optimized CSS grid animation
 * Performance: Uses CSS grid-template-rows for smooth height transitions
 * instead of framer-motion height animation which causes layout thrashing
 */
import { memo } from 'react'
import { motion } from 'framer-motion'
import Icon from '@components/common/Icon'

/**
 * Single FAQ Item with CSS grid animation
 */
const FAQItem = memo(({ 
  faq, 
  index, 
  isOpen, 
  onToggle, 
  accentColor = 'primary',
  iconClass = 'icon-primary'
}) => {
  // Color mapping for different accent colors
  const colorClasses = {
    primary: {
      badge: 'bg-primary text-white',
      badgeInactive: 'bg-bg-secondary text-primary group-hover:bg-primary/10',
      text: 'text-primary',
      textInactive: 'text-text-primary group-hover:text-primary'
    },
    cyan: {
      badge: 'bg-gradient-to-br from-cyan-400 to-teal-500 text-white',
      badgeInactive: 'bg-bg-secondary text-cyan-600 group-hover:bg-cyan-500/10',
      text: 'text-cyan-600',
      textInactive: 'text-text-primary group-hover:text-cyan-600'
    },
    emerald: {
      badge: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white',
      badgeInactive: 'bg-bg-secondary text-emerald-600 group-hover:bg-emerald-500/10',
      text: 'text-emerald-600',
      textInactive: 'text-text-primary group-hover:text-emerald-600'
    },
    indigo: {
      badge: 'bg-gradient-to-br from-indigo-400 to-purple-500 text-white',
      badgeInactive: 'bg-bg-secondary text-indigo-600 group-hover:bg-indigo-500/10',
      text: 'text-indigo-600',
      textInactive: 'text-text-primary group-hover:text-indigo-600'
    },
    orange: {
      badge: 'bg-gradient-to-br from-orange-400 to-amber-500 text-white',
      badgeInactive: 'bg-bg-secondary text-orange-600 group-hover:bg-orange-500/10',
      text: 'text-orange-600',
      textInactive: 'text-text-primary group-hover:text-orange-600'
    },
    teal: {
      badge: 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white',
      badgeInactive: 'bg-bg-secondary text-teal-600 group-hover:bg-teal-500/10',
      text: 'text-teal-600',
      textInactive: 'text-text-primary group-hover:text-teal-600'
    },
    amber: {
      badge: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
      badgeInactive: 'bg-bg-secondary text-amber-600 group-hover:bg-amber-500/10',
      text: 'text-amber-600',
      textInactive: 'text-text-primary group-hover:text-amber-600'
    },
    violet: {
      badge: 'bg-gradient-to-br from-violet-400 to-purple-500 text-white',
      badgeInactive: 'bg-bg-secondary text-violet-600 group-hover:bg-violet-500/10',
      text: 'text-violet-600',
      textInactive: 'text-text-primary group-hover:text-violet-600'
    }
  }

  const colors = colorClasses[accentColor] || colorClasses.primary

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`group rounded-xl sm:rounded-2xl border transition-shadow duration-200 overflow-hidden ${
        isOpen 
          ? 'bg-bg-primary border-gray-200 dark:border-gray-700 shadow-md' 
          : 'bg-bg-primary border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 sm:p-4 md:p-5 text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 pr-2 sm:pr-4 min-w-0">
          <div className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
            isOpen ? colors.badge : colors.badgeInactive
          }`}>
            <span className="text-xs sm:text-sm font-bold">{String(index + 1).padStart(2, '0')}</span>
          </div>
          <span className={`text-sm sm:text-base font-semibold transition-colors duration-200 line-clamp-2 ${
            isOpen ? colors.text : colors.textInactive
          }`}>
            {faq.q}
          </span>
        </div>
        <div
          className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <Icon name="chevron-down" size="sm" className={isOpen ? colors.text : 'text-text-muted'} />
        </div>
      </button>
      
      {/* Optimized accordion content - using CSS grid for smooth height animation */}
      <div 
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 pl-12 sm:px-4 sm:pb-4 sm:pl-14 md:px-5 md:pb-5 md:pl-[4.5rem]">
            <p className="text-xs sm:text-sm md:text-base text-text-secondary leading-relaxed">{faq.a}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

FAQItem.displayName = 'FAQItem'

/**
 * FAQ Accordion List
 */
const FAQAccordion = memo(({ 
  faqs, 
  openFaq, 
  setOpenFaq, 
  accentColor = 'primary',
  iconClass = 'icon-primary'
}) => {
  return (
    <div className="space-y-2 sm:space-y-3">
      {faqs.map((faq, index) => (
        <FAQItem
          key={index}
          faq={faq}
          index={index}
          isOpen={openFaq === index}
          onToggle={() => setOpenFaq(openFaq === index ? null : index)}
          accentColor={accentColor}
          iconClass={iconClass}
        />
      ))}
    </div>
  )
})

FAQAccordion.displayName = 'FAQAccordion'

export { FAQItem }
export default FAQAccordion
