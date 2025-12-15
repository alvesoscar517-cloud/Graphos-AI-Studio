import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '@config/languages'

function SEOHead({ title, description, keywords = [], ogImage = '/og-image.png' }) {
  const location = useLocation()
  const { i18n } = useTranslation()
  const canonicalUrl = `https://graphosai.com${location.pathname}`

  useEffect(() => {
    // Update document title
    document.title = title

    // Update meta tags
    const updateMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name'
      let meta = document.querySelector(`meta[${attr}="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attr, name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // Basic meta
    updateMeta('description', description)
    if (keywords.length > 0) {
      updateMeta('keywords', keywords.join(', '))
    }

    // Open Graph
    updateMeta('og:title', title, true)
    updateMeta('og:description', description, true)
    updateMeta('og:url', canonicalUrl, true)
    updateMeta('og:image', ogImage, true)
    updateMeta('og:type', 'website', true)

    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image')
    updateMeta('twitter:title', title)
    updateMeta('twitter:description', description)
    updateMeta('twitter:image', ogImage)

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)

    // Hreflang tags
    SUPPORTED_LANGUAGES.forEach(lang => {
      const hreflang = `hreflang-${lang.code}`
      let link = document.querySelector(`link[data-hreflang="${hreflang}"]`)
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'alternate')
        link.setAttribute('data-hreflang', hreflang)
        document.head.appendChild(link)
      }
      link.setAttribute('hreflang', lang.code)
      link.setAttribute('href', `https://graphosai.com/${lang.code}${location.pathname}`)
    })

    // x-default
    let xDefault = document.querySelector('link[hreflang="x-default"]')
    if (!xDefault) {
      xDefault = document.createElement('link')
      xDefault.setAttribute('rel', 'alternate')
      xDefault.setAttribute('hreflang', 'x-default')
      document.head.appendChild(xDefault)
    }
    xDefault.setAttribute('href', canonicalUrl)
  }, [title, description, keywords, ogImage, canonicalUrl, location.pathname])

  return null
}

export default SEOHead
