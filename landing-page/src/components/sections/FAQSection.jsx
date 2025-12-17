/**
 * FAQSection - Premium FAQ with animated accordion and category filters
 * Enhanced: Dec 2025 - Performance optimized, reduced motion support
 * Added: FAQ Schema structured data for SEO
 */
import { useState, useMemo, memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import Icon from '@components/common/Icon'
import StructuredData from '@components/seo/StructuredData'

const FAQ_ITEMS = [
  {
    id: 'what-is',
    categoryKey: 'general',
    questionKey: 'faq.questions.whatIs',
    answerKey: 'faq.answers.whatIs',
    defaultQuestion: 'What is Graphos AI Studio?',
    defaultAnswer: 'Graphos AI Studio is an AI-powered writing assistant that helps you detect AI-generated content, humanize your writing, and create authentic content that matches your unique voice. It includes a web app and Chrome extension for seamless workflow integration.'
  },
  {
    id: 'how-detection',
    categoryKey: 'features',
    questionKey: 'faq.questions.howDetection',
    answerKey: 'faq.answers.howDetection',
    defaultQuestion: 'How accurate is the AI detection?',
    defaultAnswer: 'Our AI detection achieves 98% accuracy by analyzing multiple linguistic patterns including lexical, semantic, structural, and content patterns. We use advanced multi-pass analysis for uncertain cases to ensure reliable results.'
  },
  {
    id: 'humanization',
    categoryKey: 'features',
    questionKey: 'faq.questions.humanization',
    answerKey: 'faq.answers.humanization',
    defaultQuestion: 'How does humanization work?',
    defaultAnswer: 'Our humanization engine rewrites AI-generated text to match natural human writing patterns. It uses your voice profile to maintain your unique style while removing AI fingerprints like repetitive structures, formal transitions, and generic language.'
  },
  {
    id: 'voice-profile',
    categoryKey: 'features',
    questionKey: 'faq.questions.voiceProfile',
    answerKey: 'faq.answers.voiceProfile',
    defaultQuestion: 'What is a Voice Profile?',
    defaultAnswer: 'A Voice Profile is a unique fingerprint of your writing style. By analyzing your writing samples, we capture your tone, vocabulary preferences, sentence patterns, and key characteristics. This allows AI to generate content that sounds authentically like you.'
  },
  {
    id: 'credits',
    categoryKey: 'pricing',
    questionKey: 'faq.questions.credits',
    answerKey: 'faq.answers.credits',
    defaultQuestion: 'How do credits work?',
    defaultAnswer: 'Credits are our pay-as-you-go currency. Different features use different amounts based on text length and complexity. AI Detection uses ~2-5 credits, Humanization ~2-8 credits, Voice Profile creation ~8-25 credits, and AI Workspace ~1-3 credits per message. Credits never expire!'
  },
  {
    id: 'free-tier',
    categoryKey: 'pricing',
    questionKey: 'faq.questions.freeTier',
    answerKey: 'faq.answers.freeTier',
    defaultQuestion: 'Is there a free plan?',
    defaultAnswer: 'Yes! Every new user gets 100 free credits to try all features. No credit card required. Plus, your first purchase gets 2x bonus credits!'
  },
  {
    id: 'languages',
    categoryKey: 'features',
    questionKey: 'faq.questions.languages',
    answerKey: 'faq.answers.languages',
    defaultQuestion: 'What languages are supported?',
    defaultAnswer: 'Graphos AI supports 15 languages including English, Vietnamese, Chinese, Japanese, Korean, Thai, Indonesian, Malay, Arabic, French, German, Spanish, Portuguese, Italian, and Russian. Each language has optimized detection and humanization patterns.'
  },
  {
    id: 'extension',
    categoryKey: 'general',
    questionKey: 'faq.questions.extension',
    answerKey: 'faq.answers.extension',
    defaultQuestion: 'How does the Chrome extension work?',
    defaultAnswer: 'Our Chrome extension lets you use Graphos AI anywhere on the web. Select text on any website to detect AI content, humanize text, or generate content in your voice. It integrates seamlessly with Gmail, Google Docs, social media, and more.'
  },
  {
    id: 'privacy',
    categoryKey: 'security',
    questionKey: 'faq.questions.privacy',
    answerKey: 'faq.answers.privacy',
    defaultQuestion: 'Is my data secure?',
    defaultAnswer: 'Absolutely. We use enterprise-grade encryption for all data. Your writing samples and voice profiles are stored securely and never shared. We comply with GDPR and other privacy regulations. You can delete your data at any time.'
  },
  {
    id: 'refund',
    categoryKey: 'pricing',
    questionKey: 'faq.questions.refund',
    answerKey: 'faq.answers.refund',
    defaultQuestion: 'What is your refund policy?',
    defaultAnswer: 'We offer a 7-day money-back guarantee on all credit purchases. If you\'re not satisfied, contact our support team for a full refund. Unused credits can also be refunded within 30 days of purchase.'
  }
]

const CATEGORIES = [
  { key: 'all', labelKey: 'faq.categories.all', defaultLabel: 'All', icon: 'layers' },
  { key: 'general', labelKey: 'faq.categories.general', defaultLabel: 'General', icon: 'info' },
  { key: 'features', labelKey: 'faq.categories.features', defaultLabel: 'Features', icon: 'zap' },
  { key: 'pricing', labelKey: 'faq.categories.pricing', defaultLabel: 'Pricing', icon: 'credit-card' },
  { key: 'security', labelKey: 'faq.categories.security', defaultLabel: 'Security', icon: 'shield-check' }
]

const FAQItem = memo(({ item, isOpen, onToggle, t, index }) => {
  return (
    <div
      className={`group rounded-xl sm:rounded-2xl border overflow-hidden transition-shadow duration-200 ${
        isOpen 
          ? 'bg-bg-primary border-gray-200 dark:border-gray-700 shadow-md' 
          : 'bg-bg-primary border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 sm:p-4 lg:p-5 text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4 pr-2 sm:pr-4 min-w-0">
          <div className={`w-8 sm:w-9 lg:w-10 h-8 sm:h-9 lg:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
            isOpen ? 'bg-primary text-white' : 'bg-bg-secondary text-primary group-hover:bg-primary/10'
          }`}>
            <span className="text-xs sm:text-sm font-bold">{String(index + 1).padStart(2, '0')}</span>
          </div>
          <span className={`text-sm sm:text-base font-semibold transition-colors duration-200 line-clamp-2 ${
            isOpen ? 'text-primary' : 'text-text-primary group-hover:text-primary'
          }`}>
            {t(item.questionKey, item.defaultQuestion)}
          </span>
        </div>
        <div
          className={`flex-shrink-0 w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 flex items-center justify-center transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <Icon name="chevron-down" size="sm" className={isOpen ? 'text-primary' : 'text-text-muted'} />
        </div>
      </button>
      
      {/* Optimized accordion content - using CSS grid for smooth height animation */}
      <div 
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-3 sm:px-4 lg:px-5 pb-3 sm:pb-4 lg:pb-5 pl-[2.75rem] sm:pl-[3.25rem] lg:pl-[4.5rem]">
            <p className="text-xs sm:text-sm lg:text-base text-text-secondary leading-relaxed">
              {t(item.answerKey, item.defaultAnswer)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

FAQItem.displayName = 'FAQItem'

const FAQSection = memo(() => {
  const { t } = useTranslation()
  const [openId, setOpenId] = useState('what-is')
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredItems = useMemo(() => 
    activeCategory === 'all' 
      ? FAQ_ITEMS 
      : FAQ_ITEMS.filter(item => item.categoryKey === activeCategory),
    [activeCategory]
  )

  // Generate FAQ structured data for SEO
  const faqStructuredData = useMemo(() => ({
    questions: FAQ_ITEMS.map(item => ({
      question: t(item.questionKey, item.defaultQuestion),
      answer: t(item.answerKey, item.defaultAnswer)
    }))
  }), [t])

  // Memoized toggle handler
  const handleToggle = useCallback((id) => {
    setOpenId(prev => prev === id ? null : id)
  }, [])

  return (
    <>
      <StructuredData type="FAQPage" data={faqStructuredData} />
    <section id="faq" className="py-12 sm:py-16 lg:py-20 xl:py-28 bg-bg-secondary/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 sm:w-80 h-48 sm:h-80 bg-purple-500/5 rounded-full blur-3xl" />

      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
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
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-bg-primary text-primary text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <Icon name="help-circle" size="sm" className="icon-primary" />
            {t('faq.badge', 'FAQ')}
          </motion.span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-3 sm:mb-4">
            {t('faq.title', 'Frequently Asked Questions')}
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2 sm:px-0">
            {t('faq.subtitle', 'Everything you need to know about Graphos AI Studio')}
          </p>
        </motion.div>

        {/* Category Filter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 sm:mb-8 lg:mb-10"
        >
          <div className="flex flex-wrap justify-center gap-2 px-2 sm:px-0">
            {CATEGORIES.map((cat, index) => (
              <motion.button
                key={cat.key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all ${
                  activeCategory === cat.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-bg-primary text-text-secondary hover:bg-bg-hover border border-gray-200 dark:border-gray-700'
                }`}
              >
                <Icon name={cat.icon} size="sm" className={activeCategory === cat.key ? 'icon-white' : ''} />
                {t(cat.labelKey, cat.defaultLabel)}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredItems.map((item, index) => (
            <FAQItem
              key={item.id}
              item={item}
              index={index}
              isOpen={openId === item.id}
              onToggle={() => handleToggle(item.id)}
              t={t}
            />
          ))}
        </div>

        {/* Contact CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-10 lg:mt-12 p-5 sm:p-6 lg:p-8 bg-bg-primary rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 text-center"
        >
          <div className="w-12 sm:w-14 lg:w-16 h-12 sm:h-14 lg:h-16 mx-auto mb-3 sm:mb-4 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Icon name="message-circle" size="lg" className="icon-primary sm:!w-6 sm:!h-6 lg:!w-7 lg:!h-7" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1.5 sm:mb-2">
            {t('faq.stillHaveQuestions', "Still have questions?")}
          </h3>
          <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-5 lg:mb-6 max-w-sm sm:max-w-md mx-auto">
            {t('faq.contactDescription', "Can't find what you're looking for? Our support team is here to help.")}
          </p>
          <motion.a
            href="mailto:Support@graphosai.com"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:bg-primary-hover transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
          >
            <Icon name="mail" size="sm" className="icon-white" />
            {t('faq.contactSupport', 'Contact Support')}
          </motion.a>
        </motion.div>
      </div>
    </section>
    </>
  )
})

FAQSection.displayName = 'FAQSection'

export default FAQSection



