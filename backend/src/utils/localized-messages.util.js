/**
 * Localized Messages Utility
 * Pre-built localized messages for common responses
 * Use this to easily add localization to existing controllers
 */

const localization = require('../services/localization.service');
const languageProcessor = require('../services/languageProcessor.service');

/**
 * Get verdict message based on AI probability
 * @param {number} aiProbability - AI probability (0-100)
 * @param {string} lang - Language code
 * @returns {string} - Localized verdict message
 */
function getAIVerdict(aiProbability, lang = 'en') {
  if (aiProbability < 20) {
    return localization.t('ai_detection.result_human', lang);
  } else if (aiProbability < 40) {
    return localization.t('voice_profile.match_high', lang, { score: Math.round(100 - aiProbability) });
  } else if (aiProbability < 60) {
    return localization.t('ai_detection.result_mixed', lang);
  } else if (aiProbability < 80) {
    return localization.t('ai_detection.result_ai', lang);
  } else {
    return localization.t('ai_detection.result_ai', lang);
  }
}

/**
 * Get confidence level message
 * @param {number} confidence - Confidence score (0-100)
 * @param {string} lang - Language code
 * @returns {Object} - { level, message }
 */
function getConfidenceLevel(confidence, lang = 'en') {
  if (confidence < 50) {
    return {
      level: 'low',
      message: localization.t('analysis.confidence_low', lang)
    };
  } else if (confidence < 75) {
    return {
      level: 'medium',
      message: localization.t('analysis.confidence_medium', lang)
    };
  } else {
    return {
      level: 'high',
      message: localization.t('analysis.confidence_high', lang)
    };
  }
}

/**
 * Get voice match level message
 * @param {number} matchScore - Match score (0-100)
 * @param {string} lang - Language code
 * @returns {Object} - { level, message }
 */
function getVoiceMatchLevel(matchScore, lang = 'en') {
  if (matchScore >= 80) {
    return {
      level: 'high',
      message: localization.t('voice_profile.match_high', lang, { score: Math.round(matchScore) })
    };
  } else if (matchScore >= 50) {
    return {
      level: 'medium',
      message: localization.t('voice_profile.match_medium', lang, { score: Math.round(matchScore) })
    };
  } else {
    return {
      level: 'low',
      message: localization.t('voice_profile.match_low', lang, { score: Math.round(matchScore) })
    };
  }
}

/**
 * Get deviation severity message
 * @param {string} severity - 'mild', 'moderate', 'severe'
 * @param {string} lang - Language code
 * @returns {string} - Localized message
 */
function getDeviationMessage(severity, lang = 'en') {
  const key = `voice_profile.deviation_${severity}`;
  return localization.t(key, lang);
}

/**
 * Get benchmark status message
 * @param {string} status - 'good', 'low', 'high'
 * @param {string} lang - Language code
 * @returns {string} - Localized message
 */
function getBenchmarkStatus(status, lang = 'en') {
  const statusMap = {
    good: 'benchmark.within_range',
    low: 'benchmark.below_range',
    high: 'benchmark.above_range'
  };
  return localization.t(statusMap[status] || statusMap.good, lang);
}

/**
 * Get metric label
 * @param {string} metric - Metric name
 * @param {string} lang - Language code
 * @returns {string} - Localized label
 */
function getMetricLabel(metric, lang = 'en') {
  return localization.t(`benchmark.metric_${metric}`, lang);
}

/**
 * Get style type label
 * @param {string} styleType - 'blog', 'academic', 'casual', 'professional'
 * @param {string} lang - Language code
 * @returns {string} - Localized label
 */
function getStyleTypeLabel(styleType, lang = 'en') {
  return localization.t(`benchmark.style_${styleType}`, lang);
}

/**
 * Get suggestion message for a metric
 * @param {string} metric - Metric name
 * @param {string} status - 'low' or 'high'
 * @param {Object} values - { value, min, max, ideal }
 * @param {string} lang - Language code
 * @returns {string} - Localized suggestion
 */
function getSuggestionMessage(metric, status, values, lang = 'en') {
  const key = `suggestions.${metric}_${status}`;
  return localization.t(key, lang, values);
}

/**
 * Get error message
 * @param {string} errorKey - Error key
 * @param {Object} params - Interpolation parameters
 * @param {string} lang - Language code
 * @returns {Object} - { message, code }
 */
function getErrorMessage(errorKey, params = {}, lang = 'en') {
  return {
    message: localization.t(`errors.${errorKey}`, lang, params),
    code: errorKey.toUpperCase().replace(/\./g, '_')
  };
}

/**
 * Get success message
 * @param {string} successKey - Success key
 * @param {Object} params - Interpolation parameters
 * @param {string} lang - Language code
 * @returns {string} - Localized message
 */
function getSuccessMessage(successKey, params = {}, lang = 'en') {
  return localization.t(`success.${successKey}`, lang, params);
}

/**
 * Get credit message
 * @param {string} creditKey - Credit key (balance, used, remaining, etc.)
 * @param {Object} params - Interpolation parameters
 * @param {string} lang - Language code
 * @returns {string} - Localized message
 */
function getCreditMessage(creditKey, params = {}, lang = 'en') {
  return localization.t(`credits.${creditKey}`, lang, params);
}

/**
 * Get support ticket status label
 * @param {string} status - Status key
 * @param {string} lang - Language code
 * @returns {string} - Localized label
 */
function getSupportStatusLabel(status, lang = 'en') {
  return localization.t(`support.status_${status}`, lang);
}

/**
 * Get support priority label
 * @param {string} priority - Priority key
 * @param {string} lang - Language code
 * @returns {string} - Localized label
 */
function getSupportPriorityLabel(priority, lang = 'en') {
  return localization.t(`support.priority_${priority}`, lang);
}

/**
 * Get notification type label
 * @param {string} type - Notification type
 * @param {string} lang - Language code
 * @returns {string} - Localized label
 */
function getNotificationTypeLabel(type, lang = 'en') {
  return localization.t(`notifications.type_${type}`, lang);
}

/**
 * Get humanization recommendation
 * @param {number} aiProbability - AI probability
 * @param {string} lang - Language code
 * @returns {string} - Localized recommendation
 */
function getHumanizationRecommendation(aiProbability, lang = 'en') {
  if (aiProbability > 60) {
    return localization.t('humanize.changes_applied', lang, { count: 'multiple' });
  } else if (aiProbability > 40) {
    return localization.t('ai_detection.result_mixed', lang);
  } else {
    return localization.t('humanize.no_changes_needed', lang);
  }
}

/**
 * Localize analysis result object
 * @param {Object} result - Analysis result
 * @param {string} lang - Language code
 * @returns {Object} - Localized result
 */
function localizeAnalysisResult(result, lang = 'en') {
  const localized = { ...result };
  
  // Add localized verdict
  if (result.ai_probability !== undefined) {
    localized.verdict_localized = getAIVerdict(result.ai_probability, lang);
  }
  
  // Add localized confidence
  if (result.confidence !== undefined) {
    const confidenceInfo = getConfidenceLevel(result.confidence, lang);
    localized.confidence_level = confidenceInfo.level;
    localized.confidence_message = confidenceInfo.message;
  }
  
  // Localize benchmark comparison
  if (result.benchmark_comparison) {
    localized.benchmark_comparison = localizeBenchmarkComparison(result.benchmark_comparison, lang);
  }
  
  // Localize suggestions
  if (result.improvement_suggestions && Array.isArray(result.improvement_suggestions)) {
    localized.improvement_suggestions = result.improvement_suggestions.map(suggestion => ({
      ...suggestion,
      message: getSuggestionMessage(
        suggestion.metric,
        suggestion.status,
        {
          value: suggestion.currentValue,
          min: suggestion.recommendedRange?.split(' - ')[0],
          max: suggestion.recommendedRange?.split(' - ')[1],
          ideal: suggestion.idealValue
        },
        lang
      )
    }));
  }
  
  return localized;
}

/**
 * Localize benchmark comparison object
 * @param {Object} comparison - Benchmark comparison
 * @param {string} lang - Language code
 * @returns {Object} - Localized comparison
 */
function localizeBenchmarkComparison(comparison, lang = 'en') {
  const localized = { ...comparison };
  
  // Localize style type
  if (comparison.styleType) {
    localized.styleTypeLabel = getStyleTypeLabel(comparison.styleType, lang);
  }
  
  // Localize comparison metrics
  if (comparison.comparison) {
    localized.comparison = {};
    Object.entries(comparison.comparison).forEach(([metric, data]) => {
      localized.comparison[metric] = {
        ...data,
        label: getMetricLabel(metric, lang),
        statusLabel: getBenchmarkStatus(data.status, lang)
      };
    });
  }
  
  // Localize suggestions
  if (comparison.suggestions && Array.isArray(comparison.suggestions)) {
    localized.suggestions = comparison.suggestions.map(suggestion => ({
      ...suggestion,
      message: getSuggestionMessage(
        suggestion.metric,
        suggestion.status,
        {
          value: typeof suggestion.currentValue === 'number' 
            ? suggestion.currentValue.toFixed(1) 
            : suggestion.currentValue,
          min: suggestion.recommendedRange?.split(' - ')[0],
          max: suggestion.recommendedRange?.split(' - ')[1]
        },
        lang
      )
    }));
  }
  
  return localized;
}

/**
 * Get language from request
 * @param {Object} req - Express request
 * @returns {string} - Language code
 */
function getLang(req) {
  return req.language || req.body?.language || req.query?.lang || 'en';
}

/**
 * Create localized response helper
 * @param {Object} req - Express request
 * @returns {Object} - Helper object with localization methods
 */
function createLocalizer(req) {
  const lang = getLang(req);
  
  return {
    lang,
    t: (key, params = {}) => localization.t(key, lang, params),
    error: (errorKey, params = {}) => getErrorMessage(errorKey, params, lang),
    success: (successKey, params = {}) => getSuccessMessage(successKey, params, lang),
    verdict: (aiProbability) => getAIVerdict(aiProbability, lang),
    confidence: (confidence) => getConfidenceLevel(confidence, lang),
    voiceMatch: (matchScore) => getVoiceMatchLevel(matchScore, lang),
    deviation: (severity) => getDeviationMessage(severity, lang),
    benchmarkStatus: (status) => getBenchmarkStatus(status, lang),
    metricLabel: (metric) => getMetricLabel(metric, lang),
    styleLabel: (styleType) => getStyleTypeLabel(styleType, lang),
    suggestion: (metric, status, values) => getSuggestionMessage(metric, status, values, lang),
    localizeResult: (result) => localizeAnalysisResult(result, lang),
    localizeBenchmark: (comparison) => localizeBenchmarkComparison(comparison, lang)
  };
}

module.exports = {
  getAIVerdict,
  getConfidenceLevel,
  getVoiceMatchLevel,
  getDeviationMessage,
  getBenchmarkStatus,
  getMetricLabel,
  getStyleTypeLabel,
  getSuggestionMessage,
  getErrorMessage,
  getSuccessMessage,
  getCreditMessage,
  getSupportStatusLabel,
  getSupportPriorityLabel,
  getNotificationTypeLabel,
  getHumanizationRecommendation,
  localizeAnalysisResult,
  localizeBenchmarkComparison,
  getLang,
  createLocalizer
};
