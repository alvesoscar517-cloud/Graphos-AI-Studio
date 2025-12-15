import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import SEOHead from '@components/seo/SEOHead'

const sections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'data-collection', title: 'Data Collection' },
  { id: 'voice-profile-data', title: 'Voice Profile Data' },
  { id: 'ai-analysis-data', title: 'AI Analysis Data' },
  { id: 'workspace-data', title: 'Workspace & Chat Data' },
  { id: 'google-drive', title: 'Google Drive Integration' },
  { id: 'payment-data', title: 'Payment & Credits' },
  { id: 'data-usage', title: 'Data Usage' },
  { id: 'data-sharing', title: 'Data Sharing' },
  { id: 'data-security', title: 'Data Security' },
  { id: 'data-retention', title: 'Data Retention' },
  { id: 'user-rights', title: 'User Rights' },
  { id: 'cookies', title: 'Cookies & Storage' },
  { id: 'chrome-extension', title: 'Chrome Extension' },
  { id: 'children', title: 'Children\'s Privacy' },
  { id: 'international', title: 'International Users' },
  { id: 'changes', title: 'Policy Changes' },
  { id: 'contact', title: 'Contact Us' },
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

function PrivacyPolicy() {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState('introduction')

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
        title={t('privacy.meta.title')}
        description={t('privacy.meta.description')}
        keywords={['privacy policy', 'data protection', 'user privacy', 'GDPR', 'AI writing tool privacy']}
      />
      
      <div className="min-h-screen bg-bg-primary relative">
        {/* Header */}
        <header className="bg-bg-primary border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-content-lg mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
            <div className="flex items-center gap-2 text-sm text-text-muted mb-3">
              <span>Legal</span>
              <span>/</span>
              <span className="text-text-secondary">Privacy Policy</span>
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              {t('privacy.title')}
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
              
              <section id="introduction" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Introduction
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  Graphos AI Studio ("we", "our", or "us") is committed to protecting your privacy. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                  information when you use our AI-powered writing assistant service available at{' '}
                  <a href="https://app.graphosai.com" className="text-primary hover:underline">app.graphosai.com</a>{' '}
                  and through our Chrome browser extension.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  By using Graphos AI Studio, you agree to the collection and use of information 
                  in accordance with this policy. If you do not agree with our policies and practices, 
                  please do not use our services.
                </p>
              </section>

              <section id="data-collection" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Data Collection
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  We collect information that you provide directly to us and information collected automatically:
                </p>
                <h3 className="text-md font-medium text-text-primary mb-2 mt-4">Account Information</h3>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Email address (for account creation and communication)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Display name (optional, for personalization)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Google account information (if you sign in with Google)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Authentication credentials (securely hashed passwords for email login)</span>
                  </li>
                </ul>
                <h3 className="text-md font-medium text-text-primary mb-2">Automatically Collected Information</h3>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Device information (browser type, operating system)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Usage data (features used, analysis frequency)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Error logs and performance metrics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Language preferences</span>
                  </li>
                </ul>
              </section>

              <section id="voice-profile-data" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Voice Profile Data
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  Our Voice Profile feature allows you to create a unique writing style profile. When you create a voice profile, we collect:
                </p>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Text samples you provide (pasted text, uploaded documents)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Short writing samples (minimum 3 samples required)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Profile name and theme (work, academic, creative, casual)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Generated writing style characteristics (vocabulary patterns, sentence structures, tone)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Quality score and profile metadata</span>
                  </li>
                </ul>
                <p className="text-text-secondary leading-relaxed">
                  Your voice profile data is used exclusively to analyze and rewrite text to match your personal writing style. 
                  We do not share your writing samples or voice profile data with third parties.
                </p>
              </section>

              <section id="ai-analysis-data" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  AI Analysis Data
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  When you use our AI analysis features, we process the following data:
                </p>
                <h3 className="text-md font-medium text-text-primary mb-2 mt-4">AI Detection</h3>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Text submitted for AI detection analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>AI probability scores and confidence levels</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Human and AI indicators identified in text</span>
                  </li>
                </ul>
                <h3 className="text-md font-medium text-text-primary mb-2">Compatibility Analysis</h3>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Text compared against your voice profile</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Vector and statistical similarity scores</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Deviation analysis and improvement suggestions</span>
                  </li>
                </ul>
                <h3 className="text-md font-medium text-text-primary mb-2">Text Statistics</h3>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Readability scores and vocabulary richness</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Sentence and paragraph statistics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Benchmark comparisons</span>
                  </li>
                </ul>
                <h3 className="text-md font-medium text-text-primary mb-2">Rewrite & Humanize</h3>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Original text submitted for rewriting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Rewritten/humanized output text</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Writing preferences and model selections</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Iterative humanization progress and results</span>
                  </li>
                </ul>
              </section>

              <section id="workspace-data" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Workspace & Chat Data
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  Our AI Workspace feature provides an intelligent chat interface. We collect:
                </p>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Chat conversations and message history</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>File attachments uploaded to conversations (images, documents)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Conversation titles and metadata</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>AI model preferences and temperature settings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Conversation summaries (for context optimization)</span>
                  </li>
                </ul>
                <h3 className="text-md font-medium text-text-primary mb-2">Notes & Documents</h3>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Notes created in AI Studio editor</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Document content and formatting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Analysis results associated with notes</span>
                  </li>
                </ul>
              </section>

              <section id="google-drive" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Google Drive Integration
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  If you choose to sync your data with Google Drive, we request the following permissions:
                </p>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>drive.file</strong> - Access to files created by Graphos AI Studio only</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>userinfo.email</strong> - Your email address for account identification</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>userinfo.profile</strong> - Your basic profile information</span>
                  </li>
                </ul>
                <p className="text-text-secondary leading-relaxed mb-3">
                  Data synced to Google Drive includes:
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Notes and documents from AI Studio</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Chat conversation history</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Files are stored in a dedicated "Graphos AI" folder in your Drive</span>
                  </li>
                </ul>
                <p className="text-text-secondary leading-relaxed mt-3">
                  We do not access any other files in your Google Drive. You can revoke access at any time 
                  through your Google Account settings.
                </p>
              </section>

              <section id="payment-data" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Payment & Credits
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  Graphos AI Studio uses a credit-based system. We collect and process:
                </p>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Credit balance and transaction history</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Credit usage per feature (chat, detection, rewrite, analysis, humanize)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Purchase records and order information</span>
                  </li>
                </ul>
                <p className="text-text-secondary leading-relaxed">
                  Payment processing is handled by secure third-party payment providers. We do not store 
                  your full credit card numbers or banking details on our servers. Payment providers may 
                  collect additional information as described in their respective privacy policies.
                </p>
              </section>

              <section id="data-usage" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  How We Use Your Data
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  We use the information we collect to:
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Provide, maintain, and improve our AI writing services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Create and maintain your voice profiles for personalized writing assistance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Perform AI detection analysis on submitted text</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Rewrite and humanize text to match your writing style</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Provide AI chat assistance with optional humanization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Sync your data across devices via Google Drive</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Process payments and manage your credit balance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Send service-related communications (account verification, password reset)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Respond to your inquiries and provide customer support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Monitor and analyze usage patterns to improve our services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Detect and prevent fraud, abuse, and security issues</span>
                  </li>
                </ul>
              </section>

              <section id="data-sharing" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Data Sharing
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  We do not sell your personal information. We may share your information only in the following circumstances:
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>AI Processing:</strong> Text is sent to Google's Gemini AI models for analysis, rewriting, and chat responses. Google processes this data according to their AI terms of service.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Google Drive:</strong> If you enable sync, your data is stored in your personal Google Drive account.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Payment Processors:</strong> Payment information is shared with our payment providers to process transactions.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>With Your Consent:</strong> We may share information with your explicit consent.</span>
                  </li>
                </ul>
              </section>

              <section id="data-security" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Data Security
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  We implement appropriate technical and organizational measures to protect your personal information:
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>All data transmission is encrypted using TLS/SSL</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Passwords are securely hashed using industry-standard algorithms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Authentication tokens are securely stored and regularly rotated</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Access to user data is restricted to authorized personnel only</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Regular security audits and vulnerability assessments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Session management with automatic expiration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Rate limiting to prevent abuse and unauthorized access</span>
                  </li>
                </ul>
              </section>

              <section id="data-retention" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Data Retention
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  We retain your data for as long as necessary to provide our services:
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Account Data:</strong> Retained while your account is active</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Voice Profiles:</strong> Retained until you delete them or your account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Chat History:</strong> Stored locally and optionally synced to Google Drive; limited to 100 conversations per user</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Analysis Cache:</strong> Temporary cache cleared periodically</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Credit History:</strong> Retained for accounting and audit purposes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Deleted Data:</strong> Permanently removed within 30 days of deletion request</span>
                  </li>
                </ul>
              </section>

              <section id="user-rights" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Your Rights
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  You have the following rights regarding your personal data:
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Access:</strong> Request a copy of your personal data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Correction:</strong> Update or correct inaccurate data through account settings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Deletion:</strong> Delete your voice profiles, notes, conversations, or entire account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Export:</strong> Export your data via Google Drive sync</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Restriction:</strong> Request limitation of processing in certain circumstances</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Objection:</strong> Object to processing based on legitimate interests</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>Withdraw Consent:</strong> Revoke Google Drive access or other permissions at any time</span>
                  </li>
                </ul>
                <p className="text-text-secondary leading-relaxed mt-3">
                  To exercise these rights, contact us at{' '}
                  <a href="mailto:Support@graphosai.com" className="text-primary hover:underline">Support@graphosai.com</a>
                </p>
              </section>

              <section id="cookies" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Cookies & Local Storage
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  We use cookies and browser storage technologies to enhance your experience:
                </p>
                <h3 className="text-md font-medium text-text-primary mb-2 mt-4">Essential Storage</h3>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Authentication tokens for secure login sessions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>User preferences (theme, language)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Draft data for profile creation (auto-saved locally)</span>
                  </li>
                </ul>
                <h3 className="text-md font-medium text-text-primary mb-2">IndexedDB Storage</h3>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Chat conversations (stored locally for offline access)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Analysis cache (to reduce redundant API calls)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span>Profile detail cache</span>
                  </li>
                </ul>
                <p className="text-text-secondary leading-relaxed">
                  You can clear local storage through your browser settings. Note that clearing storage 
                  will remove locally cached data and may require re-authentication.
                </p>
              </section>

              <section id="chrome-extension" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Chrome Extension
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  Our Chrome browser extension requests the following permissions:
                </p>
                <ul className="space-y-2 text-text-secondary mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>identity:</strong> For Google Sign-In authentication</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>storage:</strong> To store authentication tokens and preferences locally</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>webNavigation:</strong> To detect page navigation for extension functionality</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-[6px] h-[6px] rounded-full bg-primary mt-[7px] shrink-0"></span>
                    <span><strong>tabs:</strong> To interact with browser tabs for the extension interface</span>
                  </li>
                </ul>
                <p className="text-text-secondary leading-relaxed">
                  The extension only communicates with our servers (graphosai-472729326429.us-central1.run.app) 
                  and does not access or modify content on other websites unless explicitly initiated by you.
                </p>
              </section>

              <section id="children" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Children's Privacy
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  Graphos AI Studio is not intended for children under 13 years of age. We do not knowingly 
                  collect personal information from children under 13. If you are a parent or guardian and 
                  believe your child has provided us with personal information, please contact us at{' '}
                  <a href="mailto:Support@graphosai.com" className="text-primary hover:underline">Support@graphosai.com</a>{' '}
                  and we will delete such information from our systems.
                </p>
              </section>

              <section id="international" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  International Users
                </h2>
                <p className="text-text-secondary leading-relaxed mb-3">
                  Graphos AI Studio is operated from the United States. If you are accessing our services 
                  from outside the United States, please be aware that your information may be transferred 
                  to, stored, and processed in the United States and other countries.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  For users in the European Economic Area (EEA), we process your data based on: (1) your consent, 
                  (2) the necessity to perform our contract with you, (3) our legitimate interests, or 
                  (4) compliance with legal obligations. You have the right to lodge a complaint with your 
                  local data protection authority.
                </p>
              </section>

              <section id="changes" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Policy Changes
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material 
                  changes by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                  We encourage you to review this Privacy Policy periodically for any changes. Your continued 
                  use of the service after any modifications indicates your acceptance of the updated policy.
                </p>
              </section>

              <section id="contact" className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Contact Us
                </h2>
                <p className="text-text-secondary leading-relaxed mb-4">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
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

export default PrivacyPolicy
