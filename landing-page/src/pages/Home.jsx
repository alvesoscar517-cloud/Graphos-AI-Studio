/**
 * Home - Redesigned homepage with product showcase and interactive demos
 * Enhanced: Dec 2025 - Added FAQ, Comparison, Trust Badges, Chrome Extension, Use Cases sections
 * Improved: Performance optimizations, Social Proof, Exit-intent popup
 */
import { useTranslation } from 'react-i18next'
import { Suspense, lazy } from 'react'
import SEOHead from '@components/seo/SEOHead'
import StructuredData from '@components/seo/StructuredData'
import HeroSection from '@components/sections/HeroSection'
import FeaturesSection from '@components/sections/FeaturesSection'
import CTASection from '@components/sections/CTASection'
import HowItWorksSection from '@components/sections/HowItWorksSection'
import LoadingSpinner from '@components/common/LoadingSpinner'
import ExitIntentPopup from '@components/common/ExitIntentPopup'

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

// Section loading fallback
const SectionLoader = () => (
  <div className="flex items-center justify-center py-24">
    <LoadingSpinner />
  </div>
)

function Home() {
  const { t } = useTranslation()

  // Structured data for SEO
  const organizationData = {
    name: 'Graphos AI Studio',
    url: 'https://graphosai.com',
    logo: 'https://graphosai.com/logo.png',
    description: t('home.meta.description', 'AI-powered writing assistant that helps you detect AI content, humanize your writing, and create authentic content in your unique voice.'),
    sameAs: [
      'https://twitter.com/graphosai',
      'https://linkedin.com/company/graphosai'
    ]
  }

  const productData = {
    '@type': 'SoftwareApplication',
    name: 'Graphos AI Studio',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web, Chrome Extension',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1250'
    }
  }

  return (
    <>
      <SEOHead
        title={t('home.meta.title', 'Graphos AI Studio - AI Detection, Humanization & Voice Profile')}
        description={t('home.meta.description', 'Detect AI-generated content, humanize your writing, and create authentic content that sounds like you. Free AI writing assistant with Chrome extension.')}
        keywords={[
          'AI detection',
          'AI content detector',
          'humanize AI text',
          'AI writing assistant',
          'voice profile',
          'content humanization',
          'AI workspace',
          'Chrome extension'
        ]}
      />
      <StructuredData type="Organization" data={organizationData} />
      <StructuredData type="Product" data={productData} />

      <div>
        {/* Hero - Above the fold */}
        <HeroSection />

        {/* Social Proof - Stats & Company logos - NEW */}
        <Suspense fallback={<SectionLoader />}>
          <SocialProofSection />
        </Suspense>

        {/* Product Showcase - Interactive demos */}
        <section id="showcase">
          <Suspense fallback={<SectionLoader />}>
            <ProductShowcaseSection />
          </Suspense>
        </section>

        {/* How It Works - Process explanation */}
        <HowItWorksSection />

        {/* Features Grid - Quick overview */}
        <FeaturesSection />

        {/* Chrome Extension Showcase */}
        <Suspense fallback={<SectionLoader />}>
          <ChromeExtensionSection />
        </Suspense>

        {/* Use Cases - Target audiences */}
        <Suspense fallback={<SectionLoader />}>
          <UseCasesSection />
        </Suspense>

        {/* Comparison with competitors */}
        <Suspense fallback={<SectionLoader />}>
          <ComparisonSection />
        </Suspense>

        {/* Testimonials & Social Proof */}
        <Suspense fallback={<SectionLoader />}>
          <TestimonialsSection />
        </Suspense>

        {/* Pricing */}
        <Suspense fallback={<SectionLoader />}>
          <PricingSection />
        </Suspense>

        {/* FAQ with Schema markup */}
        <Suspense fallback={<SectionLoader />}>
          <FAQSection />
        </Suspense>

        {/* Final CTA */}
        <CTASection />
      </div>

      {/* Exit Intent Popup - Shows special offer when leaving */}
      <ExitIntentPopup />
    </>
  )
}

export default Home
