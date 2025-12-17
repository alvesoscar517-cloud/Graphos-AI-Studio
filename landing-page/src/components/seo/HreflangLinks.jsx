/**
 * HreflangLinks - SEO component for multi-language alternate links
 * Enhanced: Dec 2025 - Proper hreflang implementation for Google
 * 
 * This component generates hreflang tags that tell search engines about
 * language/regional versions of a page. This is critical for international SEO.
 */
import { useEffect, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@config/languages'

const BASE_URL = 'https://graphosai.com'

/**
 * Get clean path without language prefix
 */
function getCleanPath(pathname) {
  const langCodes = SUPPORTED_LANGUAGES.map(l => l.code)
  const segments = pathname.split('/').filter(Boolean)
  
  if (segments.length > 0 && langCodes.includes(segments[0])) {
    return '/' + segments.slice(1).join('/') || '/'
  }
  return pathname || '/'
}

/**
 * Build URL for a specific language
 */
function buildLangUrl(cleanPath, langCode) {
  const path = cleanPath === '/' ? '' : cleanPath
  
  if (langCode === DEFAULT_LANGUAGE) {
    return `${BASE_URL}${cleanPath}`
  }
  return `${BASE_URL}/${langCode}${path}`
}

/**
 * HreflangLinks component generates hreflang tags for all supported languages
 * Includes x-default for language-neutral fallback
 */
function HreflangLinks() {
  const location = useLocation()
  const { lang } = useParams()
  
  const cleanPath = useMemo(() => getCleanPath(location.pathname), [location.pathname])

  useEffect(() => {
    // Clean up existing hreflang links
    const existingLinks = document.querySelectorAll('link[rel="alternate"][hreflang]')
    existingLinks.forEach(link => link.remove())

    // Generate hreflang for all supported languages
    SUPPORTED_LANGUAGES.forEach(langConfig => {
      const link = document.createElement('link')
      link.rel = 'alternate'
      link.hreflang = langConfig.hreflang || langConfig.code
      link.href = buildLangUrl(cleanPath, langConfig.code)
      document.head.appendChild(link)
    })

    // Add x-default (points to default language version)
    const xDefaultLink = document.createElement('link')
    xDefaultLink.rel = 'alternate'
    xDefaultLink.hreflang = 'x-default'
    xDefaultLink.href = buildLangUrl(cleanPath, DEFAULT_LANGUAGE)
    document.head.appendChild(xDefaultLink)

    return () => {
      const links = document.querySelectorAll('link[rel="alternate"][hreflang]')
      links.forEach(link => link.remove())
    }
  }, [cleanPath])

  return null
}

export default HreflangLinks

/**
 * Get all hreflang URLs for a given path
 * Useful for SSG/SSR scenarios or generating sitemap
 */
export function getHreflangUrls(pathname) {
  const cleanPath = getCleanPath(pathname)
  
  const urls = SUPPORTED_LANGUAGES.map(lang => ({
    lang: lang.hreflang || lang.code,
    url: buildLangUrl(cleanPath, lang.code),
    locale: lang.locale,
  }))

  urls.push({
    lang: 'x-default',
    url: buildLangUrl(cleanPath, DEFAULT_LANGUAGE),
    locale: 'en_US',
  })

  return urls
}

/**
 * Generate hreflang link tags as HTML string
 * Useful for SSR/SSG
 */
export function generateHreflangHTML(pathname) {
  const urls = getHreflangUrls(pathname)
  
  return urls
    .map(({ lang, url }) => `<link rel="alternate" hreflang="${lang}" href="${url}" />`)
    .join('\n')
}

/**
 * Get canonical URL for current page
 */
export function getCanonicalUrl(pathname, currentLang = DEFAULT_LANGUAGE) {
  const cleanPath = getCleanPath(pathname)
  return buildLangUrl(cleanPath, currentLang)
}

export { BASE_URL, getCleanPath, buildLangUrl }
