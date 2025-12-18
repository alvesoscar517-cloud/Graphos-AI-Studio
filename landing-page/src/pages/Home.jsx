/**
 * Home - SEO-optimized homepage with comprehensive structured data
 * Enhanced: Dec 2025 - Full SEO optimization for Google crawling
 * Features: Multi-language SEO, Schema.org markup, Semantic HTML
 */
import { useTranslation } from 'react-i18next'
import { Suspense, lazy, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import SEOHead from '@components/seo/SEOHead'
import StructuredData from '@components/seo/StructuredData'
import HeroSection from '@components/sections/HeroSection'
import FeaturesSection from '@components/sections/FeaturesSection'
import CTASection from '@components/sections/CTASection'
import HowItWorksSection from '@components/sections/HowItWorksSection'
import LoadingSpinner from '@components/common/LoadingSpinner'

// Lazy load heavy sections for better performance
const ProductShowcaseSection = lazy(() => 
  import('@components/sections/ProductShowcaseSection')
)
const SocialProofSection = lazy(() => 
  import('@components/sections/SocialProofSection')
)
const TestimonialsSection = lazy(() => 
  import('@components/sections/TestimonialsSection')
)
const PricingSection = lazy(() => 
  import('@components/sections/PricingSection')
)
const FAQSection = lazy(() => 
  import('@components/sections/FAQSection')
)
const ComparisonSection = lazy(() => 
  import('@components/sections/ComparisonSection')
)
const ChromeExtensionSection = lazy(() => 
  import('@components/sections/ChromeExtensionSection')
)
const UseCasesSection = lazy(() => 
  import('@components/sections/UseCasesSection')
)

// Section loading fallback with semantic HTML - uses ThreeDotsLoading animation
const SectionLoader = () => (
  <div className="flex items-center justify-center py-24" role="status" aria-label="Loading section">
    <LoadingSpinner size="md" />
  </div>
)

function Home() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const { lang } = useParams()
  const currentLang = lang || i18n.language || 'en'
  const baseUrl = 'https://graphosai.com'

  // SEO Keywords optimized for each language
  const seoKeywords = useMemo(() => {
    const baseKeywords = [
      'AI detection',
      'AI content detector', 
      'humanize AI text',
      'AI writing assistant',
      'voice profile',
      'content humanization',
      'AI workspace',
      'Chrome extension',
      'GPT detector',
      'ChatGPT detector',
      'AI text detector',
      'make AI text human',
      'bypass AI detection',
      'AI to human text converter'
    ]
    
    // Add language-specific keywords
    const langKeywords = {
      vi: ['phát hiện AI', 'nhân hóa văn bản AI', 'công cụ viết AI', 'kiểm tra AI'],
      ja: ['AI検出', 'AI文章検出', 'AIライティング', 'ChatGPT検出'],
      ko: ['AI 감지', 'AI 콘텐츠 감지기', 'AI 글쓰기 도우미'],
      'zh-CN': ['AI检测', 'AI内容检测器', 'AI写作助手', 'ChatGPT检测'],
      es: ['detector de IA', 'humanizar texto IA', 'asistente de escritura IA'],
      fr: ['détecteur IA', 'humaniser texte IA', 'assistant écriture IA'],
      de: ['KI-Erkennung', 'KI-Inhaltsdetektor', 'KI-Schreibassistent'],
    }
    
    return [...baseKeywords, ...(langKeywords[currentLang] || [])]
  }, [currentLang])

  // Organization structured data
  const organizationData = useMemo(() => ({
    name: 'Graphos AI Studio',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: t('home.meta.description', 'AI-powered writing assistant that helps you detect AI content, humanize your writing, and create authentic content in your unique voice.'),
    sameAs: [
      'https://twitter.com/graphosai',
      'https://linkedin.com/company/graphosai',
      'https://www.youtube.com/@graphosai'
    ]
  }), [t])

  // WebSite structured data for sitelinks search box
  const webSiteData = useMemo(() => ({
    description: t('home.meta.description'),
    language: currentLang
  }), [t, currentLang])

  // Software Application structured data
  const softwareData = useMemo(() => ({
    name: 'Graphos AI Studio',
    description: t('home.meta.description'),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
      reviewCount: '890'
    }
  }), [t])

  // WebPage structured data
  const webPageData = useMemo(() => ({
    url: `${baseUrl}${location.pathname}`,
    name: t('home.meta.title', 'Graphos AI Studio - AI Detection, Humanization & Voice Profile'),
    description: t('home.meta.description'),
    language: currentLang,
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString()
  }), [t, location.pathname, currentLang])

  // HowTo structured data for "How It Works" section
  const howToData = useMemo(() => ({
    name: t('howItWorks.title', 'How It Works'),
    description: t('howItWorks.subtitle', 'Get started in minutes. No complex setup required.'),
    steps: [
      {
        title: t('howItWorks.step1.title', 'Create Your Voice Profile'),
        description: t('howItWorks.step1.description', 'Upload your writing samples or paste text. Our AI analyzes your unique style, tone, and vocabulary patterns.'),
        url: `${baseUrl}/features/voice-profile`
      },
      {
        title: t('howItWorks.step2.title', 'Detect AI Content'),
        description: t('howItWorks.step2.description', 'Paste any text to instantly check if it was written by AI. Get detailed analysis with confidence scores.'),
        url: `${baseUrl}/features/ai-detection`
      },
      {
        title: t('howItWorks.step3.title', 'Humanize Your Content'),
        description: t('howItWorks.step3.description', 'Transform AI-generated text into natural, human-sounding content that matches your writing style.'),
        url: `${baseUrl}/features/humanization`
      },
      {
        title: t('howItWorks.step4.title', 'Chat in Your Voice'),
        description: t('howItWorks.step4.description', 'Use AI Workspace to generate content that sounds authentically like you. Perfect for emails, posts, and more.'),
        url: `${baseUrl}/features/ai-workspace`
      }
    ]
  }), [t])

  // Breadcrumb structured data
  const breadcrumbData = useMemo(() => ({
    url: `${baseUrl}${location.pathname}`,
    items: [
      { name: 'Home', url: baseUrl }
    ]
  }), [location.pathname])

  return (
    <>
      {/* SEO Head with comprehensive meta tags */}
      <SEOHead
        title={t('home.meta.title', 'Graphos AI Studio - AI Detection, Humanization & Voice Profile')}
        description={t('home.meta.description', 'Detect AI-generated content with 98% accuracy, humanize your writing, and create authentic content that sounds like you. Free AI writing assistant with Chrome extension.')}
        keywords={seoKeywords}
        ogImage="/og-image.png"
        ogType="website"
      />
      
      {/* Structured Data for Rich Results */}
      <StructuredData type="Organization" data={organizationData} />
      <StructuredData type="WebSite" data={webSiteData} />
      <StructuredData type="SoftwareApplication" data={softwareData} />
      <StructuredData type="WebPage" data={webPageData} />
      <StructuredData type="HowTo" data={howToData} />
      <StructuredData type="BreadcrumbList" data={breadcrumbData} />

      {/* Main content with semantic HTML structure */}
      <main itemScope itemType="https://schema.org/WebPage">
        {/* Hero Section - Above the fold, critical for SEO */}
        <article itemScope itemType="https://schema.org/Article">
          <HeroSection />
        </article>

        {/* Social Proof - Trust signals */}
        <Suspense fallback={<SectionLoader />}>
          <aside aria-label="Social proof and statistics">
            <SocialProofSection />
          </aside>
        </Suspense>

        {/* Product Showcase - Interactive demos */}
        <section id="showcase" aria-labelledby="showcase-title">
          <Suspense fallback={<SectionLoader />}>
            <ProductShowcaseSection />
          </Suspense>
        </section>

        {/* How It Works - Process explanation with HowTo schema */}
        <section id="how-it-works" aria-labelledby="how-it-works-title">
          <HowItWorksSection />
        </section>

        {/* Features Grid - Quick overview */}
        <section id="features" aria-labelledby="features-title">
          <FeaturesSection />
        </section>

        {/* Chrome Extension Showcase */}
        <Suspense fallback={<SectionLoader />}>
          <section id="extension" aria-labelledby="extension-title">
            <ChromeExtensionSection />
          </section>
        </Suspense>

        {/* Use Cases - Target audiences */}
        <Suspense fallback={<SectionLoader />}>
          <section id="use-cases" aria-labelledby="use-cases-title">
            <UseCasesSection />
          </section>
        </Suspense>

        {/* Comparison with competitors */}
        <Suspense fallback={<SectionLoader />}>
          <section id="comparison" aria-labelledby="comparison-title">
            <ComparisonSection />
          </section>
        </Suspense>

        {/* Testimonials & Social Proof */}
        <Suspense fallback={<SectionLoader />}>
          <section id="testimonials" aria-labelledby="testimonials-title">
            <TestimonialsSection />
          </section>
        </Suspense>

        {/* Pricing */}
        <Suspense fallback={<SectionLoader />}>
          <section id="pricing" aria-labelledby="pricing-title">
            <PricingSection />
          </section>
        </Suspense>

        {/* FAQ with Schema markup - Important for SEO */}
        <Suspense fallback={<SectionLoader />}>
          <section id="faq" aria-labelledby="faq-title">
            <FAQSection />
          </section>
        </Suspense>

        {/* Final CTA */}
        <section id="cta" aria-labelledby="cta-title">
          <CTASection />
        </section>
      </main>
    </>
  )
}

export default Home
