/**
 * Layout - SEO-optimized layout wrapper
 * Enhanced: Dec 2025 - Language detection, RTL support, semantic HTML
 */
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from './Header'
import Footer from './Footer'
import ScrollToTop from '../common/ScrollToTop'
import { getLanguageConfig, DEFAULT_LANGUAGE } from '@config/languages'

// Tech grid background with glow
const PageBackground = () => (
  <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none" aria-hidden="true">
    {/* Base background */}
    <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
    
    {/* Grid pattern - more visible */}
    <div 
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    />
    
    {/* Larger grid overlay */}
    <div 
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.12) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.12) 1px, transparent 1px)
        `,
        backgroundSize: '200px 200px',
      }}
    />
    
    {/* Radial glow from top center */}
    <div 
      className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[70%] opacity-100"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
      }}
    />
    
    {/* Corner accents */}
    <div 
      className="absolute bottom-0 left-0 w-[40%] h-[30%] opacity-100"
      style={{
        background: 'radial-gradient(ellipse at 0% 100%, rgba(139, 92, 246, 0.06) 0%, transparent 60%)',
      }}
    />
    <div 
      className="absolute bottom-0 right-0 w-[40%] h-[30%] opacity-100"
      style={{
        background: 'radial-gradient(ellipse at 100% 100%, rgba(34, 197, 94, 0.05) 0%, transparent 60%)',
      }}
    />
  </div>
)

function Layout({ children }) {
  const { lang } = useParams()
  const { i18n } = useTranslation()
  
  // Determine current language from URL or i18n
  const currentLang = lang || i18n.language || DEFAULT_LANGUAGE
  const langConfig = getLanguageConfig(currentLang)

  // Sync language with URL and update document attributes
  useEffect(() => {
    // Update i18n language if URL has different language
    if (lang && lang !== i18n.language) {
      i18n.changeLanguage(lang)
    }
    
    // Update document lang attribute for SEO
    document.documentElement.lang = currentLang
    
    // Update text direction for RTL languages (Arabic)
    document.documentElement.dir = langConfig?.dir || 'ltr'
    
    // Add language-specific class for styling
    document.documentElement.classList.remove(...document.documentElement.classList)
    document.documentElement.classList.add(`lang-${currentLang}`)
    
    if (langConfig?.dir === 'rtl') {
      document.documentElement.classList.add('rtl')
    }
  }, [lang, currentLang, i18n, langConfig])

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary relative">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>
      
      <ScrollToTop />
      <PageBackground />
      
      <Header />
      
      <main 
        id="main-content" 
        className="flex-1 relative z-10"
        role="main"
      >
        {children}
      </main>
      
      <Footer />
    </div>
  )
}

export default Layout
