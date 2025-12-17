/**
 * CTASection - Premium final call-to-action with stunning visuals
 * Enhanced: Dec 2025 - Gradient mesh, animated elements, glassmorphism
 */
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import Icon from '@components/common/Icon'

function CTASection() {
  const { t } = useTranslation()

  return (
    <section className="pt-0 pb-12 sm:pb-16 lg:pb-20 xl:pb-28 bg-bg-secondary/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] lg:w-[900px] h-[500px] sm:h-[700px] lg:h-[900px] bg-primary/5 rounded-full blur-3xl" 
        />

      </div>

      <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl sm:rounded-3xl lg:rounded-[2rem] overflow-hidden"
        >
          {/* Solid Background */}
          <div className="absolute inset-0 bg-primary" />
          
          {/* Wave SVG at bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgba(255,255,255,0.1)"/>
              <path d="M0 120L60 115C120 110 240 100 360 95C480 90 600 90 720 92C840 94 960 98 1080 100C1200 102 1320 102 1380 102L1440 102V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgba(255,255,255,0.15)"/>
            </svg>
          </div>
          
          {/* Wave SVG at top */}
          <div className="absolute top-0 left-0 right-0 rotate-180">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 80L48 74.7C96 69 192 59 288 53.3C384 48 480 48 576 53.3C672 59 768 69 864 69.3C960 69 1056 59 1152 53.3C1248 48 1344 48 1392 48L1440 48V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" fill="rgba(255,255,255,0.08)"/>
            </svg>
          </div>

          <div className="relative p-6 sm:p-8 md:p-10 lg:p-14 xl:p-20 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm rounded-full mb-5 sm:mb-6 lg:mb-8 border border-white/[0.15]"
            >
              <motion.span 
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white rounded-full"
              />
              <span className="text-white/90 text-xs sm:text-sm font-semibold">
                {t('cta.badge', 'Start for free today')}
              </span>
              <Icon name="sparkles" size="sm" className="icon-white opacity-80 hidden sm:block" />
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-5 lg:mb-6 leading-tight px-2 sm:px-0"
            >
              {t('home.cta.title', 'Ready to Write Authentic Content?')}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 lg:mb-10 max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-2 sm:px-0"
            >
              {t('home.cta.description', 'Join thousands of writers who use Graphos AI Studio to create authentic, human-like content.')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 lg:mb-10 px-4 sm:px-0"
            >
              <motion.a
                href="https://app.graphosai.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary rounded-xl font-bold text-base sm:text-lg shadow-sm hover:shadow-lg transition-all w-full sm:w-auto"
              >
                <span>{t('cta.getStartedFree', 'Get Started Free')}</span>
                <Icon name="arrow-right" size="md" color="primary" className="group-hover:translate-x-0.5 transition-transform" />
              </motion.a>
              <motion.a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold text-base sm:text-lg border border-white/[0.15] hover:bg-white/15 hover:border-white/[0.25] transition-all w-full sm:w-auto"
              >
                <Icon name="chrome" size="md" className="icon-white" />
                {t('cta.installExtension', 'Install Extension')}
              </motion.a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-2 sm:gap-y-3 text-xs sm:text-sm text-white/70"
            >
              {[
                { icon: 'gift', text: t('cta.trust.free', 'Free forever plan') },
                { icon: 'credit-card', text: t('cta.trust.noCard', 'No credit card') },
                { icon: 'clock', text: t('cta.trust.setup', '2-minute setup') }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-1.5 sm:gap-2"
                >
                  <Icon name={item.icon} size="sm" className="icon-white opacity-80" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>


      </div>
      {/* Wave divider to Footer */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg 
          viewBox="0 0 1440 80" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
        >
          <path 
            d="M0 40C240 70 480 10 720 40C960 70 1200 10 1440 40V80H0V40Z" 
            className="fill-slate-100"
          />
          <path 
            d="M0 50C240 75 480 25 720 50C960 75 1200 25 1440 50V80H0V50Z" 
            className="fill-slate-200"
          />
        </svg>
      </div>
    </section>
  )
}

export default CTASection



