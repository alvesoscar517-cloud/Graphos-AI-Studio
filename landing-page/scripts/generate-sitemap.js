/**
 * Generate sitemap.xml for landing page
 * Run: node scripts/generate-sitemap.js
 */

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Supported languages (must match src/config/languages.js)
const SUPPORTED_LANGUAGES = [
  { code: 'en', hreflang: 'en' },
  { code: 'vi', hreflang: 'vi' },
  { code: 'ja', hreflang: 'ja' },
  { code: 'ko', hreflang: 'ko' },
  { code: 'zh-CN', hreflang: 'zh-CN' },
  { code: 'es', hreflang: 'es' },
  { code: 'fr', hreflang: 'fr' },
  { code: 'de', hreflang: 'de' },
  { code: 'it', hreflang: 'it' },
  { code: 'pt', hreflang: 'pt' },
  { code: 'ru', hreflang: 'ru' },
  { code: 'ar', hreflang: 'ar' },
  { code: 'hi', hreflang: 'hi' },
  { code: 'th', hreflang: 'th' },
  { code: 'id', hreflang: 'id' },
]

// All routes
const ALL_ROUTES = [
  { path: '/', changefreq: 'daily', priority: 1.0, langPriority: 0.9 },
  { path: '/features', changefreq: 'weekly', priority: 0.9, langPriority: 0.8 },
  { path: '/features/ai-detection', changefreq: 'weekly', priority: 0.8, langPriority: 0.7 },
  { path: '/features/humanization', changefreq: 'weekly', priority: 0.8, langPriority: 0.7 },
  { path: '/features/voice-profile', changefreq: 'weekly', priority: 0.8, langPriority: 0.7 },
  { path: '/features/ai-workspace', changefreq: 'weekly', priority: 0.8, langPriority: 0.7 },
  { path: '/features/rewrite', changefreq: 'weekly', priority: 0.8, langPriority: 0.7 },
  { path: '/features/compatibility-score', changefreq: 'weekly', priority: 0.8, langPriority: 0.7 },
  { path: '/features/deviations', changefreq: 'weekly', priority: 0.8, langPriority: 0.7 },
  { path: '/features/statistics', changefreq: 'weekly', priority: 0.8, langPriority: 0.7 },
  { path: '/privacy', changefreq: 'monthly', priority: 0.5, langPriority: 0.4 },
  { path: '/terms', changefreq: 'monthly', priority: 0.5, langPriority: 0.4 },
]

const BASE_URL = 'https://graphosai.com'

function generateHreflangLinks(routePath) {
  let links = ''
  // English as default (no prefix)
  const enUrl = routePath === '/' ? BASE_URL : `${BASE_URL}${routePath}`
  links += `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />\n`
  
  // Other languages with prefix
  SUPPORTED_LANGUAGES.filter(lang => lang.code !== 'en').forEach(lang => {
    const langUrl = routePath === '/' 
      ? `${BASE_URL}/${lang.code}` 
      : `${BASE_URL}/${lang.code}${routePath}`
    links += `    <xhtml:link rel="alternate" hreflang="${lang.hreflang}" href="${langUrl}" />\n`
  })
  
  // x-default points to English
  links += `    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />\n`
  return links
}

function generateSitemap() {
  const lastmod = new Date().toISOString().split('T')[0]

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'

  ALL_ROUTES.forEach(route => {
    // Default English URL (no language prefix)
    const defaultUrl = route.path === '/' ? BASE_URL : `${BASE_URL}${route.path}`
    xml += '  <url>\n'
    xml += `    <loc>${defaultUrl}</loc>\n`
    xml += `    <lastmod>${lastmod}</lastmod>\n`
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`
    xml += `    <priority>${route.priority}</priority>\n`
    xml += generateHreflangLinks(route.path)
    xml += '  </url>\n'

    // Language-specific URLs (excluding English)
    SUPPORTED_LANGUAGES.filter(lang => lang.code !== 'en').forEach(lang => {
      const langUrl = route.path === '/' 
        ? `${BASE_URL}/${lang.code}` 
        : `${BASE_URL}/${lang.code}${route.path}`
      xml += '  <url>\n'
      xml += `    <loc>${langUrl}</loc>\n`
      xml += `    <lastmod>${lastmod}</lastmod>\n`
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`
      xml += `    <priority>${route.langPriority}</priority>\n`
      xml += generateHreflangLinks(route.path)
      xml += '  </url>\n'
    })
  })

  xml += '</urlset>'
  return xml
}

// Generate and write sitemap
const sitemap = generateSitemap()
const outputPath = join(__dirname, '..', 'public', 'sitemap.xml')
writeFileSync(outputPath, sitemap, 'utf-8')

console.log(`✅ Sitemap generated: ${outputPath}`)
console.log(`   Total URLs: ${ALL_ROUTES.length * SUPPORTED_LANGUAGES.length}`)
