/**
 * PageSEO - Reusable SEO component for feature pages
 * Enhanced: Dec 2025 - Comprehensive SEO for all feature pages
 * Usage: Import and use in any feature page for consistent SEO
 */
import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SEOHead from './SEOHead'
import StructuredData from './StructuredData'

const BASE_URL = 'https://graphosai.com'

/**
 * SEO configurations for all pages
 */
export const PAGE_SEO_CONFIG = {
  // Feature Pages
  'ai-detection': {
    titleKey: 'aiDetection.meta.title',
    defaultTitle: 'AI Detection - Detect AI-Generated Content with 98% Accuracy | Graphos AI',
    descKey: 'aiDetection.meta.description',
    defaultDesc: 'Detect AI-generated content with 98% accuracy. Identify ChatGPT, GPT-4, Claude and other AI writing instantly. Free AI detection tool.',
    keywords: {
      en: ['AI detection', 'AI content detector', 'ChatGPT detector', 'GPT detector', 'AI text detector', 'detect AI writing', 'AI checker', 'AI plagiarism checker'],
      vi: ['phát hiện AI', 'kiểm tra văn bản AI', 'phát hiện ChatGPT', 'công cụ phát hiện AI'],
      ja: ['AI検出', 'AI文章検出', 'ChatGPT検出', 'AI判定ツール'],
      ko: ['AI 감지', 'AI 텍스트 감지기', 'ChatGPT 감지'],
      'zh-CN': ['AI检测', 'AI内容检测器', 'ChatGPT检测'],
    },
    image: '/screenshots/ai-detection.png',
    category: 'UtilitiesApplication',
    rating: { value: '4.8', count: '2500' }
  },
  
  'humanization': {
    titleKey: 'humanization.meta.title',
    defaultTitle: 'Content Humanization - Transform AI Text to Human Writing | Graphos AI',
    descKey: 'humanization.meta.description',
    defaultDesc: 'Transform AI-generated text into natural, human-like content. Humanize ChatGPT, GPT-4 text while preserving meaning. Bypass AI detection.',
    keywords: {
      en: ['humanize AI text', 'AI to human text', 'make AI text human', 'bypass AI detection', 'humanize ChatGPT', 'AI text humanizer', 'undetectable AI'],
      vi: ['nhân hóa văn bản AI', 'chuyển AI sang người', 'vượt qua phát hiện AI'],
      ja: ['AI文章人間化', 'AIテキスト変換', 'AI検出回避'],
      ko: ['AI 텍스트 인간화', 'AI 감지 우회'],
      'zh-CN': ['AI文本人性化', '绕过AI检测', 'AI转人工'],
    },
    image: '/screenshots/humanization.png',
    category: 'ProductivityApplication',
    rating: { value: '4.9', count: '1800' }
  },
  
  'voice-profile': {
    titleKey: 'voiceProfile.meta.title',
    defaultTitle: 'Voice Profile - Create Your Unique Writing Style | Graphos AI',
    descKey: 'voiceProfile.meta.description',
    defaultDesc: 'Create your unique writing voice profile. Generate AI content that sounds authentically like you. Personal writing DNA analysis.',
    keywords: {
      en: ['voice profile', 'writing style', 'personal writing voice', 'AI writing in my voice', 'writing DNA', 'unique writing style'],
      vi: ['hồ sơ giọng văn', 'phong cách viết', 'giọng văn cá nhân'],
      ja: ['ボイスプロファイル', '文体分析', '個人の文体'],
      ko: ['보이스 프로필', '글쓰기 스타일'],
      'zh-CN': ['声音档案', '写作风格', '个人写作风格'],
    },
    image: '/screenshots/voice-profile.png',
    category: 'ProductivityApplication',
    rating: { value: '4.9', count: '1500' }
  },
  
  'ai-workspace': {
    titleKey: 'aiWorkspace.meta.title',
    defaultTitle: 'AI Workspace - Chat with AI in Your Voice | Graphos AI',
    descKey: 'aiWorkspace.meta.description',
    defaultDesc: 'Chat with AI that writes in your unique voice. AI writing assistant that sounds like you. Generate personalized content instantly.',
    keywords: {
      en: ['AI workspace', 'AI chat', 'AI writing assistant', 'chat with AI', 'AI in my voice', 'personalized AI'],
      vi: ['không gian làm việc AI', 'trò chuyện AI', 'trợ lý viết AI'],
      ja: ['AIワークスペース', 'AIチャット', 'AI執筆アシスタント'],
      ko: ['AI 작업 공간', 'AI 채팅', 'AI 글쓰기 도우미'],
      'zh-CN': ['AI工作区', 'AI聊天', 'AI写作助手'],
    },
    image: '/screenshots/ai-workspace.png',
    category: 'ProductivityApplication',
    rating: { value: '4.7', count: '1200' }
  },
  
  'rewrite': {
    titleKey: 'rewrite.meta.title',
    defaultTitle: 'AI Rewrite - Transform Text in Your Voice | Graphos AI',
    descKey: 'rewrite.meta.description',
    defaultDesc: 'Rewrite any text to match your unique writing style. AI-powered text transformation that maintains your voice and tone.',
    keywords: {
      en: ['AI rewrite', 'text rewriter', 'rewrite in my voice', 'paraphrase tool', 'text transformation', 'reword text'],
      vi: ['viết lại AI', 'công cụ viết lại', 'chuyển đổi văn bản'],
      ja: ['AIリライト', 'テキスト書き換え', '文章変換'],
      ko: ['AI 다시 쓰기', '텍스트 변환'],
      'zh-CN': ['AI重写', '文本改写', '文字转换'],
    },
    image: '/screenshots/rewrite.png',
    category: 'ProductivityApplication',
    rating: { value: '4.7', count: '900' }
  },
  
  'compatibility-score': {
    titleKey: 'compatibilityScore.meta.title',
    defaultTitle: 'Compatibility Score - Check Your Writing Style Match | Graphos AI',
    descKey: 'compatibilityScore.meta.description',
    defaultDesc: 'Analyze how well your text matches your unique writing style. Get detailed compatibility scores and improvement suggestions.',
    keywords: {
      en: ['compatibility score', 'writing style match', 'style analysis', 'writing consistency', 'style checker'],
      vi: ['điểm tương thích', 'phân tích phong cách', 'kiểm tra văn phong'],
      ja: ['互換性スコア', 'スタイル分析', '文体チェック'],
      ko: ['호환성 점수', '스타일 분석'],
      'zh-CN': ['兼容性评分', '风格分析', '写作一致性'],
    },
    image: '/screenshots/compatibility-score.png',
    category: 'UtilitiesApplication',
    rating: { value: '4.6', count: '600' }
  },
  
  'deviations': {
    titleKey: 'deviations.meta.title',
    defaultTitle: 'Deviations - Find Style Inconsistencies | Graphos AI',
    descKey: 'deviations.meta.description',
    defaultDesc: 'Identify sentences that deviate from your writing style. Get severity levels, suggestions, and fix inconsistencies.',
    keywords: {
      en: ['style deviations', 'writing inconsistencies', 'style checker', 'writing analysis', 'tone consistency'],
      vi: ['sai lệch văn phong', 'kiểm tra nhất quán', 'phân tích văn bản'],
      ja: ['スタイル逸脱', '文体チェック', '一貫性分析'],
      ko: ['스타일 편차', '일관성 검사'],
      'zh-CN': ['风格偏差', '写作不一致', '风格检查'],
    },
    image: '/screenshots/deviations.png',
    category: 'UtilitiesApplication',
    rating: { value: '4.6', count: '500' }
  },
  
  'statistics': {
    titleKey: 'statistics.meta.title',
    defaultTitle: 'Statistics - Analyze Your Writing Metrics | Graphos AI',
    descKey: 'statistics.meta.description',
    defaultDesc: 'Get detailed writing statistics including word count, sentence length, vocabulary richness, and readability scores.',
    keywords: {
      en: ['writing statistics', 'text analysis', 'word count', 'readability score', 'vocabulary analysis', 'writing metrics'],
      vi: ['thống kê văn bản', 'phân tích từ', 'đếm từ', 'độ dễ đọc'],
      ja: ['文章統計', 'テキスト分析', '単語数', '可読性スコア'],
      ko: ['글쓰기 통계', '텍스트 분석', '단어 수'],
      'zh-CN': ['写作统计', '文本分析', '字数统计', '可读性'],
    },
    image: '/screenshots/statistics.png',
    category: 'UtilitiesApplication',
    rating: { value: '4.5', count: '400' }
  },
  
  // Overview Pages
  'features': {
    titleKey: 'featuresPage.meta.title',
    defaultTitle: 'Features - All AI Writing Tools | Graphos AI Studio',
    descKey: 'featuresPage.meta.description',
    defaultDesc: 'Explore all features: AI Detection, Humanization, Voice Profile, AI Workspace, Rewrite, and more. Complete AI writing toolkit.',
    keywords: {
      en: ['AI writing tools', 'AI features', 'writing assistant features', 'AI toolkit', 'content tools'],
      vi: ['công cụ viết AI', 'tính năng AI', 'bộ công cụ AI'],
      ja: ['AIライティングツール', 'AI機能', 'AIツールキット'],
      ko: ['AI 글쓰기 도구', 'AI 기능'],
      'zh-CN': ['AI写作工具', 'AI功能', 'AI工具包'],
    },
    image: '/og-image.png',
    category: 'ProductivityApplication',
    rating: { value: '4.9', count: '1250' }
  },
  
  // Legal Pages
  'privacy': {
    titleKey: 'privacy.meta.title',
    defaultTitle: 'Privacy Policy - Graphos AI Studio',
    descKey: 'privacy.meta.description',
    defaultDesc: 'Learn how Graphos AI Studio collects, uses, and protects your personal data. GDPR compliant privacy policy.',
    keywords: {
      en: ['privacy policy', 'data protection', 'GDPR', 'user privacy', 'data security'],
    },
    image: '/og-image.png',
    noindex: false
  },
  
  'terms': {
    titleKey: 'terms.meta.title',
    defaultTitle: 'Terms of Service - Graphos AI Studio',
    descKey: 'terms.meta.description',
    defaultDesc: 'Read the terms and conditions for using Graphos AI Studio services. User agreement and acceptable use policy.',
    keywords: {
      en: ['terms of service', 'user agreement', 'terms and conditions', 'acceptable use'],
    },
    image: '/og-image.png',
    noindex: false
  }
}

/**
 * Get SEO keywords for current language
 */
function getKeywords(config, lang) {
  const baseKeywords = config.keywords?.en || []
  const langKeywords = config.keywords?.[lang] || []
  return [...baseKeywords, ...langKeywords]
}

/**
 * PageSEO Component - Use in feature pages
 */
function PageSEO({ 
  pageKey, 
  faqs = [], 
  howToSteps = [],
  breadcrumbItems = [],
  customData = {}
}) {
  const { t } = useTranslation()
  const location = useLocation()
  const { lang } = useParams()
  const currentLang = lang || 'en'
  const pageUrl = `${BASE_URL}${location.pathname}`
  
  const config = PAGE_SEO_CONFIG[pageKey]
  
  if (!config) {
    console.warn(`PageSEO: No config found for pageKey "${pageKey}"`)
    return null
  }
  
  const title = t(config.titleKey, config.defaultTitle)
  const description = t(config.descKey, config.defaultDesc)
  const keywords = useMemo(() => getKeywords(config, currentLang), [config, currentLang])
  
  // WebPage structured data
  const webPageData = useMemo(() => ({
    url: pageUrl,
    name: title,
    description: description,
    language: currentLang,
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString(),
    pageType: 'WebPage',
    ...customData.webPage
  }), [pageUrl, title, description, currentLang, customData.webPage])
  
  // SoftwareApplication structured data (for feature pages)
  const softwareData = useMemo(() => {
    if (!config.category) return null
    return {
      name: `Graphos ${pageKey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
      description: description,
      url: pageUrl,
      applicationCategory: config.category,
      operatingSystem: 'Web Browser, Chrome Extension',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      aggregateRating: config.rating ? {
        '@type': 'AggregateRating',
        ratingValue: config.rating.value,
        ratingCount: config.rating.count,
        bestRating: '5',
        worstRating: '1'
      } : undefined,
      ...customData.software
    }
  }, [pageKey, description, pageUrl, config, customData.software])
  
  // FAQ structured data
  const faqData = useMemo(() => {
    if (!faqs || faqs.length === 0) return null
    return {
      questions: faqs.map(faq => ({
        question: faq.q || faq.question,
        answer: faq.a || faq.answer
      }))
    }
  }, [faqs])
  
  // HowTo structured data
  const howToData = useMemo(() => {
    if (!howToSteps || howToSteps.length === 0) return null
    return {
      name: t('howItWorks.title', 'How It Works'),
      description: description,
      totalTime: 'PT2M',
      steps: howToSteps.map(step => ({
        title: step.title,
        description: step.desc || step.description,
        url: `${pageUrl}#how-it-works`
      })),
      ...customData.howTo
    }
  }, [howToSteps, description, pageUrl, t, customData.howTo])
  
  // Breadcrumb structured data
  const breadcrumbData = useMemo(() => {
    const items = breadcrumbItems.length > 0 
      ? breadcrumbItems 
      : [
          { name: t('nav.home', 'Home'), url: BASE_URL },
          { name: t('nav.features', 'Features'), url: `${BASE_URL}/features` },
          { name: title, url: pageUrl }
        ]
    return { url: pageUrl, items }
  }, [breadcrumbItems, pageUrl, title, t])
  
  return (
    <>
      <SEOHead
        title={title}
        description={description}
        keywords={keywords}
        ogImage={config.image}
        ogType="website"
        noindex={config.noindex}
      />
      
      <StructuredData type="WebPage" data={webPageData} />
      {softwareData && <StructuredData type="SoftwareApplication" data={softwareData} />}
      {faqData && <StructuredData type="FAQPage" data={faqData} />}
      {howToData && <StructuredData type="HowTo" data={howToData} />}
      <StructuredData type="BreadcrumbList" data={breadcrumbData} />
    </>
  )
}

export default PageSEO
