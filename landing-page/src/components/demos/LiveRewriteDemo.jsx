/**
 * LiveRewriteDemo - Interactive Rewrite demo with sidebar options
 * Based on LiveHumanizationDemo with customizations for Rewrite feature
 * Includes Voice Profile selector, Model selector, and Writing Preferences
 */
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { AppFrame } from './DemoWrapper'
import Icon from '@components/common/Icon'
import ThreeDotsLoading from '@components/common/ThreeDotsLoading'

// Sample transformations - i18n supported for Rewrite
const getSamples = (t) => [
  {
    id: 'professional',
    label: t('demo.samples.professional', 'Professional'),
    original: t('demoSamples.rewrite.professional.original', `I think we should maybe consider looking at the possibility of implementing some new features that could potentially help improve our product in some ways. It would be good if we could discuss this at some point.`),
    rewritten: t('demoSamples.rewrite.professional.rewritten', `I recommend we implement new features to enhance our product's value. Let's schedule a meeting to discuss the specific improvements and their expected impact on user engagement. I've identified three key areas we should prioritize.`)
  },
  {
    id: 'casual',
    label: t('demo.samples.casual', 'Casual'),
    original: t('demoSamples.rewrite.casual.original', `The implementation of sustainable practices in corporate environments has become increasingly important in recent years. Organizations are recognizing the necessity of adopting environmentally conscious strategies.`),
    rewritten: t('demoSamples.rewrite.casual.rewritten', `You know what's been on my mind lately? How companies are finally getting serious about going green. It's not just about looking good anymore – businesses are realizing they actually need to care about the environment if they want to stick around.`)
  },
  {
    id: 'concise',
    label: t('demo.samples.concise', 'Concise'),
    original: t('demoSamples.rewrite.concise.original', `I am writing to inform you that I would like to request a meeting at your earliest convenience to discuss the possibility of exploring potential collaboration opportunities between our respective organizations.`),
    rewritten: t('demoSamples.rewrite.concise.rewritten', `Let's schedule a meeting to discuss collaboration opportunities. When works best for you this week?`)
  }
]

// Get i18n Voice Profiles
const getVoiceProfiles = (t) => [
  { id: 'professional', name: t('demo.voiceProfiles.professional', 'Professional Writer'), samples: 8 },
  { id: 'casual', name: t('demo.voiceProfiles.casual', 'Casual Blogger'), samples: 5 },
  { id: 'academic', name: t('demo.voiceProfiles.academic', 'Academic Style'), samples: 6 },
]

// Get i18n AI Models
const getAIModels = (t) => [
  { id: 'hyper', name: 'Graphos Hyper', speed: t('demo.speed.fast', 'Fast'), icon: 'zap' },
  { id: 'velocity', name: 'Graphos Velocity', speed: t('demo.speed.ultraFast', 'Ultra Fast'), icon: 'rocket' },
  { id: 'zenith', name: 'Graphos Zenith', speed: t('demo.speed.quality', 'Quality'), icon: 'star' },
]

const LiveRewriteDemo = () => {
  const { t } = useTranslation()
  const [selectedSample, setSelectedSample] = useState('professional')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showShimmer, setShowShimmer] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  
  // Sidebar states
  const [selectedProfile] = useState('professional')
  const [selectedModel] = useState('hyper')
  
  // Writing Preferences
  const [preferences, setPreferences] = useState({
    useVocabularyPreferences: true,
    useKeyCharacteristics: true,
    useSentencePatterns: true,
    useRewriteInstructions: true,
    useAntiAIDetection: true,
    useIterativeRefinement: false,
  })

  // Get i18n data
  const SAMPLES = useMemo(() => getSamples(t), [t])
  const VOICE_PROFILES = useMemo(() => getVoiceProfiles(t), [t])
  const AI_MODELS = useMemo(() => getAIModels(t), [t])
  
  const currentSample = SAMPLES.find((s) => s.id === selectedSample)
  const currentProfile = VOICE_PROFILES.find((p) => p.id === selectedProfile)
  const currentModel = AI_MODELS.find((m) => m.id === selectedModel)

  // Reset when sample changes
  useEffect(() => {
    setStreamedText('')
    setIsComplete(false)
    setShowShimmer(false)
  }, [selectedSample])

  const handleRewrite = async () => {
    if (isProcessing) return

    setIsProcessing(true)
    setStreamedText('')
    setIsComplete(false)
    setShowShimmer(true)

    // Shimmer phase
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setShowShimmer(false)

    // Streaming phase - smoother character-by-character
    const text = currentSample.rewritten
    let currentText = ''

    for (let i = 0; i < text.length; i++) {
      currentText += text[i]
      setStreamedText(currentText)
      
      // Variable speed: faster for spaces, slower for punctuation
      const char = text[i]
      let delay = 12 // base speed
      if (char === ' ') delay = 6
      else if (char === '\n') delay = 40
      else if (['.', '!', '?'].includes(char)) delay = 60
      else if ([',', ':'].includes(char)) delay = 30
      
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    setIsComplete(true)
    setIsProcessing(false)
  }

  const handleReset = () => {
    setStreamedText('')
    setIsComplete(false)
    setShowShimmer(false)
  }

  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Determine what to show in editor
  const displayText = streamedText || currentSample.original
  const isShowingOriginal = !streamedText && !showShimmer

  // Toggle Switch Component
  const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`
        relative w-9 h-5 rounded-full transition-colors duration-200
        ${checked ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
          ${checked ? 'translate-x-4' : 'translate-x-0'}
        `}
      />
    </button>
  )

  return (
    <AppFrame
      title="Graphos AI Studio - AI Rewrite"
      className="max-w-6xl mx-auto"
    >
      <div className="flex min-h-[600px]">
        {/* Main Content Area */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col lg:border-r lg:border-gray-200 lg:dark:border-slate-700">
          {/* Header with Sample Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Icon name="edit-3" size="lg" className="icon-emerald" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {t('features.rewrite.demo.title', 'AI Rewrite')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('features.rewrite.demo.subtitle', 'Transform text to match your writing style')}
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
                  disabled={isProcessing}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-50 ${
                    selectedSample === id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                isComplete
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : isShowingOriginal
                    ? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                    : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isComplete
                    ? 'bg-emerald-500'
                    : isShowingOriginal
                      ? 'bg-gray-400'
                      : 'bg-emerald-500 animate-pulse'
                }`}
              />
              {isComplete
                ? t('features.rewrite.demo.rewritten', 'Rewritten')
                : isShowingOriginal
                  ? t('features.rewrite.demo.originalLabel', 'Original Text')
                  : t('demo.processing', 'Processing...')}
            </span>
          </div>

          {/* Editor Area */}
          <div className="flex-1 relative">
            <div className="w-full h-full min-h-[380px] p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl text-gray-700 dark:text-gray-300 text-base leading-relaxed overflow-hidden relative">
              <div
                className={`transition-opacity duration-300 ${showShimmer ? 'opacity-0' : 'opacity-100'}`}
              >
                {displayText}
                {isProcessing && !showShimmer && (
                  <motion.span
                    className="inline-block w-0.5 h-4 bg-emerald-500 ml-0.5 align-middle"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Shimmer skeleton overlay */}
              <AnimatePresence>
                {showShimmer && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 p-5 flex flex-col gap-3"
                  >
                    {[95, 88, 92, 78, 85, 90, 72, 55].map((width, index) => (
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
                            background:
                              'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.3) 50%, transparent 100%)'
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

          {/* Footer with Action */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
              {isComplete ? (
                <span className="flex items-center gap-1.5">
                  <Icon name="check-circle" size="xs" className="icon-emerald" />
                  {t('features.rewrite.demo.transformComplete', 'Transformation complete')}
                </span>
              ) : (
                <span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {currentSample.original.length}
                  </span>
                  <span className="text-gray-400"> {t('demo.characters', 'characters')}</span>
                </span>
              )}
            </span>

            <div className="flex items-center gap-2 ml-auto">
              {isComplete && (
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
                onClick={handleRewrite}
                disabled={isProcessing || isComplete}
                className="flex items-center justify-center gap-2 min-w-[120px] h-[42px] px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center w-[70px]">
                    <ThreeDotsLoading size="md" />
                  </span>
                ) : (
                  <>
                    <Icon name="edit-3" size="sm" className="icon-emerald" />
                    {t('features.rewrite.demo.rewriteBtn', 'Rewrite')}
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Sidebar - Options Panel - Hidden on mobile */}
        <div className="hidden lg:flex w-56 p-3 bg-gray-50 dark:bg-slate-800/50 flex-col gap-3 overflow-y-auto">
          {/* Voice Profile Selector */}
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Icon name="user" size="lg" className="icon-emerald" />
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-800 dark:text-gray-200">{currentProfile?.name}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">{currentProfile?.samples} samples</div>
              </div>
            </div>
          </div>

          {/* Model Selector */}
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Icon name={currentModel?.icon || 'zap'} size="lg" className="icon-primary" />
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-800 dark:text-gray-200">{currentModel?.name}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">{currentModel?.speed}</div>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <div className="flex items-center gap-1.5 px-1 mb-2">
              <Icon name="sliders" size="xs" color="gray-medium" />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {t('demo.sidebar.options', 'Options')}
              </span>
            </div>
            
            <div className="space-y-1.5">
              {[
                { key: 'useVocabularyPreferences', icon: 'book-open', titleKey: 'demo.options.vocabulary', title: 'Vocabulary' },
                { key: 'useKeyCharacteristics', icon: 'list', titleKey: 'demo.options.keyFeatures', title: 'Key Features' },
                { key: 'useSentencePatterns', icon: 'align-left', titleKey: 'demo.options.sentenceStyle', title: 'Sentence Style' },
                { key: 'useRewriteInstructions', icon: 'file-text', titleKey: 'demo.options.instructions', title: 'Instructions' },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <Icon name={item.icon} size="xs" color="gray-medium" />
                    <span className="text-[11px] text-gray-700 dark:text-gray-300">{t(item.titleKey, item.title)}</span>
                  </div>
                  <ToggleSwitch
                    checked={preferences[item.key]}
                    onChange={() => togglePreference(item.key)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Humanization Section */}
          <div>
            <div className="flex items-center gap-1.5 px-1 mb-2">
              <Icon name="user-check" size="xs" color="gray-medium" />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {t('demo.sidebar.humanization', 'Humanization')}
              </span>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Icon name="shield" size="xs" color="gray-medium" />
                  <span className="text-[11px] text-gray-700 dark:text-gray-300">{t('demo.options.antiAI', 'Anti-AI')}</span>
                  <span className="text-[8px] font-medium py-px px-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded">{t('demo.tags.new', 'NEW')}</span>
                </div>
                <ToggleSwitch
                  checked={preferences.useAntiAIDetection}
                  onChange={() => togglePreference('useAntiAIDetection')}
                />
              </div>

              <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Icon name="refresh-cw" size="xs" color="gray-medium" />
                  <span className="text-[11px] text-gray-700 dark:text-gray-300">{t('demo.options.iterative', 'Iterative')}</span>
                  <span className="text-[8px] font-medium py-px px-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded">{t('demo.tags.beta', 'BETA')}</span>
                </div>
                <ToggleSwitch
                  checked={preferences.useIterativeRefinement}
                  onChange={() => togglePreference('useIterativeRefinement')}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppFrame>
  )
}

export default LiveRewriteDemo
