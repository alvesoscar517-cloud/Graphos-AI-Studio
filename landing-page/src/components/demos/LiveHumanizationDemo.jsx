/**
 * LiveHumanizationDemo - Interactive Humanization demo
 * Single editor with shimmer effect and streaming text animation
 */
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { AppFrame } from './DemoWrapper'
import Icon from '@components/common/Icon'

// Sample transformations - locked data
const SAMPLES = [
  {
    id: 'formal',
    label: 'Formal Text',
    original: `The implementation of sustainable practices in corporate environments has become increasingly important in recent years. Organizations are recognizing the necessity of adopting environmentally conscious strategies to ensure long-term viability and stakeholder satisfaction.`,
    humanized: `You know what's been on my mind lately? How companies are finally getting serious about going green. It's not just about looking good anymore – businesses are realizing they actually need to care about the environment if they want to stick around. And honestly? Their customers and investors are pushing for it too.`
  },
  {
    id: 'academic',
    label: 'Academic',
    original: `Research indicates that regular physical exercise contributes significantly to mental health improvement. Studies have demonstrated correlations between consistent workout routines and reduced symptoms of anxiety and depression.`,
    humanized: `Here's something I've learned the hard way: working out really does help with stress and feeling down. I used to think it was just gym-bro talk, but after making exercise a habit, I can tell you – the science is real. My anxiety has gotten so much better since I started moving more.`
  },
  {
    id: 'technical',
    label: 'Technical',
    original: `The advancement of artificial intelligence technology presents both opportunities and challenges for the modern workforce. Automation of routine tasks may lead to increased efficiency while simultaneously requiring workers to develop new skill sets.`,
    humanized: `AI is changing everything about how we work, and I'll be honest – it's a bit scary but also exciting? Sure, robots might take over some boring tasks (thank goodness), but it also means we all need to level up our skills. The future belongs to people who can adapt, I think.`
  }
]

const LiveHumanizationDemo = () => {
  const { t } = useTranslation()
  const [selectedSample, setSelectedSample] = useState('formal')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showShimmer, setShowShimmer] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const streamRef = useRef(null)

  const currentSample = SAMPLES.find((s) => s.id === selectedSample)

  // Reset when sample changes
  useEffect(() => {
    setStreamedText('')
    setIsComplete(false)
    setShowShimmer(false)
  }, [selectedSample])

  const handleHumanize = async () => {
    if (isProcessing) return

    setIsProcessing(true)
    setStreamedText('')
    setIsComplete(false)
    setShowShimmer(true)

    // Shimmer phase
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setShowShimmer(false)

    // Streaming phase
    const text = currentSample.humanized
    const words = text.split(' ')
    let currentText = ''

    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? '' : ' ') + words[i]
      setStreamedText(currentText)
      // Variable delay for natural feel
      await new Promise((resolve) =>
        setTimeout(resolve, 30 + Math.random() * 40)
      )
    }

    setIsComplete(true)
    setIsProcessing(false)
  }

  const handleReset = () => {
    setStreamedText('')
    setIsComplete(false)
    setShowShimmer(false)
  }

  // Determine what to show in editor
  const displayText = streamedText || currentSample.original
  const isShowingOriginal = !streamedText && !showShimmer

  return (
    <AppFrame
      title="Graphos AI Studio - Content Humanization"
      className="max-w-6xl mx-auto"
    >
      <div className="min-h-[600px] p-6 lg:p-8 flex flex-col">
        {/* Header with Sample Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Icon name="wand-sparkles" size="lg" className="text-gray-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800">
                {t('demo.contentHumanization', 'Content Humanization')}
              </h3>
              <p className="text-xs text-gray-500">
                {t('demo.transformAIText', 'Transform AI text to human-like writing')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
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
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                ? 'bg-green-50 text-green-600'
                : isShowingOriginal
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-blue-50 text-blue-600'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isComplete
                  ? 'bg-green-500'
                  : isShowingOriginal
                    ? 'bg-gray-400'
                    : 'bg-blue-500 animate-pulse'
              }`}
            />
            {isComplete
              ? t('demo.humanized', 'Humanized')
              : isShowingOriginal
                ? t('demo.original', 'Original - AI Generated')
                : t('demo.processing', 'Processing...')}
          </span>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative">
          <div className="w-full h-full min-h-[400px] p-5 bg-gray-50 rounded-2xl text-gray-700 text-base leading-relaxed overflow-hidden relative">
            {/* Original/Streamed text */}
            <div
              className={`transition-opacity duration-300 ${showShimmer ? 'opacity-0' : 'opacity-100'}`}
            >
              {displayText}
              {/* Typing cursor when streaming */}
              {isProcessing && !showShimmer && (
                <motion.span
                  className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
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
                      className="h-4 rounded-md bg-gray-200 relative overflow-hidden"
                      style={{ width: `${width}%` }}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background:
                            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)'
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
          <span className="text-xs text-gray-500">
            {isComplete ? (
              <span className="flex items-center gap-1.5">
                <Icon name="check-circle" size="xs" className="text-green-500" />
                {t('demo.transformComplete', 'Transformation complete')}
              </span>
            ) : (
              <span>
                <span className="font-semibold text-green-600">
                  {currentSample.original.length}
                </span>
                <span className="text-gray-400"> {t('demo.characters', 'characters')}</span>
              </span>
            )}
          </span>

          <div className="flex items-center gap-2">
            {isComplete && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200 transition-all"
              >
                <Icon name="rotate-ccw" size="sm" className="text-gray-500" />
                {t('demo.reset', 'Reset')}
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleHumanize}
              disabled={isProcessing || isComplete}
              className="flex items-center justify-center gap-2 min-w-[160px] px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center w-[50px] h-[16px]">
                  <span className="flex items-center gap-[3px]">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-[6px] h-[6px] bg-white/60 rounded-full"
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
                  <Icon name="wand-sparkles" size="sm" color="white" />
                  {t('demo.humanizeContent', 'Humanize Content')}
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </AppFrame>
  )
}

export default LiveHumanizationDemo
