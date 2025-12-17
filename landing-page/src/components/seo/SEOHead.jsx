/**
 * SEOHead - Comprehensive SEO component for multi-language support
 * Enhanced: Dec 2025 - Full SEO optimization for Google crawling
 * Features: hreflang, canonical, Open Graph, Twitter Cards, JSON-LD ready
 */
import { useEffect, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@config/languages'

// SEO configuration
const SEO_CONFIG = {
  siteName: 'Graphos AI Studio',
  siteUrl: 'https://graphosai.com',
  defaultImage: 'https://graphosai.com/og-image.png',
  twitterHandle: '@graphosai',
  locale: {
    en: 'en_US',
    vi: 'vi_VN',
    ja: 'ja_JP',
    ko: 'ko_KR',
    'zh-CN': 'zh_CN',
    'zh-TW': 'zh_TW',
    es: 'es_ES',
    fr: 'fr_FR',
    de: 'de_DE',
    it: 'it_IT',
    pt: 'pt_BR',
    ru: 'ru_RU',
    ar: 'ar_SA',
    hi: 'hi_IN',
    th: 'th_TH',
    id: 'id_ID',
  }
}

/**
 * Get clean path without language prefix
 */
function getCleanPath(pathname) {
  const langCodes = SUPPORTED_LANGUAGES.map(l => l.code)
  const segments = pathname.split('/').filter(Boolean)
  
  if (segments.length > 0 && langCodes.includes(segments[0])) {
    return '/' + segments.slice(1).join('/')
  }
  return pathname
}

/**
 * Build canonical URL for a specific language
 */
function buildLangUrl(basePath, langCode) {
  const cleanPath = getCleanPath(basePath)
  if (langCode === DEFAULT_LANGUAGE) {
    return `${SEO_CONFIG.siteUrl}${cleanPath || '/'}`
  }
  return `${SEO_CONFIG.siteUrl}/${langCode}${cleanPath || ''}`
}

function SEOHead({ 
  title, 
  description, 
  keywords = [], 
  ogImage,
  ogType = 'website',
  article = null, // For article pages: { publishedTime, modifiedTime, author, section, tags }
  noindex = false,
  nofollow = false
}) {
  const location = useLocation()
  const { lang } = useParams()
  const { i18n } = useTranslation()
  
  // Determine current language
  const currentLang = lang || i18n.language || DEFAULT_LANGUAGE
  const cleanPath = getCleanPath(location.pathname)
  
  // Build URLs
  const canonicalUrl = buildLangUrl(location.pathname, currentLang)
  const imageUrl = ogImage?.startsWith('http') 
    ? ogImage 
    : `${SEO_CONFIG.siteUrl}${ogImage || SEO_CONFIG.defaultImage}`
  
  // Get locale for Open Graph
  const ogLocale = SEO_CONFIG.locale[currentLang] || 'en_US'
  
  // Build alternate locales for Open Graph
  const alternateLocales = useMemo(() => {
    return SUPPORTED_LANGUAGES
      .filter(l => l.code !== currentLang)
      .map(l => SEO_CONFIG.locale[l.code] || 'en_US')
  }, [currentLang])

  // Robots directive
  const robotsContent = useMemo(() => {
    const directives = []
    directives.push(noindex ? 'noindex' : 'index')
    directives.push(nofollow ? 'nofollow' : 'follow')
    directives.push('max-image-preview:large')
    directives.push('max-snippet:-1')
    directives.push('max-video-preview:-1')
    return directives.join(', ')
  }, [noindex, nofollow])

  useEffect(() => {
    // Update document title
    document.title = title

    // Update html lang attribute
    document.documentElement.lang = currentLang
    
    // Set text direction for RTL languages
    if (currentLang === 'ar') {
      document.documentElement.dir = 'rtl'
    } else {
      document.documentElement.dir = 'ltr'
    }

    // Helper to update or create meta tags
    const updateMeta = (name, content, isProperty = false) => {
      if (!content) return
      const attr = isProperty ? 'property' : 'name'
      let meta = document.querySelector(`meta[${attr}="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attr, name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // Helper to update or create link tags
    const updateLink = (rel, href, attrs = {}) => {
      const selector = Object.entries(attrs)
        .map(([k, v]) => `[${k}="${v}"]`)
        .join('')
      let link = document.querySelector(`link[rel="${rel}"]${selector}`)
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', rel)
        Object.entries(attrs).forEach(([k, v]) => link.setAttribute(k, v))
        document.head.appendChild(link)
      }
      link.setAttribute('href', href)
      return link
    }

    // ===== Basic Meta Tags =====
    updateMeta('description', description)
    updateMeta('keywords', keywords.join(', '))
    updateMeta('author', SEO_CONFIG.siteName)
    updateMeta('robots', robotsContent)
    updateMeta('googlebot', robotsContent)
    
    // ===== Open Graph Tags =====
    updateMeta('og:title', title, true)
    updateMeta('og:description', description, true)
    updateMeta('og:url', canonicalUrl, true)
    updateMeta('og:image', imageUrl, true)
    updateMeta('og:image:width', '1200', true)
    updateMeta('og:image:height', '630', true)
    updateMeta('og:image:alt', title, true)
    updateMeta('og:type', ogType, true)
    updateMeta('og:site_name', SEO_CONFIG.siteName, true)
    updateMeta('og:locale', ogLocale, true)
    
    // Alternate locales for Open Graph
    alternateLocales.forEach((locale, index) => {
      updateMeta(`og:locale:alternate`, locale, true)
    })

    // Article specific Open Graph
    if (article && ogType === 'article') {
      updateMeta('article:published_time', article.publishedTime, true)
      updateMeta('article:modified_time', article.modifiedTime, true)
      updateMeta('article:author', article.author, true)
      updateMeta('article:section', article.section, true)
      article.tags?.forEach(tag => {
        updateMeta('article:tag', tag, true)
      })
    }

    // ===== Twitter Card Tags =====
    updateMeta('twitter:card', 'summary_large_image')
    updateMeta('twitter:site', SEO_CONFIG.twitterHandle)
    updateMeta('twitter:creator', SEO_CONFIG.twitterHandle)
    updateMeta('twitter:title', title)
    updateMeta('twitter:description', description)
    updateMeta('twitter:image', imageUrl)
    updateMeta('twitter:image:alt', title)

    // ===== Canonical URL =====
    updateLink('canonical', canonicalUrl)

    // ===== Hreflang Tags =====
    // Remove existing hreflang links first
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove())
    
    // Add hreflang for all supported languages
    SUPPORTED_LANGUAGES.forEach(langConfig => {
      const link = document.createElement('link')
      link.rel = 'alternate'
      link.hreflang = langConfig.code
      link.href = buildLangUrl(cleanPath, langConfig.code)
      document.head.appendChild(link)
    })

    // Add x-default (points to default language version)
    const xDefaultLink = document.createElement('link')
    xDefaultLink.rel = 'alternate'
    xDefaultLink.hreflang = 'x-default'
    xDefaultLink.href = buildLangUrl(cleanPath, DEFAULT_LANGUAGE)
    document.head.appendChild(xDefaultLink)

    // Cleanup function
    return () => {
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove())
    }
  }, [title, description, keywords, canonicalUrl, imageUrl, ogType, ogLocale, currentLang, cleanPath, robotsContent, alternateLocales, article])

  return null
}

export default SEOHead

// Export utilities for use in other components
export { SEO_CONFIG, buildLangUrl, getCleanPath }
