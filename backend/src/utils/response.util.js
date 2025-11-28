/**
 * Response Utility
 * Standardized response formatting with localization support
 */

const localization = require('../services/localization.service');

/**
 * Send a localized success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} lang - Language code
 * @param {number} statusCode - HTTP status code (default: 200)
 */
function successResponse(res, data, lang = 'en', statusCode = 200) {
  const localizedData = localization.localizeObject(data, lang);
  
  return res.status(statusCode).json({
    success: true,
    ...localizedData
  });
}

/**
 * Send a localized error response
 * @param {Object} res - Express response object
 * @param {string} errorKey - Error translation key (e.g., "invalid_input")
 * @param {string} lang - Language code
 * @param {Object} params - Interpolation parameters
 * @param {number} statusCode - HTTP status code (default: 400)
 */
function errorResponse(res, errorKey, lang = 'en', params = {}, statusCode = 400) {
  const message = localization.translate(`errors.${errorKey}`, lang, params);
  
  return res.status(statusCode).json({
    success: false,
    error: true,
    message,
    code: errorKey.toUpperCase().replace(/\./g, '_')
  });
}

/**
 * Send a localized response with custom message key
 * @param {Object} res - Express response object
 * @param {string} messageKey - Message translation key
 * @param {Object} data - Additional response data
 * @param {string} lang - Language code
 * @param {Object} params - Interpolation parameters
 * @param {number} statusCode - HTTP status code
 */
function localizedResponse(res, messageKey, data = {}, lang = 'en', params = {}, statusCode = 200) {
  const message = localization.translate(messageKey, lang, params);
  const localizedData = localization.localizeObject(data, lang);
  
  return res.status(statusCode).json({
    success: statusCode < 400,
    message,
    ...localizedData
  });
}

/**
 * Create a localized analysis result
 * @param {Object} analysisResult - Raw analysis result
 * @param {string} lang - Language code
 * @returns {Object} - Localized analysis result
 */
function localizeAnalysisResult(analysisResult, lang = 'en') {
  const result = { ...analysisResult };
  
  // Localize suggestions
  if (result.suggestions && Array.isArray(result.suggestions)) {
    result.suggestions = result.suggestions.map(suggestion => {
      if (typeof suggestion === 'object' && suggestion.message) {
        // Try to translate the message if it's a key
        const translatedMessage = localization.translate(
          `suggestions.${suggestion.metric}_${suggestion.status}`,
          lang,
          {
            value: suggestion.currentValue,
            min: suggestion.recommendedRange?.split(' - ')[0],
            max: suggestion.recommendedRange?.split(' - ')[1],
            ideal: suggestion.idealValue
          }
        );
        
        // Use translated message if different from key
        if (!translatedMessage.startsWith('suggestions.')) {
          suggestion.message = translatedMessage;
        }
      }
      return suggestion;
    });
  }
  
  // Localize issues
  if (result.issues && Array.isArray(result.issues)) {
    result.issues = result.issues.map(issue => {
      if (typeof issue === 'object' && issue.detail) {
        const translationKey = `analysis.${issue.type}_${issue.severity}`;
        const translated = localization.translate(translationKey, lang, {
          count: issue.metric,
          avg: issue.threshold
        });
        
        if (!translated.startsWith('analysis.')) {
          issue.detail = translated;
        }
      }
      return issue;
    });
  }
  
  // Localize evidence
  if (result.evidence && Array.isArray(result.evidence)) {
    result.evidence = result.evidence.map(evidence => {
      if (typeof evidence === 'string') {
        // Try to find a translation key pattern
        const keyMatch = evidence.match(/^\[([A-Z_]+)\]/);
        if (keyMatch) {
          const category = keyMatch[1].toLowerCase();
          const translationKey = `ai_detection.indicator_${category}`;
          const translated = localization.translate(translationKey, lang);
          if (!translated.startsWith('ai_detection.')) {
            return evidence.replace(/^\[[A-Z_]+\]\s*/, `[${localization.translate(`common.${category}`, lang) || category}] `) + translated;
          }
        }
      }
      return evidence;
    });
  }
  
  return result;
}

/**
 * Create a localized benchmark comparison result
 * @param {Object} benchmarkResult - Raw benchmark comparison
 * @param {string} lang - Language code
 * @returns {Object} - Localized benchmark result
 */
function localizeBenchmarkResult(benchmarkResult, lang = 'en') {
  const result = { ...benchmarkResult };
  
  // Localize style type
  if (result.styleType) {
    result.styleTypeLabel = localization.translate(`benchmark.style_${result.styleType}`, lang);
  }
  
  // Localize comparison metrics
  if (result.comparison) {
    Object.keys(result.comparison).forEach(metric => {
      const metricData = result.comparison[metric];
      metricData.label = localization.translate(`benchmark.metric_${metric}`, lang);
      
      if (metricData.status === 'good') {
        metricData.statusLabel = localization.translate('benchmark.within_range', lang);
      } else if (metricData.status === 'low') {
        metricData.statusLabel = localization.translate('benchmark.below_range', lang);
      } else if (metricData.status === 'high') {
        metricData.statusLabel = localization.translate('benchmark.above_range', lang);
      }
    });
  }
  
  // Localize suggestions
  if (result.suggestions && Array.isArray(result.suggestions)) {
    result.suggestions = result.suggestions.map(suggestion => {
      const translationKey = `suggestions.${suggestion.metric}_${suggestion.status}`;
      const translated = localization.translate(translationKey, lang, {
        value: typeof suggestion.currentValue === 'number' 
          ? suggestion.currentValue.toFixed(1) 
          : suggestion.currentValue,
        min: suggestion.recommendedRange?.split(' - ')[0],
        max: suggestion.recommendedRange?.split(' - ')[1]
      });
      
      if (!translated.startsWith('suggestions.')) {
        suggestion.message = translated;
      }
      
      return suggestion;
    });
  }
  
  return result;
}

/**
 * Create a localized AI detection result
 * @param {Object} detectionResult - Raw AI detection result
 * @param {string} lang - Language code
 * @returns {Object} - Localized detection result
 */
function localizeAIDetectionResult(detectionResult, lang = 'en') {
  const result = { ...detectionResult };
  
  // Determine result label based on probability
  if (result.aiProbability !== undefined) {
    if (result.aiProbability < 30) {
      result.resultLabel = localization.translate('ai_detection.result_human', lang);
    } else if (result.aiProbability < 60) {
      result.resultLabel = localization.translate('ai_detection.result_mixed', lang);
    } else {
      result.resultLabel = localization.translate('ai_detection.result_ai', lang);
    }
  }
  
  // Localize confidence level
  if (result.confidence !== undefined) {
    if (result.confidence < 50) {
      result.confidenceLabel = localization.translate('analysis.confidence_low', lang);
    } else if (result.confidence < 75) {
      result.confidenceLabel = localization.translate('analysis.confidence_medium', lang);
    } else {
      result.confidenceLabel = localization.translate('analysis.confidence_high', lang);
    }
  }
  
  // Localize human indicators
  if (result.humanIndicators && Array.isArray(result.humanIndicators)) {
    result.humanIndicatorsTitle = localization.translate('ai_detection.human_indicators_title', lang);
  }
  
  // Localize AI indicators
  if (result.aiIndicators && Array.isArray(result.aiIndicators)) {
    result.aiIndicatorsTitle = localization.translate('ai_detection.ai_indicators_title', lang);
  }
  
  return result;
}

/**
 * Create a localized voice profile result
 * @param {Object} profileResult - Raw voice profile result
 * @param {string} lang - Language code
 * @returns {Object} - Localized profile result
 */
function localizeVoiceProfileResult(profileResult, lang = 'en') {
  const result = { ...profileResult };
  
  // Localize tone
  if (result.tone) {
    result.toneLabel = localization.translate(`voice_profile.tone_${result.tone}`, lang);
  }
  
  // Localize match level
  if (result.matchScore !== undefined) {
    if (result.matchScore >= 80) {
      result.matchLabel = localization.translate('voice_profile.match_high', lang, { score: result.matchScore });
    } else if (result.matchScore >= 50) {
      result.matchLabel = localization.translate('voice_profile.match_medium', lang, { score: result.matchScore });
    } else {
      result.matchLabel = localization.translate('voice_profile.match_low', lang, { score: result.matchScore });
    }
  }
  
  // Localize deviation severity
  if (result.deviationSeverity) {
    result.deviationLabel = localization.translate(`voice_profile.deviation_${result.deviationSeverity}`, lang);
  }
  
  return result;
}

/**
 * Middleware to add localization helpers to response
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
function responseLocalizationMiddleware(req, res, next) {
  const lang = req.language || 'en';
  
  // Add helper methods to response
  res.success = (data, statusCode = 200) => successResponse(res, data, lang, statusCode);
  res.error = (errorKey, params = {}, statusCode = 400) => errorResponse(res, errorKey, lang, params, statusCode);
  res.localized = (messageKey, data = {}, params = {}, statusCode = 200) => 
    localizedResponse(res, messageKey, data, lang, params, statusCode);
  
  // Add translation helper
  res.t = (key, params = {}) => localization.translate(key, lang, params);
  
  next();
}

module.exports = {
  successResponse,
  errorResponse,
  localizedResponse,
  localizeAnalysisResult,
  localizeBenchmarkResult,
  localizeAIDetectionResult,
  localizeVoiceProfileResult,
  responseLocalizationMiddleware
};
