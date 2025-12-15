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
    testimonial: { quote: "I can now produce twice the content while keeping my personal touch.", author: "Sarah M.", role: "Content Creator" }
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
    testimonial: { quote: "I use it to check my essays before submission. Peace of mind!", author: "James K.", role: "Graduate Student" }
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
    testimonial: { quote: "Our email open rates improved 40% with more human-sounding copy.", author: "Michael R.", role: "Marketing Manager" }
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
    testimonial: { quote: "Essential tool for maintaining academic standards in the AI era.", author: "Dr. Emily T.", role: "University Professor" }
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
    testimonial: { quote: "Our customer support responses feel more personal now.", author: "David L.", role: "Customer Success Lead" }
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
    testimonial: { quote: "My clients love that my content passes all AI detectors.", author: "Lisa C.", role: "Freelance Writer" }
  }
]

function UseCasesSection() {
  const { t } = useTranslation()
  const [activeCase, setActiveCase] = useState('content-creators')
  const currentCase = USE_CASES.find(uc => uc.id === activeCase)

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-content-lg mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary text-sm font-semibold rounded-full mb-4 border border-gray-200 shadow-sm"
          >
            <Icon name="users" size="sm" className="icon-primary" />
            {t('useCases.badge', 'Use Cases')}
          </motion.span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            {t('useCases.title', 'Built for Everyone Who Writes')}
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            {t('useCases.subtitle', 'See how different professionals use Graphos AI to enhance their writing')}
          </p>
        </motion.div>

        {/* Use Case Tabs - Horizontal scroll on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {USE_CASES.map((useCase, index) => (
            <motion.button
              key={useCase.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveCase(useCase.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeCase === useCase.id
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon name={useCase.icon} size="sm" className={activeCase === useCase.id ? 'icon-white' : 'text-gray-500'} />
              <span className="hidden sm:inline">{t(useCase.titleKey, useCase.defaultTitle)}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Active Use Case Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-8"
          >
            {/* Left: Description & Benefits */}
            <div className="bg-white rounded-3xl border border-gray-200 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Icon name={currentCase?.icon || 'user'} size="lg" className="text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {t(currentCase?.titleKey || '', currentCase?.defaultTitle)}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {t(currentCase?.descKey || '', currentCase?.defaultDesc)}
                  </p>
                </div>
              </div>

              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Icon name="check-circle" size="sm" className="text-gray-400" />
                {t('useCases.keyBenefits', 'Key Benefits')}
              </h4>
              <ul className="space-y-3 mb-6">
                {currentCase?.benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center group-hover:bg-gray-200 transition-all">
                      <Icon name="check" size="xs" className="text-gray-600" />
                    </div>
                    <span className="text-gray-700">
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
                className="inline-flex items-center gap-2 text-gray-700 font-medium hover:text-gray-900 transition-colors"
              >
                {t('useCases.startNow', 'Start using Graphos AI')}
                <Icon name="arrow-right" size="sm" />
              </motion.a>
            </div>

            {/* Right: Testimonial Card */}
            <div className="relative rounded-3xl p-8 flex flex-col justify-center border border-gray-200 bg-gradient-to-br from-primary/5 via-white to-white">
              <div className="relative">
                <Icon name="quote" size="xl" className="text-primary/20 mb-4" />
                <blockquote className="text-xl lg:text-2xl text-gray-800 font-medium mb-6 leading-relaxed">
                  "{currentCase?.testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-semibold">
                    {currentCase?.testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {currentCase?.testimonial.author}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {currentCase?.testimonial.role}
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
