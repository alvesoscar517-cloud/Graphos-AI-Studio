/**
 * VideoHeroSection - Alternative hero with video background/demo
 * Can be used as replacement for HeroSection when video is available
 */
import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import Icon from '@components/common/Icon'

const VideoHeroSection = () => {
  const { t } = useTranslation()
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef(null)

  const handlePlayVideo = () => {
    setIsPlaying(true)
    // In production, this would play an actual video
  }

  const handleCloseVideo = () => {
    setIsPlaying(false)
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-bg-secondary to-bg-primary" />
        
        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary text-sm font-medium rounded-full border border-gray-200 shadow-sm">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                {t('hero.badge', 'AI Writing Assistant')}
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
              {t('hero.title', 'Write Authentically')}
              <br />
              <span>
                {t('hero.titleHighlight', 'With AI That Gets You')}
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg text-text-secondary mb-8 max-w-lg">
              {t('hero.description', 'Detect AI content, humanize your writing, and create content that sounds authentically like you. All in one powerful platform.')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                href="https://app.graphosai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary-hover transition-all shadow-glow-primary hover:shadow-lg hover:scale-[1.02]"
              >
                {t('cta.getStartedFree', 'Get Started Free')}
                <Icon name="arrow-right" size="md" className="icon-white" />
              </a>
              <button
                onClick={handlePlayVideo}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-bg-secondary text-text-primary rounded-xl font-semibold text-lg hover:bg-bg-hover transition-all border border-gray-200"
              >
                <Icon name="play-circle" size="md" />
                {t('cta.watchDemo', 'Watch Demo')}
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <Icon name="check-circle" size="sm" className="text-green-500" />
                <span>{t('hero.trust.free', 'Free to start')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="check-circle" size="sm" className="text-green-500" />
                <span>{t('hero.trust.noCard', 'No credit card')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="check-circle" size="sm" className="text-green-500" />
                <span>{t('hero.trust.extension', 'Chrome extension')}</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Video/Demo Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Video Thumbnail */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              {/* Placeholder for video thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-bg-secondary to-bg-tertiary flex items-center justify-center">
                {/* App Preview Mockup */}
                <div className="w-full h-full p-4">
                  {/* Browser Chrome */}
                  <div className="bg-bg-primary rounded-xl border border-gray-200 overflow-hidden h-full">
                    <div className="flex items-center gap-2 px-3 py-2 bg-bg-secondary border-b border-gray-200">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 mx-2">
                        <div className="bg-bg-tertiary rounded px-2 py-1 text-xs text-text-muted">
                          app.graphosai.com
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-bg-secondary rounded w-3/4" />
                      <div className="h-3 bg-bg-secondary rounded w-full" />
                      <div className="h-3 bg-bg-secondary rounded w-5/6" />
                      <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="shield-check" size="sm" />
                          <span className="text-xs font-medium text-primary">{t('demo.aiDetection.result', 'AI Detection Result')}</span>
                        </div>
                        <div className="text-2xl font-bold text-text-primary">23%</div>
                        <div className="text-xs text-text-secondary">{t('demo.verdictHuman', 'Human-written content')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Play Button Overlay */}
              <button
                onClick={handlePlayVideo}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Icon name="play" size="xl" className="ml-1" />
                </div>
              </button>
            </div>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-4 -left-4 bg-bg-primary rounded-xl border border-gray-200 shadow-lg p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Icon name="users" size="md" className="text-green-500" />
                </div>
                <div>
                  <div className="text-lg font-bold text-text-primary">50K+</div>
                  <div className="text-xs text-text-muted">{t('hero.stats.users', 'Active Users')}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -top-4 -right-4 bg-bg-primary rounded-xl border border-gray-200 shadow-lg p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="shield-check" size="md" />
                </div>
                <div>
                  <div className="text-lg font-bold text-text-primary">98%</div>
                  <div className="text-xs text-text-muted">{t('hero.stats.accuracy', 'Accuracy')}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={handleCloseVideo}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-4xl aspect-video bg-bg-primary rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseVideo}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <Icon name="x" size="md" />
            </button>

            {/* Video Placeholder */}
            <div className="w-full h-full flex items-center justify-center bg-bg-secondary">
              <div className="text-center">
                <Icon name="video" size="xl" className="text-text-muted mb-4 mx-auto" />
                <p className="text-text-secondary">
                  {t('hero.videoPlaceholder', 'Demo video coming soon!')}
                </p>
                <p className="text-sm text-text-muted mt-2">
                  {t('hero.videoNote', 'Try the live demo below instead')}
                </p>
                <a
                  href="#showcase"
                  onClick={handleCloseVideo}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
                >
                  {t('cta.tryDemo', 'Try Live Demo')}
                  <Icon name="arrow-down" size="sm" className="icon-white" />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}

export default VideoHeroSection



