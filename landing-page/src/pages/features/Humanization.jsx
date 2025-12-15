import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useState, lazy, Suspense } from 'react'
import SEOHead from '@components/seo/SEOHead'
import StructuredData from '@components/seo/StructuredData'
import Breadcrumb from '@components/common/Breadcrumb'
import Icon from '@components/common/Icon'

// Lazy load the live demo
const LiveHumanizationDemo = lazy(() => import('@components/demos/LiveHumanizationDemo'))

function Humanization() {
  const { t } = useTranslation()
  const [openFaq, setOpenFaq] = useState(null)

  const benefits = [
    { icon: 'sparkles', title: t('features.humanization.benefits.natural.title', 'Natural Flow'), description: t('features.humanization.benefits.natural.desc', 'Transform robotic text into conversational, engaging content that reads naturally') },
    { icon: 'user', title: t('features.humanization.benefits.meaning.title', 'Preserve Meaning'), description: t('features.humanization.benefits.meaning.desc', 'Keep your message intact while improving readability and authenticity') },
    { icon: 'sliders', title: t('features.humanization.benefits.styles.title', 'Multiple Styles'), description: t('features.humanization.benefits.styles.desc', 'Choose from casual, professional, academic, or match your voice profile') },
    { icon: 'zap', title: t('features.humanization.benefits.instant.title', 'Instant Results'), description: t('features.humanization.benefits.instant.desc', 'Get humanized content in seconds with one click') },
  ]

  const useCases = [
    { icon: 'file-text', title: t('features.humanization.useCases.content.title', 'Content Creation'), description: t('features.humanization.useCases.content.desc', 'Transform AI drafts into authentic blog posts, articles, and marketing copy') },
    { icon: 'mail', title: t('features.humanization.useCases.email.title', 'Email Writing'), description: t('features.humanization.useCases.email.desc', 'Make AI-assisted emails sound personal and genuine') },
    { icon: 'graduation-cap', title: t('features.humanization.useCases.academic.title', 'Academic Writing'), description: t('features.humanization.useCases.academic.desc', 'Refine AI-generated research summaries to match academic standards') },
    { icon: 'share-2', title: t('features.humanization.useCases.social.title', 'Social Media'), description: t('features.humanization.useCases.social.desc', 'Create engaging social posts that connect with your audience') },
  ]

  const beforeAfterExamples = [
    {
      before: t('features.humanization.examples.ex1.before', 'The implementation of sustainable practices in corporate environments has become increasingly important in recent years.'),
      after: t('features.humanization.examples.ex1.after', "You know what's been on my mind lately? How companies are finally getting serious about going green."),
      style: t('features.humanization.examples.ex1.style', 'Casual & Conversational')
    },
    {
      before: t('features.humanization.examples.ex2.before', 'Research indicates that regular physical exercise contributes significantly to mental health improvement.'),
      after: t('features.humanization.examples.ex2.after', "Here's something I've learned: working out really does help with stress. My anxiety has gotten so much better since I started moving more."),
      style: t('features.humanization.examples.ex2.style', 'Personal & Authentic')
    }
  ]

  const faqs = [
    { q: t('features.humanization.faq.q1', 'How does content humanization work?'), a: t('features.humanization.faq.a1', 'Our AI analyzes the input text and rewrites it using natural language patterns, varied sentence structures, personal pronouns, and conversational elements that are characteristic of human writing.') },
    { q: t('features.humanization.faq.q2', 'Will the meaning of my content change?'), a: t('features.humanization.faq.a2', 'No. Our humanization preserves the core meaning and key points of your content while transforming the writing style to sound more natural and authentic.') },
    { q: t('features.humanization.faq.q3', 'Can I customize the writing style?'), a: t('features.humanization.faq.a3', 'Yes! You can choose from multiple styles (casual, professional, academic) or use your Voice Profile to match your unique writing style.') },
    { q: t('features.humanization.faq.q4', 'Will humanized content pass AI detection?'), a: t('features.humanization.faq.a4', 'Our humanization significantly reduces AI detection scores by introducing natural writing patterns. However, we recommend using it ethically and transparently.') },
    { q: t('features.humanization.faq.q5', 'Is there a word limit?'), a: t('features.humanization.faq.a5', 'Free users can humanize up to 500 words per request. Pro users have higher limits up to 5,000 words per request.') },
  ]

  const comparisonData = [
    { feature: t('features.humanization.comparison.quality', 'Output Quality'), us: t('features.humanization.comparison.excellent', 'Excellent'), others: t('features.humanization.comparison.good', 'Good') },
    { feature: t('features.humanization.comparison.voiceMatch', 'Voice Profile Match'), us: '✓', others: '✗' },
    { feature: t('features.humanization.comparison.styles', 'Style Options'), us: '5+', others: '2-3' },
    { feature: t('features.humanization.comparison.meaning', 'Meaning Preservation'), us: '98%', others: '85%' },
    { feature: t('features.humanization.comparison.speed', 'Processing Speed'), us: '<3s', others: '5-10s' },
    { feature: t('features.humanization.comparison.languages', 'Languages'), us: '15+', others: '3-5' },
  ]

  return (
    <>
      <SEOHead
        title={t('humanization.meta.title')}
        description={t('humanization.meta.description')}
        keywords={['content humanization', 'humanize AI text', 'natural writing', 'AI to human', 'rewrite AI content', 'make AI text human']}
      />
      <StructuredData
        type="SoftwareApplication"
        data={{
          name: 'Graphos Content Humanization',
          description: t('humanization.meta.description'),
          url: 'https://graphosai.com/features/humanization',
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
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.a
            }
          }))
        }}
      />
      <div className="pt-16">
        <div className="max-w-content-lg mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: t('nav.home'), href: '/' },
              { label: t('nav.features'), href: '#' },
              { label: t('nav.humanization') },
            ]}
          />

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
              <Icon name="wand-sparkles" size="sm" />
              {t('features.humanization.badge', 'AI to Human in Seconds')}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">{t('humanization.title')}</h1>
            <p className="text-xl text-text-secondary max-w-2xl">{t('humanization.description')}</p>
          </motion.div>

          {/* Live Demo */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-success/10 text-success text-xs font-medium rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                {t('demo.liveDemo', 'Live Demo')}
              </span>
              <span className="text-sm text-text-muted">{t('features.humanization.tryItNow', 'See the transformation in action')}</span>
            </div>
            <Suspense fallback={
              <div className="h-96 bg-bg-secondary rounded-2xl border border-gray-200 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            }>
              <LiveHumanizationDemo />
            </Suspense>
          </motion.div>

          {/* Before/After Examples */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-16">
            <h2 className="text-2xl font-bold text-text-primary mb-8">{t('features.humanization.examplesTitle', 'See the Difference')}</h2>
            <div className="space-y-6">
              {beforeAfterExamples.map((example, index) => (
                <div key={index} className="bg-bg-secondary rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-2 bg-bg-primary border-b border-gray-200">
                    <span className="text-sm font-medium text-primary">{example.style}</span>
                  </div>
                  <div className="grid md:grid-cols-2">
                    <div className="p-5 border-b md:border-b-0 md:border-r border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="cpu" size="sm" className="text-text-muted" />
                        <span className="text-xs font-medium text-text-muted uppercase">{t('demo.before', 'Before')} - AI Generated</span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">{example.before}</p>
                    </div>
                    <div className="p-5 bg-primary/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="user" size="sm" />
                        <span className="text-xs font-medium text-primary uppercase">{t('demo.after', 'After')} - Humanized</span>
                      </div>
                      <p className="text-sm text-text-primary leading-relaxed">{example.after}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-16">
            <h2 className="text-2xl font-bold text-text-primary mb-8">{t('features.humanization.whyHumanize', 'Why Humanize Your Content?')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-16">
            <h2 className="text-2xl font-bold text-text-primary mb-8">{t('features.humanization.useCasesTitle', 'Perfect For')}</h2>
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

          {/* Comparison Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-16">
            <h2 className="text-2xl font-bold text-text-primary mb-8">{t('features.humanization.comparisonTitle', 'How We Compare')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-bg-secondary rounded-xl border border-gray-200 overflow-hidden">
                <thead>
                  <tr className="bg-bg-primary">
                    <th className="text-left p-4 text-sm font-semibold text-text-primary">{t('features.humanization.comparison.feature', 'Feature')}</th>
                    <th className="text-center p-4 text-sm font-semibold text-primary">Graphos AI</th>
                    <th className="text-center p-4 text-sm font-semibold text-text-muted">{t('features.humanization.comparison.others', 'Others')}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="p-4 text-sm text-text-primary">{row.feature}</td>
                      <td className="p-4 text-center text-sm font-medium text-primary">{row.us}</td>
                      <td className="p-4 text-center text-sm text-text-muted">{row.others}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-16">
            <h2 className="text-2xl font-bold text-text-primary mb-8">{t('features.humanization.faqTitle', 'Frequently Asked Questions')}</h2>
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
            <h2 className="text-2xl font-bold text-text-primary mb-4">{t('features.humanization.ctaTitle', 'Ready to Humanize Your Content?')}</h2>
            <p className="text-text-secondary mb-6">{t('features.humanization.ctaDesc', 'Transform AI text into natural, engaging writing.')}</p>
            <a href="https://app.graphosai.com" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors">
              {t('cta.getStartedFree')}
            </a>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default Humanization
