import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * SEO Configuration for Graphos AI Studio
 * Manages document head meta tags and structured data with i18n support
 */

// SEO content by language
const SEO_BY_LANG = {
  en: {
    title: 'Graphos AI | Best AI Humanizer & AI Detection Bypass Tool',
    description: 'Transform AI-generated text into 100% human-like content. Bypass all AI detectors (GPTZero, Originality, Turnitin) in seconds with Graphos AI Studio.',
    keywords: 'AI humanizer, AI detection bypass, humanize AI text, bypass GPTZero, bypass Originality AI, bypass Turnitin, AI to human text converter, undetectable AI'
  },
  vi: {
    title: 'Graphos AI | Công cụ Humanize AI & Vượt qua AI Detector tốt nhất',
    description: 'Chuyển đổi văn bản AI thành nội dung giống người viết 100%. Vượt qua mọi bộ lọc AI Detector (GPTZero, Originality, Turnitin) chỉ trong vài giây.',
    keywords: 'humanize AI, vượt qua AI detector, chuyển văn bản AI sang người, bypass GPTZero, công cụ humanize AI, AI không bị phát hiện'
  },
  ja: {
    title: 'Graphos AI | 最高のAIヒューマナイザー＆AI検出バイパスツール',
    description: 'AI生成テキストを100%人間らしいコンテンツに変換。GPTZero、Originality、Turnitinなど全てのAI検出器を数秒でバイパス。',
    keywords: 'AIヒューマナイザー, AI検出バイパス, AIテキスト人間化, GPTZeroバイパス, AI検出回避'
  },
  ko: {
    title: 'Graphos AI | 최고의 AI 휴머나이저 & AI 탐지 우회 도구',
    description: 'AI 생성 텍스트를 100% 인간적인 콘텐츠로 변환. GPTZero, Originality, Turnitin 등 모든 AI 탐지기를 몇 초 만에 우회.',
    keywords: 'AI 휴머나이저, AI 탐지 우회, AI 텍스트 인간화, GPTZero 우회, AI 탐지 회피'
  },
  'zh-CN': {
    title: 'Graphos AI | 最佳AI人性化工具 & AI检测绕过工具',
    description: '将AI生成的文本转换为100%类人内容。几秒钟内绕过所有AI检测器（GPTZero、Originality、Turnitin）。',
    keywords: 'AI人性化, AI检测绕过, AI文本人性化, 绕过GPTZero, AI检测规避, 不可检测AI'
  },
  es: {
    title: 'Graphos AI | Mejor Humanizador de IA y Herramienta para Evadir Detección de IA',
    description: 'Transforma texto generado por IA en contenido 100% humano. Evade todos los detectores de IA (GPTZero, Originality, Turnitin) en segundos.',
    keywords: 'humanizador de IA, evadir detección de IA, humanizar texto IA, bypass GPTZero, IA indetectable'
  },
  fr: {
    title: 'Graphos AI | Meilleur Humaniseur IA & Outil de Contournement de Détection IA',
    description: 'Transformez le texte généré par IA en contenu 100% humain. Contournez tous les détecteurs IA (GPTZero, Originality, Turnitin) en quelques secondes.',
    keywords: 'humaniseur IA, contourner détection IA, humaniser texte IA, bypass GPTZero, IA indétectable'
  },
  de: {
    title: 'Graphos AI | Bester KI-Humanisierer & KI-Erkennungs-Bypass-Tool',
    description: 'Verwandeln Sie KI-generierten Text in 100% menschlichen Inhalt. Umgehen Sie alle KI-Detektoren (GPTZero, Originality, Turnitin) in Sekunden.',
    keywords: 'KI-Humanisierer, KI-Erkennung umgehen, KI-Text humanisieren, GPTZero umgehen, nicht erkennbare KI'
  },
  it: {
    title: 'Graphos AI | Miglior Umanizzatore IA & Strumento Bypass Rilevamento IA',
    description: 'Trasforma il testo generato dall\'IA in contenuto 100% umano. Bypassa tutti i rilevatori IA (GPTZero, Originality, Turnitin) in pochi secondi.',
    keywords: 'umanizzatore IA, bypass rilevamento IA, umanizzare testo IA, bypass GPTZero, IA non rilevabile'
  },
  pt: {
    title: 'Graphos AI | Melhor Humanizador de IA & Ferramenta de Bypass de Detecção de IA',
    description: 'Transforme texto gerado por IA em conteúdo 100% humano. Contorne todos os detectores de IA (GPTZero, Originality, Turnitin) em segundos.',
    keywords: 'humanizador de IA, bypass detecção IA, humanizar texto IA, bypass GPTZero, IA indetectável'
  },
  ru: {
    title: 'Graphos AI | Лучший ИИ-гуманизатор и инструмент обхода обнаружения ИИ',
    description: 'Преобразуйте текст, созданный ИИ, в 100% человеческий контент. Обходите все детекторы ИИ (GPTZero, Originality, Turnitin) за секунды.',
    keywords: 'ИИ-гуманизатор, обход обнаружения ИИ, гуманизация текста ИИ, обход GPTZero, необнаруживаемый ИИ'
  },
  ar: {
    title: 'Graphos AI | أفضل أداة لأنسنة الذكاء الاصطناعي وتجاوز كشف AI',
    description: 'حوّل النص المُنشأ بالذكاء الاصطناعي إلى محتوى بشري 100%. تجاوز جميع كاشفات AI (GPTZero، Originality، Turnitin) في ثوانٍ.',
    keywords: 'أنسنة AI, تجاوز كشف AI, تحويل نص AI لبشري, تجاوز GPTZero'
  },
  hi: {
    title: 'Graphos AI | सर्वश्रेष्ठ AI ह्यूमनाइज़र और AI डिटेक्शन बायपास टूल',
    description: 'AI-जनित टेक्स्ट को 100% मानव-जैसी सामग्री में बदलें। सेकंडों में सभी AI डिटेक्टर (GPTZero, Originality, Turnitin) को बायपास करें।',
    keywords: 'AI ह्यूमनाइज़र, AI डिटेक्शन बायपास, AI टेक्स्ट ह्यूमनाइज़, GPTZero बायपास'
  },
  th: {
    title: 'Graphos AI | เครื่องมือ AI Humanizer และ Bypass AI Detection ที่ดีที่สุด',
    description: 'แปลงข้อความที่สร้างโดย AI เป็นเนื้อหาที่เหมือนมนุษย์ 100% ผ่านตัวตรวจจับ AI ทั้งหมด (GPTZero, Originality, Turnitin) ในไม่กี่วินาที',
    keywords: 'AI Humanizer, bypass AI detection, แปลงข้อความ AI, ผ่าน GPTZero'
  },
  id: {
    title: 'Graphos AI | Alat AI Humanizer & Bypass Deteksi AI Terbaik',
    description: 'Ubah teks yang dihasilkan AI menjadi konten 100% seperti manusia. Lewati semua detektor AI (GPTZero, Originality, Turnitin) dalam hitungan detik.',
    keywords: 'AI humanizer, bypass deteksi AI, humanisasi teks AI, bypass GPTZero, AI tidak terdeteksi'
  }
}

const DEFAULT_SEO = SEO_BY_LANG.en

// SoftwareApplication Schema for Google Rich Results
const SOFTWARE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': 'https://app.graphosai.com/#software',
  name: 'Graphos AI Studio',
  alternateName: ['Graphos AI', 'Graphos AI Humanizer', 'AI Text Humanizer'],
  description: 'Best AI humanizer tool to transform AI-generated text into 100% human-like content. Bypass GPTZero, Originality AI, Turnitin and all AI detectors with 99% success rate.',
  applicationCategory: 'ProductivityApplication',
  applicationSubCategory: 'Writing Assistant',
  operatingSystem: 'Web Browser, Chrome Extension',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  softwareVersion: '2.0',
  inLanguage: ['en', 'vi', 'ja', 'ko', 'zh-CN', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'hi', 'th', 'id'],
  featureList: [
    'AI Content Humanization with 99% bypass rate',
    'AI Detection with 98% accuracy',
    'Voice Profile Creation',
    'Multi-language Support (15+ languages)',
    'Chrome Extension Integration',
    'Bypass GPTZero, Originality AI, Turnitin, Copyleaks, ZeroGPT'
  ],
  author: {
    '@type': 'Organization',
    '@id': 'https://graphosai.com/#organization',
    name: 'Graphos AI Studio',
    url: 'https://graphosai.com'
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    priceValidUntil: '2026-12-31'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '2850',
    bestRating: '5',
    worstRating: '1',
    reviewCount: '1420'
  }
}

// Organization Schema
const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://graphosai.com/#organization',
  name: 'Graphos AI Studio',
  url: 'https://graphosai.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://app.graphosai.com/logo.png',
    width: 512,
    height: 512
  },
  description: 'AI-powered writing assistant with humanization, detection, and voice profile features',
  email: 'support@graphosai.com',
  sameAs: [
    'https://twitter.com/graphosai',
    'https://linkedin.com/company/graphosai'
  ]
}

// WebApplication Schema (no aggregateRating - already in SoftwareApplication)
const WEB_APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  '@id': 'https://app.graphosai.com/#webapp',
  name: 'Graphos AI Studio',
  url: 'https://app.graphosai.com',
  description: 'Transform AI-generated text into 100% human-like content that bypasses all AI detectors',
  applicationCategory: 'ProductivityApplication',
  browserRequirements: 'Requires JavaScript',
  operatingSystem: 'All',
  availableLanguage: ['en', 'vi', 'ja', 'ko', 'zh-CN', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'hi', 'th', 'id'],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  }
}

// FAQ Schema
const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Graphos AI Humanizer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Graphos AI Humanizer is a tool that transforms AI-generated text (from ChatGPT, Claude, Gemini, etc.) into natural, human-like content that bypasses AI detection tools like GPTZero, Originality AI, and Turnitin with a 99% success rate.'
      }
    },
    {
      '@type': 'Question',
      name: 'Can Graphos AI bypass GPTZero and Originality AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Graphos AI has a 99% success rate in bypassing major AI detectors including GPTZero, Originality AI, Turnitin, Copyleaks, and ZeroGPT while preserving the original meaning of your content.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is Graphos AI free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Graphos AI offers a free tier with limited credits. You can humanize AI text, detect AI content, and create voice profiles without any payment. Premium plans are available for heavy users.'
      }
    },
    {
      '@type': 'Question',
      name: 'How many languages does Graphos AI support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Graphos AI supports 15+ languages including English, Vietnamese, Japanese, Korean, Chinese, Spanish, French, German, Italian, Portuguese, Russian, Arabic, Hindi, Thai, and Indonesian.'
      }
    }
  ]
}

/**
 * Updates document head with SEO meta tags based on language
 */
function updateMetaTags(lang = 'en') {
  const config = SEO_BY_LANG[lang] || DEFAULT_SEO
  
  // Update title
  document.title = config.title
  
  // Update html lang attribute
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  
  // Helper to update or create meta tag
  const setMeta = (name, content, property = false) => {
    if (!content) return
    const attr = property ? 'property' : 'name'
    let meta = document.querySelector(`meta[${attr}="${name}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute(attr, name)
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
  }
  
  // Basic meta tags
  setMeta('description', config.description)
  setMeta('keywords', config.keywords)
  
  // Open Graph
  setMeta('og:title', config.title, true)
  setMeta('og:description', config.description, true)
  
  // Twitter
  setMeta('twitter:title', config.title)
  setMeta('twitter:description', config.description)
  
  // Update og:locale based on language
  const localeMap = {
    en: 'en_US', vi: 'vi_VN', ja: 'ja_JP', ko: 'ko_KR',
    'zh-CN': 'zh_CN', es: 'es_ES', fr: 'fr_FR', de: 'de_DE',
    it: 'it_IT', pt: 'pt_BR', ru: 'ru_RU', ar: 'ar_SA',
    hi: 'hi_IN', th: 'th_TH', id: 'id_ID'
  }
  setMeta('og:locale', localeMap[lang] || 'en_US', true)
}

/**
 * Injects JSON-LD structured data into document head
 */
function injectStructuredData() {
  // Remove existing schema scripts
  document.querySelectorAll('script[data-seo-schema]').forEach(el => el.remove())
  
  const schemas = [SOFTWARE_SCHEMA, ORGANIZATION_SCHEMA, WEB_APP_SCHEMA, FAQ_SCHEMA]
  
  schemas.forEach((schema, index) => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-seo-schema', `schema-${index}`)
    script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)
  })
}

/**
 * SEOHead Component
 * Manages SEO meta tags and structured data with i18n support
 */
export default function SEOHead({ title, description, keywords }) {
  const { i18n } = useTranslation()
  const currentLang = i18n.language || 'en'
  
  useEffect(() => {
    // Update meta tags based on current language
    updateMetaTags(currentLang)
    
    // Override with custom props if provided
    if (title) document.title = title
    if (description) {
      const metaDesc = document.querySelector('meta[name="description"]')
      if (metaDesc) metaDesc.setAttribute('content', description)
    }
    if (keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]')
      if (metaKeywords) metaKeywords.setAttribute('content', keywords)
    }
    
    // Inject structured data (only once)
    injectStructuredData()
    
  }, [currentLang, title, description, keywords])
  
  return null
}

// Export for external use
export { 
  DEFAULT_SEO,
  SEO_BY_LANG,
  SOFTWARE_SCHEMA, 
  ORGANIZATION_SCHEMA, 
  WEB_APP_SCHEMA, 
  FAQ_SCHEMA,
  updateMetaTags,
  injectStructuredData
}
