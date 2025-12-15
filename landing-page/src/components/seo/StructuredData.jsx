import { useEffect } from 'react'

/**
 * StructuredData component for JSON-LD structured data
 * Supports Organization, Product, WebPage, FAQPage, SoftwareApplication types
 */
function StructuredData({ type, data }) {
  useEffect(() => {
    const scriptId = `structured-data-${type.toLowerCase()}`
    
    // Remove existing script if any
    const existingScript = document.getElementById(scriptId)
    if (existingScript) {
      existingScript.remove()
    }

    // Create structured data based on type
    let structuredData = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data,
    }

    // Add type-specific defaults
    if (type === 'Organization') {
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Graphos AI Studio',
        url: 'https://graphosai.com',
        logo: 'https://graphosai.com/logo.png',
        sameAs: [],
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'support@graphosai.com',
          contactType: 'customer support'
        },
        ...data,
      }
    } else if (type === 'Product' || type === 'SoftwareApplication') {
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Graphos AI Studio',
        description: 'AI-powered writing assistant with detection, humanization, and voice profile features',
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'Web, Chrome',
        brand: {
          '@type': 'Brand',
          name: 'Graphos AI',
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '1250',
          bestRating: '5',
          worstRating: '1'
        },
        ...data,
      }
    } else if (type === 'WebPage') {
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        isPartOf: {
          '@type': 'WebSite',
          name: 'Graphos AI Studio',
          url: 'https://graphosai.com',
        },
        ...data,
      }
    } else if (type === 'FAQPage') {
      // FAQ Schema for better SEO
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.questions?.map(q => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer
          }
        })) || [],
        ...data,
      }
    } else if (type === 'BreadcrumbList') {
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.items?.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url
        })) || [],
      }
    }

    // Create and append script
    const script = document.createElement('script')
    script.id = scriptId
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(structuredData)
    document.head.appendChild(script)

    return () => {
      const scriptToRemove = document.getElementById(scriptId)
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [type, data])

  return null
}

export default StructuredData
