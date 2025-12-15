import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useState, lazy, Suspense } from 'react'
import SEOHead from '@components/seo/SEOHead'
import StructuredData from '@components/seo/StructuredData'
import Breadcrumb from '@components/common/Breadcrumb'
import Icon from '@components/common/Icon'

// Lazy load the live demo
const LiveWorkspaceDemo = lazy(() => import('@components/demos/LiveWorkspaceDemo'))

function AIWorkspace() {
  const { t } = useTranslation()
  const [openFaq, setOpenFaq] = useState(null)

  const quickActions = [
    { icon: 'mail', label: t('features.aiWorkspace.actions.email.label', 'Write Email'), description: t('features.aiWorkspace.actions.email.desc', 'Compose professional emails in your voice') },
    { icon: 'file-text', label: t('features.aiWorkspace.actions.blog.label', 'Blog Post'), description: t('features.aiWorkspace.actions.blog.desc', 'Create engaging blog content') },
    { icon: 'briefcase', label: t('features.aiWorkspace.actions.proposal.label', 'Business Proposal'), description: t('features.aiWorkspace.actions.proposal.desc', 'Draft compelling proposals') },
    { icon: 'share-2', label: t('features.aiWorkspace.actions.social.label', 'Social Media'), description: t('features.aiWorkspace.actions.social.desc', 'Craft posts that resonate') },
    { icon: 'message-circle', label: t('features.aiWorkspace.actions.reply.label', 'Quick Reply'), description: t('features.aiWorkspace.actions.reply.desc', 'Generate thoughtful responses') },
    { icon: 'edit-3', label: t('features.aiWorkspace.actions.rewrite.label', 'Rewrite'), description: t('features.aiWorkspace.actions.rewrite.desc', 'Improve existing content') },
  ]

  const benefits = [
    { icon: 'message-circle', title: t('features.aiWorkspace.benefits.natural.title', 'Natural Conversations'), description: t('features.aiWorkspace.benefits.natural.desc', 'Chat with AI that understands your style and preferences') },
    { icon: 'fingerprint', title: t('features.aiWorkspace.benefits.voice.title', 'Your Voice'), description: t('features.aiWorkspace.benefits.voice.desc', 'All outputs match your unique writing profile automatically') },
    { icon: 'brain', title: t('features.aiWorkspace.benefits.context.title', 'Context Aware'), description: t('features.aiWorkspace.benefits.context.desc', 'AI remembers your preferences and conversation history') },
    { icon: 'zap', title: t('features.aiWorkspace.benefits.quick.title', 'Quick Actions'), description: t('features.aiWorkspace.benefits.quick.desc', 'One-click templates for common writing tasks') },
  ]

  const useCases = [
    { icon: 'mail', title: t('features.aiWorkspace.useCases.email.title', 'Email Communication'), description: t('features.aiWorkspace.useCases.email.desc', 'Draft, reply, and follow up on emails that sound like you wrote them') },
    { icon: 'file-text', title: t('features.aiWorkspace.useCases.content.title', 'Content Creation'), description: t('features.aiWorkspace.useCases.content.desc', 'Generate blog posts, articles, and marketing copy in your voice') },
    { icon: 'share-2', title: t('features.aiWorkspace.useCases.social.title', 'Social Media'), description: t('features.aiWorkspace.useCases.social.desc', 'Create engaging posts for LinkedIn, Twitter, and more') },
    { icon: 'briefcase', title: t('features.aiWorkspace.useCases.business.title', 'Business Writing'), description: t('features.aiWorkspace.useCases.business.desc', 'Proposals, reports, and presentations that match your brand') },
  ]

  const faqs = [
    { q: t('features.aiWorkspace.faq.q1', 'How does AI Workspace use my voice profile?'), a: t('features.aiWorkspace.faq.a1', 'When you chat with AI Workspace, it automatically applies your voice profile to all generated content. This means every email, post, or article will sound like you wrote it.') },
    { q: t('features.aiWorkspace.faq.q2', 'Can I use it without a voice profile?'), a: t('features.aiWorkspace.faq.a2', 'Yes! You can use AI Workspace without a voice profile, and it will generate content in a neutral, professional tone. However, creating a voice profile significantly improves personalization.') },
    { q: t('features.aiWorkspace.faq.q3', 'What types of content can I create?'), a: t('features.aiWorkspace.faq.a3', 'AI Workspace can help with emails, blog posts, social media content, business proposals, product descriptions, marketing copy, and much more. Use quick actions or describe what you need.') },
    { q: t('features.aiWorkspace.faq.q4', 'Is my conversation history saved?'), a: t('features.aiWorkspace.faq.a4', 'Your conversation history is saved locally and can be accessed across sessions. You can clear it anytime from settings. We prioritize your privacy.') },
    { q: t('features.aiWorkspace.faq.q5', 'Can I edit the generated content?'), a: t('features.aiWorkspace.faq.a5', 'Absolutely! All generated content is fully editable. You can refine, expand, or ask the AI to regenerate with different parameters.') },
  ]

  const comparisonData = [
    { feature: t('features.aiWorkspace.comparison.voiceMatch', 'Voice Profile Integration'), us: '✓', others: '✗' },
    { feature: t('features.aiWorkspace.comparison.quickActions', 'Quick Action Templates'), us: '20+', others: '5-10' },
    { feature: t('features.aiWorkspace.comparison.context', 'Context Memory'), us: '✓', others: t('features.aiWorkspace.comparison.limited', 'Limited') },
    { feature: t('features.aiWorkspace.comparison.languages', 'Languages'), us: '15+', others: '3-5' },
    { feature: t('features.aiWorkspace.comparison.export', 'Export Options'), us: '✓', others: '✗' },
    { feature: t('features.aiWorkspace.comparison.history', 'Conversation History'), us: '✓', others: '✗' },
  ]

  return (
    <>
      <SEOHead
        title={t('aiWorkspace.meta.title')}
        description={t('aiWorkspace.meta.description')}
        keywords={['AI workspace', 'AI chat', 'writing assistant', 'AI writing', 'content generation', 'AI copywriter']}
      />
      <StructuredData
        type="SoftwareApplication"
        data={{
          name: 'Graphos AI Workspace',
          description: t('aiWorkspace.meta.description'),
          url: 'https://graphosai.com/features/ai-workspace',
          applicationCategory: 'ProductivityApplication',
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
          <Breadcrumb items={[{ label: t('nav.home'), href: '/' }, { label: t('nav.features'), href: '#' }, { label: t('nav.aiWorkspace') }]} />

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
              <Icon name="message-square" size="sm" />
              {t('features.aiWorkspace.badge', 'AI That Writes Like You')}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">{t('aiWorkspace.title')}</h1>
            <p className="text-xl text-text-secondary max-w-2xl">{t('aiWorkspace.description')}</p>
          </motion.div>

          {/* Live Demo */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-success/10 text-success text-xs font-medium rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                {t('demo.liveDemo', 'Live Demo')}
              </span>
              <span className="text-sm text-text-muted">{t('features.aiWorkspace.tryItNow', 'Try the chat interface')}</span>
            </div>
            <Suspense fallback={
              <div className="h-[500px] bg-bg-secondary rounded-2xl border border-gray-200 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            }>
              <LiveWorkspaceDemo />
            </Suspense>
          </motion.div>

          {/* Quick Actions Grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-16">
            <h2 className="text-2xl font-bold text-text-primary mb-8">{t('features.aiWorkspace.quickActionsTitle', 'Quick Actions')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  className="p-4 bg-bg-secondary rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg cursor-pointer transition-all duration-300 group"
                >
                  <div className="w-10 h-10 mb-3 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon name={action.icon} size="lg" />
                  </div>
                  <div className="font-medium text-text-primary mb-1">{action.label}</div>
                  <p className="text-xs text-text-secondary">{action.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-16">
            <h2 className="text-2xl font-bold text-text-primary mb-8">{t('features.aiWorkspace.howItWorksTitle', 'How AI Workspace Works')}</h2>
            <div className="bg-bg-secondary rounded-2xl border border-gray-200 overflow-hidden">
              {/* Chat Preview */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-primary text-white rounded-2xl rounded-br-md px-4 py-3">
                      <p className="text-sm">{t('features.aiWorkspace.chatExample.user', 'Help me write a professional email declining a meeting invitation')}</p>
                    </div>
                  </div>
                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] bg-bg-primary border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                      <p className="text-sm text-text-primary whitespace-pre-line">{t('features.aiWorkspace.chatExample.ai', `Hey there,

Thanks so much for thinking of me for the meeting next Tuesday! I really appreciate the invite.

Unfortunately, I've got a conflict that day – my calendar is packed with back-to-back commitments I can't move around. Would it be possible to catch up another time?

Let me know what works for you!

Best,
[Your name]`)}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Icon name="fingerprint" size="sm" />
                    <span>{t('features.aiWorkspace.voiceApplied', 'Voice Profile: Casual & Friendly applied')}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-16">
            <h2 className="text-2xl font-bold text-text-primary mb-8">{t('features.aiWorkspace.whyUse', 'Why Use AI Workspace?')}</h2>
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
            <h2 className="text-2xl font-bold text-text-primary mb-8">{t('features.aiWorkspace.useCasesTitle', 'Perfect For')}</h2>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-16">
            <h2 className="text-2xl font-bold text-text-primary mb-8">{t('features.aiWorkspace.comparisonTitle', 'How We Compare')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-bg-secondary rounded-xl border border-gray-200 overflow-hidden">
                <thead>
                  <tr className="bg-bg-primary">
                    <th className="text-left p-4 text-sm font-semibold text-text-primary">{t('features.aiWorkspace.comparison.feature', 'Feature')}</th>
                    <th className="text-center p-4 text-sm font-semibold text-primary">Graphos AI</th>
                    <th className="text-center p-4 text-sm font-semibold text-text-muted">{t('features.aiWorkspace.comparison.others', 'Others')}</th>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-16">
            <h2 className="text-2xl font-bold text-text-primary mb-8">{t('features.aiWorkspace.faqTitle', 'Frequently Asked Questions')}</h2>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="text-center py-12 bg-gradient-to-br from-primary/10 to-bg-secondary rounded-2xl">
            <h2 className="text-2xl font-bold text-text-primary mb-4">{t('features.aiWorkspace.ctaTitle', 'Start Using AI Workspace')}</h2>
            <p className="text-text-secondary mb-6">{t('features.aiWorkspace.ctaDesc', 'Chat with AI in your unique writing style.')}</p>
            <a href="https://app.graphosai.com" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors">
              {t('cta.getStartedFree')}
            </a>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default AIWorkspace
