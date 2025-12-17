/**
 * StructuredData - Enhanced JSON-LD structured data for SEO
 * Enhanced: Dec 2025 - Comprehensive schema.org support
 * Supports: Organization, SoftwareApplication, WebPage, FAQPage, BreadcrumbList, WebSite, HowTo
 */
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

// Base configuration
const BASE_CONFIG = {
  siteName: 'Graphos AI Studio',
  siteUrl: 'https://graphosai.com',
  logo: 'https://graphosai.com/logo.png',
  email: 'support@graphosai.com',
  socialLinks: [
    'https://twitter.com/graphosai',
    'https://linkedin.com/company/graphosai',
    'https://www.youtube.com/@graphosai'
  ]
}

/**
 * Generate Organization schema
 */
function generateOrganizationSchema(data = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_CONFIG.siteUrl}/#organization`,
    name: data.name || BASE_CONFIG.siteName,
    url: data.url || BASE_CONFIG.siteUrl,
    logo: {
      '@type': 'ImageObject',
      '@id': `${BASE_CONFIG.siteUrl}/#logo`,
      url: data.logo || BASE_CONFIG.logo,
      width: 512,
      height: 512,
      caption: BASE_CONFIG.siteName
    },
    image: { '@id': `${BASE_CONFIG.siteUrl}/#logo` },
    description: data.description || 'AI-powered writing assistant with detection, humanization, and voice profile features',
    email: data.email || BASE_CONFIG.email,
    sameAs: data.sameAs || BASE_CONFIG.socialLinks,
    contactPoint: {
      '@type': 'ContactPoint',
      email: BASE_CONFIG.email,
      contactType: 'customer support',
      availableLanguage: ['English', 'Vietnamese', 'Japanese', 'Korean', 'Chinese', 'Spanish', 'French', 'German']
    },
    ...data
  }
}

/**
 * Generate WebSite schema with SearchAction
 */
function generateWebSiteSchema(data = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_CONFIG.siteUrl}/#website`,
    name: BASE_CONFIG.siteName,
    url: BASE_CONFIG.siteUrl,
    description: data.description || 'AI Detection, Humanization & Voice Profile Platform',
    publisher: { '@id': `${BASE_CONFIG.siteUrl}/#organization` },
    inLanguage: data.language || 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_CONFIG.siteUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    ...data
  }
}

/**
 * Generate SoftwareApplication schema
 */
function generateSoftwareApplicationSchema(data = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${BASE_CONFIG.siteUrl}/#software`,
    name: data.name || BASE_CONFIG.siteName,
    description: data.description || 'AI-powered writing assistant that helps you detect AI content, humanize your writing, and create authentic content in your unique voice.',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web, Chrome Extension',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '2.0',
    releaseNotes: `${BASE_CONFIG.siteUrl}/changelog`,
    screenshot: [
      {
        '@type': 'ImageObject',
        url: `${BASE_CONFIG.siteUrl}/screenshots/ai-detection.png`,
        caption: 'AI Detection Feature'
      },
      {
        '@type': 'ImageObject',
        url: `${BASE_CONFIG.siteUrl}/screenshots/humanization.png`,
        caption: 'Content Humanization'
      }
    ],
    featureList: [
      'AI Content Detection with 98% accuracy',
      'Content Humanization',
      'Voice Profile Creation',
      'AI Workspace Chat',
      'Chrome Extension',
      'Multi-language Support (15+ languages)'
    ],
    brand: {
      '@type': 'Brand',
      name: 'Graphos AI',
      logo: BASE_CONFIG.logo
    },
    author: { '@id': `${BASE_CONFIG.siteUrl}/#organization` },
    publisher: { '@id': `${BASE_CONFIG.siteUrl}/#organization` },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      seller: { '@id': `${BASE_CONFIG.siteUrl}/#organization` }
    },
    aggregateRating: data.aggregateRating || {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
      reviewCount: '890'
    },
    ...data
  }
}

/**
 * Generate WebPage schema
 */
function generateWebPageSchema(data = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': data.pageType || 'WebPage',
    '@id': data.url ? `${data.url}#webpage` : undefined,
    url: data.url,
    name: data.name,
    description: data.description,
    isPartOf: { '@id': `${BASE_CONFIG.siteUrl}/#website` },
    about: { '@id': `${BASE_CONFIG.siteUrl}/#organization` },
    primaryImageOfPage: data.image ? {
      '@type': 'ImageObject',
      url: data.image
    } : undefined,
    datePublished: data.datePublished,
    dateModified: data.dateModified || new Date().toISOString(),
    inLanguage: data.language || 'en',
    breadcrumb: data.breadcrumb ? { '@id': `${data.url}#breadcrumb` } : undefined,
    ...data
  }
}

/**
 * Generate FAQPage schema
 */
function generateFAQPageSchema(data = {}) {
  const questions = data.questions || []
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${BASE_CONFIG.siteUrl}/#faq`,
    mainEntity: questions.map((q, index) => ({
      '@type': 'Question',
      '@id': `${BASE_CONFIG.siteUrl}/#faq-${index + 1}`,
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer
      }
    }))
  }
}

/**
 * Generate BreadcrumbList schema
 */
function generateBreadcrumbSchema(data = {}) {
  const items = data.items || []
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': data.url ? `${data.url}#breadcrumb` : undefined,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}

/**
 * Generate HowTo schema (for How It Works section)
 */
function generateHowToSchema(data = {}) {
  const steps = data.steps || []
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${BASE_CONFIG.siteUrl}/#howto`,
    name: data.name || 'How to Use Graphos AI Studio',
    description: data.description || 'Learn how to detect AI content, humanize your writing, and create authentic content.',
    totalTime: data.totalTime || 'PT5M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0'
    },
    tool: {
      '@type': 'HowToTool',
      name: 'Graphos AI Studio'
    },
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.description,
      url: step.url || `${BASE_CONFIG.siteUrl}/#step-${index + 1}`,
      image: step.image
    }))
  }
}

/**
 * Generate Review schema
 */
function generateReviewSchema(data = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: { '@id': `${BASE_CONFIG.siteUrl}/#software` },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: data.rating || '5',
      bestRating: '5',
      worstRating: '1'
    },
    author: {
      '@type': 'Person',
      name: data.authorName
    },
    reviewBody: data.reviewText,
    datePublished: data.datePublished
  }
}

/**
 * Main StructuredData component
 */
function StructuredData({ type, data = {} }) {
  const { i18n } = useTranslation()
  
  const structuredData = useMemo(() => {
    const dataWithLang = { ...data, language: i18n.language }
    
    switch (type) {
      case 'Organization':
        return generateOrganizationSchema(dataWithLang)
      case 'WebSite':
        return generateWebSiteSchema(dataWithLang)
      case 'SoftwareApplication':
      case 'Product':
        return generateSoftwareApplicationSchema(dataWithLang)
      case 'WebPage':
        return generateWebPageSchema(dataWithLang)
      case 'FAQPage':
        return generateFAQPageSchema(dataWithLang)
      case 'BreadcrumbList':
        return generateBreadcrumbSchema(dataWithLang)
      case 'HowTo':
        return generateHowToSchema(dataWithLang)
      case 'Review':
        return generateReviewSchema(dataWithLang)
      default:
        return {
          '@context': 'https://schema.org',
          '@type': type,
          ...dataWithLang
        }
    }
  }, [type, data, i18n.language])

  useEffect(() => {
    const scriptId = `structured-data-${type.toLowerCase()}`
    
    // Remove existing script
    const existingScript = document.getElementById(scriptId)
    if (existingScript) {
      existingScript.remove()
    }

    // Create and append new script
    const script = document.createElement('script')
    script.id = scriptId
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(structuredData, null, 0)
    document.head.appendChild(script)

    return () => {
      const scriptToRemove = document.getElementById(scriptId)
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [type, structuredData])

  return null
}

export default StructuredData

// Export schema generators for SSR/SSG use
export {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateSoftwareApplicationSchema,
  generateWebPageSchema,
  generateFAQPageSchema,
  generateBreadcrumbSchema,
  generateHowToSchema,
  generateReviewSchema,
  BASE_CONFIG
}
