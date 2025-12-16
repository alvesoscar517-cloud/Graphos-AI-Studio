/**
 * LiveCompatibilityDemo - Interactive Compatibility Score demo
 * Shows how text is analyzed against a Voice Profile for style matching
 * Design: Teal/Cyan theme - representing analysis and precision
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { AppFrame } from './DemoWrapper'
import Icon from '@components/common/Icon'

// Sample texts with pre-calculated compatibility scores
const SAMPLES = [
  {
    id: 'high',
    label: 'High Match',
    text: `I've been thinking about how we approach our daily challenges. The key is to stay focused on what truly matters while remaining flexible enough to adapt. Small consistent steps lead to remarkable progress over time.`,
    score: 92,
    vectorScore: 94,
    statisticalScore: 89,
    confidence: 87,
    deviations: { mild: 1, moderate: 0, severe: 0 }
  },
  {
    id: 'medium',
    label: 'Medium Match',
    text: `The implementation of sustainable practices in corporate environments has become increasingly important. Organizations must recognize the necessity of adopting environmentally conscious strategies to remain competitive in today's market.`,
    score: 68,
    vectorScore: 72,
    statisticalScore: 63,
    confidence: 82,
    deviations: { mild: 2, moderate: 1, severe: 0 }
  },
  {
    id: 'low',
    label: 'Low Match',
    text: `Pursuant to the aforementioned considerations, it is hereby recommended that the committee undertake a comprehensive review of the existing protocols. The ramifications of such an endeavor would be manifold and far-reaching.`,
    score: 34,
    vectorScore: 38,
    statisticalScore: 29,
    confidence: 91,
    deviations: { mild: 1, moderate: 2, severe: 2 }
  }
]

// Mock Voice Profiles
const VOICE_PROFILES = [
  { id: 'personal', name: 'Personal Blog', samples: 12, tone: 'Conversational' },
  { id: 'professional', name: 'Professional', samples: 8, tone: 'Formal' },
  { id: 'creative', name: 'Creative Writer', samples: 15, tone: 'Expressive' },
]

const LiveCompatibilityDemo = () => {
  const { t } = useTranslation()
  const [selectedSample, setSelectedSample] = useState('high')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [selectedProfile] = useState('personal')

  const currentSample = SAMPLES.find((s) => s.id === selectedSample)
  const currentProfile = VOICE_PROFILES.find((p) => p.id === selectedProfile)

  // Reset when sample changes
  useEffect(() => {
    setShowResult(false)
    setAnimatedScore(0)
  }, [selectedSample])

  // Animate score when result shows
  useEffect(() => {
    if (showResult && currentSample) {
      const targetScore = currentSample.score
      const duration = 1500
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        setAnimatedScore(Math.round(easeOut * targetScore))
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      requestAnimationFrame(animate)
    }
  }, [showResult, currentSample])

  const handleAnalyze = async () => {
    if (isAnalyzing) return

    setIsAnalyzing(true)
    setShowResult(false)
    setAnimatedScore(0)

    // Simulate analysis time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsAnalyzing(false)
    setShowResult(true)
  }

  const handleReset = () => {
    setShowResult(false)
    setAnimatedScore(0)
  }

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-500'
    if (score >= 50) return 'text-amber-500'
    return 'text-red-500'
  }

  const getScoreLabel = (score) => {
    if (score >= 90) return t('demo.compatibility.veryCompatible', 'Very Compatible')
    if (score >= 75) return t('demo.compatibility.goodMatch', 'Good Match')
    if (score >= 50) return t('demo.compatibility.averageMatch', 'Average Match')
    if (score >= 25) return t('demo.compatibility.lowMatch', 'Low Match')
    return t('demo.compatibility.notCompatible', 'Not Compatible')
  }

  const getScoreBgColor = (score) => {
    if (score >= 75) return 'from-emerald-500 to-teal-500'
    if (score >= 50) return 'from-amber-500 to-orange-500'
    return 'from-red-500 to-rose-500'
  }

  return (
    <AppFrame
      title="Graphos AI Studio - Compatibility Score"
      className="max-w-6xl mx-auto"
    >
      <div className="flex min-h-[600px]">
        {/* Main Content Area */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col border-r border-gray-200 dark:border-slate-700">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-500/20 rounded-xl flex items-center justify-center">
                <Icon name="target" size="lg" className="icon-teal" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {t('demo.compatibility.title', 'Compatibility Score')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('demo.compatibility.subtitle', 'Analyze how well text matches your writing style')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('demo.trySample', 'Try sample')}:
              </span>
              {SAMPLES.map(({ id, label }) => (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSample(id)}
                  disabled={isAnalyzing}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-50 ${
                    selectedSample === id
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Text Display Area */}
          <div className="flex-1 relative">
            <div className="w-full h-full min-h-[300px] p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl text-gray-700 dark:text-gray-300 text-base leading-relaxed overflow-hidden relative">
              {currentSample?.text}
              
              {/* Analysis overlay */}
              <AnimatePresence>
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gray-50/90 dark:bg-slate-800/90 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 mx-auto mb-4 relative"
                      >
                        <div className="absolute inset-0 rounded-full border-4 border-teal-200 dark:border-teal-800" />
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-500" />
                      </motion.div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('demo.compatibility.analyzing', 'Analyzing writing style...')}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Result Section */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Main Score */}
                  <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-500/10 dark:to-cyan-500/10 rounded-xl">
                    <div className={`text-4xl font-bold ${getScoreColor(animatedScore)}`}>
                      {animatedScore}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {getScoreLabel(currentSample?.score)}
                    </div>
                  </div>

                  {/* Vector Score */}
                  <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="cpu" size="xs" className="icon-teal" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('demo.compatibility.vector', 'Vector')}
                      </span>
                    </div>
                    <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      {currentSample?.vectorScore}%
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentSample?.vectorScore}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Statistical Score */}
                  <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="bar-chart-2" size="xs" className="icon-teal" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('demo.compatibility.statistical', 'Statistical')}
                      </span>
                    </div>
                    <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      {currentSample?.statisticalScore}%
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentSample?.statisticalScore}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Deviations */}
                  <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="alert-triangle" size="xs" className="icon-teal" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('demo.compatibility.deviations', 'Deviations')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {currentSample?.deviations.severe > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full">
                          {currentSample.deviations.severe} severe
                        </span>
                      )}
                      {currentSample?.deviations.moderate > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full">
                          {currentSample.deviations.moderate} moderate
                        </span>
                      )}
                      {currentSample?.deviations.mild > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full">
                          {currentSample.deviations.mild} mild
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-teal-600 dark:text-teal-400">
                {currentSample?.text.length}
              </span>
              <span className="text-gray-400"> {t('demo.characters', 'characters')}</span>
            </span>

            <div className="flex items-center gap-2">
              {showResult && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-slate-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                >
                  <Icon name="rotate-ccw" size="sm" color="gray-medium" />
                  {t('demo.reset', 'Reset')}
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                disabled={isAnalyzing || showResult}
                className="flex items-center justify-center gap-2 min-w-[160px] px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl text-sm font-medium hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/20"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-[3px]">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-[6px] h-[6px] bg-white/60 rounded-full"
                        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </span>
                ) : (
                  <>
                    <Icon name="target" size="sm" className="icon-white" />
                    {t('demo.compatibility.analyzeBtn', 'Calculate Score')}
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-56 p-3 bg-gray-50 dark:bg-slate-800/50 flex flex-col gap-3 overflow-y-auto">
          {/* Voice Profile */}
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-500/20 rounded-xl flex items-center justify-center">
                <Icon name="user" size="lg" className="icon-teal" />
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-800 dark:text-gray-200">{currentProfile?.name}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">{currentProfile?.samples} samples • {currentProfile?.tone}</div>
              </div>
            </div>
          </div>

          {/* Score Interpretation */}
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 mb-3">
              <Icon name="info" size="xs" color="gray-medium" />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Score Guide
              </span>
            </div>
            <div className="space-y-2">
              {[
                { range: '90-100%', label: 'Very Compatible', color: 'emerald' },
                { range: '75-89%', label: 'Good Match', color: 'teal' },
                { range: '50-74%', label: 'Average', color: 'amber' },
                { range: '25-49%', label: 'Low Match', color: 'orange' },
                { range: '0-24%', label: 'Not Compatible', color: 'red' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <span className={`text-${item.color}-600 dark:text-${item.color}-400 font-medium`}>{item.range}</span>
                  <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Components */}
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 mb-3">
              <Icon name="layers" size="xs" color="gray-medium" />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Analysis
              </span>
            </div>
            <div className="space-y-2">
              {[
                { icon: 'cpu', label: 'Vector Similarity', desc: 'Semantic matching' },
                { icon: 'bar-chart-2', label: 'Statistical', desc: 'Structure analysis' },
                { icon: 'activity', label: 'Confidence', desc: 'Result reliability' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <Icon name={item.icon} size="xs" className="icon-teal mt-0.5" />
                  <div>
                    <div className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{item.label}</div>
                    <div className="text-[9px] text-gray-500 dark:text-gray-400">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppFrame>
  )
}

export default LiveCompatibilityDemo
