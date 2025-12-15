import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import SEOHead from '@components/seo/SEOHead'

const sections = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'description', title: 'Service Description' },
  { id: 'account', title: 'Account Terms' },
  { id: 'voice-profiles', title: 'Voice Profiles' },
  { id: 'ai-features', title: 'AI Features' },
  { id: 'credits', title: 'Credits & Payments' },
  { id: 'usage', title: 'Acceptable Use' },
  { id: 'content', title: 'User Content' },
  { id: 'intellectual-property', title: 'Intellectual Property' },
  { id: 'third-party', title: 'Third-Party Services' },
  { id: 'disclaimer', title: 'Disclaimers' },
  { id: 'limitation', title: 'Limitation of Liability' },
  { id: 'indemnification', title: 'Indemnification' },
  { id: 'termination', title: 'Termination' },
  { id: 'changes', title: 'Changes to Terms' },
  { id: 'governing-law', title: 'Governing Law' },
  { id: 'contact', title: 'Contact' },
]

function PolicyNav({ sections, activeSection, onNavigate }) {
  return (
    <nav className="hidden lg:block w-52 shrink-0">
      <div className="sticky top-24">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          On this page
        </p>
        <ul className="space-y-1 border-l border-gray-200 dark:border-gray-700">
          {sections.map(section => (
            <li key={section.id}>
              <button
                onClick={() => onNavigate(section.id)}
                className={`block w-full text-left text-sm py-1 pl-3 -ml-px border-l-2 transition-colors duration-150 ${
                  activeSection === section.id
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

function Terms() {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState('acceptance')

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -70% 0px' }
    )

    sections.forEach(section => {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const handleNavigate = id => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const top = element.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <>
      <SEOHead
        title={t('terms.meta.title')}
        description={t('terms.meta.description')}
        keywords={['terms of service', 'user agreement', 'terms and conditions', 'AI writing tool terms']}
      />
      
      <div className="min-h-screen bg-bg-primary relative">
        {/* Header */}
        <header className="bg-bg-primary border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-content-lg mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
            <div className="flex items-center gap-2 text-sm text-text-muted mb-3">
              <span>Legal</span>
              <span>/</span>
              <span className="text-text-secondary">Terms of Service</span>
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              {t('terms.title')}
            </h1>
            <p className="text-sm text-text-muted">
              Last updated: December 16, 2025
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-content-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-12">
            {/* Main Content */}
            <article className="flex-1 min-w-0">
              
              <section id="acceptance" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Acceptance of Terms
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  By accessing or using Graphos AI Studio ("Service"), available at{' '}
                  <a href="https://app.graphosai.com" className="text-primary hover:underline">app.graphosai.com</a>{' '}
                  and through our Chrome browser extension, you agree to be bound by these Terms of Service ("Terms"). 
                  These Terms constitute a legally binding agreement between you and Graphos AI Studio ("we", "our", or "us").
                </p>
                <p className="text-text-secondary leading-relaxed">
                  If you do not agree to these Terms, you must not access or use our Service. By creating an account 
                  or using any part of the Service, you acknowledge that you have read, understood, and agree to be 
                  bound by these Terms and our Privacy Policy.
                </p>
              </section>

              <section id="description" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Service Description
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  Graphos AI Studio is an AI-powered writing assistant platform that provides the following features:
                </p>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Voice Profile Creation:</strong> Create personalized writing style profiles by analyzing your text samples</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>AI Detection:</strong> Analyze text to determine the probability of AI-generated content</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Compatibility Analysis:</strong> Compare text against your voice profile for style consistency</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Text Statistics:</strong> Analyze readability, vocabulary richness, and other writing metrics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Text Rewriting:</strong> Rewrite content to match your personal writing style</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Humanization:</strong> Transform AI-generated text to appear more human-written</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>AI Workspace:</strong> Chat interface with AI assistants, with optional humanized responses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>AI Studio Editor:</strong> Rich text editor with integrated AI analysis tools</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Google Drive Sync:</strong> Synchronize your notes and conversations across devices</span>
                  </li>
                </ul>
                <p className="text-text-secondary leading-relaxed">
                  The Service is available through our web application and Chrome browser extension. Features and 
                  availability may vary between platforms.
                </p>
              </section>

              <section id="account" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Account Terms
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  To use certain features of the Service, you must create an account. By creating an account, you agree to:
                </p>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Provide accurate, current, and complete information during registration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Maintain and promptly update your account information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Maintain the security and confidentiality of your login credentials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Accept responsibility for all activities that occur under your account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Notify us immediately of any unauthorized use of your account</span>
                  </li>
                </ul>
                <h3 className="text-md font-medium text-text-primary mb-2 mt-4">Account Restrictions</h3>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>You must be at least 13 years old to use this Service</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>One person or entity may not maintain multiple accounts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Accounts cannot be transferred or sold to another party</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>We reserve the right to suspend or terminate accounts that violate these Terms</span>
                  </li>
                </ul>
              </section>

              <section id="voice-profiles" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Voice Profiles
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  Voice Profiles are a core feature of Graphos AI Studio. By creating a voice profile, you understand and agree that:
                </p>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>You must provide text samples that you have the right to use</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>A minimum of 3 text samples is required to create a profile</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Text samples should represent your authentic writing style</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Profile creation consumes credits based on the complexity of analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Profile quality depends on the quality and quantity of samples provided</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>You can delete your voice profiles at any time</span>
                  </li>
                </ul>
                <p className="text-text-secondary leading-relaxed">
                  We do not guarantee that rewritten text will perfectly match your writing style or pass any 
                  specific AI detection tools. Results may vary based on the quality of your voice profile and 
                  the nature of the content being processed.
                </p>
              </section>

              <section id="ai-features" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  AI Features
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  Our AI-powered features are provided for informational and assistance purposes. You acknowledge that:
                </p>
                <h3 className="text-md font-medium text-text-primary mb-2 mt-4">AI Detection</h3>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>AI detection results are probabilistic estimates, not definitive determinations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Results should not be used as the sole basis for academic, legal, or employment decisions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Confidence levels indicate the reliability of the analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Minimum text length of 50 characters is required for accurate detection</span>
                  </li>
                </ul>
                <h3 className="text-md font-medium text-text-primary mb-2">Rewriting & Humanization</h3>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Rewritten text may differ significantly from the original</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>We do not guarantee that humanized text will bypass any specific AI detection system</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>You are responsible for reviewing and editing AI-generated content before use</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Iterative humanization may require multiple processing iterations</span>
                  </li>
                </ul>
                <h3 className="text-md font-medium text-text-primary mb-2">AI Workspace Chat</h3>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>AI responses are generated by third-party AI models (Google Gemini)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Responses may contain inaccuracies or outdated information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Chat history is limited to 50 messages per conversation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Maximum of 100 conversations stored per user</span>
                  </li>
                </ul>
              </section>

              <section id="credits" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Credits & Payments
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  Graphos AI Studio operates on a credit-based system:
                </p>
                <h3 className="text-md font-medium text-text-primary mb-2 mt-4">Credit Usage</h3>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Credits are consumed when using AI features (chat, detection, rewrite, analysis, humanize)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Credit costs vary by feature and text length</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>New users may receive welcome bonus credits</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Credit balance and transaction history are available in your account</span>
                  </li>
                </ul>
                <h3 className="text-md font-medium text-text-primary mb-2">Purchases</h3>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Credit packages are available for purchase</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>All purchases are final and non-refundable unless required by law</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Prices may change with 30 days notice</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Credits do not expire while your account remains active</span>
                  </li>
                </ul>
                <h3 className="text-md font-medium text-text-primary mb-2">Refunds</h3>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Refunds may be issued at our discretion for technical issues</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Refund requests must be submitted within 14 days of purchase</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Contact <a href="mailto:Support@graphosai.com" className="text-primary hover:underline">Support@graphosai.com</a> for refund inquiries</span>
                  </li>
                </ul>
              </section>

              <section id="usage" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Acceptable Use
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  You agree to use the Service only for lawful purposes. You must not:
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Use the Service for any illegal purpose or in violation of any laws</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Submit content that infringes on intellectual property rights of others</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Use the Service to generate harmful, misleading, or deceptive content</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Attempt to bypass AI detection for academic dishonesty or fraud</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Submit content containing malware, viruses, or malicious code</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Attempt to gain unauthorized access to our systems or other users' accounts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Interfere with or disrupt the Service or servers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Use automated systems (bots, scrapers) without our permission</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Reverse engineer, decompile, or attempt to extract source code</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Resell, redistribute, or commercially exploit the Service without authorization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Circumvent rate limits or abuse the credit system</span>
                  </li>
                </ul>
              </section>

              <section id="content" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  User Content
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  You retain ownership of all content you submit to the Service ("User Content"). By submitting User Content, you:
                </p>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Grant us a limited license to process, analyze, and store your content to provide the Service</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Represent that you have the right to submit such content</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Acknowledge that content may be processed by third-party AI services</span>
                  </li>
                </ul>
                <p className="text-text-secondary leading-relaxed mb-3">
                  We do not claim ownership of your User Content. However, we may use aggregated, anonymized data 
                  to improve our services.
                </p>
                <h3 className="text-md font-medium text-text-primary mb-2">Content Restrictions</h3>
                <p className="text-text-secondary leading-relaxed mb-3">
                  You must not submit content that:
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Contains illegal material or promotes illegal activities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Contains hate speech, harassment, or threats</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Contains sexually explicit material involving minors</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Violates the privacy or rights of others</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Contains personal information of others without consent</span>
                  </li>
                </ul>
              </section>

              <section id="intellectual-property" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Intellectual Property
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  The Service and its original content, features, and functionality are owned by Graphos AI Studio 
                  and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Our trademarks, logos, and service marks may not be used without permission</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>You retain ownership of your original content submitted to the Service</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>AI-generated output based on your content belongs to you</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>You grant us a license to use your content solely to provide the Service</span>
                  </li>
                </ul>
              </section>

              <section id="third-party" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Third-Party Services
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  Our Service integrates with third-party services:
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Google Gemini AI:</strong> Powers our AI analysis, chat, and rewriting features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Google Drive:</strong> Optional sync for notes and conversations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Google Sign-In:</strong> Authentication option</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Firebase:</strong> Authentication and real-time data services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Payment Processors:</strong> Secure payment handling</span>
                  </li>
                </ul>
                <p className="text-text-secondary leading-relaxed mt-3">
                  Your use of third-party services is subject to their respective terms of service and privacy policies. 
                  We are not responsible for the practices of third-party services.
                </p>
              </section>

              <section id="disclaimer" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Disclaimers
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Implied warranties of merchantability, fitness for a particular purpose, and non-infringement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Warranties that the Service will be uninterrupted, error-free, or secure</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Warranties regarding the accuracy or reliability of AI-generated results</span>
                  </li>
                </ul>
                <p className="text-text-secondary leading-relaxed mb-3">
                  Specifically regarding our AI features:
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>AI detection results are estimates and should not be relied upon as definitive proof</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Humanized text is not guaranteed to pass any specific AI detection system</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Voice profile matching is approximate and may not perfectly replicate your writing style</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>AI chat responses may contain inaccuracies and should be verified</span>
                  </li>
                </ul>
              </section>

              <section id="limitation" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Limitation of Liability
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, GRAPHOS AI STUDIO AND ITS OFFICERS, DIRECTORS, 
                  EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR:
                </p>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Any indirect, incidental, special, consequential, or punitive damages</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Loss of profits, data, use, goodwill, or other intangible losses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Damages resulting from unauthorized access to your account or data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Damages resulting from reliance on AI detection or analysis results</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Academic, professional, or legal consequences from using our Service</span>
                  </li>
                </ul>
                <p className="text-text-secondary leading-relaxed">
                  Our total liability for any claims arising from your use of the Service shall not exceed 
                  the amount you paid us in the twelve (12) months preceding the claim.
                </p>
              </section>

              <section id="indemnification" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Indemnification
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  You agree to indemnify, defend, and hold harmless Graphos AI Studio and its officers, directors, 
                  employees, and agents from any claims, damages, losses, liabilities, and expenses (including 
                  reasonable attorneys' fees) arising from: (a) your use of the Service; (b) your violation of 
                  these Terms; (c) your violation of any rights of another party; or (d) your User Content.
                </p>
              </section>

              <section id="termination" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Termination
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  We may terminate or suspend your account and access to the Service:
                </p>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Immediately, without prior notice, for violation of these Terms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>For suspected fraudulent, abusive, or illegal activity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>If required by law or legal process</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>For extended periods of inactivity</span>
                  </li>
                </ul>
                <p className="text-text-secondary leading-relaxed mb-3">
                  You may terminate your account at any time through your account settings. Upon termination:
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Your right to use the Service will immediately cease</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Unused credits are non-refundable</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Your data will be deleted according to our Privacy Policy</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Data synced to Google Drive will remain in your Drive account</span>
                  </li>
                </ul>
              </section>

              <section id="changes" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Changes to Terms
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify you of material changes 
                  by posting the updated Terms on this page and updating the "Last updated" date. For significant 
                  changes, we may also notify you via email or through the Service. Your continued use of the 
                  Service after any modifications constitutes acceptance of the updated Terms. If you do not agree 
                  to the modified Terms, you must stop using the Service.
                </p>
              </section>

              <section id="governing-law" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Governing Law & Disputes
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  These Terms shall be governed by and construed in accordance with the laws of the United States, 
                  without regard to its conflict of law provisions.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  Any disputes arising from these Terms or your use of the Service shall be resolved through 
                  binding arbitration, except where prohibited by law. You agree to waive any right to participate 
                  in class action lawsuits or class-wide arbitration.
                </p>
              </section>

              <section id="contact" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Contact Information
                </h2>
                <p className="text-text-secondary leading-relaxed mb-4">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Email: <a href="mailto:Support@graphosai.com" className="text-primary hover:underline">Support@graphosai.com</a></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Web Application: <a href="https://app.graphosai.com" className="text-primary hover:underline">app.graphosai.com</a></span>
                  </li>
                </ul>
              </section>

            </article>

            {/* Sidebar Navigation */}
            <PolicyNav 
              sections={sections} 
              activeSection={activeSection} 
              onNavigate={handleNavigate} 
            />
          </div>
        </div>

        {/* Wave divider to Footer */}
        <div className="w-full pointer-events-none mt-8">
          <svg 
            viewBox="0 0 1440 80" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto block"
            preserveAspectRatio="none"
          >
            <path 
              d="M0 40C240 70 480 10 720 40C960 70 1200 10 1440 40V80H0V40Z" 
              className="fill-slate-100"
            />
            <path 
              d="M0 50C240 75 480 25 720 50C960 75 1200 25 1440 50V80H0V50Z" 
              className="fill-slate-200"
            />
          </svg>
        </div>
      </div>
    </>
  )
}

export default Terms
