/**
 * UseCasesSection - Premium use cases with interactive cards
 * Enhanced: Dec 2025 - Better visual design, animated transitions, testimonial cards
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '@components/common/Icon'

const USE_CASES = [
  {
    id: 'content-creators',
    icon: 'pen-tool',
    titleKey: 'useCases.contentCreators.title',
    descKey: 'useCases.contentCreators.desc',
    defaultTitle: 'Content Creators',
    defaultDesc: 'Bloggers, YouTubers, and social media managers who need authentic content at scale.',
    benefits: [
      { key: 'speed', default: 'Create content 5x faster' },
      { key: 'voice', default: 'Maintain your unique voice' },
      { key: 'scale', default: 'Scale without losing authenticity' }
    ],
    testimonial: { 
      quoteKey: 'useCases.contentCreators.testimonial.quote',
      authorKey: 'useCases.contentCreators.testimonial.author',
      roleKey: 'useCases.contentCreators.testimonial.role',
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face"
    }
  },
  {
    id: 'students',
    icon: 'graduation-cap',
    titleKey: 'useCases.students.title',
    descKey: 'useCases.students.desc',
    defaultTitle: 'Students & Academics',
    defaultDesc: 'Students and researchers who want to ensure their work is original and authentic.',
    benefits: [
      { key: 'verify', default: 'Verify your work is original' },
      { key: 'improve', default: 'Improve writing quality' },
      { key: 'learn', default: 'Learn from AI suggestions' }
    ],
    testimonial: { 
      quoteKey: 'useCases.students.testimonial.quote',
      authorKey: 'useCases.students.testimonial.author',
      roleKey: 'useCases.students.testimonial.role',
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face"
    }
  },
  {
    id: 'marketers',
    icon: 'trending-up',
    titleKey: 'useCases.marketers.title',
    descKey: 'useCases.marketers.desc',
    defaultTitle: 'Marketing Teams',
    defaultDesc: 'Marketing professionals who need to produce authentic brand content efficiently.',
    benefits: [
      { key: 'brand', default: 'Maintain brand voice consistency' },
      { key: 'campaigns', default: 'Launch campaigns faster' },
      { key: 'authentic', default: 'Create authentic ad copy' }
    ],
    testimonial: { 
      quoteKey: 'useCases.marketers.testimonial.quote',
      authorKey: 'useCases.marketers.testimonial.author',
      roleKey: 'useCases.marketers.testimonial.role',
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face"
    }
  },
  {
    id: 'educators',
    icon: 'book-open',
    titleKey: 'useCases.educators.title',
    descKey: 'useCases.educators.desc',
    defaultTitle: 'Educators',
    defaultDesc: 'Teachers and professors who need to detect AI-generated student submissions.',
    benefits: [
      { key: 'detect', default: 'Detect AI submissions accurately' },
      { key: 'integrity', default: 'Maintain academic integrity' },
      { key: 'feedback', default: 'Provide better feedback' }
    ],
    testimonial: { 
      quoteKey: 'useCases.educators.testimonial.quote',
      authorKey: 'useCases.educators.testimonial.author',
      roleKey: 'useCases.educators.testimonial.role',
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face"
    }
  },
  {
    id: 'businesses',
    icon: 'briefcase',
    titleKey: 'useCases.businesses.title',
    descKey: 'useCases.businesses.desc',
    defaultTitle: 'Businesses',
    defaultDesc: 'Companies that need authentic communication with customers and stakeholders.',
    benefits: [
      { key: 'communication', default: 'Authentic customer communication' },
      { key: 'documentation', default: 'Professional documentation' },
      { key: 'efficiency', default: 'Improve team efficiency' }
    ],
    testimonial: { 
      quoteKey: 'useCases.businesses.testimonial.quote',
      authorKey: 'useCases.businesses.testimonial.author',
      roleKey: 'useCases.businesses.testimonial.role',
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face"
    }
  },
  {
    id: 'freelancers',
    icon: 'user',
    titleKey: 'useCases.freelancers.title',
    descKey: 'useCases.freelancers.desc',
    defaultTitle: 'Freelance Writers',
    defaultDesc: 'Independent writers who need to deliver authentic content to clients.',
    benefits: [
      { key: 'quality', default: 'Deliver higher quality work' },
      { key: 'clients', default: 'Satisfy more clients' },
      { key: 'income', default: 'Increase your income' }
    ],
    testimonial: { 
      quoteKey: 'useCases.freelancers.testimonial.quote',
      authorKey: 'useCases.freelancers.testimonial.author',
      roleKey: 'useCases.freelancers.testimonial.role',
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face"
    }
  }
]

function UseCasesSection() {
  const { t } = useTranslation()
  const [activeCase, setActiveCase] = useState('content-creators')
  const currentCase = USE_CASES.find(uc => uc.id === activeCase)

  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-48 sm:w-80 h-48 sm:h-80 bg-primary/5 rounded-full blur-3xl" />

      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10 lg:mb-12"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-primary text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 border border-gray-200 shadow-sm"
          >
            <Icon name="users" size="sm" className="icon-primary" />
            {t('useCases.badge', 'Use Cases')}
          </motion.span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-3 sm:mb-4">
            {t('useCases.title', 'Built for Everyone Who Writes')}
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2 sm:px-0">
            {t('useCases.subtitle', 'See how different professionals use Graphos AI to enhance their writing')}
          </p>
        </motion.div>

        {/* Use Case Tabs - Centered on all screens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 sm:mb-8 lg:mb-10"
        >
          <div className="flex flex-wrap justify-center gap-2 px-2 sm:px-0">
            {USE_CASES.map((useCase, index) => (
              <motion.button
                key={useCase.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCase(useCase.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeCase === useCase.id
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon name={useCase.icon} size="sm" className={activeCase === useCase.id ? 'icon-white' : 'text-gray-500'} />
                <span>{t(useCase.titleKey, useCase.defaultTitle)}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Active Use Case Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8"
          >
            {/* Left: Description & Benefits */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-11 sm:w-12 lg:w-14 h-11 sm:h-12 lg:h-14 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name={currentCase?.icon || 'user'} size="md" className="text-gray-600 sm:!w-6 sm:!h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    {t(currentCase?.titleKey || '', currentCase?.defaultTitle)}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 line-clamp-2">
                    {t(currentCase?.descKey || '', currentCase?.defaultDesc)}
                  </p>
                </div>
              </div>

              <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                <Icon name="check-circle" size="sm" className="text-gray-400" />
                {t('useCases.keyBenefits', 'Key Benefits')}
              </h4>
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {currentCase?.benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 sm:gap-3 group"
                  >
                    <div className="w-5 sm:w-6 h-5 sm:h-6 bg-gray-100 rounded-md flex items-center justify-center group-hover:bg-gray-200 transition-all flex-shrink-0">
                      <Icon name="check" size="xs" className="text-gray-600" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700">
                      {t(`useCases.${currentCase.id}.benefits.${benefit.key}`, benefit.default)}
                    </span>
                  </motion.li>
                ))}
              </ul>

              <motion.a
                href="https://app.graphosai.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 4 }}
                className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-700 font-medium hover:text-gray-900 transition-colors"
              >
                {t('useCases.startNow', 'Start using Graphos AI')}
                <Icon name="arrow-right" size="sm" />
              </motion.a>
            </div>

            {/* Right: Testimonial Card */}
            <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 flex flex-col justify-center border border-gray-200 bg-gradient-to-br from-primary/5 via-white to-white">
              <div className="relative">
                <Icon name="quote" size="lg" className="text-primary/20 mb-3 sm:mb-4 sm:!w-8 sm:!h-8" />
                <blockquote className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-800 font-medium mb-4 sm:mb-6 leading-relaxed">
                  {t(currentCase?.testimonial.quoteKey)}
                </blockquote>
                <div className="flex items-center gap-3 sm:gap-4">
                  <img 
                    src={currentCase?.testimonial.avatar} 
                    alt={t(currentCase?.testimonial.authorKey)}
                    className="w-10 sm:w-12 h-10 sm:h-12 rounded-full object-cover shadow-md flex-shrink-0 ring-2 ring-white"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                      {t(currentCase?.testimonial.authorKey)}
                    </div>
                    <div className="text-gray-500 text-xs sm:text-sm truncate">
                      {t(currentCase?.testimonial.roleKey)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

export default UseCasesSection



