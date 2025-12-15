/**
 * RealAIDetectionDemo - Interactive AI Detection demo (Demo Mode Only)
 * 
 * Features:
 * - Sample text selection with pre-computed results
 * - Custom text input with simulated detection results
 * - Text validation (50-2000 characters)
 * - Text statistics display
 * - Humanize CTA for high AI scores
 * - Redirect to main app for full functionality
 * 
 * Note: This demo uses only pre-computed/simulated results.
 * For real AI detection, users should use the full app.
 * 
 * @module components/demos/RealAIDetectionDemo
 */
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AppFrame } from './DemoWrapper';
import Icon from '@components/common/Icon';
import { 
  SAMPLE_TEXTS, 
  getSampleTypes, 
  findMatchingSample,
  getRandomLoadingDelay 
} from './sampleData';

// Text length constraints
const MIN_TEXT_LENGTH = 50;
const MAX_TEXT_LENGTH = 2000;

// App URLs
const APP_URLS = {
  signup: 'https://app.graphosai.com/signup',
  app: 'https://app.graphosai.com',
  humanize: 'https://app.graphosai.com?feature=humanize'
};

/**
 * Calculate text statistics
 */
const calculateTextStats = (text) => {
  if (!text) return { words: 0, sentences: 0, characters: 0 };
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const characters = text.length;
  return { words, sentences, characters };
};

/**
 * Generate simulated detection result for custom text (demo only)
 * This provides a realistic-looking result without calling any API
 */
const generateSimulatedResult = (text) => {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  
  // Simple heuristics for demo purposes
  const avgWordLength = text.replace(/\s+/g, '').length / Math.max(wordCount, 1);
  const hasPersonalPronouns = /\b(I|me|my|we|our|you|your)\b/i.test(text);
  const hasInformalLanguage = /\b(yeah|okay|ok|gonna|wanna|kinda|sorta|hey|wow|oh|hmm)\b/i.test(text);
  const hasQuestions = /\?/.test(text);
  const hasTechnicalTerms = /\b(algorithm|implementation|optimization|infrastructure|methodology|paradigm|framework)\b/i.test(text);
  
  // Calculate AI probability based on text characteristics
  let aiProbability = 50; // Start neutral
  
  if (hasPersonalPronouns) aiProbability -= 15;
  if (hasInformalLanguage) aiProbability -= 20;
  if (hasQuestions) aiProbability -= 10;
  if (hasTechnicalTerms) aiProbability += 15;
  if (avgWordLength > 5.5) aiProbability += 10;
  if (avgWordLength < 4.5) aiProbability -= 10;
  
  // Add some randomness for variety
  aiProbability += Math.floor(Math.random() * 20) - 10;
  
  // Clamp to valid range
  aiProbability = Math.max(10, Math.min(95, aiProbability));
  
  // Determine verdict
  let verdict, confidenceLevel;
  if (aiProbability < 30) {
    verdict = 'Human-written';
    confidenceLevel = 'high';
  } else if (aiProbability <= 70) {
    verdict = 'Mixed content';
    confidenceLevel = 'medium';
  } else {
    verdict = 'AI-generated';
    confidenceLevel = 'high';
  }
  
  // Generate indicators based on analysis
  const humanIndicators = [];
  const aiIndicators = [];
  
  if (hasPersonalPronouns) humanIndicators.push('Personal pronouns detected');
  if (hasInformalLanguage) humanIndicators.push('Informal language patterns');
  if (hasQuestions) humanIndicators.push('Rhetorical questions present');
  if (avgWordLength < 5) humanIndicators.push('Natural word length variation');
  
  if (hasTechnicalTerms) aiIndicators.push('Technical terminology detected');
  if (avgWordLength > 5.5) aiIndicators.push('Consistent formal vocabulary');
  if (!hasPersonalPronouns && !hasInformalLanguage) aiIndicators.push('Lack of personal expressions');
  if (sentenceCount > 0 && wordCount / sentenceCount > 20) aiIndicators.push('Complex sentence structures');
  
  return {
    success: true,
    ai_probability: aiProbability,
    confidence: Math.floor(70 + Math.random() * 25),
    confidence_level: confidenceLevel,
    verdict,
    human_indicators: humanIndicators.slice(0, 4),
    ai_indicators: aiIndicators.slice(0, 4),
    text_statistics: {
      totalWords: wordCount,
      totalSentences: sentenceCount
    }
  };
};

/**
 * RealAIDetectionDemo Component
 */
const RealAIDetectionDemo = () => {
  const { t } = useTranslation();
  
  // State
  const [text, setText] = useState(SAMPLE_TEXTS.ai.text);
  const [inputMode, setInputMode] = useState('sample'); // 'sample' | 'custom'
  const [selectedSample, setSelectedSample] = useState('ai');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [demoCount, setDemoCount] = useState(0);
  const [showResult, setShowResult] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Handle sample selection
  const handleSampleSelect = useCallback((type) => {
    const sample = SAMPLE_TEXTS[type];
    if (sample) {
      setText(sample.text);
      setSelectedSample(type);
      setInputMode('sample');
      setResult(null);
      setError(null);
    }
  }, []);

  // Handle text change
  const handleTextChange = useCallback((e) => {
    const newText = e.target.value;
    setText(newText);
    
    // Check if text matches a sample
    const matchingSample = findMatchingSample(newText);
    if (matchingSample) {
      setInputMode('sample');
      setSelectedSample(matchingSample);
    } else {
      setInputMode('custom');
      setSelectedSample(null);
    }
    
    // Clear previous results when text changes
    setResult(null);
    setError(null);
  }, []);

  // Validate text length
  const validateText = useCallback((textToValidate) => {
    const trimmed = textToValidate?.trim() || '';
    if (trimmed.length < MIN_TEXT_LENGTH) {
      return { valid: false, code: 'TEXT_TOO_SHORT', message: t('demo.textTooShort', `Please enter at least ${MIN_TEXT_LENGTH} characters`) };
    }
    if (trimmed.length > MAX_TEXT_LENGTH) {
      return { valid: false, code: 'TEXT_TOO_LONG', message: t('demo.textTooLong', `Text must be under ${MAX_TEXT_LENGTH} characters`) };
    }
    return { valid: true };
  }, [t]);

  // Handle analyze - Demo mode only (no real API calls)
  const handleAnalyze = async () => {
    // Validate text
    const validation = validateText(text);
    if (!validation.valid) {
      setError({ code: validation.code, message: validation.message });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      // Simulate loading delay
      const delay = getRandomLoadingDelay();
      await new Promise(resolve => setTimeout(resolve, delay));
      
      let detectionResult;
      
      if (inputMode === 'sample' && selectedSample) {
        // Use pre-computed results for samples
        detectionResult = SAMPLE_TEXTS[selectedSample].result;
      } else {
        // Generate simulated result for custom text
        detectionResult = generateSimulatedResult(text);
      }
      
      setResult(detectionResult);
      
      // Increment demo count
      const newCount = demoCount + 1;
      setDemoCount(newCount);
    } catch (err) {
      setError({
        code: 'DEMO_ERROR',
        message: t('demo.serverError', 'Something went wrong. Please try again.')
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get verdict icon based on score
  const getVerdictIcon = (score) => {
    if (score < 30) return 'shield-check';
    if (score < 50) return 'check-circle';
    if (score < 70) return 'alert-circle';
    return 'alert-triangle';
  };

  // Get verdict color based on score
  const getVerdictColor = (score) => {
    if (score < 30) return 'text-green-600 bg-green-50 border-green-200';
    if (score < 50) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score < 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // Get confidence color gradient
  const getConfidenceColor = (conf) => {
    if (conf < 60) return 'from-orange-400 to-amber-400';
    if (conf < 80) return 'from-blue-400 to-cyan-400';
    return 'from-green-400 to-emerald-400';
  };

  // Character count display
  const charCount = text?.length || 0;
  const isValidLength = charCount >= MIN_TEXT_LENGTH && charCount <= MAX_TEXT_LENGTH;
  const textStats = calculateTextStats(text);
  
  // Show redirect CTA after first use
  const showRedirectCTA = demoCount >= 1;

  return (
    <AppFrame
      title="Graphos AI Studio - AI Detection"
      className="max-w-5xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[520px]">
        {/* Left Panel - Text Input */}
        <div className="lg:col-span-3 p-4 lg:p-6 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-100">
          {/* Header with Sample Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
            <span className="text-xs text-gray-500">
              {t('demo.trySample', 'Try sample')}:
            </span>
            {getSampleTypes().map(({ id, labelKey, label }) => (
              <motion.button
                key={id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSampleSelect(id)}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedSample === id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t(labelKey, label)}
              </motion.button>
            ))}
          </div>

          {/* Text Input Area */}
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder={t('demo.enterText', 'Enter or paste your text here to analyze...')}
              className={`w-full h-full min-h-[280px] sm:min-h-[320px] p-4 bg-gray-50 rounded-xl text-gray-700 text-sm leading-relaxed resize-none border-2 transition-colors focus:outline-none ${
                error && (error.code === 'TEXT_TOO_SHORT' || error.code === 'TEXT_TOO_LONG')
                  ? 'border-red-300 focus:border-red-400'
                  : 'border-transparent focus:border-primary/30'
              }`}
              disabled={isAnalyzing}
            />
            
            {/* Shimmer overlay when analyzing */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 p-4 flex flex-col gap-3 bg-gray-50 rounded-xl"
                >
                  {[95, 88, 92, 78, 85, 90, 72, 60].map((width, index) => (
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

          {/* Footer with Stats and Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
            {/* Text Statistics */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className={isValidLength ? 'text-green-600' : 'text-red-500'}>
                <span className="font-semibold">{charCount}</span>
                <span className="text-gray-400"> {t('demo.chars', 'chars')}</span>
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">
                <span className="font-semibold">{textStats.words}</span>
                <span className="text-gray-400"> {t('demo.words', 'words')}</span>
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">
                <span className="font-semibold">{textStats.sentences}</span>
                <span className="text-gray-400"> {t('demo.sentences', 'sentences')}</span>
              </span>
              {inputMode === 'custom' && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-purple-500 font-medium">
                    {t('demo.demoMode', 'Demo')}
                  </span>
                </>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={isAnalyzing || !isValidLength}
              className="w-full sm:w-auto flex items-center justify-center gap-2 min-w-[120px] px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center w-[50px] h-[16px]">
                  <span className="flex items-center gap-[3px]">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-[6px] h-[6px] bg-white/70 rounded-full"
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
                  <Icon name="shield-check" size="sm" />
                  <span>
                    {result
                      ? t('demo.redetect', 'Re-detect')
                      : t('analysis.detect', 'Detect AI')}
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-2 p-4 lg:p-6 bg-gray-50/50">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
              <Icon name="shield-check" size="lg" className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-800 m-0 mb-0.5">
                {t('analysis.aiDetection', 'AI Detection')}
              </h4>
              <p className="text-xs text-gray-500 m-0">
                {t('analysis.content', 'Content Analysis')}
              </p>
            </div>
            {result && (
              <button
                className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
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
            {/* Error State */}
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <div className="w-14 h-14 mb-3 bg-red-50 rounded-xl flex items-center justify-center">
                  <Icon name="alert-circle" size="xl" className="text-red-400" />
                </div>
                <p className="text-sm text-gray-700 mb-2">{error.message}</p>
                {error.signup_url && (
                  <a
                    href={error.signup_url}
                    className="mt-3 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                  >
                    {t('demo.signUpFree', 'Sign Up Free')}
                    <Icon name="arrow-right" size="sm" />
                  </a>
                )}
              </motion.div>
            )}

            {/* Loading State */}
            {isAnalyzing && !error && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 border-[3px] border-gray-200 rounded-full" />
                  <div className="absolute inset-0 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-2 border-[2px] border-primary/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  {t('demo.analyzing', 'Analyzing content...')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {t('demo.analyzingDesc', 'Checking patterns and indicators')}
                </p>
              </motion.div>
            )}

            {/* Result State */}
            {result && showResult && !error && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-3"
              >
                {/* Score Circle */}
                <div className="relative w-28 h-28 flex items-center justify-center my-2">
                  <svg
                    className="absolute top-0 left-0 w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <defs>
                      <linearGradient
                        id="realDemoAiDetectionGradient"
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
                      stroke="url(#realDemoAiDetectionGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={263.89}
                      initial={{ strokeDashoffset: 263.89 }}
                      animate={{
                        strokeDashoffset: 263.89 - (result.ai_probability / 100) * 263.89
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="flex items-baseline gap-0.5">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        className="text-3xl font-bold text-gray-800"
                      >
                        {result.ai_probability}
                      </motion.span>
                      <span className="text-sm font-medium text-gray-400">%</span>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-0.5">{t('demo.aiProbability', 'AI Probability')}</span>
                  </div>
                </div>

                {/* Verdict Badge */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="w-full flex justify-center"
                >
                  <div className={`inline-flex items-center gap-2 py-2 px-4 border rounded-full text-xs font-semibold ${getVerdictColor(result.ai_probability)}`}>
                    <Icon
                      name={getVerdictIcon(result.ai_probability)}
                      size="sm"
                      className="flex-shrink-0"
                    />
                    <span className="whitespace-nowrap">{result.verdict}</span>
                  </div>
                </motion.div>

                {/* Confidence Bar */}
                <div className="w-full p-3 bg-white rounded-xl border border-gray-100 mt-1">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">
                        {t('analysis.confidence', 'Confidence')}
                      </span>
                      <span className="text-sm font-bold text-gray-700">
                        {result.confidence}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(result.confidence)}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Text Statistics */}
                {result.text_statistics && (
                  <div className="w-full grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-white rounded-lg border border-gray-100 text-center">
                      <div className="text-lg font-bold text-gray-800">{result.text_statistics.totalWords || textStats.words}</div>
                      <div className="text-[10px] text-gray-500">{t('demo.wordsAnalyzed', 'Words')}</div>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-gray-100 text-center">
                      <div className="text-lg font-bold text-gray-800">{result.text_statistics.totalSentences || textStats.sentences}</div>
                      <div className="text-[10px] text-gray-500">{t('demo.sentencesAnalyzed', 'Sentences')}</div>
                    </div>
                  </div>
                )}

                {/* Indicators Section - Collapsible */}
                {(result.human_indicators?.length > 0 || result.ai_indicators?.length > 0) && (
                  <div className="w-full">
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="w-full flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Icon name="list" size="sm" className="text-gray-400" />
                        {t('demo.viewIndicators', 'View Indicators')}
                        <span className="text-gray-400">
                          ({(result.human_indicators?.length || 0) + (result.ai_indicators?.length || 0)})
                        </span>
                      </span>
                      <Icon
                        name="chevron-down"
                        size="sm"
                        className={`text-gray-400 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    <AnimatePresence>
                      {showDetails && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2 space-y-2">
                            {/* Human Indicators */}
                            {result.human_indicators?.length > 0 && (
                              <div className="p-2.5 bg-green-50 rounded-lg border border-green-100">
                                <h5 className="flex items-center gap-1.5 text-[10px] font-semibold text-green-700 mb-2">
                                  <Icon name="user-check" size="xs" className="text-green-600" />
                                  {t('analysis.humanIndicators', 'Human Indicators')}
                                </h5>
                                <div className="space-y-1">
                                  {result.human_indicators.slice(0, 4).map((item, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[11px] text-green-800">
                                      <Icon name="check" size="xs" className="text-green-500 mt-0.5 flex-shrink-0" />
                                      <span>{item}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* AI Indicators */}
                            {result.ai_indicators?.length > 0 && (
                              <div className="p-2.5 bg-orange-50 rounded-lg border border-orange-100">
                                <h5 className="flex items-center gap-1.5 text-[10px] font-semibold text-orange-700 mb-2">
                                  <Icon name="cpu" size="xs" className="text-orange-600" />
                                  {t('analysis.aiIndicators', 'AI Indicators')}
                                </h5>
                                <div className="space-y-1">
                                  {result.ai_indicators.slice(0, 4).map((item, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[11px] text-orange-800">
                                      <Icon name="alert-triangle" size="xs" className="text-orange-500 mt-0.5 flex-shrink-0" />
                                      <span>{item}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Humanize CTA - Show when AI score > 50% */}
                {result.ai_probability > 50 && (
                  <motion.a
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    href={APP_URLS.humanize}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl flex items-center justify-between text-sm font-medium hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
                  >
                    <span className="flex items-center gap-2">
                      <Icon name="wand-2" size="sm" />
                      {t('demo.humanizeThis', 'Make it more human')}
                    </span>
                    <Icon name="arrow-right" size="sm" />
                  </motion.a>
                )}

                {/* Main CTA - Changes based on usage */}
                {showRedirectCTA ? (
                  <motion.a
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    href={APP_URLS.app}
                    className="w-full py-3 px-4 bg-primary text-white rounded-xl flex items-center justify-between text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Icon name="sparkles" size="sm" />
                      {t('demo.continueInApp', 'Continue in Full App')}
                    </span>
                    <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-lg">
                      {t('demo.unlimited', 'Unlimited')}
                      <Icon name="arrow-right" size="xs" />
                    </span>
                  </motion.a>
                ) : (
                  <a
                    href={APP_URLS.signup}
                    className="w-full py-2.5 px-3 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-between text-xs font-medium hover:bg-gray-200 transition-colors"
                  >
                    <span>{t('demo.tryFullVersion', 'Try Full Version Free')}</span>
                    <Icon name="arrow-right" size="sm" className="text-gray-400" />
                  </a>
                )}
              </motion.div>
            )}

            {/* Empty State */}
            {!result && !error && !isAnalyzing && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 mb-4 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <Icon name="file-search" size="xl" className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {t('demo.readyToAnalyze', 'Ready to analyze')}
                </p>
                <p className="text-xs text-gray-400 max-w-[200px]">
                  {t('demo.enterTextDesc', 'Enter or paste text, then click Detect AI to analyze')}
                </p>
                
                {/* Quick tip */}
                <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-100 max-w-[220px]">
                  <div className="flex items-start gap-2">
                    <Icon name="lightbulb" size="sm" className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-blue-700 text-left">
                      {t('demo.quickTip', 'Tip: Try the sample texts to see how different content types are detected')}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppFrame>
  );
};

export default RealAIDetectionDemo;
