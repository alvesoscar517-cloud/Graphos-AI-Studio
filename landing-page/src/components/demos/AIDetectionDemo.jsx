import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

/**
 * Simulated AI detection result
 */
function simulateDetection(text) {
  if (!text || text.trim().length < 10) {
    return null
  }

  // Simulate detection based on text characteristics
  const wordCount = text.split(/\s+/).length
  const avgWordLength = text.replace(/\s+/g, '').length / wordCount
  const hasComplexSentences = text.includes(',') || text.includes(';')
  
  // Generate simulated probabilities
  let aiProbability = 0.3 + Math.random() * 0.4
  if (avgWordLength > 6) aiProbability += 0.1
  if (hasComplexSentences) aiProbability += 0.1
  if (wordCount > 50) aiProbability += 0.1
  
  aiProbability = Math.min(0.95, Math.max(0.05, aiProbability))
  
  return {
    aiProbability: Math.round(aiProbability * 100),
    humanProbability: Math.round((1 - aiProbability) * 100),
    confidence: aiProbability > 0.7 ? 'high' : aiProbability > 0.4 ? 'medium' : 'low',
    wordCount,
  }
}

function AIDetectionDemo() {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (!text.trim()) return
    
    setIsAnalyzing(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const detectionResult = simulateDetection(text)
    setResult(detectionResult)
    setIsAnalyzing(false)
  }

  const handleClear = () => {
    setText('')
    setResult(null)
  }

  return (
    <div className="bg-bg-secondary rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        Try AI Detection Demo
      </h3>
      <p className="text-sm text-text-secondary mb-4">
        Paste any text below to see a simulated AI detection analysis. This is a demo - for accurate results, use the full application.
      </p>

      <div className="space-y-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste your text here to analyze..."
          className="w-full h-40 p-4 bg-bg-primary border border-gray-200 rounded-xl text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          maxLength={2000}
        />

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">
            {text.length}/2000 characters
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!text.trim() || isAnalyzing}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 bg-bg-primary rounded-xl border border-gray-200"
          >
            <h4 className="font-semibold text-text-primary mb-4">Detection Results</h4>
            
            {/* Probability Meter */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-success">Human: {result.humanProbability}%</span>
                <span className="text-warning">AI: {result.aiProbability}%</span>
              </div>
              <div className="h-4 bg-bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.aiProbability}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-success via-warning to-error"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-bg-secondary rounded-lg">
                <div className="text-sm text-text-muted">Confidence</div>
                <div className="font-semibold text-text-primary capitalize">{result.confidence}</div>
              </div>
              <div className="p-3 bg-bg-secondary rounded-lg">
                <div className="text-sm text-text-muted">Words Analyzed</div>
                <div className="font-semibold text-text-primary">{result.wordCount}</div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-text-secondary mb-3">
                Want more accurate results with detailed analysis?
              </p>
              <a
                href="https://app.graphosai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
              >
                Try Full Version Free
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AIDetectionDemo
