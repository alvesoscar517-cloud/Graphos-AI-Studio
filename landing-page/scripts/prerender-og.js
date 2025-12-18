/**
 * Pre-render script for OG meta tags - Multi-language SEO
 * Generates static HTML files with correct OG meta tags for each language
 * This ensures social media crawlers see the correct localized content
 * 
 * Enhanced: Dec 2025 - Full multi-language SEO support
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DIST_DIR = path.resolve(__dirname, '../dist')
const LOCALES_DIR = path.resolve(__dirname, '../src/i18n/locales')
const BASE_URL = 'https://graphosai.com'

// Language configurations with locale codes for Open Graph
// Note: Must match languages in src/i18n/locales/ directory
const LANGUAGE_CONFIG = {
  en: { locale: 'en_US', dir: 'ltr', name: 'English' },
  vi: { locale: 'vi_VN', dir: 'ltr', name: 'Tiếng Việt' },
  ja: { locale: 'ja_JP', dir: 'ltr', name: '日本語' },
  ko: { locale: 'ko_KR', dir: 'ltr', name: '한국어' },
  'zh-CN': { locale: 'zh_CN', dir: 'ltr', name: '简体中文' },
  es: { locale: 'es_ES', dir: 'ltr', name: 'Español' },
  fr: { locale: 'fr_FR', dir: 'ltr', name: 'Français' },
  de: { locale: 'de_DE', dir: 'ltr', name: 'Deutsch' },
  it: { locale: 'it_IT', dir: 'ltr', name: 'Italiano' },
  pt: { locale: 'pt_BR', dir: 'ltr', name: 'Português' },
  ru: { locale: 'ru_RU', dir: 'ltr', name: 'Русский' },
  ar: { locale: 'ar_SA', dir: 'rtl', name: 'العربية' },
  hi: { locale: 'hi_IN', dir: 'ltr', name: 'हिन्दी' },
  th: { locale: 'th_TH', dir: 'ltr', name: 'ไทย' },
  id: { locale: 'id_ID', dir: 'ltr', name: 'Bahasa Indonesia' }
}

const LANGUAGES = Object.keys(LANGUAGE_CONFIG).filter(l => l !== 'en')

// Page configurations - keys map to translation keys
const PAGES = {
  '': { // Home page
    translationKey: 'home',
    image: '/og-image.png',
    fallback: {
      title: 'Graphos AI Studio - AI Detection, Humanization & Voice Profile',
      description: 'Detect AI-generated content with 98% accuracy, humanize your writing, and create authentic content that sounds like you.'
    }
  },
  'features': {
    translationKey: 'featuresPage',
    image: '/screenshots/features.png',
    fallback: {
      title: 'Features - All AI Writing Tools | Graphos AI Studio',
      description: 'Explore all features: AI Detection, Humanization, Voice Profile, AI Workspace, and more.'
    }
  },
  'features/ai-detection': {
    translationKey: 'aiDetection',
    image: '/screenshots/ai-detection.png',
    fallback: {
      title: 'AI Detection - Detect AI-Generated Content with 98% Accuracy | Graphos AI',
      description: 'Detect AI-generated content with 98% accuracy. Identify ChatGPT, GPT-4, Claude and other AI writing instantly.'
    }
  },
  'features/humanization': {
    translationKey: 'humanization',
    image: '/screenshots/humanization.png',
    fallback: {
      title: 'Content Humanization - Transform AI Text to Human Writing | Graphos AI',
      description: 'Transform AI-generated text into natural, human-like content. Humanize ChatGPT, GPT-4 text while preserving meaning.'
    }
  },
  'features/voice-profile': {
    translationKey: 'voiceProfile',
    image: '/screenshots/voice-profile.png',
    fallback: {
      title: 'Voice Profile - Create Your Unique Writing Style | Graphos AI',
      description: 'Create your unique writing voice profile. Generate AI content that sounds authentically like you.'
    }
  },
  'features/ai-workspace': {
    translationKey: 'aiWorkspace',
    image: '/screenshots/ai-workspace.png',
    fallback: {
      title: 'AI Workspace - Chat with AI in Your Voice | Graphos AI',
      description: 'Chat with AI that writes in your unique voice. AI writing assistant that sounds like you.'
    }
  },
  'features/rewrite': {
    translationKey: 'rewrite',
    image: '/screenshots/rewrite.png',
    fallback: {
      title: 'AI Rewrite - Transform Text in Your Voice | Graphos AI',
      description: 'Rewrite any text to match your unique writing style. AI-powered text transformation.'
    }
  },
  'features/compatibility-score': {
    translationKey: 'compatibilityScore',
    image: '/screenshots/compatibility-score.png',
    fallback: {
      title: 'Compatibility Score - Check Your Writing Style Match | Graphos AI',
      description: 'Analyze how well your text matches your unique writing style. Get detailed compatibility scores.'
    }
  },
  'features/deviations': {
    translationKey: 'deviations',
    image: '/screenshots/deviations.png',
    fallback: {
      title: 'Deviations - Find Style Inconsistencies | Graphos AI',
      description: 'Identify sentences that deviate from your writing style. Get severity levels and suggestions.'
    }
  },
  'features/statistics': {
    translationKey: 'statistics',
    image: '/screenshots/statistics.png',
    fallback: {
      title: 'Statistics - Analyze Your Writing Metrics | Graphos AI',
      description: 'Get detailed writing statistics including word count, sentence length, vocabulary richness.'
    }
  },
  'privacy': {
    translationKey: 'privacy',
    image: '/og-image.png',
    fallback: {
      title: 'Privacy Policy - Graphos AI Studio',
      description: 'Learn how Graphos AI Studio collects, uses, and protects your personal data.'
    }
  },
  'terms': {
    translationKey: 'terms',
    image: '/og-image.png',
    fallback: {
      title: 'Terms of Service - Graphos AI Studio',
      description: 'Read the terms and conditions for using Graphos AI Studio services.'
    }
  }
}

// Load translation file for a language
function loadTranslations(lang) {
  try {
    const filePath = path.join(LOCALES_DIR, `${lang}.json`)
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.warn(`⚠️ Could not load translations for ${lang}:`, error.message)
    return null
  }
}

// Get nested value from object using dot notation
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Get translated meta for a page
function getPageMeta(pageConfig, lang) {
  const translations = loadTranslations(lang)
  
  if (!translations) {
    return pageConfig.fallback
  }
  
  const key = pageConfig.translationKey
  const title = getNestedValue(translations, `${key}.meta.title`) || pageConfig.fallback.title
  const description = getNestedValue(translations, `${key}.meta.description`) || pageConfig.fallback.description
  
  // Get localized keywords if available
  const keywords = getNestedValue(translations, `${key}.meta.keywords`) || null
  
  return { title, description, keywords }
}


function readIndexHtml() {
  const indexPath = path.join(DIST_DIR, 'index.html')
  return fs.readFileSync(indexPath, 'utf-8')
}

function buildUrl(pagePath, lang = null) {
  if (lang && lang !== 'en') {
    return pagePath ? `${BASE_URL}/${lang}/${pagePath}` : `${BASE_URL}/${lang}/`
  }
  return pagePath ? `${BASE_URL}/${pagePath}` : `${BASE_URL}/`
}

function generateHreflangTags(pagePath) {
  const tags = []
  
  // English (default)
  const enUrl = buildUrl(pagePath, null)
  tags.push(`<link rel="alternate" hreflang="en" href="${enUrl}" />`)
  
  // Other languages
  for (const lang of LANGUAGES) {
    const url = buildUrl(pagePath, lang)
    tags.push(`<link rel="alternate" hreflang="${lang}" href="${url}" />`)
  }
  
  // x-default
  tags.push(`<link rel="alternate" hreflang="x-default" href="${enUrl}" />`)
  
  return tags.join('\n    ')
}

function generateAlternateLocales(currentLang) {
  const locales = []
  for (const [lang, config] of Object.entries(LANGUAGE_CONFIG)) {
    if (lang !== currentLang) {
      locales.push(`<meta property="og:locale:alternate" content="${config.locale}" />`)
    }
  }
  return locales.join('\n    ')
}

function updateOgTags(html, pageConfig, pagePath, lang = 'en') {
  const meta = getPageMeta(pageConfig, lang)
  const langConfig = LANGUAGE_CONFIG[lang] || LANGUAGE_CONFIG.en
  const fullUrl = buildUrl(pagePath, lang === 'en' ? null : lang)
  const imageUrl = `${BASE_URL}${pageConfig.image}`
  
  let updatedHtml = html
  
  // Update html lang and dir attributes
  updatedHtml = updatedHtml.replace(
    /<html[^>]*>/,
    `<html lang="${lang}" dir="${langConfig.dir}">`
  )
  
  // Update title tag
  updatedHtml = updatedHtml.replace(
    /<title>[^<]*<\/title>/,
    `<title>${meta.title}</title>`
  )
  
  // Update meta title
  updatedHtml = updatedHtml.replace(
    /<meta name="title" content="[^"]*"/,
    `<meta name="title" content="${meta.title}"`
  )
  
  // Update meta description
  updatedHtml = updatedHtml.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${meta.description}"`
  )
  
  // Update meta keywords if available
  if (meta.keywords) {
    updatedHtml = updatedHtml.replace(
      /<meta name="keywords" content="[^"]*"/,
      `<meta name="keywords" content="${meta.keywords}"`
    )
  }
  
  // Update canonical URL
  updatedHtml = updatedHtml.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${fullUrl}"`
  )
  
  // Update hreflang tags
  const hreflangPattern = /<link rel="alternate" hreflang="[^"]*" href="[^"]*" \/>\s*/g
  updatedHtml = updatedHtml.replace(hreflangPattern, '')
  const hreflangTags = generateHreflangTags(pagePath)
  updatedHtml = updatedHtml.replace(
    /(<link rel="canonical"[^>]*>)/,
    `$1\n    \n    <!-- Hreflang Tags for Multi-language SEO -->\n    ${hreflangTags}`
  )
  
  // Update og:title
  updatedHtml = updatedHtml.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${meta.title}"`
  )
  
  // Update og:description
  updatedHtml = updatedHtml.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${meta.description}"`
  )
  
  // Update og:url
  updatedHtml = updatedHtml.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${fullUrl}"`
  )
  
  // Update og:image
  updatedHtml = updatedHtml.replace(
    /<meta property="og:image" content="[^"]*"/,
    `<meta property="og:image" content="${imageUrl}"`
  )
  
  // Update og:image:alt
  updatedHtml = updatedHtml.replace(
    /<meta property="og:image:alt" content="[^"]*"/,
    `<meta property="og:image:alt" content="${meta.title}"`
  )
  
  // Update og:locale
  updatedHtml = updatedHtml.replace(
    /<meta property="og:locale" content="[^"]*"/,
    `<meta property="og:locale" content="${langConfig.locale}"`
  )
  
  // Update og:locale:alternate tags
  const alternateLocalePattern = /<meta property="og:locale:alternate" content="[^"]*" \/>\s*/g
  updatedHtml = updatedHtml.replace(alternateLocalePattern, '')
  const alternateLocales = generateAlternateLocales(lang)
  updatedHtml = updatedHtml.replace(
    /(<meta property="og:locale" content="[^"]*" \/>)/,
    `$1\n    ${alternateLocales}`
  )
  
  // Update twitter:title
  updatedHtml = updatedHtml.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${meta.title}"`
  )
  
  // Update twitter:description
  updatedHtml = updatedHtml.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${meta.description}"`
  )
  
  // Update twitter:url
  updatedHtml = updatedHtml.replace(
    /<meta name="twitter:url" content="[^"]*"/,
    `<meta name="twitter:url" content="${fullUrl}"`
  )
  
  // Update twitter:image
  updatedHtml = updatedHtml.replace(
    /<meta name="twitter:image" content="[^"]*"/,
    `<meta name="twitter:image" content="${imageUrl}"`
  )
  
  // Update twitter:image:alt
  updatedHtml = updatedHtml.replace(
    /<meta name="twitter:image:alt" content="[^"]*"/,
    `<meta name="twitter:image:alt" content="${meta.title}"`
  )
  
  return updatedHtml
}


function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function generatePages() {
  console.log('🚀 Starting multi-language OG meta tags pre-rendering...\n')
  console.log(`📁 Output directory: ${DIST_DIR}`)
  console.log(`🌍 Languages: en, ${LANGUAGES.join(', ')}\n`)
  
  const indexHtml = readIndexHtml()
  let generatedCount = 0
  const errors = []
  
  // Generate pages for each route
  for (const [pagePath, pageConfig] of Object.entries(PAGES)) {
    const isHomePage = pagePath === ''
    
    // Generate for English (default language - no prefix)
    try {
      if (isHomePage) {
        // Home page - update the root index.html
        const enHtml = updateOgTags(indexHtml, pageConfig, pagePath, 'en')
        fs.writeFileSync(path.join(DIST_DIR, 'index.html'), enHtml)
        console.log(`✅ Generated: /index.html (English home)`)
      } else {
        const enDir = path.join(DIST_DIR, pagePath)
        ensureDir(enDir)
        const enHtml = updateOgTags(indexHtml, pageConfig, pagePath, 'en')
        fs.writeFileSync(path.join(enDir, 'index.html'), enHtml)
        console.log(`✅ Generated: /${pagePath}/index.html`)
      }
      generatedCount++
    } catch (error) {
      errors.push({ path: `/${pagePath}`, lang: 'en', error: error.message })
      console.error(`❌ Error generating /${pagePath}: ${error.message}`)
    }
    
    // Generate for each language
    for (const lang of LANGUAGES) {
      try {
        if (isHomePage) {
          // Language home page
          const langDir = path.join(DIST_DIR, lang)
          ensureDir(langDir)
          const langHtml = updateOgTags(indexHtml, pageConfig, pagePath, lang)
          fs.writeFileSync(path.join(langDir, 'index.html'), langHtml)
          console.log(`✅ Generated: /${lang}/index.html`)
        } else {
          const langDir = path.join(DIST_DIR, lang, pagePath)
          ensureDir(langDir)
          const langHtml = updateOgTags(indexHtml, pageConfig, pagePath, lang)
          fs.writeFileSync(path.join(langDir, 'index.html'), langHtml)
          console.log(`✅ Generated: /${lang}/${pagePath}/index.html`)
        }
        generatedCount++
      } catch (error) {
        errors.push({ path: `/${lang}/${pagePath}`, lang, error: error.message })
        console.error(`❌ Error generating /${lang}/${pagePath}: ${error.message}`)
      }
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log(`🎉 Pre-rendering complete!`)
  console.log(`   ✅ Generated: ${generatedCount} pages`)
  console.log(`   📄 Pages: ${Object.keys(PAGES).length}`)
  console.log(`   🌍 Languages: ${LANGUAGES.length + 1} (including English)`)
  
  if (errors.length > 0) {
    console.log(`   ❌ Errors: ${errors.length}`)
    errors.forEach(e => console.log(`      - ${e.path}: ${e.error}`))
  }
  
  console.log('='.repeat(60))
}

// Run the script
generatePages()