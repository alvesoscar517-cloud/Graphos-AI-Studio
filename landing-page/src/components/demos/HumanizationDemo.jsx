import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'

// Get i18n sample texts
const getSampleTexts = (t) => [
  {
    before: t('demoSamples.humanization.formal.original', "The implementation of artificial intelligence in modern business operations has demonstrated significant improvements in operational efficiency and cost reduction metrics across various industry sectors."),
    after: t('demoSamples.humanization.formal.humanized', "AI is changing how businesses work. Companies using it are seeing real results - things run smoother and costs go down. It's happening everywhere, from retail to healthcare."),
  },
  {
    before: t('demoSamples.humanization.academic.original', "It is imperative to acknowledge that the utilization of renewable energy sources constitutes a fundamental component of sustainable development strategies."),
    after: t('demoSamples.humanization.academic.humanized', "We need to use more renewable energy. It's a key part of building a sustainable future - something we can't ignore anymore."),
  },
  {
    before: t('demoSamples.humanization.technical.original', "The research findings indicate that individuals who engage in regular physical exercise demonstrate enhanced cognitive function and improved mental health outcomes."),
    after: t('demoSamples.humanization.technical.humanized', "People who exercise regularly think more clearly and feel better mentally. The research backs this up - it's not just about physical health."),
  },
]

function HumanizationDemo() {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAfter, setShowAfter] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Get i18n sample texts
  const sampleTexts = useMemo(() => getSampleTexts(t), [t])

  const handleHumanize = async () => {
    setIsAnimating(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setShowAfter(true)
    setIsAnimating(false)
  }

  const handleNext = () => {
    setShowAfter(false)
    setCurrentIndex((currentIndex + 1) % sampleTexts.length)
  }

  const handleReset = () => {
    setShowAfter(false)
  }

  const current = sampleTexts[currentIndex]

  return (
    <div className="bg-bg-secondary rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {t('demo.tryHumanization', 'Try Humanization Demo')}
      </h3>
      <p className="text-sm text-text-secondary mb-4">
        {t('demo.humanizationDesc', 'See how AI-generated text transforms into natural, human-like writing.')}
      </p>

      <div className="space-y-4">
        {/* Before/After Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowAfter(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !showAfter ? 'bg-primary text-white' : 'bg-bg-primary text-text-secondary'
            }`}
          >
            {t('demo.originalAI', 'Original (AI)')}
          </button>
          <button
            onClick={() => showAfter && setShowAfter(true)}
            disabled={!showAfter}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showAfter ? 'bg-success text-white' : 'bg-bg-primary text-text-muted'
            }`}
          >
            {t('demo.humanized', 'Humanized')}
          </button>
        </div>

        {/* Text Display */}
        <div className="relative min-h-[150px] p-4 bg-bg-primary rounded-xl border border-gray-200">
          <AnimatePresence mode="wait">
            <motion.p
              key={showAfter ? 'after' : 'before'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-text-primary leading-relaxed"
            >
              {showAfter ? current.after : current.before}
            </motion.p>
          </AnimatePresence>
          
          {/* Label */}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
            showAfter ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
          }`}>
            {showAfter ? t('demo.humanLike', 'Human-like') : t('demo.aiGenerated', 'AI-generated')}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">
            {t('demo.exampleOf', 'Example {{current}} of {{total}}', { current: currentIndex + 1, total: sampleTexts.length })}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleNext}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              {t('demo.nextExample', 'Next Example')}
            </button>
            {!showAfter ? (
              <button
                onClick={handleHumanize}
                disabled={isAnimating}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {isAnimating ? t('demo.humanizing', 'Humanizing...') : t('demo.humanize', 'Humanize')}
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-bg-primary text-text-primary rounded-lg font-medium hover:bg-bg-hover transition-colors border border-gray-200"
              >
                {t('common.reset', 'Reset')}
              </button>
            )}
          </div>
        </div>

        {/* CTA after humanization */}
        {showAfter && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20 text-center"
          >
            <p className="text-sm text-text-secondary mb-3">
              {t('demo.wantToHumanize', 'Want to humanize your own content?')}
            </p>
            <a
              href="https://app.graphosai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
            >
              {t('demo.tryFullVersion', 'Try Full Version Free')}
            </a>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default HumanizationDemo
