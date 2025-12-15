import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useState, lazy, Suspense } from 'react'
import SEOHead from '@components/seo/SEOHead'
import StructuredData from '@components/seo/StructuredData'
import Breadcrumb from '@components/common/Breadcrumb'
import Icon from '@components/common/Icon'

// Lazy load the live demo
const LiveVoiceProfileDemo = lazy(() => import('@components/demos/LiveVoiceProfileDemo'))

function VoiceProfile() {
  const { t } = useTranslation()
  const [openFaq, setOpenFaq] = useState(null)

  const profileMetrics = [
    { label: t('demo.formality', 'Formality'), value: 65, color: 'from-primary to-blue-400' },
    { label: t('demo.creativity', 'Creativity'), value: 82, color: 'from-primary to-blue-400' },
    { label: t('demo.directness', 'Directness'), value: 72, color: 'from-primary to-blue-400' },
    { label: t('demo.empathy', 'Empathy'), value: 78, color: 'from-primary to-blue-400' },
  ]

  const benefits = [
    { icon: 'fingerprint', title: t('features.voiceProfile.benefits.unique.title', 'Unique Identity'), description: t('features.voiceProfile.benefits.unique.desc', 'Create content that sounds authentically like you, every time') },
    { icon: 'bar-chart-2', title: t('features.voiceProfile.benefits.analysis.title', 'Deep Analysis'), description: t('features.voiceProfile.benefits.analysis.desc', 'Understand your writing patterns, vocabulary, and style preferences') },
    { icon: 'refresh-cw', title: t('features.voiceProfile.benefits.consistent.title', 'Consistent Voice'), description: t('features.voiceProfile.benefits.consistent.desc', 'Maintain your tone across all content, from emails to blog posts') },
    { icon: 'cpu', title: t('features.voiceProfile.benefits.ai.title', 'AI Integration'), description: t('features.voiceProfile.benefits.ai.desc', 'Use your profile with AI Workspace for personalized content generation') },
  ]

  const useCases = [
    { icon: 'user', title: t('features.voiceProfile.useCases.personal.title', 'Personal Branding'), description: t('features.voiceProfile.useCases.personal.desc', 'Build a consistent personal brand across all your content') },
    { icon: 'briefcase', title: t('features.voiceProfile.useCases.business.title', 'Business Communication'), description: t('features.voiceProfile.useCases.business.desc', 'Ensure all team communications match your brand voice') },
    { icon: 'edit-3', title: t('features.voiceProfile.useCases.content.title', 'Content Creation'), description: t('features.voiceProfile.useCases.content.desc', 'Generate blog posts, articles, and copy that sound like you') },
    { icon: 'users', title: t('features.voiceProfile.useCases.team.title', 'Team Collaboration'), description: t('features.voiceProfile.useCases.team.desc', 'Share profiles to maintain consistent voice across your team') },
  ]

  const howItWorks = [
    { step: 1, title: t('features.voiceProfile.howItWorks.step1.title', 'Upload Samples'), desc: t('features.voiceProfile.howItWorks.step1.desc', 'Provide 3-5 writing samples (emails, posts, articles) that represent your style') },
    { step: 2, title: t('features.voiceProfile.howItWorks.step2.title', 'AI Analysis'), desc: t('features.voiceProfile.howItWorks.step2.desc', 'Our AI analyzes vocabulary, sentence structure, tone, and unique patterns') },
    { step: 3, title: t('features.voiceProfile.howItWorks.step3.title', 'Profile Created'), desc: t('features.voiceProfile.howItWorks.step3.desc', 'Get a detailed profile with metrics, traits, and signature characteristics') },
    { step: 4, title: t('features.voiceProfile.howItWorks.step4.title', 'Use Everywhere'), desc: t('features.voiceProfile.howItWorks.step4.desc', 'Apply your profile to humanization, AI Workspace, and content generation') },
  ]

  const faqs = [
    { q: t('features.voiceProfile.faq.q1', 'How many writing samples do I need?'), a: t('features.voiceProfile.faq.a1', 'We recommend 3-5 writing samples of at least 200 words each. More samples lead to more accurate profiles. The samples should represent your typical writing style.') },
    { q: t('features.voiceProfile.faq.q2', 'What types of content work best?'), a: t('features.voiceProfile.faq.a2', 'Any content you\'ve written works! Emails, blog posts, social media posts, articles, or even chat messages. The key is that it represents how you naturally write.') },
    { q: t('features.voiceProfile.faq.q3', 'Can I have multiple voice profiles?'), a: t('features.voiceProfile.faq.a3', 'Yes! Pro users can create multiple profiles for different contexts - one for professional communication, another for casual content, etc.') },
    { q: t('features.voiceProfile.faq.q4', 'How accurate is the voice matching?'), a: t('features.voiceProfile.faq.a4', 'Our voice matching achieves 90%+ similarity to your original writing style. The more samples you provide, the more accurate the matching becomes.') },
    { q: t('features.voiceProfile.faq.q5', 'Is my writing data secure?'), a: t('features.voiceProfile.faq.a5', 'Absolutely. Your writing samples are encrypted and used only to create your profile. We never share your data with third parties.') },
  ]

  return (
    <>
      <SEOHead
        title={t('voiceProfile.meta.title')}
        description={t('voiceProfile.meta.description')}
        keywords={['voice profile', 'writing style', 'personal AI', 'writing analysis', 'brand voice', 'content personalization']}
      />
      <StructuredData
        type="SoftwareApplication"
        data={{
          name: 'Graphos Voice Profile',
          description: t('voiceProfile.meta.description'),
          url: 'https://graphosai.com/features/voice-profile',
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          }
        }}
      />
      <StructuredData
        type="FAQPage"
        data={{
          mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: { '@type': 'Answer', text: faq.a }
          }))
        }}
      />
      <div className="pt-16">
        <div className="max-w-content-lg mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: t('nav.home'), href: '/' }, { label: t('nav.features'), href: '#' }, { label: t('nav.voiceProfile') }]} />

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
              <Icon name="fingerprint" size="sm" />
              {t('features.voiceProfile.badge', 'Your Unique Writing DNA')}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">{t('voiceProfile.title')}</h1>
            <p className="text-xl text-text-secondary max-w-2xl">{t('voiceProfile.description')}</p>
          </motion.div>

          {/* Live Demo */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-success/10 text-success text-xs font-medium rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                {t('demo.liveDemo', 'Live Demo')}
              </span>
              <span className="text-sm text-text-muted">{t('features.voiceProfile.tryItNow', 'Explore sample voice profiles')}</span>
            </div>
            <Suspense fallback={
              <div className="h-96 bg-bg-secondary rounded-2xl border border-gray-200 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            }>
              <LiveVoiceProfileDemo />
            </Suspense>
          </motion.div>

          {/* How It Works */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-16">
            <h2 className="text-2xl font-bold text-text-primary mb-8">{t('features.voiceProfile.howItWorksTitle', 'How Voice Profile Works')}</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {howItWorks.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.1 }}
                  className="relative p-5 bg-bg-secondary rounded-xl border border-gray-200"
                >
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">{item.title}</h3>
                  <p className="text-sm text-text-secondary">{item.desc}</p>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                      <Icon name="chevron-right" size="md" className="text-text-muted" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Profile Visualization Preview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-16">
            <h2 className="text-2xl font-bold text-text-primary mb-8">{t('features.voiceProfile.whatYouGet', 'What You Get')}</h2>
            <div className="bg-bg-secondary rounded-2xl border border-gray-200 p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Metrics */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Icon name="bar-chart-2" size="md" />
                    {t('demo.writingMetrics', 'Writing Metrics')}
                  </h3>
                  <div className="space-y-4">
                    {profileMetrics.map((metric, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-secondary">{metric.label}</span>
                          <span className="font-medium text-text-primary">{metric.value}%</span>
                        </div>
                        <div className="h-2.5 bg-bg-primary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Traits & Words */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <Icon name="tag" size="md" />
                      {t('demo.writingTraits', 'Writing Traits')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['Conversational', 'Empathetic', 'Clear', 'Engaging'].map((trait, i) => (
                        <motion.span
                          key={trait}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                          className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full"
                        >
                          {trait}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <Icon name="book-open" size="md" />
                      {t('demo.signatureWords', 'Signature Words')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['"honestly"', '"I think"', '"let me explain"', '"here\'s the thing"'].map((word, i) => (
                        <motion.span
                          key={word}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1 + i * 0.1 }}
                          className="px-3 py-1.5 bg-bg-primary text-text-secondary text-sm rounded-full border border-gray-200"
                        >
                          {word}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-16">
            <h2 className="text-2xl font-bold text-text-primary mb-8">{t('features.voiceProfile.whyCreate', 'Why Create a Voice Profile?')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + index * 0.1 }}
                  className="p-6 bg-bg-secondary rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                    <Icon name={benefit.icon} size="lg" />
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">{benefit.title}</h3>
                  <p className="text-text-secondary text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Use Cases */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-16">
            <h2 className="text-2xl font-bold text-text-primary mb-8">{t('features.voiceProfile.useCasesTitle', 'Perfect For')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {useCases.map((useCase, index) => (
                <div key={index} className="flex gap-4 p-5 bg-bg-secondary rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={useCase.icon} size="md" className="icon-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">{useCase.title}</h3>
                    <p className="text-text-secondary text-sm">{useCase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-16">
            <h2 className="text-2xl font-bold text-text-primary mb-8">{t('features.voiceProfile.faqTitle', 'Frequently Asked Questions')}</h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-bg-secondary rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-bg-hover transition-colors"
                  >
                    <span className="font-medium text-text-primary pr-4">{faq.q}</span>
                    <Icon name={openFaq === index ? 'chevron-up' : 'chevron-down'} size="md" className="text-text-muted flex-shrink-0" />
                  </button>
                  {openFaq === index && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-4 pb-4">
                      <p className="text-text-secondary text-sm leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-center py-12 bg-gradient-to-br from-primary/10 to-bg-secondary rounded-2xl">
            <h2 className="text-2xl font-bold text-text-primary mb-4">{t('features.voiceProfile.ctaTitle', 'Create Your Voice Profile')}</h2>
            <p className="text-text-secondary mb-6">{t('features.voiceProfile.ctaDesc', 'Discover your unique writing style today.')}</p>
            <a href="https://app.graphosai.com" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors">
              {t('cta.getStartedFree')}
            </a>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default VoiceProfile
