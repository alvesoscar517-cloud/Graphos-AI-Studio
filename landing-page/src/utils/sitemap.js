import { SUPPORTED_LANGUAGES } from '@config/languages'

/**
 * All page routes in the landing page
 */
export const ALL_ROUTES = [
  '/',
  '/features/ai-detection',
  '/features/humanization',
  '/features/voice-profile',
  '/features/ai-workspace',
  '/privacy',
  '/terms',
]

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
    // Default language URL
    xml += '  <url>\n'
    xml += `    <loc>${baseUrl}${route}</loc>\n`
    xml += `    <lastmod>${lastmod}</lastmod>\n`
    xml += '    <changefreq>weekly</changefreq>\n'
    xml += route === '/' ? '    <priority>1.0</priority>\n' : '    <priority>0.8</priority>\n'

    // Add hreflang alternates
    SUPPORTED_LANGUAGES.forEach(lang => {
      xml += `    <xhtml:link rel="alternate" hreflang="${lang.code}" href="${baseUrl}/${lang.code}${route}" />\n`
    })
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${route}" />\n`
    xml += '  </url>\n'

    // Language-specific URLs
    SUPPORTED_LANGUAGES.forEach(lang => {
      xml += '  <url>\n'
      xml += `    <loc>${baseUrl}/${lang.code}${route}</loc>\n`
      xml += `    <lastmod>${lastmod}</lastmod>\n`
      xml += '    <changefreq>weekly</changefreq>\n'
      xml += route === '/' ? '    <priority>0.9</priority>\n' : '    <priority>0.7</priority>\n'
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
