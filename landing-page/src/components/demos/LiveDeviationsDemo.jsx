/**
 * LiveDeviationsDemo - Interactive Deviations demo
 * Shows how sentences are analyzed for style deviations
 * Design: Orange/Amber theme - representing alerts and warnings
 */
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { AppFrame } from './DemoWrapper'
import Icon from '@components/common/Icon'

// Sample texts with pre-calculated deviations
const SAMPLES = [
  {
    id: 'few',
    label: 'Few Deviations',
    text: `I've been thinking about how we approach our daily challenges. The key is to stay focused on what truly matters. Small consistent steps lead to remarkable progress over time. We should embrace change and adapt quickly.`,
    score: 88,
    avgSimilarity: 78,
    totalDeviant: 1,
    sentences: [
      { text: "I've been thinking about how we approach our daily challenges.", isDeviant: false, severity: null, similarity: 0.92 },
      { text: "The key is to stay focused on what truly matters.", isDeviant: false, severity: null, similarity: 0.89 },
      { text: "Small consistent steps lead to remarkable progress over time.", isDeviant: true, severity: 'mild', similarity: 0.45 },
      { text: "We should embrace change and adapt quickly.", isDeviant: false, severity: null, similarity: 0.87 }
    ],
    summary: { mild: 1, moderate: 0, severe: 0 }
  },
  {
    id: 'some',
    label: 'Some Deviations',
    text: `The implementation of sustainable practices has become increasingly important. Organizations must recognize the necessity of adopting environmentally conscious strategies. This approach yields significant benefits. Companies should act now.`,
    score: 65,
    avgSimilarity: 48,
    totalDeviant: 3,
    sentences: [
      { text: "The implementation of sustainable practices has become increasingly important.", isDeviant: true, severity: 'moderate', similarity: 0.35 },
      { text: "Organizations must recognize the necessity of adopting environmentally conscious strategies.", isDeviant: true, severity: 'severe', similarity: 0.22 },
      { text: "This approach yields significant benefits.", isDeviant: true, severity: 'mild', similarity: 0.48 },
      { text: "Companies should act now.", isDeviant: false, severity: null, similarity: 0.85 }
    ],
    summary: { mild: 1, moderate: 1, severe: 1 }
  },
  {
    id: 'many',
    label: 'Many Deviations',
    text: `Pursuant to the aforementioned considerations, it is hereby recommended that the committee undertake a comprehensive review. The ramifications would be manifold. Such endeavors require meticulous planning. One must proceed with caution.`,
    score: 32,
    avgSimilarity: 27,
    totalDeviant: 4,
    sentences: [
      { text: "Pursuant to the aforementioned considerations, it is hereby recommended that the committee undertake a comprehensive review.", isDeviant: true, severity: 'severe', similarity: 0.18 },
      { text: "The ramifications would be manifold.", isDeviant: true, severity: 'severe', similarity: 0.21 },
      { text: "Such endeavors require meticulous planning.", isDeviant: true, severity: 'moderate', similarity: 0.32 },
      { text: "One must proceed with caution.", isDeviant: true, severity: 'moderate', similarity: 0.38 }
    ],
    summary: { mild: 0, moderate: 2, severe: 2 }
  }
]

// Mock Voice Profiles
const VOICE_PROFILES = [
  { id: 'personal', name: 'Personal Blog', samples: 12, tone: 'Conversational' },
]

const LiveDeviationsDemo = () => {
  const { t } = useTranslation()
  const [selectedSample, setSelectedSample] = useState('few')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [hoveredSentence, setHoveredSentence] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [selectedProfile] = useState('personal')
  const textAreaRef = useRef(null)

  const currentSample = SAMPLES.find((s) => s.id === selectedSample)
  const currentProfile = VOICE_PROFILES.find((p) => p.id === selectedProfile)

  useEffect(() => {
    setShowResult(false)
    setHoveredSentence(null)
  }, [selectedSample])

  const handleAnalyze = async () => {
    if (isAnalyzing) return
    setIsAnalyzing(true)
    setShowResult(false)
    setHoveredSentence(null)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsAnalyzing(false)
    setShowResult(true)
  }

  const handleReset = () => {
    setShowResult(false)
    setHoveredSentence(null)
  }

  const handleSentenceHover = (index, event) => {
    if (!currentSample?.sentences[index]?.isDeviant) return
    const rect = event.currentTarget.getBoundingClientRect()
    const parentRect = textAreaRef.current?.getBoundingClientRect()
    if (parentRect) {
      setTooltipPosition({
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.bottom - parentRect.top + 8
      })
    }
    setHoveredSentence(index)
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'severe': return 'bg-red-100 dark:bg-red-500/20 border-red-300 dark:border-red-500/30'
      case 'moderate': return 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/30'
      case 'mild': return 'bg-blue-100 dark:bg-blue-500/20 border-blue-300 dark:border-blue-500/30'
      default: return ''
    }
  }

  const getSeverityTextColor = (severity) => {
    switch (severity) {
      case 'severe': return 'text-red-600 dark:text-red-400'
      case 'moderate': return 'text-amber-600 dark:text-amber-400'
      case 'mild': return 'text-blue-600 dark:text-blue-400'
      default: return 'text-gray-700 dark:text-gray-300'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'severe': return 'alert-triangle'
      case 'moderate': return 'alert-circle'
      case 'mild': return 'info'
      default: return 'check-circle'
    }
  }

  return (
    <AppFrame title="Graphos AI Studio - Deviations" className="max-w-6xl mx-auto">
      <div className="flex min-h-[600px]">
        {/* Main Content Area */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col border-r border-gray-200 dark:border-slate-700">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon name="alert-triangle" size="lg" className="icon-orange" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {t('demo.deviations.title', 'Deviations')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('demo.deviations.subtitle', 'Find sentences that deviate from your style')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                {t('demo.trySample', 'Try sample')}:
              </span>
              {SAMPLES.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setSelectedSample(id)}
                  disabled={isAnalyzing}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-50 whitespace-nowrap ${
                    selectedSample === id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Display Area - Fixed height like Compatibility Score */}
          <div className="flex-1 relative" ref={textAreaRef}>
            <div className="w-full h-full min-h-[300px] p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl text-gray-700 dark:text-gray-300 text-base leading-relaxed overflow-hidden relative">
              {showResult ? (
                <div className="leading-relaxed">
                  {currentSample?.sentences.map((sentence, index) => (
                    <span
                      key={index}
                      onMouseEnter={(e) => handleSentenceHover(index, e)}
                      onMouseLeave={() => setHoveredSentence(null)}
                      className={`inline transition-all rounded px-0.5 border cursor-default ${
                        sentence.isDeviant 
                          ? `${getSeverityColor(sentence.severity)} cursor-pointer`
                          : 'border-transparent'
                      }`}
                    >
                      <span className={sentence.isDeviant ? getSeverityTextColor(sentence.severity) : 'text-gray-700 dark:text-gray-300'}>
                        {sentence.text}
                      </span>
                      {' '}
                    </span>
                  ))}
                </div>
              ) : (
                currentSample?.text
              )}
              
              {/* Tooltip Popup - Below sentence */}
              <AnimatePresence>
                {hoveredSentence !== null && currentSample?.sentences[hoveredSentence]?.isDeviant && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 pointer-events-none"
                    style={{
                      left: Math.min(Math.max(tooltipPosition.x - 120, 10), textAreaRef.current?.offsetWidth - 250 || 300),
                      top: tooltipPosition.y,
                    }}
                  >
                    <div className="w-[240px] p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 shadow-xl">
                      {/* Arrow pointing up */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-l border-t border-gray-200 dark:border-slate-600 rotate-45" />
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          currentSample.sentences[hoveredSentence].severity === 'severe' ? 'bg-red-100 dark:bg-red-500/20' :
                          currentSample.sentences[hoveredSentence].severity === 'moderate' ? 'bg-amber-100 dark:bg-amber-500/20' :
                          'bg-blue-100 dark:bg-blue-500/20'
                        }`}>
                          <Icon 
                            name={getSeverityIcon(currentSample.sentences[hoveredSentence].severity)} 
                            size="xs" 
                            className={`icon-${currentSample.sentences[hoveredSentence].severity === 'severe' ? 'red' : currentSample.sentences[hoveredSentence].severity === 'moderate' ? 'amber' : 'blue'}`} 
                          />
                        </div>
                        <span className={`text-xs font-semibold capitalize ${getSeverityTextColor(currentSample.sentences[hoveredSentence].severity)}`}>
                          {currentSample.sentences[hoveredSentence].severity} Deviation
                        </span>
                        <span className="text-[10px] text-gray-400 ml-auto">
                          {(currentSample.sentences[hoveredSentence].similarity * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        {t('demo.deviations.suggestion', 'This sentence differs from your typical writing style.')}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
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
                        <div className="absolute inset-0 rounded-full border-4 border-orange-200 dark:border-orange-800" />
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500" />
                      </motion.div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('demo.deviations.analyzing', 'Analyzing...')}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Result Section - Similar to Compatibility Score */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700"
              >
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Main Score */}
                  <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 rounded-xl">
                    <div className={`text-4xl font-bold ${
                      currentSample?.score >= 75 ? 'text-emerald-500' :
                      currentSample?.score >= 50 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {currentSample?.score}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('demo.deviations.compatibility', 'Compatibility')}
                    </div>
                  </div>

                  {/* Deviant Sentences */}
                  <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="file-text" size="xs" className="icon-orange" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('demo.deviations.deviant', 'Deviant')}
                      </span>
                    </div>
                    <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      {currentSample?.totalDeviant}/{currentSample?.sentences.length}
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentSample?.totalDeviant / currentSample?.sentences.length) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Severe */}
                  <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="alert-triangle" size="xs" className="icon-red" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('demo.deviations.severe', 'Severe')}
                      </span>
                    </div>
                    <div className="text-xl font-semibold text-red-500">
                      {currentSample?.summary.severe}
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(currentSample?.summary.severe * 25, 100)}%` }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Moderate */}
                  <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="alert-circle" size="xs" className="icon-amber" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('demo.deviations.moderate', 'Moderate')}
                      </span>
                    </div>
                    <div className="text-xl font-semibold text-amber-500">
                      {currentSample?.summary.moderate}
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(currentSample?.summary.moderate * 25, 100)}%` }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Mild */}
                  <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="info" size="xs" className="icon-blue" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('demo.deviations.mild', 'Mild')}
                      </span>
                    </div>
                    <div className="text-xl font-semibold text-blue-500">
                      {currentSample?.summary.mild}
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(currentSample?.summary.mild * 25, 100)}%` }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                {currentSample?.sentences.length}
              </span>
              <span className="text-gray-400"> {t('demo.sentences', 'sentences')}</span>
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
                className="flex items-center justify-center gap-2 min-w-[160px] px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20"
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
                    <Icon name="alert-triangle" size="sm" className="icon-white" />
                    <span>{t('demo.deviations.findBtn', 'Find Deviations')}</span>
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
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Icon name="user" size="lg" className="icon-orange" />
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-800 dark:text-gray-200">{currentProfile?.name}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">{currentProfile?.samples} samples • {currentProfile?.tone}</div>
              </div>
            </div>
          </div>

          {/* Severity Guide */}
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 mb-3">
              <Icon name="info" size="xs" color="gray-medium" />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Severity Guide
              </span>
            </div>
            <div className="space-y-2">
              {[
                { severity: 'severe', label: 'Severe', desc: 'Major style mismatch', color: 'red' },
                { severity: 'moderate', label: 'Moderate', desc: 'Noticeable difference', color: 'amber' },
                { severity: 'mild', label: 'Mild', desc: 'Small variation', color: 'blue' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <Icon name={getSeverityIcon(item.severity)} size="xs" className={`icon-${item.color} mt-0.5 flex-shrink-0`} />
                  <div className="min-w-0">
                    <div className={`text-[11px] font-medium text-${item.color}-600 dark:text-${item.color}-400`}>{item.label}</div>
                    <div className="text-[9px] text-gray-500 dark:text-gray-400">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 mb-3">
              <Icon name="lightbulb" size="xs" color="gray-medium" />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Tips
              </span>
            </div>
            <ul className="space-y-2 text-[10px] text-gray-500 dark:text-gray-400">
              <li className="flex items-start gap-1.5">
                <Icon name="check" size="xs" className="icon-orange mt-0.5 flex-shrink-0" />
                <span>Hover highlighted sentences for details</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Icon name="check" size="xs" className="icon-orange mt-0.5 flex-shrink-0" />
                <span>Focus on severe deviations first</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Icon name="check" size="xs" className="icon-orange mt-0.5 flex-shrink-0" />
                <span>Use AI Rewrite to fix issues</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AppFrame>
  )
}

export default LiveDeviationsDemo
