/**
 * LiveAIDetectionDemo - Interactive AI Detection demo
 * Matches the real AIDetectionCard component from the main app
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { AppFrame } from './DemoWrapper'
import Icon from '@components/common/Icon'

// Sample texts for demo - locked, user cannot edit
const SAMPLE_TEXTS = {
  ai: `The implementation of artificial intelligence in modern healthcare systems represents a paradigm shift in medical diagnostics and patient care. Machine learning algorithms have demonstrated remarkable accuracy in analyzing medical imaging data, often surpassing human radiologists in detecting certain conditions. Furthermore, natural language processing enables efficient extraction of relevant information from electronic health records, facilitating more informed clinical decision-making.`,
  human: `I've been thinking about this problem for weeks now, and honestly? It's driving me crazy. Every time I think I've figured it out, something new pops up. My colleague Sarah suggested we try a different approach - maybe we're overcomplicating things. She's probably right. We tend to do that a lot around here, especially when deadlines are looming.`,
  mixed: `Artificial intelligence has revolutionized content creation through sophisticated algorithms and neural networks. But here's the thing - I still think there's something special about human creativity that machines can't quite capture. Sure, AI can generate technically perfect prose, but can it tell you about that time I accidentally sent an email to the wrong person? I don't think so!`
}

// Mock detection results matching real app behavior
const getMockResult = (type) => {
  const results = {
    ai: {
      aiScore: 87,
      confidence: 92,
      verdict: 'AI-generated',
      humanIndicators: [],
      aiIndicators: [
        'Consistent formal tone throughout',
        'Technical vocabulary usage',
        'Structured paragraph flow',
        'Lack of personal expressions'
      ]
    },
    human: {
      aiScore: 18,
      confidence: 88,
      verdict: 'Human-written',
      humanIndicators: [
        'Personal pronouns detected',
        'Informal language patterns',
        'Emotional expressions present',
        'Varied sentence structure'
      ],
      aiIndicators: []
    },
    mixed: {
      aiScore: 52,
      confidence: 75,
      verdict: 'Mixed content',
      humanIndicators: [
        'Personal anecdotes present',
        'Informal expressions used'
      ],
      aiIndicators: [
        'Technical terminology detected',
        'Formal sentence structures'
      ]
    }
  }
  return results[type]
}

const LiveAIDetectionDemo = () => {
  const { t } = useTranslation()
  const [selectedSample, setSelectedSample] = useState('ai')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [showResult, setShowResult] = useState(true)

  const text = SAMPLE_TEXTS[selectedSample]

  // Reset result when sample changes
  useEffect(() => {
    setResult(null)
  }, [selectedSample])

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setResult(null)

    await new Promise((resolve) => setTimeout(resolve, 1800))

    const mockResult = getMockResult(selectedSample)
    setResult(mockResult)
    setIsAnalyzing(false)
  }

  const getVerdictIcon = (score) => {
    if (score < 30) return 'shield-check'
    if (score < 50) return 'check-circle'
    if (score < 70) return 'alert-circle'
    return 'alert-triangle'
  }

  const getConfidenceColor = (conf) => {
    if (conf < 60) return 'from-orange-400 to-amber-400'
    if (conf < 80) return 'from-blue-400 to-cyan-400'
    return 'from-green-400 to-emerald-400'
  }

  return (
    <AppFrame
      title="Graphos AI Studio - AI Detection"
      className="max-w-5xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[520px]">
        {/* Left Panel - Text Display (Read-only) */}
        <div className="lg:col-span-3 p-5 lg:p-6 flex flex-col">
          {/* Header with Sample Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs text-gray-500">
              {t('demo.trySample', 'Try sample')}:
            </span>
            {[
              { key: 'ai', label: t('demo.aiText', 'AI Text') },
              { key: 'human', label: t('demo.humanText', 'Human Text') },
              { key: 'mixed', label: t('demo.mixedText', 'Mixed') }
            ].map(({ key, label }) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedSample(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedSample === key
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </motion.button>
            ))}
          </div>

          {/* Text Display Area - Read Only with Shimmer effect when analyzing */}
          <div className="flex-1 relative">
            <div className="w-full h-full min-h-[320px] p-4 bg-gray-50 rounded-xl text-gray-700 text-sm leading-relaxed overflow-hidden relative">
              {/* Text content */}
              <div className={`transition-opacity duration-300 ${isAnalyzing ? 'opacity-0' : 'opacity-100'}`}>
                {text}
              </div>
              
              {/* Shimmer skeleton overlay when analyzing */}
              <AnimatePresence>
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 p-4 flex flex-col gap-3"
                  >
                    {/* Shimmer lines */}
                    {[95, 88, 92, 78, 85, 90, 72, 60].map((width, index) => (
                      <motion.div
                        key={index}
                        className="h-4 rounded-md bg-gray-200 relative overflow-hidden"
                        style={{ width: `${width}%` }}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)'
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

          {/* Footer with Character Count and Action */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-green-600">
              <span className="font-semibold">{text.length}</span>
              <span className="text-gray-400">
                {' '}
                / 50+ {t('demo.characters', 'characters')}
              </span>
            </span>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center justify-center gap-2 min-w-[120px] px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center w-[50px] h-[16px]">
                  <span className="flex items-center gap-[3px]">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-[6px] h-[6px] bg-gray-400 rounded-full"
                        animate={{
                          y: [0, -4, 0],
                          opacity: [0.4, 1, 0.4]
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: 'easeInOut'
                        }}
                      />
                    ))}
                  </span>
                </span>
              ) : (
                <>
                  <span>
                    {result
                      ? t('analysis.detected', 'Detected')
                      : t('analysis.detect', 'Detect')}
                  </span>
                  <Icon name="arrow-right" size="sm" className="text-gray-400" />
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-2 p-5 lg:p-6 bg-white">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Icon name="shield-check" size="lg" className="text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-medium text-gray-800 m-0 mb-0.5">
                {t('analysis.aiDetection', 'AI Detection')}
              </h4>
              <p className="text-[11px] text-gray-500 m-0">
                {t('analysis.content', 'Content Analysis')}
              </p>
            </div>
            {result && (
              <button
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setShowResult(!showResult)}
              >
                <Icon
                  name="chevron-down"
                  size="sm"
                  className={`text-gray-400 transition-transform duration-300 ${showResult ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative w-14 h-14 mb-3">
                  <div className="absolute inset-0 border-[3px] border-gray-200 rounded-full" />
                  <div className="absolute inset-0 border-[3px] border-gray-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm text-gray-500">
                  {t('demo.analyzing', 'Analyzing...')}
                </p>
              </motion.div>
            ) : result && showResult ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-2"
              >
                {/* Score Circle */}
                <div className="relative w-24 h-24 flex items-center justify-center my-2">
                  <svg
                    className="absolute top-0 left-0 w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <defs>
                      <linearGradient
                        id="demoAiDetectionGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#93c5fd" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#2563eb" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="url(#demoAiDetectionGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={263.89}
                      initial={{ strokeDashoffset: 263.89 }}
                      animate={{
                        strokeDashoffset:
                          263.89 - (result.aiScore / 100) * 263.89
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-baseline gap-0.5">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-semibold text-gray-800"
                      >
                        {result.aiScore}
                      </motion.span>
                      <span className="text-sm font-medium text-gray-400">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Verdict */}
                <div className="w-full flex justify-center">
                  <div className="inline-flex items-center gap-2 py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700">
                    <Icon
                      name={getVerdictIcon(result.aiScore)}
                      size="sm"
                      className="text-gray-500 flex-shrink-0"
                    />
                    <span className="whitespace-nowrap">{result.verdict}</span>
                  </div>
                </div>

                {/* Confidence */}
                <div className="w-full p-2.5 px-3 bg-gray-50 rounded-lg mt-1">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">
                        {t('analysis.confidence', 'Confidence')}
                      </span>
                      <span className="text-xs font-semibold text-gray-700">
                        {result.confidence}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-sm overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={`h-full rounded-sm bg-gradient-to-r ${getConfidenceColor(result.confidence)}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Human Indicators */}
                {result.humanIndicators.length > 0 && (
                  <div className="w-full mt-2">
                    <h5 className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 mb-2">
                      <Icon name="user-check" size="xs" className="text-gray-400" />
                      {t('analysis.humanIndicators', 'Human Indicators')} (
                      {result.humanIndicators.length})
                    </h5>
                    <div className="space-y-1.5">
                      {result.humanIndicators.slice(0, 3).map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-[11px] text-gray-600"
                        >
                          <span className="flex-shrink-0 p-1 rounded bg-gray-100">
                            <Icon name="check" size="xs" className="text-gray-400" />
                          </span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Indicators */}
                {result.aiIndicators.length > 0 && (
                  <div className="w-full mt-2">
                    <h5 className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 mb-2">
                      <Icon name="cpu" size="xs" className="text-gray-400" />
                      {t('analysis.aiIndicators', 'AI Indicators')} (
                      {result.aiIndicators.length})
                    </h5>
                    <div className="space-y-1.5">
                      {result.aiIndicators.slice(0, 3).map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-[11px] text-gray-600"
                        >
                          <span className="flex-shrink-0 p-1 rounded bg-gray-100">
                            <Icon
                              name="alert-triangle"
                              size="xs"
                              className="text-gray-400"
                            />
                          </span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* View Details Button */}
                <button className="w-full py-2 px-3 mt-2 bg-gray-50 rounded-lg flex items-center justify-between text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                  <span>{t('common.viewDetails', 'View Details')}</span>
                  <Icon name="chevron-right" size="sm" className="text-gray-400" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-14 h-14 mb-3 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Icon name="file-text" size="xl" className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">
                  {t('demo.enterTextToAnalyze', 'Enter text to analyze')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {t('demo.minCharacters', 'Minimum 50 characters required')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppFrame>
  )
}

export default LiveAIDetectionDemo
