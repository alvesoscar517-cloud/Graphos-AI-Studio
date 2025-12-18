/**
 * LiveStatisticsDemo - Interactive Text Statistics demo
 * Shows comprehensive writing metrics and benchmark comparisons
 * Design: Indigo/Purple theme - representing data and analytics
 */
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { AppFrame } from './DemoWrapper'
import Icon from '@components/common/Icon'
import ThreeDotsLoading from '@components/common/ThreeDotsLoading'

// Sample texts with pre-calculated statistics - i18n supported
const getSamples = (t) => [
  {
    id: 'blog',
    label: t('demo.samples.blogPost', 'Blog Post'),
    text: t('demoSamples.statistics.blog.text', `Writing great content isn't just about having good ideas. It's about presenting them in a way that connects with your readers. Short sentences help. They create rhythm. Longer sentences, on the other hand, allow you to explore complex ideas and build momentum in your narrative.`),
    stats: {
      totalWords: 48,
      totalSentences: 6,
      totalParagraphs: 1,
      avgWordLength: 4.6,
      avgSentenceLength: 8.0,
      vocabularyRichness: 0.85,
      punctuationRatio: 0.10,
      readabilityScore: 78,
      topSentenceStarters: ['writing', 'it\'s', 'short', 'they', 'longer'],
      transitionWordCount: 3
    },
    styleMatch: 'blog',
    benchmarkScore: 92
  },
  {
    id: 'academic',
    label: t('demo.samples.academic', 'Academic'),
    text: t('demoSamples.statistics.academic.text', `The implementation of sustainable development practices within contemporary organizational frameworks necessitates a comprehensive understanding of environmental, social, and governance factors. Furthermore, the integration of these multifaceted considerations into strategic decision-making processes has demonstrated significant correlations with long-term institutional resilience and stakeholder value creation.`),
    stats: {
      totalWords: 47,
      totalSentences: 2,
      totalParagraphs: 1,
      avgWordLength: 7.2,
      avgSentenceLength: 23.5,
      vocabularyRichness: 0.91,
      punctuationRatio: 0.06,
      readabilityScore: 28,
      topSentenceStarters: ['the implementation', 'furthermore'],
      transitionWordCount: 2
    },
    styleMatch: 'academic',
    benchmarkScore: 85
  },
  {
    id: 'casual',
    label: t('demo.samples.casual', 'Casual'),
    text: t('demoSamples.statistics.casual.text', `Hey! So I tried that new coffee shop today. It was pretty good, actually. The vibes were chill and the barista was super friendly. Definitely going back. You should check it out sometime!`),
    stats: {
      totalWords: 35,
      totalSentences: 6,
      totalParagraphs: 1,
      avgWordLength: 4.1,
      avgSentenceLength: 5.8,
      vocabularyRichness: 0.77,
      punctuationRatio: 0.14,
      readabilityScore: 89,
      topSentenceStarters: ['hey', 'so i', 'it was', 'the vibes', 'definitely'],
      transitionWordCount: 1
    },
    styleMatch: 'casual',
    benchmarkScore: 88
  }
]

// Benchmark data for comparison
const BENCHMARKS = {
  blog: {
    avgWordLength: { min: 4.0, max: 5.5, ideal: 4.8 },
    avgSentenceLength: { min: 12, max: 20, ideal: 15 },
    readabilityScore: { min: 60, max: 80, ideal: 70 },
    vocabularyRichness: { min: 0.4, max: 0.7, ideal: 0.55 }
  },
  academic: {
    avgWordLength: { min: 5.0, max: 7.0, ideal: 5.8 },
    avgSentenceLength: { min: 18, max: 30, ideal: 22 },
    readabilityScore: { min: 30, max: 50, ideal: 40 },
    vocabularyRichness: { min: 0.5, max: 0.8, ideal: 0.65 }
  },
  casual: {
    avgWordLength: { min: 3.5, max: 5.0, ideal: 4.2 },
    avgSentenceLength: { min: 8, max: 15, ideal: 12 },
    readabilityScore: { min: 70, max: 90, ideal: 80 },
    vocabularyRichness: { min: 0.35, max: 0.6, ideal: 0.45 }
  }
}

const LiveStatisticsDemo = () => {
  const { t } = useTranslation()
  const [selectedSample, setSelectedSample] = useState('blog')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [animatedStats, setAnimatedStats] = useState({})

  const SAMPLES = useMemo(() => getSamples(t), [t])
  const currentSample = SAMPLES.find((s) => s.id === selectedSample)
  const currentBenchmark = BENCHMARKS[currentSample?.styleMatch || 'blog']

  // Reset when sample changes
  useEffect(() => {
    setShowResult(false)
    setAnimatedStats({})
  }, [selectedSample])

  // Animate stats when result shows
  useEffect(() => {
    if (showResult && currentSample) {
      const stats = currentSample.stats
      const duration = 1500
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        
        setAnimatedStats({
          totalWords: Math.round(easeOut * stats.totalWords),
          totalSentences: Math.round(easeOut * stats.totalSentences),
          avgWordLength: parseFloat((easeOut * stats.avgWordLength).toFixed(1)),
          avgSentenceLength: parseFloat((easeOut * stats.avgSentenceLength).toFixed(1)),
          vocabularyRichness: parseFloat((easeOut * stats.vocabularyRichness).toFixed(2)),
          readabilityScore: Math.round(easeOut * stats.readabilityScore),
          punctuationRatio: parseFloat((easeOut * stats.punctuationRatio).toFixed(2)),
          benchmarkScore: Math.round(easeOut * currentSample.benchmarkScore)
        })
        
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
    setAnimatedStats({})

    // Simulate analysis time
    await new Promise((resolve) => setTimeout(resolve, 1800))

    setIsAnalyzing(false)
    setShowResult(true)
  }

  const handleReset = () => {
    setShowResult(false)
    setAnimatedStats({})
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500'
    if (score >= 60) return 'text-indigo-500'
    if (score >= 40) return 'text-amber-500'
    return 'text-red-500'
  }

  const getReadabilityLabel = (score) => {
    if (score >= 80) return t('demo.statistics.readability.veryEasy', 'Very Easy')
    if (score >= 60) return t('demo.statistics.readability.easy', 'Easy')
    if (score >= 40) return t('demo.statistics.readability.moderate', 'Moderate')
    if (score >= 20) return t('demo.statistics.readability.difficult', 'Difficult')
    return t('demo.statistics.readability.veryDifficult', 'Very Difficult')
  }

  const isInRange = (value, benchmark) => {
    return value >= benchmark.min && value <= benchmark.max
  }

  return (
    <AppFrame
      title="Graphos AI Studio - Text Statistics"
      className="max-w-6xl mx-auto"
    >
      <div className="flex min-h-[600px]">
        {/* Main Content Area */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col lg:border-r lg:border-gray-200 lg:dark:border-slate-700">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                <Icon name="bar-chart-2" size="lg" className="icon-indigo" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {t('demo.statistics.title', 'Text Statistics')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('demo.statistics.subtitle', 'Analyze writing metrics and patterns')}
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
                      ? 'bg-indigo-500 text-white'
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
            <div className="w-full h-full min-h-[200px] p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl text-gray-700 dark:text-gray-300 text-base leading-relaxed overflow-hidden relative">
              {/* Text content */}
              <div className={`transition-opacity duration-300 ${isAnalyzing ? 'opacity-0' : 'opacity-100'}`}>
                {currentSample?.text}
              </div>
              
              {/* Shimmer skeleton overlay when analyzing */}
              <AnimatePresence>
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 p-5 flex flex-col gap-3"
                  >
                    {[95, 88, 92, 78, 85, 55].map((width, index) => (
                      <motion.div
                        key={index}
                        className="h-4 rounded-md bg-gray-200 dark:bg-slate-700 relative overflow-hidden"
                        style={{ width: `${width}%` }}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.3) 50%, transparent 100%)'
                          }}
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: index * 0.1
                          }}
                        />
                      </motion.div>
                    ))}
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
                className="mt-4 space-y-4"
              >
                {/* Primary Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Total Words */}
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="file-text" size="xs" className="icon-indigo" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('demo.statistics.words', 'Words')}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {animatedStats.totalWords || 0}
                    </div>
                  </div>

                  {/* Total Sentences */}
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="align-left" size="xs" className="icon-indigo" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('demo.statistics.sentences', 'Sentences')}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {animatedStats.totalSentences || 0}
                    </div>
                  </div>

                  {/* Readability Score */}
                  <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="book-open" size="xs" className="icon-indigo" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('demo.statistics.readability', 'Readability')}
                      </span>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(animatedStats.readabilityScore || 0)}`}>
                      {animatedStats.readabilityScore || 0}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {getReadabilityLabel(animatedStats.readabilityScore || 0)}
                    </div>
                  </div>

                  {/* Benchmark Score */}
                  <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="target" size="xs" className="icon-emerald" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('demo.statistics.benchmark', 'Benchmark')}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-500">
                      {animatedStats.benchmarkScore || 0}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {currentSample?.styleMatch} {t('demo.statistics.style', 'style')}
                    </div>
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="activity" size="sm" className="icon-indigo" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('demo.statistics.detailedMetrics', 'Detailed Metrics')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Avg Word Length */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {t('demo.statistics.avgWordLength', 'Avg Word Length')}
                        </span>
                        <span className={`text-xs font-medium ${
                          isInRange(animatedStats.avgWordLength || 0, currentBenchmark.avgWordLength) 
                            ? 'text-emerald-500' 
                            : 'text-amber-500'
                        }`}>
                          {animatedStats.avgWordLength || 0}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, ((animatedStats.avgWordLength || 0) / 8) * 100)}%` }}
                          transition={{ duration: 1 }}
                          className={`h-full rounded-full ${
                            isInRange(animatedStats.avgWordLength || 0, currentBenchmark.avgWordLength)
                              ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                              : 'bg-gradient-to-r from-amber-400 to-orange-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Avg Sentence Length */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {t('demo.statistics.avgSentenceLength', 'Avg Sentence')}
                        </span>
                        <span className={`text-xs font-medium ${
                          isInRange(animatedStats.avgSentenceLength || 0, currentBenchmark.avgSentenceLength) 
                            ? 'text-emerald-500' 
                            : 'text-amber-500'
                        }`}>
                          {animatedStats.avgSentenceLength || 0}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, ((animatedStats.avgSentenceLength || 0) / 30) * 100)}%` }}
                          transition={{ duration: 1, delay: 0.1 }}
                          className={`h-full rounded-full ${
                            isInRange(animatedStats.avgSentenceLength || 0, currentBenchmark.avgSentenceLength)
                              ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                              : 'bg-gradient-to-r from-amber-400 to-orange-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Vocabulary Richness */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {t('demo.statistics.vocabulary', 'Vocabulary')}
                        </span>
                        <span className={`text-xs font-medium ${
                          isInRange(animatedStats.vocabularyRichness || 0, currentBenchmark.vocabularyRichness) 
                            ? 'text-emerald-500' 
                            : 'text-amber-500'
                        }`}>
                          {((animatedStats.vocabularyRichness || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(animatedStats.vocabularyRichness || 0) * 100}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full rounded-full ${
                            isInRange(animatedStats.vocabularyRichness || 0, currentBenchmark.vocabularyRichness)
                              ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                              : 'bg-gradient-to-r from-amber-400 to-orange-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Punctuation Ratio */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {t('demo.statistics.punctuation', 'Punctuation')}
                        </span>
                        <span className="text-xs font-medium text-indigo-500">
                          {animatedStats.punctuationRatio || 0}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (animatedStats.punctuationRatio || 0) * 500)}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {currentSample?.text.length}
              </span>
              <span className="text-gray-400"> {t('demo.characters', 'characters')}</span>
            </span>

            <div className="flex items-center gap-2 ml-auto">
              {showResult && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 p-2.5 sm:px-4 sm:py-2.5 bg-gray-100 dark:bg-slate-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                >
                  <Icon name="rotate-ccw" size="sm" color="gray-medium" />
                  <span className="hidden sm:inline">{t('demo.reset', 'Reset')}</span>
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                disabled={isAnalyzing || showResult}
                className="flex items-center justify-center gap-2 min-w-[160px] h-[42px] px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center w-[100px]">
                    <ThreeDotsLoading size="md" />
                  </span>
                ) : (
                  <>
                    <Icon name="bar-chart-2" size="sm" className="icon-indigo" />
                    {t('demo.statistics.analyzeBtn', 'Analyze Text')}
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:flex w-56 p-3 bg-gray-50 dark:bg-slate-800/50 flex-col gap-3 overflow-y-auto">
          {/* Style Type */}
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                <Icon name="edit-3" size="lg" className="icon-indigo" />
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-800 dark:text-gray-200 capitalize">{currentSample?.styleMatch} {t('demo.statistics.style', 'style')}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">{t('demo.statistics.benchmarkComparison')}</div>
              </div>
            </div>
          </div>

          {/* Metrics Explained */}
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 mb-3">
              <Icon name="info" size="xs" color="gray-medium" />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('demo.statistics.metricsGuide')}</span>
            </div>
            <div className="space-y-2">
              {[
                { icon: 'type', labelKey: 'demo.statistics.metrics.wordLength.label', descKey: 'demo.statistics.metrics.wordLength.desc' },
                { icon: 'align-left', labelKey: 'demo.statistics.metrics.sentenceLength.label', descKey: 'demo.statistics.metrics.sentenceLength.desc' },
                { icon: 'book-open', labelKey: 'demo.statistics.metrics.readability.label', descKey: 'demo.statistics.metrics.readability.desc' },
                { icon: 'book', labelKey: 'demo.statistics.metrics.vocabulary.label', descKey: 'demo.statistics.metrics.vocabulary.desc' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <Icon name={item.icon} size="xs" className="icon-indigo mt-0.5" />
                  <div>
                    <div className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{t(item.labelKey)}</div>
                    <div className="text-[9px] text-gray-500 dark:text-gray-400">{t(item.descKey)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Readability Scale */}
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 mb-3">
              <Icon name="bar-chart" size="xs" color="gray-medium" />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('demo.statistics.readabilityScale')}</span>
            </div>
            <div className="space-y-1.5">
              {[
                { range: '80-100', labelKey: 'demo.statistics.readabilityLevels.veryEasy', color: 'emerald' },
                { range: '60-79', labelKey: 'demo.statistics.readabilityLevels.easy', color: 'teal' },
                { range: '40-59', labelKey: 'demo.statistics.readabilityLevels.moderate', color: 'amber' },
                { range: '20-39', labelKey: 'demo.statistics.readabilityLevels.difficult', color: 'orange' },
                { range: '0-19', labelKey: 'demo.statistics.readabilityLevels.veryDifficult', color: 'red' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <span className={`text-${item.color}-600 dark:text-${item.color}-400 font-medium`}>{item.range}</span>
                  <span className="text-gray-500 dark:text-gray-400">{t(item.labelKey)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppFrame>
  )
}

export default LiveStatisticsDemo
