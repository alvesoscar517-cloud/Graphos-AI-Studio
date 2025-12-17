/**
 * SEO Components - Export all SEO-related components
 * Enhanced: Dec 2025 - Centralized SEO exports
 */

export { default as SEOHead, SEO_CONFIG, buildLangUrl, getCleanPath } from './SEOHead'
export { 
  default as StructuredData,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateSoftwareApplicationSchema,
  generateWebPageSchema,
  generateFAQPageSchema,
  generateBreadcrumbSchema,
  generateHowToSchema,
  generateReviewSchema,
  BASE_CONFIG
} from './StructuredData'
export { 
  default as HreflangLinks,
  getHreflangUrls,
  generateHreflangHTML,
  getCanonicalUrl,
  BASE_URL
} from './HreflangLinks'
export { default as PageSEO, PAGE_SEO_CONFIG } from './PageSEO'
