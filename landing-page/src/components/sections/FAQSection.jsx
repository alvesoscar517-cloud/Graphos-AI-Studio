/**
 * FAQSection - Premium FAQ with animated accordion and category filters
 * Enhanced: Dec 2025 - Glassmorphism cards, smooth animations, better visual hierarchy
 * Added: FAQ Schema structured data for SEO
 */
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
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

const FAQItem = ({ item, isOpen, onToggle, t, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05 }}
    className={`group rounded-2xl border transition-all overflow-hidden ${
      isOpen 
        ? 'bg-bg-primary border-gray-200 dark:border-gray-700 shadow-md' 
        : 'bg-bg-primary border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm'
    }`}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-5 text-left"
    >
      <div className="flex items-center gap-4 pr-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
          isOpen ? 'bg-primary text-white' : 'bg-bg-secondary text-primary group-hover:bg-primary/10'
        }`}>
          <span className="text-sm font-bold">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <span className={`text-base font-semibold transition-colors ${
          isOpen ? 'text-primary' : 'text-text-primary group-hover:text-primary'
        }`}>
          {t(item.questionKey, item.defaultQuestion)}
        </span>
      </div>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center transition-all"
      >
        <Icon name="chevron-down" size="sm" className={isOpen ? 'text-primary' : 'text-text-muted'} />
      </motion.div>
    </button>
    
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="px-5 pb-5 pl-[4.5rem]">
            <p className="text-text-secondary leading-relaxed">
              {t(item.answerKey, item.defaultAnswer)}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
)

function FAQSection() {
  const { t } = useTranslation()
  const [openId, setOpenId] = useState('what-is')
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredItems = activeCategory === 'all' 
    ? FAQ_ITEMS 
    : FAQ_ITEMS.filter(item => item.categoryKey === activeCategory)

  // Generate FAQ structured data for SEO
  const faqStructuredData = useMemo(() => ({
    questions: FAQ_ITEMS.map(item => ({
      question: t(item.questionKey, item.defaultQuestion),
      answer: t(item.answerKey, item.defaultAnswer)
    }))
  }), [t])

  return (
    <>
      <StructuredData type="FAQPage" data={faqStructuredData} />
    <section id="faq" className="py-20 lg:py-28 bg-bg-secondary/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative">
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-bg-primary text-primary text-sm font-semibold rounded-full mb-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <Icon name="help-circle" size="sm" className="icon-primary" />
            {t('faq.badge', 'FAQ')}
          </motion.span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            {t('faq.title', 'Frequently Asked Questions')}
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            {t('faq.subtitle', 'Everything you need to know about Graphos AI Studio')}
          </p>
        </motion.div>

        {/* Category Filter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {CATEGORIES.map((cat, index) => (
            <motion.button
              key={cat.key}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                activeCategory === cat.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-bg-primary text-text-secondary hover:bg-bg-hover border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon name={cat.icon} size="sm" className={activeCategory === cat.key ? 'icon-white' : ''} />
              {t(cat.labelKey, cat.defaultLabel)}
            </motion.button>
          ))}
        </motion.div>

        {/* FAQ List */}
        <motion.div
          layout
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <FAQItem
                key={item.id}
                item={item}
                index={index}
                isOpen={openId === item.id}
                onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                t={t}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Contact CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-8 bg-bg-primary rounded-2xl border border-gray-200 dark:border-gray-700 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center">
            <Icon name="message-circle" size="xl" className="icon-primary" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">
            {t('faq.stillHaveQuestions', "Still have questions?")}
          </h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            {t('faq.contactDescription', "Can't find what you're looking for? Our support team is here to help.")}
          </p>
          <motion.a
            href="mailto:support@graphosai.com"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-all shadow-sm hover:shadow-md"
          >
            <Icon name="mail" size="sm" className="icon-white" />
            {t('faq.contactSupport', 'Contact Support')}
          </motion.a>
        </motion.div>
      </div>
    </section>
    </>
  )
}

export default FAQSection
