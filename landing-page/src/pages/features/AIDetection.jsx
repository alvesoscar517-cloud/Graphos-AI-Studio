import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useState, lazy, Suspense } from 'react'
import SEOHead from '@components/seo/SEOHead'
import StructuredData from '@components/seo/StructuredData'
import Breadcrumb from '@components/common/Breadcrumb'
import Icon from '@components/common/Icon'

// Lazy load the real demo for better performance
const RealAIDetectionDemo = lazy(() => import('@components/demos/RealAIDetectionDemo'))

function AIDetection() {
  const { t } = useTranslation()
  const [openFaq, setOpenFaq] = useState(null)

  const benefits = [
    { icon: 'target', title: t('features.aiDetection.benefits.accuracy.title', 'High Accuracy'), description: t('features.aiDetection.benefits.accuracy.desc', 'Advanced algorithms detect AI-generated content with 98%+ precision') },
    { icon: 'zap', title: t('features.aiDetection.benefits.speed.title', 'Fast Analysis'), description: t('features.aiDetection.benefits.speed.desc', 'Get results in seconds, not minutes') },
    { icon: 'bar-chart', title: t('features.aiDetection.benefits.reports.title', 'Detailed Reports'), description: t('features.aiDetection.benefits.reports.desc', 'Understand exactly which parts may be AI-generated with confidence scores') },
    { icon: 'lock', title: t('features.aiDetection.benefits.privacy.title', 'Privacy First'), description: t('features.aiDetection.benefits.privacy.desc', 'Your content is never stored or shared') },
  ]

  const useCases = [
    { icon: 'graduation-cap', title: t('features.aiDetection.useCases.education.title', 'Education'), description: t('features.aiDetection.useCases.education.desc', 'Teachers and professors can verify student submissions for academic integrity') },
    { icon: 'briefcase', title: t('features.aiDetection.useCases.business.title', 'Business'), description: t('features.aiDetection.useCases.business.desc', 'Ensure authentic content in marketing, PR, and corporate communications') },
    { icon: 'edit-3', title: t('features.aiDetection.useCases.publishing.title', 'Publishing'), description: t('features.aiDetection.useCases.publishing.desc', 'Publishers and editors can verify content authenticity before publication') },
    { icon: 'users', title: t('features.aiDetection.useCases.hiring.title', 'Hiring'), description: t('features.aiDetection.useCases.hiring.desc', 'HR teams can check cover letters and writing samples for authenticity') },
  ]

  const faqs = [
    { q: t('features.aiDetection.faq.q1', 'How accurate is the AI detection?'), a: t('features.aiDetection.faq.a1', 'Our AI detection achieves 98%+ accuracy on most AI-generated content, including ChatGPT, GPT-4, Claude, and other popular models. We continuously update our algorithms to detect the latest AI writing patterns.') },
    { q: t('features.aiDetection.faq.q2', 'What types of AI content can you detect?'), a: t('features.aiDetection.faq.a2', 'We can detect content from ChatGPT, GPT-4, GPT-3.5, Claude, Gemini, Llama, and most other popular AI writing tools. Our system is regularly updated to recognize new AI models.') },
    { q: t('features.aiDetection.faq.q3', 'Is my content stored or shared?'), a: t('features.aiDetection.faq.a3', 'No. We prioritize your privacy. Your text is analyzed in real-time and is not stored on our servers. We never share your content with third parties.') },
    { q: t('features.aiDetection.faq.q4', 'What is the minimum text length required?'), a: t('features.aiDetection.faq.a4', 'For accurate detection, we recommend at least 50 characters. Longer texts (200+ words) provide more reliable results as our AI has more patterns to analyze.') },
    { q: t('features.aiDetection.faq.q5', 'Can AI detection be fooled?'), a: t('features.aiDetection.faq.a5', 'While no detection system is 100% perfect, our multi-layer analysis makes it very difficult to bypass. We analyze writing patterns, vocabulary, sentence structure, and many other factors simultaneously.') },
    { q: t('features.aiDetection.faq.q6', 'How do you handle different languages?'), a: t('features.aiDetection.faq.a6', 'Our AI detection supports 15+ languages including English, Vietnamese, Spanish, French, German, and more. The system automatically detects the language and applies appropriate analysis patterns.') },
    { q: t('features.aiDetection.faq.q7', "What's the difference between free and premium?"), a: t('features.aiDetection.faq.a7', 'Free users get limited detections per day with basic indicators. Premium users enjoy unlimited detections, detailed evidence reports, API access, and priority processing.') },
  ]

  const comparisonData = [
    { feature: t('features.aiDetection.comparison.accuracy', 'Detection Accuracy'), us: '98%+', others: '85-90%' },
    { feature: t('features.aiDetection.comparison.speed', 'Analysis Speed'), us: '<2s', others: '5-10s' },
    { feature: t('features.aiDetection.comparison.models', 'AI Models Detected'), us: '15+', others: '5-8' },
    { feature: t('features.aiDetection.comparison.confidence', 'Confidence Score'), us: '✓', others: '✗' },
    { feature: t('features.aiDetection.comparison.indicators', 'Human/AI Indicators'), us: '✓', others: '✗' },
    { feature: t('features.aiDetection.comparison.privacy', 'No Data Storage'), us: '✓', others: '✗' },
    { feature: t('features.aiDetection.comparison.languages', 'Multi-language Support'), us: '15+', others: '3-5' },
  ]

  const testimonials = [
    {
      quote: t('features.aiDetection.testimonials.education.quote', 'This tool has saved me countless hours checking student papers. The accuracy is impressive and the detailed indicators help me understand exactly what to look for.'),
      author: t('features.aiDetection.testimonials.education.author', 'Dr. Sarah Chen'),
      role: t('features.aiDetection.testimonials.education.role', 'University Professor'),
      avatar: '👩‍🏫'
    },
    {
      quote: t('features.aiDetection.testimonials.business.quote', 'Essential for our content team. We use it to verify all incoming content before publication. The confidence scores give us peace of mind.'),
      author: t('features.aiDetection.testimonials.business.author', 'Michael Torres'),
      role: t('features.aiDetection.testimonials.business.role', 'Content Director, Tech Startup'),
      avatar: '👨‍💼'
    },
    {
      quote: t('features.aiDetection.testimonials.freelance.quote', 'As a freelance editor, I need to ensure the content I receive is authentic. This tool is fast, accurate, and the privacy-first approach is exactly what I need.'),
      author: t('features.aiDetection.testimonials.freelance.author', 'Emma Williams'),
      role: t('features.aiDetection.testimonials.freelance.role', 'Freelance Editor'),
      avatar: '✍️'
    }
  ]

  const howItWorksSteps = [
    {
      step: 1,
      title: t('features.aiDetection.howItWorks.step1.title', 'Paste Your Text'),
      desc: t('features.aiDetection.howItWorks.step1.desc', 'Enter or paste the content you want to analyze (minimum 50 characters)'),
      icon: 'clipboard'
    },
    {
      step: 2,
      title: t('features.aiDetection.howItWorks.step2.title', 'Multi-Layer Analysis'),
      desc: t('features.aiDetection.howItWorks.step2.desc', 'Our AI analyzes patterns, vocabulary, sentence structure, and writing style'),
      icon: 'layers'
    },
    {
      step: 3,
      title: t('features.aiDetection.howItWorks.step3.title', 'Get Detailed Results'),
      desc: t('features.aiDetection.howItWorks.step3.desc', 'Receive AI probability score, confidence level, and human/AI indicators'),
      icon: 'bar-chart-2'
    }
  ]

  return (
    <>
      <SEOHead
        title={t('aiDetection.meta.title')}
        description={t('aiDetection.meta.description')}
        keywords={['AI detection', 'AI content detector', 'detect AI writing', 'ChatGPT detector', 'GPT detector', 'AI checker', 'plagiarism checker AI']}
      />
      <StructuredData
        type="SoftwareApplication"
        data={{
          name: 'Graphos AI Detection',
          description: t('aiDetection.meta.description'),
          url: 'https://graphosai.com/features/ai-detection',
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '2500'
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
              { label: t('nav.aiDetection') },
            ]}
          />

          {/* Hero Section with Gradient Background */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 mb-12 relative"
          >
            {/* Background Gradient */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 rounded-3xl -z-10" />
            
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
              <Icon name="shield-check" size="sm" />
              {t('features.aiDetection.badge', '98% Accuracy Rate')}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              {t('aiDetection.title')}
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mb-6">
              {t('aiDetection.description')}
            </p>

            {/* Trust Statistics */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="cpu" size="sm" className="text-primary" />
                </div>
                <span>{t('features.aiDetection.stats.models', '15+ AI Models Detected')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="zap" size="sm" className="text-primary" />
                </div>
                <span>{t('features.aiDetection.stats.speed', '<2s Analysis Time')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="globe" size="sm" className="text-primary" />
                </div>
                <span>{t('features.aiDetection.stats.languages', '15+ Languages')}</span>
              </div>
            </div>

            {/* Primary CTAs */}
            <div className="flex flex-wrap gap-3">
              <a
                href="https://app.graphosai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/25"
              >
                {t('cta.getStartedFree', 'Get Started Free')}
                <Icon name="arrow-right" size="sm" />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-bg-secondary border border-gray-200 text-text-primary rounded-xl font-semibold hover:bg-bg-hover transition-colors"
              >
                <Icon name="play-circle" size="sm" />
                {t('cta.tryDemo', 'Try Demo')}
              </a>
            </div>
          </motion.div>

          {/* Live Demo Section */}
          <motion.div
            id="demo"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16 scroll-mt-24"
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1.5 bg-success/10 text-success text-xs font-semibold rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                {t('demo.liveDemo', 'Live Demo')}
              </span>
              <span className="text-sm text-text-muted">{t('features.aiDetection.tryItNow', 'Try it now - no sign up required')}</span>
            </div>
            <Suspense fallback={
              <div className="h-[520px] bg-bg-secondary rounded-2xl border border-gray-200 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-sm text-text-muted">{t('common.loading', 'Loading...')}</span>
                </div>
              </div>
            }>
              <RealAIDetectionDemo />
            </Suspense>
          </motion.div>

          {/* How It Works Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
                {t('features.aiDetection.howItWorks.title', 'How AI Detection Works')}
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                {t('features.aiDetection.howItWorks.subtitle', 'Our multi-layer analysis ensures accurate detection in just seconds')}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-bg-secondary to-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {howItWorksSteps.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-center relative"
                  >
                    {/* Connector line */}
                    {index < howItWorksSteps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-primary/10" />
                    )}
                    
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center relative">
                      <Icon name={item.icon} size="xl" className="text-primary" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="font-semibold text-text-primary mb-2">{item.title}</h3>
                    <p className="text-sm text-text-secondary">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
              
              {/* Result Preview */}
              <div className="mt-8 p-4 md:p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Score Circle */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="aiDetectionGradientPreview" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#93c5fd" />
                          <stop offset="50%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#2563eb" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border-light)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#aiDetectionGradientPreview)" strokeWidth="8" strokeLinecap="round" strokeDasharray="263.89" strokeDashoffset="66" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-text-primary">75%</span>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 py-2 px-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs font-semibold text-yellow-700 mb-2">
                      <Icon name="alert-circle" size="sm" />
                      <span>{t('features.aiDetection.sampleVerdict', 'Mixed content')}</span>
                    </div>
                    <p className="text-sm text-text-secondary">{t('features.aiDetection.sampleDesc', 'Sample result showing AI probability with confidence score and detailed human/AI indicators')}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
                {t('features.aiDetection.whyChoose', 'Why Choose Our AI Detection?')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="group p-6 bg-bg-secondary rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon name={benefit.icon} size="lg" className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">{benefit.title}</h3>
                  <p className="text-text-secondary text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Testimonials Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
                {t('features.aiDetection.testimonials.title', 'Trusted by Professionals')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {testimonials.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-6 bg-bg-secondary rounded-xl border border-gray-200"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Icon key={i} name="star" size="sm" className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-text-secondary text-sm mb-4 italic">"{item.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-lg">
                      {item.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary text-sm">{item.author}</div>
                      <div className="text-text-muted text-xs">{item.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Use Cases Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
                {t('features.aiDetection.useCasesTitle', 'Use Cases')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {useCases.map((useCase, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex gap-4 p-5 bg-bg-secondary rounded-xl border border-gray-200 hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                    <Icon name={useCase.icon} size="lg" className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">{useCase.title}</h3>
                    <p className="text-text-secondary text-sm">{useCase.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
                {t('features.aiDetection.comparisonTitle', 'How We Compare')}
              </h2>
            </div>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full min-w-[500px] bg-bg-secondary rounded-xl border border-gray-200 overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-primary/5 to-purple-500/5">
                    <th className="text-left p-4 text-sm font-semibold text-text-primary">{t('features.aiDetection.comparison.feature', 'Feature')}</th>
                    <th className="text-center p-4 text-sm font-semibold text-primary">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="sparkles" size="sm" />
                        Graphos AI
                      </span>
                    </th>
                    <th className="text-center p-4 text-sm font-semibold text-text-muted">{t('features.aiDetection.comparison.others', 'Others')}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="border-t border-gray-200 hover:bg-bg-hover transition-colors">
                      <td className="p-4 text-sm text-text-primary">{row.feature}</td>
                      <td className="p-4 text-center text-sm font-semibold text-primary">{row.us}</td>
                      <td className="p-4 text-center text-sm text-text-muted">{row.others}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Pricing Teaser */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-16"
          >
            <div className="bg-gradient-to-br from-primary/5 via-bg-secondary to-purple-500/5 rounded-2xl border border-gray-200 p-6 md:p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
                  {t('features.aiDetection.pricing.title', 'Simple, Transparent Pricing')}
                </h2>
                <p className="text-text-secondary">
                  {t('features.aiDetection.pricing.subtitle', 'Start free, upgrade when you need more')}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* Free Tier */}
                <div className="p-6 bg-white rounded-xl border border-gray-200">
                  <div className="text-sm font-semibold text-text-muted mb-2">{t('features.aiDetection.pricing.free', 'Free')}</div>
                  <div className="text-3xl font-bold text-text-primary mb-4">$0</div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <Icon name="check" size="sm" className="text-green-500" />
                      {t('features.aiDetection.pricing.freeFeature1', '5 detections/day')}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <Icon name="check" size="sm" className="text-green-500" />
                      {t('features.aiDetection.pricing.freeFeature2', 'Basic indicators')}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <Icon name="check" size="sm" className="text-green-500" />
                      {t('features.aiDetection.pricing.freeFeature3', 'Standard processing')}
                    </li>
                  </ul>
                  <a
                    href="https://app.graphosai.com/signup"
                    className="block w-full py-2.5 text-center bg-bg-secondary border border-gray-200 text-text-primary rounded-xl font-medium hover:bg-bg-hover transition-colors"
                  >
                    {t('cta.getStarted', 'Get Started')}
                  </a>
                </div>
                
                {/* Pro Tier */}
                <div className="p-6 bg-gradient-to-br from-primary to-blue-600 rounded-xl text-white relative overflow-hidden">
                  <div className="absolute top-3 right-3 px-2 py-1 bg-white/20 rounded-full text-xs font-semibold">
                    {t('features.aiDetection.pricing.popular', 'Popular')}
                  </div>
                  <div className="text-sm font-semibold text-white/80 mb-2">{t('features.aiDetection.pricing.pro', 'Pro')}</div>
                  <div className="text-3xl font-bold mb-4">$9<span className="text-lg font-normal text-white/70">/mo</span></div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <Icon name="check" size="sm" className="text-white" />
                      {t('features.aiDetection.pricing.proFeature1', 'Unlimited detections')}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Icon name="check" size="sm" className="text-white" />
                      {t('features.aiDetection.pricing.proFeature2', 'Full evidence reports')}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Icon name="check" size="sm" className="text-white" />
                      {t('features.aiDetection.pricing.proFeature3', 'API access')}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Icon name="check" size="sm" className="text-white" />
                      {t('features.aiDetection.pricing.proFeature4', 'Priority processing')}
                    </li>
                  </ul>
                  <a
                    href="https://app.graphosai.com/signup?plan=pro"
                    className="block w-full py-2.5 text-center bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-colors"
                  >
                    {t('cta.startFreeTrial', 'Start Free Trial')}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
                {t('features.aiDetection.faqTitle', 'Frequently Asked Questions')}
              </h2>
            </div>
            <div className="space-y-3 max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + index * 0.05 }}
                  className="bg-bg-secondary rounded-xl border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-bg-hover transition-colors"
                  >
                    <span className="font-medium text-text-primary pr-4">{faq.q}</span>
                    <Icon 
                      name={openFaq === index ? 'chevron-up' : 'chevron-down'} 
                      size="md" 
                      className="text-text-muted flex-shrink-0" 
                    />
                  </button>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4"
                    >
                      <p className="text-text-secondary text-sm leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Final CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center py-12 md:py-16 bg-gradient-to-br from-primary/10 via-bg-secondary to-purple-500/10 rounded-2xl relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-10 left-10 w-20 h-20 bg-primary/20 rounded-full blur-2xl" />
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
                <Icon name="sparkles" size="sm" />
                {t('features.aiDetection.ctaBadge', 'Start detecting in seconds')}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                {t('features.aiDetection.ctaTitle', 'Ready to Detect AI Content?')}
              </h2>
              <p className="text-text-secondary mb-8 max-w-xl mx-auto">
                {t('features.aiDetection.ctaDesc', 'Join thousands of professionals who trust Graphos AI for accurate content detection. Start free today.')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://app.graphosai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/25"
                >
                  {t('cta.getStartedFree', 'Get Started Free')}
                  <Icon name="arrow-right" size="sm" />
                </a>
                <a
                  href="https://chromewebstore.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white border border-gray-200 text-text-primary rounded-xl font-semibold hover:bg-bg-hover transition-colors shadow-sm"
                >
                  <Icon name="chrome" size="md" />
                  {t('features.aiDetection.chromeExtension', 'Chrome Extension')}
                </a>
              </div>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Icon name="check-circle" size="sm" className="text-green-500" />
                  {t('features.aiDetection.trustIndicator1', 'No credit card required')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="check-circle" size="sm" className="text-green-500" />
                  {t('features.aiDetection.trustIndicator2', 'Setup in 30 seconds')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="check-circle" size="sm" className="text-green-500" />
                  {t('features.aiDetection.trustIndicator3', 'Cancel anytime')}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default AIDetection
