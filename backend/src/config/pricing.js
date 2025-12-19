/**
 * Credit Pricing Configuration
 * Smart credit calculation system based on usage
 * 
 * Updated: November 2025
 * - Added missing features (translation, humanization, profile operations)
 * - Standardized pricing across all AI-consuming endpoints
 */

const envConfig = require('./envConfigHelper');

const logger = require('../utils/logger');
// ============================================================================
// FREE CREDITS FOR NEW USERS
// ============================================================================

const FREE_CREDITS = 100; // Free credits for new users (increased from 50)

// ============================================================================
// MODEL PRICING (Graphos AI models)
// ============================================================================

const MODEL_COSTS = {
  // Graphos Velocity - Fastest, cost-effective
  'gemini-2.5-flash-lite': {
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    multiplier: 0.8,             // Cheapest option
    hasNativeThinking: true
  },
  
  // Graphos Hyper - Balanced, recommended (default)
  'gemini-2.5-flash': {
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    multiplier: 1.0,             // Base multiplier
    hasNativeThinking: true
  },
  
  // Graphos Zenith - Best quality, highest accuracy
  'gemini-2.5-pro': {
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.00,
    multiplier: 2.0,             // Reduced for better user value
    hasNativeThinking: true
  },
  
  // Embedding model
  'text-embedding-004': {
    inputCostPer1M: 0.025,       // $0.025 per 1M tokens
    outputCostPer1M: 0,
    multiplier: 0.5,
    hasNativeThinking: false
  }
};

// ============================================================================
// FEATURE PRICING (credits per operation)
// ============================================================================

const FEATURE_COSTS = {
  // ============================================================================
  // AI CONTENT DETECTION (Updated: Dec 2025 - removed maxCost for fair pricing)
  // ============================================================================
  'ai_detection': {
    baseCost: 2,
    perWordCost: 0.001,
    // maxCost removed - cost scales linearly with text length
    description: 'AI content detection (single pass)'
  },
  'ai_detection_enhanced': {
    baseCost: 3,
    perWordCost: 0.0015,
    // maxCost removed - cost scales linearly with text length
    description: 'AI content detection (multi-pass)'
  },
  
  // ============================================================================
  // EMBEDDING OPERATIONS
  // ============================================================================
  'embedding_single': {
    baseCost: 0.5,
    perWordCost: 0.0003,
    maxCost: 3,
    description: 'Single embedding generation'
  },
  'embedding_batch': {
    baseCost: 1,
    perItemCost: 0.3,
    maxCost: 10,
    description: 'Batch embedding generation'
  },
  
  // ============================================================================
  // VOICE PROFILE OPERATIONS (Updated: Dec 2025 - uses Graphos Zenith with thinking)
  // User-friendly pricing - profile creation is important for onboarding
  // ============================================================================
  'voice_profile_generation': {
    baseCost: 8,                  // Increased for Graphos Zenith with thinking
    perSampleCost: 0.5,
    maxCost: 20,                  // Cap to protect users
    description: 'Voice profile generation with AI thinking (Graphos Zenith)'
  },
  'profile_sample_add': {
    baseCost: 0.3,
    perWordCost: 0.0002,
    maxCost: 1.5,
    description: 'Add sample to profile'
  },
  'profile_samples_batch': {
    baseCost: 0.5,
    perSampleCost: 0.3,
    maxCost: 8,
    description: 'Batch add samples to profile'
  },
  'profile_complete': {
    baseCost: 10,                 // Increased for Graphos Zenith with thinking
    perSampleCost: 0.5,
    maxCost: 25,                  // Cap to protect users
    description: 'Complete profile creation with AI thinking (Graphos Zenith)'
  },
  
  // ============================================================================
  // TEXT ANALYSIS (Updated: Dec 2025 - removed maxCost for fair pricing)
  // ============================================================================
  'text_analysis': {
    baseCost: 2,
    perWordCost: 0.002,
    // maxCost removed - cost scales linearly with text length
    description: 'Text analysis with embeddings'
  },
  'improvement_suggestions': {
    baseCost: 0.5,
    perWordCost: 0.001,
    // maxCost removed - cost scales linearly with text length
    description: 'Improvement suggestions'
  },
  
  // ============================================================================
  // TEXT REWRITING & HUMANIZATION (Updated: Dec 2025 - removed maxCost for fair pricing)
  // ============================================================================
  'text_rewrite': {
    baseCost: 1.5,
    perWordCost: 0.0008,
    // maxCost removed - cost scales linearly with text length
    modelMultiplier: true,
    description: 'Text rewriting'
  },
  'iterative_humanize': {
    baseCost: 2,
    perIterationCost: 1.0,
    perWordCost: 0.0005,
    // maxCost removed - cost scales linearly with text length and iterations
    description: 'Iterative humanization'
  },
  'check_humanization': {
    baseCost: 1,
    perWordCost: 0.0005,
    // maxCost removed - cost scales linearly with text length
    description: 'Humanization check'
  },
  
  // ============================================================================
  // CHAT OPERATIONS (Updated: Dec 2025 - Two-phase pricing)
  // Phase 1 (Pre-charge): baseCost + (inputWords * perInputWordCost)
  // Phase 2 (Post-charge): outputTokens * perOutputTokenCost * modelMultiplier
  // This ensures dev costs are covered while being fair to users
  // ============================================================================
  'chat_message': {
    baseCost: 0.3,                // Reduced base cost (was 0.5)
    perInputWordCost: 0.0003,     // Cost for user's input message
    perOutputTokenCost: 0.0008,   // Cost per output token (calculated after completion)
    // Output pricing: ~0.8 credits per 1000 output tokens (base model)
    // Example: 500 token response = 0.4 credits output cost
    modelMultiplier: true,
    description: 'Chat message (input pre-charge + output post-charge)'
  },
  'chat_humanized': {
    baseCost: 0.5,                // Reduced base cost (was 1)
    perInputWordCost: 0.0004,     // Slightly higher for humanized
    perOutputTokenCost: 0.001,    // Higher output cost due to humanization processing
    // Output pricing: ~1 credit per 1000 output tokens (base model)
    modelMultiplier: true,
    description: 'Humanized chat message (input pre-charge + output post-charge)'
  },
  'conversation_summarize': {
    baseCost: 1,
    perMessageCost: 0.15,
    maxCost: 8,
    description: 'Conversation summarization (enhanced with 800 tokens)'
  },
  
  // ============================================================================
  // TRANSLATION (Updated: Dec 2025 - removed maxCost for fair pricing)
  // ============================================================================
  'translation': {
    baseCost: 1,
    perWordCost: 0.001,
    // maxCost removed - cost scales linearly with text length
    description: 'Text translation'
  },
  
  // ============================================================================
  // FILE PROCESSING
  // ============================================================================
  'file_upload_image': {
    baseCost: 1,
    maxCost: 3,
    description: 'Image upload and analysis'
  },
  'file_upload_document': {
    baseCost: 0.5,
    maxCost: 2,
    description: 'Document upload'
  }
};

// ============================================================================
// CREDIT PACKAGES (One-time purchase)
// Pricing strategy: Better value for larger packages
// Updated: Dec 2025 - Increased credits and bonuses for better user value
// ============================================================================

// Use getter function to always get latest variant IDs from config
function getCreditPackages() {
  return {
    'basic': {
      credits: 200,
      price: 4.99,
      bonus: 30,                     // +15% bonus = 230 total
      description: 'Basic',
      variantId: envConfig.get('LS_VARIANT_BASIC') || null    // ~$0.022/credit
    },
    'pro': {
      credits: 600,
      price: 14.99,
      bonus: 150,                    // +25% bonus = 750 total
      description: 'Pro',
      variantId: envConfig.get('LS_VARIANT_PRO') || null      // ~$0.020/credit
    },
    'pro_plus': {
      credits: 1800,
      price: 39.99,
      bonus: 540,                    // +30% bonus = 2340 total
      description: 'Pro Plus',
      variantId: envConfig.get('LS_VARIANT_PRO_PLUS') || null // ~$0.017/credit
    },
    'power': {
      credits: 6000,
      price: 99.99,
      bonus: 2400,                   // +40% bonus = 8400 total
      description: 'Power',
      variantId: envConfig.get('LS_VARIANT_POWER') || null    // ~$0.012/credit
    }
  };
}

// For backward compatibility
const CREDIT_PACKAGES = getCreditPackages();

/**
 * Get package by Lemon Squeezy variant ID
 * Supports both string and number comparison
 * Uses getCreditPackages() to get latest config from Firestore
 */
function getPackageByVariantId(variantId) {
  const variantIdStr = String(variantId);
  const variantIdNum = parseInt(variantId, 10);
  const packages = getCreditPackages();
  
  for (const [packageId, pkg] of Object.entries(packages)) {
    if (!pkg.variantId) continue;
    
    const pkgVariantStr = String(pkg.variantId);
    const pkgVariantNum = parseInt(pkg.variantId, 10);
    
    if (pkgVariantStr === variantIdStr || pkgVariantNum === variantIdNum) {
      return { packageId, ...pkg };
    }
  }
  return null;
}

/**
 * Get package by price (fallback when variant ID not configured)
 * Matches based on total price in cents
 */
function getPackageByPrice(priceInCents) {
  const packages = getCreditPackages();
  for (const [packageId, pkg] of Object.entries(packages)) {
    const pkgPriceInCents = Math.round(pkg.price * 100);
    if (pkgPriceInCents === priceInCents) {
      return { packageId, ...pkg };
    }
  }
  return null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate credits for a feature (Phase 1: Pre-charge based on input)
 */
function calculateFeatureCost(featureName, params = {}) {
  const feature = FEATURE_COSTS[featureName];
  if (!feature) {
    logger.warn(`[PRICING] Unknown feature: ${featureName}, using default cost`);
    return 1; // Default cost for unknown features
  }
  
  let cost = feature.baseCost;
  
  // Add per-word cost (input)
  if (params.wordCount && feature.perWordCost) {
    cost += params.wordCount * feature.perWordCost;
  }
  
  // Add per-input-word cost (for chat - more explicit naming)
  if (params.inputWordCount && feature.perInputWordCost) {
    cost += params.inputWordCount * feature.perInputWordCost;
  }
  
  // Add per-sentence cost
  if (params.sentenceCount && feature.perSentenceCost) {
    cost += params.sentenceCount * feature.perSentenceCost;
  }
  
  // Add per-sample cost
  if (params.sampleCount && feature.perSampleCost) {
    cost += params.sampleCount * feature.perSampleCost;
  }
  
  // Add per-item cost (for batch operations)
  if (params.itemCount && feature.perItemCost) {
    cost += params.itemCount * feature.perItemCost;
  }
  
  // Add per-iteration cost (for iterative operations)
  if (params.iterationCount && feature.perIterationCost) {
    cost += params.iterationCount * feature.perIterationCost;
  }
  
  // Add per-message cost (for conversation operations)
  if (params.messageCount && feature.perMessageCost) {
    cost += params.messageCount * feature.perMessageCost;
  }
  
  // Apply model multiplier
  if (feature.modelMultiplier && params.model) {
    const modelConfig = MODEL_COSTS[params.model];
    if (modelConfig) {
      cost *= modelConfig.multiplier;
    }
  }
  
  // NOTE: maxCost cap removed (Dec 2025) - cost now scales linearly with text length
  // This is fairer for both users (short text = low cost) and developers (long text = appropriate cost)
  
  // Round to 2 decimal places
  return Math.round(cost * 100) / 100;
}

/**
 * Calculate output cost for chat features (Phase 2: Post-charge based on output)
 * Called after AI response is complete to charge for actual output tokens
 * @param {string} featureName - 'chat_message' or 'chat_humanized'
 * @param {number} outputTokens - Actual output tokens from AI response
 * @param {string} model - Model used for generation
 * @returns {number} Additional credits to charge for output
 */
function calculateOutputCost(featureName, outputTokens, model = 'gemini-2.5-flash') {
  const feature = FEATURE_COSTS[featureName];
  if (!feature || !feature.perOutputTokenCost) {
    return 0;
  }
  
  let outputCost = outputTokens * feature.perOutputTokenCost;
  
  // Apply model multiplier for output cost
  if (feature.modelMultiplier && model) {
    const modelConfig = MODEL_COSTS[model];
    if (modelConfig) {
      outputCost *= modelConfig.multiplier;
    }
  }
  
  // Round to 2 decimal places
  return Math.round(outputCost * 100) / 100;
}

/**
 * Get feature pricing info for transparency
 * @param {string} featureName - Feature name
 * @returns {Object} Pricing details for the feature
 */
function getFeaturePricingInfo(featureName) {
  const feature = FEATURE_COSTS[featureName];
  if (!feature) return null;
  
  return {
    baseCost: feature.baseCost,
    perInputWordCost: feature.perInputWordCost || feature.perWordCost || 0,
    perOutputTokenCost: feature.perOutputTokenCost || 0,
    hasOutputPricing: !!feature.perOutputTokenCost,
    modelMultiplier: feature.modelMultiplier || false,
    description: feature.description
  };
}

/**
 * Estimate tokens from text
 */
function estimateTokens(text) {
  // Rough estimate: 1 token ≈ 4 characters for English, 2-3 for Vietnamese
  return Math.ceil(text.length / 3);
}

/**
 * Count words in text
 */
function countWords(text) {
  return text.trim().split(/\s+/).length;
}

/**
 * Count sentences in text
 */
function countSentences(text) {
  return (text.match(/[.!?]+/g) || []).length || 1;
}

module.exports = {
  FREE_CREDITS,
  MODEL_COSTS,
  FEATURE_COSTS,
  CREDIT_PACKAGES,
  getCreditPackages,
  calculateFeatureCost,
  calculateOutputCost,
  getFeaturePricingInfo,
  estimateTokens,
  countWords,
  countSentences,
  getPackageByVariantId,
  getPackageByPrice
};
