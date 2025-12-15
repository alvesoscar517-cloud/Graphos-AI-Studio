/**
 * HowItWorksSection - Premium animated workflow with connected steps
 * Enhanced: Dec 2025 - Better visual flow, animated connections, gradient cards
 */
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import Icon from '@components/common/Icon'

const STEPS = [
  {
    number: '01',
    icon: 'upload',
    titleKey: 'howItWorks.step1.title',
    descKey: 'howItWorks.step1.description',
    defaultTitle: 'Create Your Voice Profile',
    defaultDesc: 'Upload your writing samples or paste text. Our AI analyzes your unique style, tone, and vocabulary patterns.',
    gradient: 'from-blue-500 to-cyan-400',
    iconColor: 'icon-blue',
    hoverTextColor: 'group-hover:text-blue-500'
  },
  {
    number: '02',
    icon: 'shield-check',
    titleKey: 'howItWorks.step2.title',
    descKey: 'howItWorks.step2.description',
    defaultTitle: 'Detect AI Content',
    defaultDesc: 'Paste any text to instantly check if it was written by AI. Get detailed analysis with confidence scores.',
    gradient: 'from-emerald-500 to-teal-400',
    iconColor: 'icon-emerald',
    hoverTextColor: 'group-hover:text-emerald-500'
  },
  {
    number: '03',
    icon: 'wand-sparkles',
    titleKey: 'howItWorks.step3.title',
    descKey: 'howItWorks.step3.description',
    defaultTitle: 'Humanize Your Content',
    defaultDesc: 'Transform AI-generated text into natural, human-sounding content that matches your writing style.',
    gradient: 'from-violet-500 to-purple-400',
    iconColor: 'icon-violet',
    hoverTextColor: 'group-hover:text-violet-500'
  },
  {
    number: '04',
    icon: 'message-square',
    titleKey: 'howItWorks.step4.title',
    descKey: 'howItWorks.step4.description',
    defaultTitle: 'Chat in Your Voice',
    defaultDesc: 'Use AI Workspace to generate content that sounds authentically like you. Perfect for emails, posts, and more.',
    gradient: 'from-orange-500 to-amber-400',
    iconColor: 'icon-orange',
    hoverTextColor: 'group-hover:text-orange-500'
  }
]

const HowItWorksSection = () => {
  const { t } = useTranslation()

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-content-lg mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-bg-primary text-primary text-sm font-semibold rounded-full mb-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <Icon name="play-circle" size="sm" className="icon-primary" />
            {t('howItWorks.badge', 'Simple Process')}
          </motion.span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            {t('howItWorks.title', 'How It Works')}
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            {t('howItWorks.subtitle', 'Get started in minutes. No complex setup required.')}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop with gradient */}
          <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-0.5">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-orange-500/30 rounded-full" />
            {/* Animated glow effect */}
            <motion.div 
              animate={{ 
                x: ['0%', '100%'],
                opacity: [0, 1, 1, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/2 -translate-y-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full blur-sm"
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {/* Step Card */}
                <motion.div 
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="relative bg-bg-primary rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group h-full"
                >
                  {/* Step Number Badge with glow */}
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`absolute -top-4 left-6 inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br ${step.gradient} text-white text-sm font-bold rounded-xl shadow-lg`}
                    style={{ boxShadow: `0 4px 14px -2px rgba(59, 130, 246, 0.4)` }}
                  >
                    {step.number}
                  </motion.div>

                  {/* Icon with gradient background */}
                  <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center mb-5 mt-4 overflow-hidden group-hover:scale-110 transition-transform duration-300`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                    <Icon name={step.icon} size="lg" className={`${step.iconColor} relative z-10`} />
                  </div>

                  {/* Content */}
                  <h3 className={`text-lg font-bold text-text-primary mb-3 ${step.hoverTextColor} transition-colors`}>
                    {t(step.titleKey, step.defaultTitle)}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {t(step.descKey, step.defaultDesc)}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-14"
        >
          <p className="text-text-secondary mb-4">
            {t('howItWorks.ctaText', 'Ready to get started?')}
          </p>
          <motion.a
            href="https://app.graphosai.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-bg-primary text-text-primary rounded-xl font-semibold hover:bg-bg-hover border border-gray-200 dark:border-gray-700 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
          >
            {t('cta.getStarted', 'Get Started Free')}
            <Icon name="arrow-right" size="md" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorksSection
