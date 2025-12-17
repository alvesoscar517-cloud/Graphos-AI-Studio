/**
 * AIDetection - SEO-optimized AI Detection feature page
 * Enhanced: Dec 2025 - Full SEO optimization for Google crawling
 * Features: Comprehensive structured data, semantic HTML, multi-language SEO
 */
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, lazy, Suspense, useEffect, useRef, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import SEOHead from '@components/seo/SEOHead'
import StructuredData from '@components/seo/StructuredData'
import Breadcrumb from '@components/common/Breadcrumb'
import Icon from '@components/common/Icon'
import RelatedFeatures from '@components/common/RelatedFeatures'
import ThreeDotsLoading from '@components/common/ThreeDotsLoading'

// Lazy load components for better performance
const LiveAIDetectionDemo = lazy(() => import('@components/demos/LiveAIDetectionDemo'))
const PricingSection = lazy(() => import('@components/sections/PricingSection'))

// Hero Background - Static Radar/Scanner design (no animation)
const HeroBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-10">
    {/* Base gradient */}
    <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900" />
    
    {/* SVG Radar Background - Static - Responsive sizing */}
    <svg 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[650px] md:w-[750px] lg:w-[900px] h-[500px] sm:h-[650px] md:h-[750px] lg:h-[900px] opacity-100"
      viewBox="0 0 800 800"
      fill="none"
    >
      {/* Concentric circles - darker/bolder */}
      <circle cx="400" cy="400" r="80" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" fill="none" />
      <circle cx="400" cy="400" r="140" stroke="rgba(59, 130, 246, 0.22)" strokeWidth="1.5" fill="none" />
      <circle cx="400" cy="400" r="200" stroke="rgba(59, 130, 246, 0.18)" strokeWidth="1.5" fill="none" />
      <circle cx="400" cy="400" r="260" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" fill="none" />
      <circle cx="400" cy="400" r="320" stroke="rgba(59, 130, 246, 0.12)" strokeWidth="1" fill="none" />
      <circle cx="400" cy="400" r="380" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" fill="none" />
      
      {/* Cross lines - bolder */}
      <line x1="400" y1="20" x2="400" y2="780" stroke="rgba(59, 130, 246, 0.12)" strokeWidth="1" />
      <line x1="20" y1="400" x2="780" y2="400" stroke="rgba(59, 130, 246, 0.12)" strokeWidth="1" />
      
      {/* Diagonal lines - bolder */}
      <line x1="117" y1="117" x2="683" y2="683" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />
      <line x1="683" y1="117" x2="117" y2="683" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />
      
      {/* Scanner sweep area - static gradient */}
      <defs>
        <linearGradient id="scannerGradient" x1="400" y1="400" x2="750" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
          <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
        </linearGradient>
        <radialGradient id="centerGlow" cx="400" cy="400" r="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
          <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
        </radialGradient>
      </defs>
      
      {/* Scanner sweep - pie slice shape */}
      <path 
        d="M400,400 L400,0 A400,400 0 0,1 683,117 Z" 
        fill="url(#scannerGradient)"
        opacity="0.6"
      />
      
      {/* Scanner line */}
      <line 
        x1="400" y1="400" x2="683" y2="117" 
        stroke="rgba(59, 130, 246, 0.5)" 
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Center glow */}
      <circle cx="400" cy="400" r="150" fill="url(#centerGlow)" />
      
      {/* Center dot */}
      <circle cx="400" cy="400" r="6" fill="rgba(59, 130, 246, 0.7)" />
      <circle cx="400" cy="400" r="3" fill="rgba(59, 130, 246, 1)" />
      
      {/* Detection points on radar */}
      <circle cx="480" cy="320" r="4" fill="rgba(34, 197, 94, 0.8)" />
      <circle cx="480" cy="320" r="8" fill="rgba(34, 197, 94, 0.3)" />
      
      <circle cx="350" cy="280" r="3" fill="rgba(59, 130, 246, 0.6)" />
      <circle cx="350" cy="280" r="6" fill="rgba(59, 130, 246, 0.2)" />
      
      <circle cx="520" cy="380" r="3" fill="rgba(139, 92, 246, 0.6)" />
      <circle cx="520" cy="380" r="6" fill="rgba(139, 92, 246, 0.2)" />
    </svg>
    
    {/* Additional ambient glow - Responsive */}
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
        filter: 'blur(50px)',
      }}
    />
    
    {/* Edge fade */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-slate-900" />
    
    {/* Radial fade for edges */}
    <div 
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 0%, var(--color-bg-primary) 100%)',
      }}
    />
  </div>
)


// Animated Counter Hook
const useAnimatedCounter = (end, duration = 2000, startOnView = true) => {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true)
    }
  }, [startOnView])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    let startTime
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, hasStarted])

  return { count, ref }
}


// Enhanced Stat Card Component - Responsive
const StatCard = ({ value, label, suffix = '', prefix = '' }) => {
  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0
  const { count, ref } = useAnimatedCounter(numericValue, 1500)
  
  // Determine display value
  const displayValue = value.includes('+') 
    ? `${prefix}${count}+` 
    : value.includes('%') 
    ? `${count}%`
    : value.includes('<')
    ? `<${count}s`
    : `${prefix}${count}${suffix}`

  return (
    <motion.div
      ref={ref}
      className="relative group"
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="relative px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/50 dark:border-white/10 shadow-lg shadow-black/5">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
        
        <div className="text-center">
          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-violet-600 bg-clip-text text-transparent">
            {displayValue}
          </div>
          <div className="text-xs sm:text-sm text-text-muted mt-0.5 sm:mt-1 font-medium">{label}</div>
        </div>
      </div>
    </motion.div>
  )
}


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
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'
    },
    {
      quote: t('features.aiDetection.testimonials.business.quote', 'Essential for our content team. We use it to verify all incoming content before publication. The confidence scores give us peace of mind.'),
      author: t('features.aiDetection.testimonials.business.author', 'Michael Torres'),
      role: t('features.aiDetection.testimonials.business.role', 'Content Director, Tech Startup'),
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      quote: t('features.aiDetection.testimonials.freelance.quote', 'As a freelance editor, I need to ensure the content I receive is authentic. This tool is fast, accurate, and the privacy-first approach is exactly what I need.'),
      author: t('features.aiDetection.testimonials.freelance.author', 'Emma Williams'),
      role: t('features.aiDetection.testimonials.freelance.role', 'Freelance Editor'),
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
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


  const location = useLocation()
  const { lang } = useParams()
  const currentLang = lang || 'en'
  const baseUrl = 'https://graphosai.com'
  const pageUrl = `${baseUrl}${location.pathname}`

  // SEO Keywords - comprehensive and language-aware
  const seoKeywords = useMemo(() => {
    const baseKeywords = [
      'AI detection',
      'AI content detector',
      'detect AI writing',
      'ChatGPT detector',
      'GPT detector',
      'AI checker',
      'AI text detector',
      'detect ChatGPT',
      'AI writing detector',
      'GPT-4 detector',
      'Claude detector',
      'AI plagiarism checker',
      'is this AI written',
      'check if text is AI',
      'AI content checker',
      'detect AI generated text',
      'AI detection tool',
      'free AI detector'
    ]
    
    // Language-specific keywords
    const langKeywords = {
      vi: ['phát hiện AI', 'kiểm tra văn bản AI', 'phát hiện ChatGPT', 'công cụ phát hiện AI'],
      ja: ['AI検出', 'AI文章検出', 'ChatGPT検出', 'AI判定ツール'],
      ko: ['AI 감지', 'AI 텍스트 감지기', 'ChatGPT 감지', 'AI 검출기'],
      'zh-CN': ['AI检测', 'AI内容检测器', 'ChatGPT检测', 'AI文本检测'],
      es: ['detector de IA', 'detectar texto IA', 'detector ChatGPT'],
      fr: ['détecteur IA', 'détecter texte IA', 'détecteur ChatGPT'],
      de: ['KI-Erkennung', 'KI-Text-Detektor', 'ChatGPT-Detektor'],
    }
    
    return [...baseKeywords, ...(langKeywords[currentLang] || [])]
  }, [currentLang])

  // WebPage structured data
  const webPageData = useMemo(() => ({
    url: pageUrl,
    name: t('aiDetection.meta.title', 'AI Detection - Detect AI-Generated Content | Graphos AI'),
    description: t('aiDetection.meta.description', 'Detect AI-generated content with 98% accuracy. Identify ChatGPT, GPT-4, Claude and other AI writing instantly. Free AI detection tool.'),
    language: currentLang,
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString(),
    pageType: 'WebPage'
  }), [t, pageUrl, currentLang])

  // SoftwareApplication structured data
  const softwareData = useMemo(() => ({
    name: 'Graphos AI Detection',
    description: t('aiDetection.meta.description'),
    url: pageUrl,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web Browser, Chrome Extension',
    featureList: [
      'AI Content Detection with 98% accuracy',
      'Detect ChatGPT, GPT-4, Claude, Gemini',
      'Multi-language support (15+ languages)',
      'Real-time analysis in under 2 seconds',
      'Detailed confidence scores',
      'Human vs AI indicators',
      'Privacy-first - no data storage'
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2500',
      bestRating: '5',
      worstRating: '1'
    }
  }), [t, pageUrl])

  // HowTo structured data for "How It Works" section
  const howToData = useMemo(() => ({
    name: t('features.aiDetection.howItWorks.title', 'How AI Detection Works'),
    description: t('features.aiDetection.howItWorks.subtitle', 'Our multi-layer analysis ensures accurate detection in just seconds'),
    totalTime: 'PT30S',
    steps: howItWorksSteps.map(step => ({
      title: step.title,
      description: step.desc,
      url: `${pageUrl}#how-it-works`
    }))
  }), [t, pageUrl, howItWorksSteps])

  // FAQ structured data
  const faqData = useMemo(() => ({
    questions: faqs.map(faq => ({
      question: faq.q,
      answer: faq.a
    }))
  }), [faqs])

  // Breadcrumb structured data
  const breadcrumbData = useMemo(() => ({
    url: pageUrl,
    items: [
      { name: t('nav.home', 'Home'), url: baseUrl },
      { name: t('nav.features', 'Features'), url: `${baseUrl}/features` },
      { name: t('nav.aiDetection', 'AI Detection'), url: pageUrl }
    ]
  }), [t, pageUrl])

  return (
    <>
      {/* Comprehensive SEO Head */}
      <SEOHead
        title={t('aiDetection.meta.title', 'AI Detection - Detect AI-Generated Content with 98% Accuracy | Graphos AI')}
        description={t('aiDetection.meta.description', 'Detect AI-generated content with 98% accuracy. Identify ChatGPT, GPT-4, Claude and other AI writing instantly. Free AI detection tool trusted by educators and businesses.')}
        keywords={seoKeywords}
        ogImage="/screenshots/ai-detection.png"
        ogType="website"
      />
      
      {/* Structured Data for Rich Results */}
      <StructuredData type="WebPage" data={webPageData} />
      <StructuredData type="SoftwareApplication" data={softwareData} />
      <StructuredData type="HowTo" data={howToData} />
      <StructuredData type="FAQPage" data={faqData} />
      <StructuredData type="BreadcrumbList" data={breadcrumbData} />

      {/* Main content with semantic HTML */}
      <main itemScope itemType="https://schema.org/WebPage">
        {/* Hero Section - Responsive Centered Layout */}
        <section 
          className="relative min-h-[85vh] sm:min-h-[88vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden pt-16 sm:pt-12 md:pt-8 pb-12 sm:pb-14 md:pb-16"
          aria-labelledby="hero-title"
        >
          <HeroBackground />
          
          {/* Breadcrumb - Inside container for alignment */}
          <div className="absolute top-4 sm:top-5 md:top-6 left-0 right-0 z-20">
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Breadcrumb
                  items={[
                    { label: t('nav.home'), href: '/' },
                    { label: t('nav.features'), href: '/features' },
                    { label: t('nav.aiDetection') },
                  ]}
                />
              </motion.div>
            </div>
          </div>
          
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 text-center relative z-10">

            {/* Animated Badge - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="mb-5 sm:mb-6 md:mb-8"
            >
              <motion.span 
                className="relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-primary/10 via-primary/15 to-violet-500/10 text-primary text-xs sm:text-sm font-semibold rounded-full border border-primary/20 shadow-lg shadow-primary/10"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(59, 130, 246, 0.1)',
                    '0 0 30px rgba(59, 130, 246, 0.2)',
                    '0 0 20px rgba(59, 130, 246, 0.1)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-green-500" />
                </span>
                {t('features.aiDetection.badge', '98% Accuracy Rate')}
              </motion.span>
            </motion.div>

            
            {/* Main Headline - Responsive Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-text-primary mb-4 sm:mb-5 md:mb-6 leading-[1.1] tracking-tight"
            >
              {t('aiDetection.title', 'AI Detection')}
            </motion.h1>
            
            {/* Subtitle with gradient - Responsive */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-5 sm:mb-6 md:mb-8"
            >
              <span className="bg-gradient-to-r from-primary via-blue-500 to-violet-500 bg-clip-text text-transparent">
                {t('features.aiDetection.heroHighlight', 'Precision & Confidence')}
              </span>
            </motion.p>
            
            {/* Description - Responsive */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-text-secondary mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-xl sm:max-w-2xl mx-auto px-2"
            >
              {t('aiDetection.description', 'Identify AI-generated content with precision and confidence. Trusted by educators, publishers, and businesses worldwide.')}
            </motion.p>

            {/* Enhanced Stats Row - Responsive Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 md:mb-10 max-w-xs sm:max-w-xl md:max-w-2xl mx-auto"
            >
              <StatCard value="15+" label={t('features.aiDetection.stats.modelsShort', 'AI Models')} />
              <StatCard value="<2s" label={t('features.aiDetection.stats.speedShort', 'Analysis')} />
              <StatCard value="15+" label={t('features.aiDetection.stats.languagesShort', 'Languages')} />
              <StatCard value="98%" label={t('features.aiDetection.stats.accuracy', 'Accuracy')} />
            </motion.div>

            {/* Enhanced CTA Buttons - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 md:mb-10 px-4 sm:px-0"
            >
              <motion.a
                href="https://app.graphosai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-semibold text-sm sm:text-base overflow-hidden shadow-xl shadow-primary/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">{t('cta.getStartedFree', 'Get Started Free')}</span>
                <Icon name="arrow-right" size="sm" className="icon-white relative group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <motion.a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-text-primary rounded-xl font-semibold text-sm sm:text-base hover:bg-white dark:hover:bg-white/20 transition-all shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon name="play-circle" size="sm" />
                {t('cta.tryDemo', 'Try Demo')}
              </motion.a>
            </motion.div>

            
            {/* Enhanced Trust indicators - Responsive */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm px-2"
            >
              {[
                { icon: 'credit-card', text: t('features.aiDetection.trust.noCard', 'No credit card required') },
                { icon: 'zap', text: t('features.aiDetection.trust.instant', 'Instant results') },
                { icon: 'shield', text: t('features.aiDetection.trust.privacy', 'Privacy first') },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-bg-primary"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <Icon name={item.icon} size="sm" color="gray-medium" />
                  <span className="whitespace-nowrap">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Scroll Indicator - Hidden on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 hidden sm:block"
          >
            <motion.a
              href="#demo"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2 text-text-muted hover:text-primary transition-all cursor-pointer"
            >
              <span className="text-xs font-medium">{t('hero.scroll', 'Scroll to explore')}</span>
              <div className="w-6 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-start justify-center p-1.5">
                <motion.div 
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-current rounded-full"
                />
              </div>
            </motion.a>
          </motion.div>
        </section>


        {/* Live Demo Section - Responsive */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 relative">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <motion.div
              id="demo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="scroll-mt-20 sm:scroll-mt-24"
            >
            {/* Section Header - Responsive */}
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-success text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 border border-gray-200 shadow-sm"
              >
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full animate-pulse" />
                {t('demo.liveDemo', 'Live Demo')}
              </motion.span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3 sm:mb-4">
                {t('features.aiDetection.demo.title', 'Try AI Detection Now')}
              </h2>
              <p className="text-base sm:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
                {t('features.aiDetection.demo.subtitle', 'Experience our AI detection technology firsthand. No sign-up required.')}
              </p>
            </div>
            
            <Suspense fallback={
              <div className="h-[400px] sm:h-[480px] md:h-[520px] bg-bg-secondary rounded-xl sm:rounded-2xl border border-gray-200 flex items-center justify-center">
                <ThreeDotsLoading size="lg" />
              </div>
            }>
              <LiveAIDetectionDemo />
            </Suspense>
            </motion.div>
          </div>
        </section>


        {/* How It Works Section - Responsive Enhanced */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-40 sm:w-56 md:w-72 lg:w-80 h-40 sm:h-56 md:h-72 lg:h-80 bg-purple-500/5 rounded-full blur-3xl" />
            {/* SVG Background Pattern */}
            <img 
              src="/images/backgrounds/bg-wave-1.svg" 
              alt="" 
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-100"
            />
          </div>
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
            <div className="text-center mb-8 sm:mb-10">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-primary text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 border border-gray-200 shadow-sm"
              >
                <Icon name="shield-check" size="sm" className="icon-primary" />
                {t('features.aiDetection.badge', '98% Accuracy Rate')}
              </motion.span>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
                {t('features.aiDetection.howItWorks.title', 'How AI Detection Works')}
              </h2>
              <p className="text-sm sm:text-base text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
                {t('features.aiDetection.howItWorks.subtitle', 'Our multi-layer analysis ensures accurate detection in just seconds')}
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              {/* Left: Steps with Timeline */}
              <div className="relative">
                {/* Vertical Timeline Line - Hidden on mobile */}
                <div className="absolute left-5 sm:left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 via-violet-500 to-emerald-500 rounded-full hidden md:block" />
                
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  {howItWorksSteps.map((item, index) => {
                    const colors = [
                      { 
                        gradient: 'from-blue-500 to-blue-600', 
                        bg: 'bg-blue-500/10', 
                        border: 'border-blue-500/20',
                        filter: 'invert(42%) sepia(93%) saturate(1352%) hue-rotate(200deg) brightness(100%) contrast(97%)'
                      },
                      { 
                        gradient: 'from-violet-500 to-purple-600', 
                        bg: 'bg-violet-500/10', 
                        border: 'border-violet-500/20',
                        filter: 'invert(40%) sepia(96%) saturate(1847%) hue-rotate(238deg) brightness(100%) contrast(94%)'
                      },
                      { 
                        gradient: 'from-emerald-500 to-teal-600', 
                        bg: 'bg-emerald-500/10', 
                        border: 'border-emerald-500/20',
                        filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(95%) contrast(90%)'
                      }
                    ]
                    const color = colors[index] || colors[0]
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15 }}
                        className="relative flex gap-3 sm:gap-4 md:gap-5"
                      >
                        {/* Step Number Circle */}
                        <div className="relative z-10 flex-shrink-0">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${color.gradient} flex items-center justify-center shadow-lg`}
                          >
                            <span className="text-white font-bold text-base sm:text-lg">{item.step}</span>
                          </motion.div>
                        </div>

                        {/* Step Content Card */}
                        <motion.div
                          whileHover={{ y: -2 }}
                          className={`flex-1 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border ${color.border} hover:shadow-lg transition-all duration-300`}
                        >
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${color.bg} flex items-center justify-center mb-2 sm:mb-3`}>
                            <Icon name={item.icon} size="md" style={{ filter: color.filter }} />
                          </div>
                          <h3 className="text-sm sm:text-base md:text-lg font-bold text-text-primary mb-1 sm:mb-2">
                            {item.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                            {item.desc}
                          </p>
                        </motion.div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>


              {/* Right: Visual Demo - Responsive */}
              <div className="space-y-4 sm:space-y-5">
                {/* Analysis Layers Animation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5"
                >
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Icon name="layers" size="sm" style={{ filter: 'invert(40%) sepia(96%) saturate(1847%) hue-rotate(238deg) brightness(100%) contrast(94%)' }} />
                    </div>
                    <h4 className="font-semibold text-text-primary text-xs sm:text-sm">{t('features.aiDetection.howItWorks.step2.title', 'Multi-Layer Analysis')}</h4>
                    <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] sm:text-xs text-emerald-500 font-medium">{t('demo.processing', 'Processing...')}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    {[
                      { label: 'Lexical Patterns', icon: 'type', active: true },
                      { label: 'Semantic Analysis', icon: 'brain', active: false },
                      { label: 'Structure Check', icon: 'layout', active: false },
                      { label: 'Statistical Model', icon: 'activity', active: false }
                    ].map((layer, idx) => (
                      <motion.div
                        key={layer.label}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: idx === 0 ? 1 : 0.5 }}
                        className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg border transition-all ${
                          idx === 0
                            ? 'bg-primary/10 border-primary/30'
                            : 'bg-gray-50 dark:bg-slate-700/50 border-transparent'
                        }`}
                      >
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center ${
                          idx === 0 ? 'bg-primary/20' : 'bg-gray-200 dark:bg-gray-600'
                        }`}>
                          <Icon 
                            name={layer.icon} 
                            size="sm" 
                            style={{ 
                              filter: idx === 0 
                                ? 'invert(42%) sepia(93%) saturate(1352%) hue-rotate(200deg) brightness(100%) contrast(97%)' 
                                : 'brightness(0) saturate(100%) opacity(0.4)' 
                            }} 
                          />
                        </div>
                        <span className={`text-xs sm:text-sm font-medium ${idx === 0 ? 'text-primary' : 'text-text-secondary'}`}>
                          {layer.label}
                        </span>
                        {idx === 0 && (
                          <div className="ml-auto w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>


                {/* Result Demo - Responsive */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 shadow-lg"
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Icon name="shield-check" size="md" style={{ filter: 'invert(42%) sepia(93%) saturate(1352%) hue-rotate(200deg) brightness(100%) contrast(97%)' }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary text-xs sm:text-sm">
                        {t('demo.aiDetection', 'AI Detection')}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-text-tertiary">
                        {t('features.aiDetection.sampleDesc', 'Sample result with confidence score')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
                    {/* Circular Progress - Responsive */}
                    <div className="relative flex-shrink-0">
                      <svg className="w-20 h-20 sm:w-24 sm:h-24 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="url(#progressGradientHIW)" strokeWidth="6" strokeLinecap="round" strokeDasharray="263.89" strokeDashoffset="66" />
                        <defs>
                          <linearGradient id="progressGradientHIW" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#93c5fd" />
                            <stop offset="50%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl sm:text-2xl font-bold text-text-primary">75%</span>
                        <span className="text-[8px] sm:text-[10px] text-blue-400 uppercase tracking-wide font-medium">{t('features.labels.aiScore', 'AI SCORE')}</span>
                      </div>
                    </div>

                    {/* Result Details - Responsive */}
                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      {/* Verdict Badge */}
                      <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 mb-3 sm:mb-4">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-400" />
                        <span className="text-[10px] sm:text-xs font-semibold text-orange-500">
                          {t('features.aiDetection.sampleVerdict', 'Mixed content')}
                        </span>
                      </div>

                      {/* Indicators */}
                      <div className="space-y-2 sm:space-y-3">
                        {/* Human Indicators */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#d1fae5' }}>
                            <Icon name="user" size="sm" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(95%) contrast(90%)' }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                              <span className="text-xs sm:text-sm text-text-secondary">{t('demo.humanIndicators', 'Human Indicators')}</span>
                              <span className="text-xs sm:text-sm font-semibold text-green-500">4</span>
                            </div>
                            <div className="h-1.5 sm:h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full w-[40%] rounded-full" style={{ backgroundColor: '#22c55e' }} />
                            </div>
                          </div>
                        </div>

                        {/* AI Indicators */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fce7f3' }}>
                            <Icon name="bot" size="sm" style={{ filter: 'invert(56%) sepia(74%) saturate(1095%) hue-rotate(296deg) brightness(95%) contrast(96%)' }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                              <span className="text-xs sm:text-sm text-text-secondary">{t('demo.aiIndicators', 'AI Indicators')}</span>
                              <span className="text-xs sm:text-sm font-semibold text-pink-500">6</span>
                            </div>
                            <div className="h-1.5 sm:h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full w-[60%] rounded-full" style={{ backgroundColor: '#ec4899' }} />
                            </div>
                          </div>
                        </div>

                        {/* Confidence */}
                        <div className="flex items-center gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700">
                          <Icon name="circle" size="xs" style={{ filter: 'brightness(0) saturate(100%) opacity(0.4)' }} />
                          <span className="text-xs sm:text-sm text-text-secondary">{t('demo.confidence', 'Confidence')}:</span>
                          <span className="text-xs sm:text-sm font-bold text-text-primary">{t('features.aiDetection.demo.highConfidence', 'High (92%)')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>


        {/* Benefits Section - Responsive */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 relative overflow-hidden">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
            {/* Section Header - Responsive */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary/10 to-violet-500/10 text-primary text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 border border-primary/20 shadow-sm"
              >
                <Icon name="award" size="sm" className="icon-primary" />
                {t('features.aiDetection.whyChooseBadge', 'Industry Leading')}
              </motion.span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3 sm:mb-4">
                {t('features.aiDetection.whyChoose', 'Why Choose Our AI Detection?')}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
                {t('features.aiDetection.whyChooseSubtitle', 'Trusted by thousands of professionals for accurate, fast, and private AI content detection')}
              </p>
            </div>

            {/* Benefits Grid - Responsive Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {benefits.map((benefit, index) => {
                const cardStyles = [
                  { 
                    gradient: 'from-blue-500/10 via-blue-400/5 to-transparent',
                    iconBg: 'from-blue-500 to-blue-600',
                    borderHover: 'hover:border-blue-400/40',
                    shadowHover: 'hover:shadow-blue-500/10',
                    iconFilter: 'brightness(0) invert(1)'
                  },
                  { 
                    gradient: 'from-amber-500/10 via-orange-400/5 to-transparent',
                    iconBg: 'from-amber-500 to-orange-500',
                    borderHover: 'hover:border-amber-400/40',
                    shadowHover: 'hover:shadow-amber-500/10',
                    iconFilter: 'brightness(0) invert(1)'
                  },
                  { 
                    gradient: 'from-violet-500/10 via-purple-400/5 to-transparent',
                    iconBg: 'from-violet-500 to-purple-600',
                    borderHover: 'hover:border-violet-400/40',
                    shadowHover: 'hover:shadow-violet-500/10',
                    iconFilter: 'brightness(0) invert(1)'
                  },
                  { 
                    gradient: 'from-emerald-500/10 via-teal-400/5 to-transparent',
                    iconBg: 'from-emerald-500 to-teal-600',
                    borderHover: 'hover:border-emerald-400/40',
                    shadowHover: 'hover:shadow-emerald-500/10',
                    iconFilter: 'brightness(0) invert(1)'
                  }
                ]
                const style = cardStyles[index] || cardStyles[0]

                return (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className={`group relative p-4 sm:p-5 md:p-6 lg:p-7 bg-white dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-gray-200/80 dark:border-gray-700/50 ${style.borderHover} hover:shadow-xl ${style.shadowHover} transition-all duration-300 overflow-hidden`}
                  >
                    {/* Background Gradient Decoration */}
                    <div className={`absolute top-0 right-0 w-24 sm:w-32 md:w-40 h-24 sm:h-32 md:h-40 bg-gradient-to-bl ${style.gradient} rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
                    
                    {/* Icon Container */}
                    <div className="relative mb-3 sm:mb-4 md:mb-5">
                      <motion.div 
                        whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                        className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br ${style.iconBg} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg`}
                      >
                        <Icon name={benefit.icon} size="lg" style={{ filter: style.iconFilter }} />
                      </motion.div>
                      {/* Glow effect behind icon */}
                      <div className={`absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br ${style.iconBg} rounded-lg sm:rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-text-primary mb-1.5 sm:mb-2 group-hover:text-primary transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-text-secondary leading-relaxed">
                      {benefit.description}
                    </p>

                    {/* Decorative corner accent */}
                    <div className="absolute bottom-0 right-0 w-16 sm:w-20 h-16 sm:h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg viewBox="0 0 80 80" className="w-full h-full">
                        <path d="M80 80 L80 60 Q80 80 60 80 Z" fill="currentColor" className="text-gray-100 dark:text-gray-700/50" />
                      </svg>
                    </div>
                  </motion.div>
                )
              })}
            </div>


            {/* Bottom Stats Bar - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-6 sm:mt-8 md:mt-10 p-4 sm:p-5 md:p-6 bg-gradient-to-r from-primary/5 via-violet-500/5 to-primary/5 rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/30"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {[
                  { value: '2M+', label: t('features.aiDetection.statsBar.scans', 'Scans Completed') },
                  { value: '50K+', label: t('features.aiDetection.statsBar.users', 'Active Users') },
                  { value: '99.9%', label: t('features.aiDetection.statsBar.uptime', 'Uptime') },
                  { value: '4.9/5', label: t('features.aiDetection.statsBar.rating', 'User Rating') }
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-text-muted mt-0.5 sm:mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>


        {/* Testimonials Section - Responsive */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 sm:w-56 md:w-72 lg:w-80 h-40 sm:h-56 md:h-72 lg:h-80 bg-orange-500/5 rounded-full blur-3xl" />
          </div>
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
            {/* Section Header - Responsive */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 border border-amber-500/20 shadow-sm"
              >
                <Icon name="users" size="sm" style={{ filter: 'invert(65%) sepia(63%) saturate(588%) hue-rotate(360deg) brightness(101%) contrast(101%)' }} />
                {t('features.aiDetection.testimonials.badge', 'Customer Stories')}
              </motion.span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3 sm:mb-4">
                {t('features.aiDetection.testimonials.title', 'Trusted by Professionals')}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
                {t('features.aiDetection.testimonials.subtitle', 'See what educators, businesses, and content creators say about our AI detection')}
              </p>
            </div>

            {/* Testimonials Grid - Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {testimonials.map((item, index) => {
                const cardColors = [
                  { accent: 'from-blue-500 to-cyan-500', bg: 'from-blue-500/5 to-cyan-500/5', border: 'hover:border-blue-400/30' },
                  { accent: 'from-violet-500 to-purple-500', bg: 'from-violet-500/5 to-purple-500/5', border: 'hover:border-violet-400/30' },
                  { accent: 'from-emerald-500 to-teal-500', bg: 'from-emerald-500/5 to-teal-500/5', border: 'hover:border-emerald-400/30' }
                ]
                const colors = cardColors[index] || cardColors[0]

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15, duration: 0.5 }}
                    whileHover={{ y: -6 }}
                    className={`group relative p-4 sm:p-5 md:p-6 lg:p-7 bg-white dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-gray-200/80 dark:border-gray-700/50 ${colors.border} hover:shadow-xl transition-all duration-300 overflow-hidden`}
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Quote Icon */}
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>

                    {/* Stars Rating */}
                    <div className="relative flex items-center gap-0.5 mb-3 sm:mb-4 md:mb-5">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + index * 0.1 + i * 0.05 }}
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </motion.div>
                      ))}
                      <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs font-semibold text-amber-500">5.0</span>
                    </div>

                    {/* Quote Text */}
                    <p className="relative text-text-secondary text-xs sm:text-sm md:text-base leading-relaxed mb-4 sm:mb-5 md:mb-6">
                      "{item.quote}"
                    </p>

                    {/* Author Info */}
                    <div className="relative flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4 md:pt-5 border-t border-gray-100 dark:border-gray-700/50">
                      {/* Avatar with gradient ring */}
                      <div className="relative flex-shrink-0">
                        <div className={`absolute -inset-1 bg-gradient-to-br ${colors.accent} rounded-full blur-sm opacity-60`} />
                        <img 
                          src={item.avatar} 
                          alt={item.author}
                          className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-text-primary text-sm sm:text-base truncate">{item.author}</div>
                        <div className="text-text-muted text-xs sm:text-sm truncate">{item.role}</div>
                      </div>
                      {/* Verified badge */}
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center" title="Verified">
                          <Icon name="check" size="xs" style={{ filter: 'brightness(0) invert(1)' }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>


            {/* Trust Logos / Social Proof - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-8 sm:mt-10 md:mt-12 text-center"
            >
              <p className="text-xs sm:text-sm text-text-muted mb-4 sm:mb-6">
                {t('features.aiDetection.testimonials.trustedBy', 'Trusted by teams at leading organizations')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 opacity-50 grayscale hover:grayscale-0 hover:opacity-70 transition-all duration-500">
                {['University', 'Enterprise', 'Media', 'Publishing'].map((org, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 sm:gap-2 text-text-muted">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded-md sm:rounded-lg flex items-center justify-center">
                      <Icon name={idx === 0 ? 'graduation-cap' : idx === 1 ? 'building' : idx === 2 ? 'tv' : 'book-open'} size="sm" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium">{org}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>


        {/* Use Cases Section - Responsive */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 right-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-0 w-40 sm:w-56 md:w-72 lg:w-80 h-40 sm:h-56 md:h-72 lg:h-80 bg-teal-500/5 rounded-full blur-3xl" />
            {/* SVG Background Pattern */}
            <img 
              src="/images/backgrounds/bg-wave-8.svg" 
              alt="" 
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-100"
            />
          </div>
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
            {/* Section Header - Responsive */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 border border-emerald-500/20 shadow-sm"
              >
                <Icon name="briefcase" size="sm" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(95%) contrast(90%)' }} />
                {t('features.aiDetection.useCasesBadge', 'Real-World Applications')}
              </motion.span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3 sm:mb-4">
                {t('features.aiDetection.useCasesTitle', 'Use Cases')}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
                {t('features.aiDetection.useCasesSubtitle', 'Discover how professionals across industries use our AI detection')}
              </p>
            </div>

            {/* Use Cases Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {useCases.map((useCase, index) => {
                const cardStyles = [
                  { 
                    gradient: 'from-blue-500 to-indigo-600',
                    bgGradient: 'from-blue-500/5 via-indigo-500/5 to-transparent',
                    borderHover: 'hover:border-blue-400/40',
                    stat: '10K+',
                    statLabel: t('features.aiDetection.useCases.education.stat', 'Educators')
                  },
                  { 
                    gradient: 'from-violet-500 to-purple-600',
                    bgGradient: 'from-violet-500/5 via-purple-500/5 to-transparent',
                    borderHover: 'hover:border-violet-400/40',
                    stat: '500+',
                    statLabel: t('features.aiDetection.useCases.business.stat', 'Companies')
                  },
                  { 
                    gradient: 'from-amber-500 to-orange-600',
                    bgGradient: 'from-amber-500/5 via-orange-500/5 to-transparent',
                    borderHover: 'hover:border-amber-400/40',
                    stat: '1M+',
                    statLabel: t('features.aiDetection.useCases.publishing.stat', 'Articles Checked')
                  },
                  { 
                    gradient: 'from-emerald-500 to-teal-600',
                    bgGradient: 'from-emerald-500/5 via-teal-500/5 to-transparent',
                    borderHover: 'hover:border-emerald-400/40',
                    stat: '50K+',
                    statLabel: t('features.aiDetection.useCases.hiring.stat', 'Applications Verified')
                  }
                ]
                const style = cardStyles[index] || cardStyles[0]

                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className={`group relative p-4 sm:p-5 md:p-6 lg:p-7 bg-white dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-gray-200/80 dark:border-gray-700/50 ${style.borderHover} hover:shadow-xl transition-all duration-300 overflow-hidden`}
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${style.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Decorative Pattern */}
                    <div className="absolute top-0 right-0 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 opacity-5 group-hover:opacity-10 transition-opacity">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <pattern id={`pattern-${index}`} patternUnits="userSpaceOnUse" width="10" height="10">
                          <circle cx="5" cy="5" r="1.5" fill="currentColor" />
                        </pattern>
                        <rect width="100" height="100" fill={`url(#pattern-${index})`} />
                      </svg>
                    </div>

                    <div className="relative flex gap-3 sm:gap-4 md:gap-5">
                      {/* Icon Container */}
                      <div className="flex-shrink-0">
                        <motion.div 
                          whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                          transition={{ duration: 0.4 }}
                          className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br ${style.gradient} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg`}
                        >
                          <Icon name={useCase.icon} size="lg" style={{ filter: 'brightness(0) invert(1)' }} />
                        </motion.div>
                        {/* Glow effect */}
                        <div className={`absolute top-4 sm:top-5 md:top-6 left-4 sm:left-5 md:left-6 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br ${style.gradient} rounded-lg sm:rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-text-primary mb-1.5 sm:mb-2 group-hover:text-primary transition-colors">
                          {useCase.title}
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base text-text-secondary leading-relaxed mb-3 sm:mb-4">
                          {useCase.description}
                        </p>
                        
                        {/* Stats Badge */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r ${style.bgGradient} rounded-full border border-gray-200/50 dark:border-gray-700/50`}>
                            <span className={`text-xs sm:text-sm font-bold bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent`}>
                              {style.stat}
                            </span>
                            <span className="text-[10px] sm:text-xs text-text-muted">{style.statLabel}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow indicator on hover */}
                    <div className="absolute bottom-4 sm:bottom-5 md:bottom-6 right-4 sm:right-5 md:right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br ${style.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                        <Icon name="arrow-right" size="sm" style={{ filter: 'brightness(0) invert(1)' }} />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>


            {/* Bottom CTA - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-6 sm:mt-8 md:mt-10 text-center"
            >
              <p className="text-xs sm:text-sm md:text-base text-text-secondary mb-3 sm:mb-4 px-2">
                {t('features.aiDetection.useCasesCta', "Don't see your use case? We support many more industries.")}
              </p>
              <a
                href="https://app.graphosai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-primary/10 to-violet-500/10 text-primary text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl border border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
              >
                <Icon name="message-circle" size="sm" className="icon-primary" />
                <span className="hidden sm:inline">{t('features.aiDetection.contactUs', 'Contact Us for Custom Solutions')}</span>
                <span className="sm:hidden">{t('features.aiDetection.contactUsShort', 'Contact Us')}</span>
                <Icon name="arrow-right" size="sm" className="icon-primary" />
              </a>
            </motion.div>
          </div>
        </section>


        {/* Comparison Table - Responsive */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 sm:w-56 md:w-72 lg:w-80 h-40 sm:h-56 md:h-72 lg:h-80 bg-violet-500/5 rounded-full blur-3xl" />
          </div>
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
            {/* Section Header - Responsive */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary/10 to-violet-500/10 text-primary text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 border border-primary/20 shadow-sm"
              >
                <Icon name="trophy" size="sm" className="icon-primary" />
                {t('features.aiDetection.comparisonBadge', 'Why Choose Us')}
              </motion.span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3 sm:mb-4">
                {t('features.aiDetection.comparisonTitle', 'How We Compare')}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto mb-4 sm:mb-6 px-2">
                {t('features.aiDetection.comparisonSubtitle', 'See why professionals choose Graphos AI over other detection tools')}
              </p>
              
              {/* Win Counter Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full border border-green-500/20"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span className="text-xs sm:text-sm font-bold">
                  {t('features.aiDetection.comparisonWins', '7 key advantages over competitors')}
                </span>
              </motion.div>
            </div>

            {/* Comparison Table Card - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl"
            >
              {/* Table Header - Responsive */}
              <div className="grid grid-cols-3 bg-bg-secondary border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 sm:p-4 md:p-5 text-xs sm:text-sm font-semibold text-text-secondary flex items-center gap-1.5 sm:gap-2">
                  <Icon name="list" size="sm" className="text-text-muted hidden sm:block" />
                  <span className="truncate">{t('features.aiDetection.comparison.feature', 'Feature')}</span>
                </div>
                {/* Graphos column with highlight */}
                <div className="p-3 sm:p-4 md:p-5 text-center border-l border-gray-200 dark:border-gray-700 bg-gradient-to-b from-primary/10 to-primary/5">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <img src="/logo.svg" alt="Graphos AI" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-md sm:rounded-lg shadow-sm" />
                    <span className="font-bold text-primary text-sm sm:text-base md:text-lg">Graphos</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-primary/70 mt-0.5 block hidden sm:block">{t('features.aiDetection.comparison.ourSolution', 'Our Solution')}</span>
                </div>
                <div className="p-3 sm:p-4 md:p-5 text-center border-l border-gray-200 dark:border-gray-700">
                  <span className="text-text-secondary font-medium text-sm sm:text-base block">
                    {t('features.aiDetection.comparison.others', 'Others')}
                  </span>
                  <span className="text-[10px] sm:text-xs text-text-muted mt-0.5 block hidden sm:block">{t('features.aiDetection.comparison.competitors', 'Competitors')}</span>
                </div>
              </div>

              {/* Table Body - Responsive */}
              {comparisonData.map((row, index) => {
                const isCheckmark = row.us === '✓'
                const isOthersX = row.others === '✗'
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className={`grid grid-cols-3 group hover:bg-primary/5 transition-all duration-200 ${
                      index !== comparisonData.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                    }`}
                  >
                    {/* Feature Name */}
                    <div className="py-3 sm:py-4 px-3 sm:px-4 md:px-5 flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0 hidden sm:flex">
                        <Icon 
                          name={index === 0 ? 'target' : index === 1 ? 'zap' : index === 2 ? 'cpu' : index === 3 ? 'bar-chart' : index === 4 ? 'users' : index === 5 ? 'shield' : 'globe'} 
                          size="sm" 
                          className="text-text-muted group-hover:text-primary transition-colors" 
                        />
                      </div>
                      <span className="text-xs sm:text-sm md:text-base font-medium text-text-primary group-hover:text-primary transition-colors">
                        {row.feature}
                      </span>
                    </div>
                    
                    {/* Graphos Value */}
                    <div className="py-3 sm:py-4 px-2 sm:px-4 md:px-5 flex items-center justify-center border-l border-gray-100 dark:border-gray-800 bg-gradient-to-b from-primary/[0.03] to-transparent">
                      {isCheckmark ? (
                        <motion.div 
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-primary to-primary-hover shadow-md shadow-primary/30 flex items-center justify-center"
                        >
                          <Icon name="check" size="sm" style={{ filter: 'brightness(0) invert(1)' }} />
                        </motion.div>
                      ) : (
                        <span className="text-xs sm:text-sm md:text-base font-bold text-primary bg-primary/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                          {row.us}
                        </span>
                      )}
                    </div>
                    
                    {/* Others Value */}
                    <div className="py-3 sm:py-4 px-2 sm:px-4 md:px-5 flex items-center justify-center border-l border-gray-100 dark:border-gray-800">
                      {isOthersX ? (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <Icon name="x" size="sm" className="text-gray-400" />
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm md:text-base text-text-muted">
                          {row.others}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>


            {/* Bottom Social Proof - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6"
            >
              <div className="inline-flex items-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 bg-bg-secondary/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex -space-x-1.5 sm:-space-x-2">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face" alt="User" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="User" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" alt="User" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
                </div>
                <span className="text-xs sm:text-sm text-text-secondary">
                  <span className="font-semibold text-text-primary">50K+</span> {t('features.aiDetection.comparison.usersCount', 'users trust us')}
                </span>
              </div>
              
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 bg-bg-secondary/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-text-primary">4.9/5</span>
                <span className="text-xs sm:text-sm text-text-muted">{t('features.aiDetection.comparison.rating', 'average rating')}</span>
              </div>
            </motion.div>
          </div>
        </section>


        {/* Pricing Section */}
        <Suspense fallback={
          <div className="h-[400px] sm:h-[500px] md:h-[600px] flex items-center justify-center">
            <ThreeDotsLoading size="lg" />
          </div>
        }>
          <PricingSection />
        </Suspense>

        {/* FAQ Section - Responsive */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 relative overflow-hidden bg-bg-secondary">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 sm:w-56 md:w-72 lg:w-80 h-40 sm:h-56 md:h-72 lg:h-80 bg-purple-500/5 rounded-full blur-3xl" />
          </div>

          <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 relative">
            {/* Section Header - Responsive */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-bg-primary text-primary text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <Icon name="help-circle" size="sm" className="icon-primary" />
                {t('features.aiDetection.faqBadge', 'FAQ')}
              </motion.span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3 sm:mb-4">
                {t('features.aiDetection.faqTitle', 'Frequently Asked Questions')}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-xl sm:max-w-2xl mx-auto px-2">
                {t('features.aiDetection.faqSubtitle', 'Everything you need to know about our AI detection')}
              </p>
            </div>

            {/* FAQ List - Responsive */}
            <div className="space-y-2 sm:space-y-3">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={`group rounded-xl sm:rounded-2xl border transition-all overflow-hidden ${
                    openFaq === index 
                      ? 'bg-bg-primary border-gray-200 dark:border-gray-700 shadow-md' 
                      : 'bg-bg-primary border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-3 sm:p-4 md:p-5 text-left"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 pr-2 sm:pr-4">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                        openFaq === index ? 'bg-primary text-white' : 'bg-bg-secondary text-primary group-hover:bg-primary/10'
                      }`}>
                        <span className="text-xs sm:text-sm font-bold">{String(index + 1).padStart(2, '0')}</span>
                      </div>
                      <span className={`text-sm sm:text-base font-semibold transition-colors ${
                        openFaq === index ? 'text-primary' : 'text-text-primary group-hover:text-primary'
                      }`}>
                        {faq.q}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center"
                    >
                      <Icon name="chevron-down" size="sm" className={openFaq === index ? 'text-primary' : 'text-text-muted'} />
                    </motion.div>
                  </button>
                  
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5 pl-12 sm:pl-14 md:pl-[4.5rem]">
                        <p className="text-xs sm:text-sm md:text-base text-text-secondary leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>


            {/* Contact CTA Card - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 sm:mt-10 md:mt-12 p-5 sm:p-6 md:p-8 bg-bg-primary rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Icon name="message-circle" size="xl" className="icon-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1.5 sm:mb-2">
                {t('faq.stillHaveQuestions', "Still have questions?")}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-text-secondary mb-4 sm:mb-5 md:mb-6 max-w-md mx-auto px-2">
                {t('faq.contactDescription', "Can't find what you're looking for? Our support team is here to help.")}
              </p>
              <motion.a
                href="mailto:Support@graphosai.com"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:bg-primary-hover transition-all shadow-sm hover:shadow-md"
              >
                <Icon name="mail" size="sm" style={{ filter: 'brightness(0) invert(1)' }} />
                {t('faq.contactSupport', 'Contact Support')}
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* Related Features */}
        <RelatedFeatures currentFeature="aiDetection" />

        {/* ================================================================== */}
        {/* FINAL CTA SECTION - Responsive */}
        {/* ================================================================== */}
        <section className="pt-0 pb-12 sm:pb-16 md:pb-20 lg:pb-28 bg-bg-secondary relative overflow-hidden">
          {/* Background decoration - Responsive */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[750px] lg:w-[900px] h-[400px] sm:h-[600px] md:h-[750px] lg:h-[900px] bg-primary/5 rounded-full blur-3xl" 
            />
          </div>

          <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl sm:rounded-3xl lg:rounded-[2rem] overflow-hidden"
            >
              {/* Solid Background */}
              <div className="absolute inset-0 bg-primary" />
            
              {/* Wave SVG at bottom */}
              <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                  <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgba(255,255,255,0.1)"/>
                  <path d="M0 120L60 115C120 110 240 100 360 95C480 90 600 90 720 92C840 94 960 98 1080 100C1200 102 1320 102 1380 102L1440 102V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgba(255,255,255,0.15)"/>
                </svg>
              </div>
              
              {/* Wave SVG at top */}
              <div className="absolute top-0 left-0 right-0 rotate-180">
                <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                  <path d="M0 80L48 74.7C96 69 192 59 288 53.3C384 48 480 48 576 53.3C672 59 768 69 864 69.3C960 69 1056 59 1152 53.3C1248 48 1344 48 1392 48L1440 48V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" fill="rgba(255,255,255,0.08)"/>
                </svg>
              </div>

              <div className="relative p-6 sm:p-8 md:p-10 lg:p-14 xl:p-20 text-center">
                {/* Badge - Responsive */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm rounded-full mb-5 sm:mb-6 md:mb-8 border border-white/[0.15]"
                >
                  <motion.span 
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full"
                  />
                  <span className="text-white/90 text-xs sm:text-sm font-semibold">
                    {t('features.aiDetection.ctaBadge', 'Start detecting in seconds')}
                  </span>
                  <Icon name="sparkles" size="sm" style={{ filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
                </motion.div>

                {/* Headline - Responsive */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-5 md:mb-6 leading-tight"
                >
                  {t('features.aiDetection.ctaTitle', 'Ready to Detect AI Content?')}
                </motion.h2>

                {/* Description - Responsive */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 md:mb-10 max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-2"
                >
                  {t('features.aiDetection.ctaDesc', 'Join thousands of professionals who trust Graphos AI for accurate content detection. Start free today.')}
                </motion.p>

                {/* CTA Buttons - Responsive */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 md:mb-10 px-4 sm:px-0"
                >
                  <motion.a
                    href="https://app.graphosai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="group inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-white text-primary rounded-xl font-bold text-sm sm:text-base md:text-lg shadow-sm hover:shadow-lg transition-all"
                  >
                    <span>{t('cta.getStartedFree', 'Get Started Free')}</span>
                    <Icon name="arrow-right" size="md" className="icon-primary group-hover:translate-x-1 transition-transform" />
                  </motion.a>
                  <motion.a
                    href="#demo"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-sm sm:text-base md:text-lg border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <Icon name="play-circle" size="sm" style={{ filter: 'brightness(0) invert(1)' }} />
                    {t('cta.tryDemo', 'Try Demo')}
                  </motion.a>
                </motion.div>

                {/* Trust indicators - Responsive */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-white/70 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Icon name="check-circle" size="sm" style={{ filter: 'brightness(0) invert(1)', opacity: 0.7 }} />
                    <span>{t('features.aiDetection.trust.noCard', 'No credit card required')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Icon name="check-circle" size="sm" style={{ filter: 'brightness(0) invert(1)', opacity: 0.7 }} />
                    <span>{t('features.aiDetection.trust.instant', 'Instant results')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Icon name="check-circle" size="sm" style={{ filter: 'brightness(0) invert(1)', opacity: 0.7 }} />
                    <span>{t('features.aiDetection.trust.privacy', 'Privacy first')}</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Wave divider to Footer */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
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
        </section>
      </main>
    </>
  )
}

export default AIDetection




