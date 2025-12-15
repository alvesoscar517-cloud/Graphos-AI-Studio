/**
 * DetectionResultCard - Display AI detection results
 * 
 * Features:
 * - Circular progress indicator for AI probability
 * - Verdict badge with color coding
 * - Confidence bar with percentage
 * - Human indicators list with checkmark icons
 * - AI indicators list with warning icons
 * - CTA button for signup
 * 
 * @module components/demos/DetectionResultCard
 */
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Icon from '@components/common/Icon';

/**
 * Get verdict icon based on AI probability score
 * @param {number} score - AI probability (0-100)
 * @returns {string} Icon name
 */
const getVerdictIcon = (score) => {
  if (score < 30) return 'shield-check';
  if (score < 50) return 'check-circle';
  if (score < 70) return 'alert-circle';
  return 'alert-triangle';
};

/**
 * Get confidence color gradient based on confidence level
 * @param {number} confidence - Confidence percentage (0-100)
 * @returns {string} Tailwind gradient classes
 */
const getConfidenceColor = (confidence) => {
  if (confidence < 60) return 'from-orange-400 to-amber-400';
  if (confidence < 80) return 'from-blue-400 to-cyan-400';
  return 'from-green-400 to-emerald-400';
};

/**
 * Get verdict badge color based on AI probability
 * @param {number} score - AI probability (0-100)
 * @returns {string} Tailwind color classes
 */
const getVerdictColor = (score) => {
  if (score < 30) return 'bg-green-50 border-green-200 text-green-700';
  if (score <= 70) return 'bg-yellow-50 border-yellow-200 text-yellow-700';
  return 'bg-red-50 border-red-200 text-red-700';
};

/**
 * DetectionResultCard Component
 * @param {Object} props
 * @param {Object} props.result - Detection result object
 * @param {Function} props.onTryAgain - Callback for try again action
 */
const DetectionResultCard = ({ result, onTryAgain }) => {
  const { t } = useTranslation();

  if (!result) return null;

  const {
    ai_probability,
    confidence,
    verdict,
    human_indicators = [],
    ai_indicators = []
  } = result;

  // SVG circle calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (ai_probability / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center gap-2"
    >
      {/* AI Probability Circle */}
      <div className="relative w-24 h-24 flex items-center justify-center my-2">
        <svg
          className="absolute top-0 left-0 w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient
              id="detectionResultGradient"
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
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="url(#detectionResultGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        {/* Percentage display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-baseline gap-0.5">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-semibold text-gray-800"
            >
              {ai_probability}
            </motion.span>
            <span className="text-sm font-medium text-gray-400">%</span>
          </div>
        </div>
      </div>

      {/* Verdict Badge */}
      <div className="w-full flex justify-center">
        <div className={`inline-flex items-center gap-2 py-2 px-3 border rounded-lg text-xs font-medium ${getVerdictColor(ai_probability)}`}>
          <Icon
            name={getVerdictIcon(ai_probability)}
            size="sm"
            className="flex-shrink-0"
          />
          <span className="whitespace-nowrap">{verdict}</span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="w-full p-2.5 px-3 bg-gray-50 rounded-lg mt-1">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">
              {t('analysis.confidence', 'Confidence')}
            </span>
            <span className="text-xs font-semibold text-gray-700">
              {confidence}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-sm overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`h-full rounded-sm bg-gradient-to-r ${getConfidenceColor(confidence)}`}
            />
          </div>
        </div>
      </div>

      {/* Human Indicators */}
      {human_indicators.length > 0 && (
        <div className="w-full mt-2">
          <h5 className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 mb-2">
            <Icon name="user-check" size="xs" className="text-green-500" />
            {t('analysis.humanIndicators', 'Human Indicators')} ({human_indicators.length})
          </h5>
          <div className="space-y-1.5">
            {human_indicators.slice(0, 4).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center gap-2 text-[11px] text-gray-600"
              >
                <span className="flex-shrink-0 p-1 rounded bg-green-50">
                  <Icon name="check" size="xs" className="text-green-500" />
                </span>
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* AI Indicators */}
      {ai_indicators.length > 0 && (
        <div className="w-full mt-2">
          <h5 className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 mb-2">
            <Icon name="cpu" size="xs" className="text-orange-500" />
            {t('analysis.aiIndicators', 'AI Indicators')} ({ai_indicators.length})
          </h5>
          <div className="space-y-1.5">
            {ai_indicators.slice(0, 4).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center gap-2 text-[11px] text-gray-600"
              >
                <span className="flex-shrink-0 p-1 rounded bg-orange-50">
                  <Icon name="alert-triangle" size="xs" className="text-orange-500" />
                </span>
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* CTA Button */}
      <a
        href="https://app.graphosai.com/signup"
        className="w-full py-2.5 px-3 mt-3 bg-primary text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <span>{t('demo.tryFullVersion', 'Try Full Version Free')}</span>
        <Icon name="arrow-right" size="sm" />
      </a>

      {/* Try Again Button */}
      {onTryAgain && (
        <button
          onClick={onTryAgain}
          className="w-full py-2 px-3 bg-gray-50 text-gray-600 rounded-lg flex items-center justify-center gap-2 text-xs font-medium hover:bg-gray-100 transition-colors"
        >
          <Icon name="refresh-cw" size="xs" />
          <span>{t('demo.tryAgain', 'Try Again')}</span>
        </button>
      )}
    </motion.div>
  );
};

export default DetectionResultCard;
