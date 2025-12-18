import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * SEO Configuration by Route and Language
 */
const SEO_CONFIG = {
  en: {
    '/': {
      title: 'Graphos AI | Best AI Humanizer & AI Detection Bypass Tool',
      description: 'Transform AI-generated text into 100% human-like content. Bypass all AI detectors (GPTZero, Originality, Turnitin) in seconds.',
      keywords: 'AI humanizer, AI detection bypass, humanize AI text, bypass GPTZero, bypass Originality AI, undetectable AI'
    },
    '/profile-setup': {
      title: 'Profile Setup | Graphos AI Studio',
      description: 'Set up your Graphos AI profile to personalize your AI humanization experience.',
      keywords: 'Graphos AI profile, voice profile setup, AI writing style'
    }
  },
  vi: {
    '/': {
      title: 'Graphos AI | Công cụ Humanize AI & Vượt qua AI Detector tốt nhất',
      description: 'Chuyển đổi văn bản AI thành nội dung giống người viết 100%. Vượt qua mọi bộ lọc AI Detector trong vài giây.',
      keywords: 'humanize AI, vượt qua AI detector, chuyển văn bản AI sang người, bypass GPTZero'
    },
    '/profile-setup': {
      title: 'Thiết lập Hồ sơ | Graphos AI Studio',
      description: 'Thiết lập hồ sơ Graphos AI để cá nhân hóa trải nghiệm humanize AI của bạn.',
      keywords: 'hồ sơ Graphos AI, thiết lập voice profile, phong cách viết AI'
    }
  },
  ja: {
    '/': {
      title: 'Graphos AI | 最高のAIヒューマナイザー＆AI検出バイパスツール',
      description: 'AI生成テキストを100%人間らしいコンテンツに変換。全てのAI検出器を数秒でバイパス。',
      keywords: 'AIヒューマナイザー, AI検出バイパス, AIテキスト人間化, GPTZeroバイパス'
    },
    '/profile-setup': {
      title: 'プロフィール設定 | Graphos AI Studio',
      description: 'Graphos AIプロフィールを設定して、AIヒューマナイゼーション体験をカスタマイズ。',
      keywords: 'Graphos AIプロフィール, ボイスプロフィール設定'
    }
  },
  ko: {
    '/': {
      title: 'Graphos AI | 최고의 AI 휴머나이저 & AI 탐지 우회 도구',
      description: 'AI 생성 텍스트를 100% 인간적인 콘텐츠로 변환. 모든 AI 탐지기를 몇 초 만에 우회.',
      keywords: 'AI 휴머나이저, AI 탐지 우회, AI 텍스트 인간화, GPTZero 우회'
    },
    '/profile-setup': {
      title: '프로필 설정 | Graphos AI Studio',
      description: 'Graphos AI 프로필을 설정하여 AI 휴머나이제이션 경험을 개인화하세요.',
      keywords: 'Graphos AI 프로필, 보이스 프로필 설정'
    }
  },
  'zh-CN': {
    '/': {
      title: 'Graphos AI | 最佳AI人性化工具 & AI检测绕过工具',
      description: '将AI生成的文本转换为100%类人内容。几秒钟内绕过所有AI检测器。',
      keywords: 'AI人性化, AI检测绕过, AI文本人性化, 绕过GPTZero'
    },
    '/profile-setup': {
      title: '配置文件设置 | Graphos AI Studio',
      description: '设置您的Graphos AI配置文件，个性化您的AI人性化体验。',
      keywords: 'Graphos AI配置文件, 语音配置文件设置'
    }
  },
  es: {
    '/': {
      title: 'Graphos AI | Mejor Humanizador de IA y Herramienta para Evadir Detección',
      description: 'Transforma texto generado por IA en contenido 100% humano. Evade todos los detectores de IA en segundos.',
      keywords: 'humanizador de IA, evadir detección de IA, humanizar texto IA, bypass GPTZero'
    },
    '/profile-setup': {
      title: 'Configuración de Perfil | Graphos AI Studio',
      description: 'Configura tu perfil de Graphos AI para personalizar tu experiencia de humanización.',
      keywords: 'perfil Graphos AI, configuración de perfil de voz'
    }
  },
  fr: {
    '/': {
      title: 'Graphos AI | Meilleur Humaniseur IA & Outil de Contournement',
      description: 'Transformez le texte généré par IA en contenu 100% humain. Contournez tous les détecteurs IA en secondes.',
      keywords: 'humaniseur IA, contourner détection IA, humaniser texte IA, bypass GPTZero'
    },
    '/profile-setup': {
      title: 'Configuration du Profil | Graphos AI Studio',
      description: 'Configurez votre profil Graphos AI pour personnaliser votre expérience.',
      keywords: 'profil Graphos AI, configuration profil vocal'
    }
  },
  de: {
    '/': {
      title: 'Graphos AI | Bester KI-Humanisierer & KI-Erkennungs-Bypass',
      description: 'Verwandeln Sie KI-generierten Text in 100% menschlichen Inhalt. Umgehen Sie alle KI-Detektoren in Sekunden.',
      keywords: 'KI-Humanisierer, KI-Erkennung umgehen, KI-Text humanisieren, GPTZero umgehen'
    },
    '/profile-setup': {
      title: 'Profil-Einrichtung | Graphos AI Studio',
      description: 'Richten Sie Ihr Graphos AI-Profil ein, um Ihre Erfahrung zu personalisieren.',
      keywords: 'Graphos AI Profil, Stimmprofil-Einrichtung'
    }
  }
}

const DEFAULT_LANG = 'en'

/**
 * Custom hook for dynamic SEO management with i18n support
 */
export function useSEO(customConfig = {}) {
  const location = useLocation()
  const { i18n } = useTranslation()
  const currentLang = i18n.language?.split('-')[0] || DEFAULT_LANG
  
  useEffect(() => {
    const pathname = location.pathname
    const langConfig = SEO_CONFIG[currentLang] || SEO_CONFIG[DEFAULT_LANG]
    const routeConfig = langConfig[pathname] || langConfig['/']
    const config = { ...routeConfig, ...customConfig }
    
    // Update html lang attribute
    document.documentElement.lang = i18n.language || DEFAULT_LANG
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr'
    
    // Update title
    if (config.title) {
      document.title = config.title
    }
    
    // Update meta description
    if (config.description) {
      let metaDesc = document.querySelector('meta[name="description"]')
      if (metaDesc) {
        metaDesc.setAttribute('content', config.description)
      }
    }
    
    // Update meta keywords
    if (config.keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (metaKeywords) {
        metaKeywords.setAttribute('content', config.keywords)
      }
    }
    
    // Update OG tags
    if (config.title) {
      const ogTitle = document.querySelector('meta[property="og:title"]')
      if (ogTitle) ogTitle.setAttribute('content', config.title)
      
      const twitterTitle = document.querySelector('meta[name="twitter:title"]')
      if (twitterTitle) twitterTitle.setAttribute('content', config.title)
    }
    
    if (config.description) {
      const ogDesc = document.querySelector('meta[property="og:description"]')
      if (ogDesc) ogDesc.setAttribute('content', config.description)
      
      const twitterDesc = document.querySelector('meta[name="twitter:description"]')
      if (twitterDesc) twitterDesc.setAttribute('content', config.description)
    }
    
    // Update og:locale
    const localeMap = {
      en: 'en_US', vi: 'vi_VN', ja: 'ja_JP', ko: 'ko_KR',
      zh: 'zh_CN', es: 'es_ES', fr: 'fr_FR', de: 'de_DE',
      it: 'it_IT', pt: 'pt_BR', ru: 'ru_RU', ar: 'ar_SA',
      hi: 'hi_IN', th: 'th_TH', id: 'id_ID'
    }
    const ogLocale = document.querySelector('meta[property="og:locale"]')
    if (ogLocale) {
      ogLocale.setAttribute('content', localeMap[currentLang] || 'en_US')
    }
    
    // Update canonical URL with lang param
    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) {
      const langParam = currentLang !== 'en' ? `?lang=${i18n.language}` : ''
      canonical.setAttribute('href', `https://app.graphosai.com${pathname}${langParam}`)
    }
    
  }, [location.pathname, currentLang, i18n.language, customConfig])
}

/**
 * Set page-specific SEO programmatically
 */
export function setPageSEO({ title, description, keywords }) {
  if (title) {
    document.title = title
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', title)
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (twitterTitle) twitterTitle.setAttribute('content', title)
  }
  
  if (description) {
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', description)
    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', description)
    const twitterDesc = document.querySelector('meta[name="twitter:description"]')
    if (twitterDesc) twitterDesc.setAttribute('content', description)
  }
  
  if (keywords) {
    const metaKeywords = document.querySelector('meta[name="keywords"]')
    if (metaKeywords) metaKeywords.setAttribute('content', keywords)
  }
}

export default useSEO
