import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SUPPORTED_LANGUAGES } from '@config/languages'

/**
 * HreflangLinks component generates hreflang tags for all supported languages
 * Includes x-default for language-neutral fallback
 */
function HreflangLinks() {
  const location = useLocation()
  const baseUrl = 'https://graphosai.com'

  useEffect(() => {
    // Clean up existing hreflang links
    const existingLinks = document.querySelectorAll('link[rel="alternate"][hreflang]')
    existingLinks.forEach(link => link.remove())

    // Generate hreflang for all supported languages
    SUPPORTED_LANGUAGES.forEach(lang => {
      const link = document.createElement('link')
      link.rel = 'alternate'
      link.hreflang = lang.code
      link.href = `${baseUrl}/${lang.code}${location.pathname}`
      document.head.appendChild(link)
    })

    // Add x-default (points to English version)
    const xDefaultLink = document.createElement('link')
    xDefaultLink.rel = 'alternate'
    xDefaultLink.hreflang = 'x-default'
    xDefaultLink.href = `${baseUrl}${location.pathname}`
    document.head.appendChild(xDefaultLink)

    return () => {
      const links = document.querySelectorAll('link[rel="alternate"][hreflang]')
      links.forEach(link => link.remove())
    }
  }, [location.pathname])

  return null
}

export default HreflangLinks

/**
 * Get all hreflang URLs for a given path
 * Useful for SSG/SSR scenarios
 */
export function getHreflangUrls(pathname) {
  const baseUrl = 'https://graphosai.com'
  
  const urls = SUPPORTED_LANGUAGES.map(lang => ({
    lang: lang.code,
    url: `${baseUrl}/${lang.code}${pathname}`,
  }))

  urls.push({
    lang: 'x-default',
    url: `${baseUrl}${pathname}`,
  })

  return urls
}
