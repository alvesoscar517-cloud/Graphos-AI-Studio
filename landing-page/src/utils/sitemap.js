import { SUPPORTED_LANGUAGES } from '@config/languages'

/**
 * All page routes in the landing page
 */
export const ALL_ROUTES = [
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

/**
 * Generate hreflang links for a route
 */
function generateHreflangLinks(baseUrl, routePath) {
  let links = ''
  // English as default (no prefix)
  const enUrl = routePath === '/' ? baseUrl : `${baseUrl}${routePath}`
  links += `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />\n`
  
  // Other languages with prefix
  SUPPORTED_LANGUAGES.filter(lang => lang.code !== 'en').forEach(lang => {
    const langUrl = routePath === '/' 
      ? `${baseUrl}/${lang.code}` 
      : `${baseUrl}/${lang.code}${routePath}`
    links += `    <xhtml:link rel="alternate" hreflang="${lang.hreflang}" href="${langUrl}" />\n`
  })
  
  // x-default points to English
  links += `    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />\n`
  return links
}

/**
 * Generate sitemap XML content
 * @returns {string} XML sitemap content
 */
export function generateSitemap() {
  const baseUrl = 'https://graphosai.com'
  const lastmod = new Date().toISOString().split('T')[0]

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'

  ALL_ROUTES.forEach(route => {
    // Default English URL (no language prefix)
    const defaultUrl = route.path === '/' ? baseUrl : `${baseUrl}${route.path}`
    xml += '  <url>\n'
    xml += `    <loc>${defaultUrl}</loc>\n`
    xml += `    <lastmod>${lastmod}</lastmod>\n`
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`
    xml += `    <priority>${route.priority}</priority>\n`
    xml += generateHreflangLinks(baseUrl, route.path)
    xml += '  </url>\n'

    // Language-specific URLs (excluding English)
    SUPPORTED_LANGUAGES.filter(lang => lang.code !== 'en').forEach(lang => {
      const langUrl = route.path === '/' 
        ? `${baseUrl}/${lang.code}` 
        : `${baseUrl}/${lang.code}${route.path}`
      xml += '  <url>\n'
      xml += `    <loc>${langUrl}</loc>\n`
      xml += `    <lastmod>${lastmod}</lastmod>\n`
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`
      xml += `    <priority>${route.langPriority}</priority>\n`
      xml += generateHreflangLinks(baseUrl, route.path)
      xml += '  </url>\n'
    })
  })

  xml += '</urlset>'
  return xml
}

/**
 * Generate robots.txt content
 * @returns {string} robots.txt content
 */
export function generateRobotsTxt() {
  return `# Robots.txt for Graphos AI Studio Landing Page
User-agent: *
Allow: /

# Sitemap
Sitemap: https://graphosai.com/sitemap.xml

# Disallow admin and API paths
Disallow: /api/
Disallow: /admin/
`
}
