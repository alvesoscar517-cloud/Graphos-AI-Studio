/**
 * Footer - Clean footer with links and social
 * Enhanced: Dec 2025 - Streamlined design, optimized spacing
 */
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import Icon from '../common/Icon'

function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    features: [
      { to: '/features/ai-detection', label: t('nav.aiDetection', 'AI Detection') },
      { to: '/features/humanization', label: t('nav.humanization', 'Humanization') },
      { to: '/features/voice-profile', label: t('nav.voiceProfile', 'Voice Profile') },
      { to: '/features/rewrite', label: t('nav.rewrite', 'AI Rewrite') },
      { to: '/features/compatibility-score', label: t('nav.compatibilityScore', 'Compatibility Score') },
      { to: '/features/deviations', label: t('nav.deviations', 'Deviations') },
      { to: '/features/statistics', label: t('nav.statistics', 'Statistics') },
      { to: '/features/ai-workspace', label: t('nav.aiWorkspace', 'AI Workspace') },
      { href: 'https://chrome.google.com/webstore', label: t('nav.chromeExtension', 'Chrome Extension'), external: true }
    ],
    resources: [
      { href: '#faq', label: t('nav.faq', 'FAQ') },
      { href: '#pricing', label: t('nav.pricing', 'Pricing') },
      { href: 'mailto:Support@graphosai.com', label: t('nav.support', 'Support') },
      { href: 'https://app.graphosai.com', label: t('nav.login', 'Login'), external: true }
    ],
    legal: [
      { to: '/privacy', label: t('nav.privacy', 'Privacy Policy') },
      { to: '/terms', label: t('nav.terms', 'Terms of Service') },
      { to: '/privacy#cookies', label: t('nav.cookies', 'Cookie Policy') }
    ]
  }

  const socialLinks = [
    { href: 'https://twitter.com/graphosai', icon: 'twitter', label: 'Twitter' },
    { href: 'https://linkedin.com/company/graphosai', icon: 'linkedin', label: 'LinkedIn' },
    { href: 'https://github.com/graphosai', icon: 'github', label: 'GitHub' },
    { href: 'mailto:Support@graphosai.com', icon: 'mail', label: 'Email' }
  ]

  const trustBadges = [
    { icon: 'shield-check', label: t('footer.trust.ssl', 'SSL Secured') },
    { icon: 'lock', label: t('footer.trust.gdpr', 'GDPR Compliant') },
    { icon: 'check-circle', label: t('footer.trust.privacy', 'Privacy First') }
  ]

  return (
    <footer className="relative bg-gradient-to-b from-slate-200 to-slate-100 overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 right-1/4 w-56 h-56 bg-blue-400/8 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <motion.img
                whileHover={{ scale: 1.05, rotate: -5 }}
                src="/logo.svg" 
                alt="Graphos AI" 
                className="w-9 h-9 rounded-xl shadow-md" 
              />
              <span className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                Graphos AI
              </span>
            </Link>
            <p className="text-text-secondary text-sm max-w-xs mb-4 leading-relaxed">
              {t('footer.description', 'Graphos AI Studio helps you write authentic content with AI detection, humanization, and voice profile features.')}
            </p>
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2">
              {trustBadges.map((badge) => (
                <div 
                  key={badge.label} 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/60 border border-gray-200/80 rounded-full"
                >
                  <Icon name={badge.icon} size="xs" color="gray-medium" />
                  <span className="text-xs text-text-muted font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-text-primary mb-3 text-sm">
              {t('nav.features', 'Features')}
            </h3>
            <ul className="space-y-2">
              {footerLinks.features.map((link, i) => (
                <li key={i}>
                  {link.external ? (
                    <a 
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-secondary hover:text-primary text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.to} className="text-text-secondary hover:text-primary text-sm transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-text-primary mb-3 text-sm">
              {t('nav.resources', 'Resources')}
            </h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link, i) => (
                <li key={i}>
                  <a 
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="text-text-secondary hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-text-primary mb-3 text-sm">
              {t('nav.legal', 'Legal')}
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, i) => (
                <li key={i}>
                  <Link to={link.to} className="text-text-secondary hover:text-primary text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-300/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-sm">
            © {currentYear} Graphos AI Studio. {t('footer.copyright', 'All rights reserved.')}
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-1.5">
            {socialLinks.map((social) => (
              <a 
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/80 border border-gray-200/80 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                aria-label={social.label}
              >
                <Icon name={social.icon} size="sm" color="gray-medium" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
