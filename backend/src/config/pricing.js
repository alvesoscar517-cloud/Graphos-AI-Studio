/**
 * Credit Pricing Configuration
 * Smart credit calculation system based on usage
 * 
 * Updated: November 2025
 * - Added missing features (translation, humanization, profile operations)
 * - Standardized pricing across all AI-consuming endpoints
 */

// ============================================================================
// FREE CREDITS FOR NEW USERS
// ============================================================================

const FREE_CREDITS = 100; // Free credits for new users (increased from 50)

// ============================================================================
// MODEL PRICING (based on Gemini API costs)
// ============================================================================

const MODEL_COSTS = {
  // Gemini Flash models (fast, cheap)
  'gemini-2.0-flash-exp': {
    inputCostPer1M: 0.075,      // $0.075 per 1M input tokens
    outputCostPer1M: 0.30,      // $0.30 per 1M output tokens
    multiplier: 1.0
  },
  'gemini-2.5-flash-lite': {
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    multiplier: 0.8              // Cheapest model
  },
  'gemini-2.5-flash': {
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    multiplier: 1.2              // Slightly more expensive
  },
  'gemini-2.5-pro': {
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.00,
    multiplier: 3.0              // Most expensive, highest quality
  },
  
  // Embedding model
  'text-embedding-004': {
    inputCostPer1M: 0.025,       // $0.025 per 1M tokens
    outputCostPer1M: 0,
    multiplier: 0.5
  },
  
  // Legacy Pro model
  'gemini-2.0-pro': {
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.00,
    multiplier: 3.0
  }
};

// ============================================================================
// FEATURE PRICING (credits per operation)
// ============================================================================

const FEATURE_COSTS = {
  // ============================================================================
  // AI CONTENT DETECTION
  // ============================================================================
  'ai_detection': {
    baseCost: 2,
    perWordCost: 0.001,
    maxCost: 10,
    description: 'AI content detection (single pass)'
  },
  'ai_detection_enhanced': {
    baseCost: 3,
    perWordCost: 0.0015,
    maxCost: 15,
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
  // VOICE PROFILE OPERATIONS (reduced costs - important for user onboarding)
  // ============================================================================
  'voice_profile_generation': {
    baseCost: 5,
    perSampleCost: 0.5,
    maxCost: 15,
    description: 'Voice profile generation (finalize)'
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
    baseCost: 5,
    perSampleCost: 0.5,
    maxCost: 15,
    description: 'Complete profile creation'
  },
  
  // ============================================================================
  // TEXT ANALYSIS
  // ============================================================================
  'text_analysis': {
    baseCost: 3,
    perSentenceCost: 0.3,
    maxCost: 20,
    description: 'Text analysis with embeddings'
  },
  'improvement_suggestions': {
    baseCost: 1,
    perSentenceCost: 0.5,
    maxCost: 10,
    description: 'Improvement suggestions'
  },
  
  // ============================================================================
  // TEXT REWRITING & HUMANIZATION
  // ============================================================================
  'text_rewrite': {
    baseCost: 1.5,
    perWordCost: 0.0008,
    maxCost: 12,
    modelMultiplier: true,
    description: 'Text rewriting'
  },
  'iterative_humanize': {
    baseCost: 3,
    perIterationCost: 1.5,
    perWordCost: 0.0008,
    maxCost: 15,
    description: 'Iterative humanization'
  },
  'check_humanization': {
    baseCost: 1.5,
    perWordCost: 0.0008,
    maxCost: 6,
    description: 'Humanization check'
  },
  
  // ============================================================================
  // CHAT OPERATIONS
  // ============================================================================
  'chat_message': {
    baseCost: 1,
    perWordCost: 0.0008,
    maxCost: 8,
    modelMultiplier: true,
    description: 'Chat message'
  },
  'chat_humanized': {
    baseCost: 2,
    perWordCost: 0.001,
    maxCost: 12,
    modelMultiplier: true,
    description: 'Humanized chat message'
  },
  'conversation_summarize': {
    baseCost: 1,
    perMessageCost: 0.1,
    maxCost: 5,
    description: 'Conversation summarization'
  },
  
  // ============================================================================
  // TRANSLATION
  // ============================================================================
  'translation': {
    baseCost: 1,
    perWordCost: 0.001,
    maxCost: 10,
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
// Pricing strategy: ~$0.02-0.03 per credit, better value for larger packages
// ============================================================================

const CREDIT_PACKAGES = {
  'starter': {
    credits: 50,
    price: 1.99,
    bonus: 0,
    description: 'Starter',
    variantId: process.env.LS_VARIANT_STARTER || null  // ~$0.04/credit
  },
  'basic': {
    credits: 150,
    price: 4.99,
    bonus: 15,                     // +10% bonus = 165 total
    description: 'Basic',
    variantId: process.env.LS_VARIANT_BASIC || null    // ~$0.03/credit
  },
  'pro': {
    credits: 500,
    price: 14.99,
    bonus: 100,                    // +20% bonus = 600 total
    description: 'Pro',
    variantId: process.env.LS_VARIANT_PRO || null      // ~$0.025/credit
  },
  'pro_plus': {
    credits: 1500,
    price: 39.99,
    bonus: 450,                    // +30% bonus = 1950 total
    description: 'Pro Plus',
    variantId: process.env.LS_VARIANT_PRO_PLUS || null // ~$0.02/credit
  },
  'power': {
    credits: 5000,
    price: 99.99,
    bonus: 2000,                   // +40% bonus = 7000 total
    description: 'Power',
    variantId: process.env.LS_VARIANT_POWER || null    // ~$0.014/credit
  }
};

/**
 * Get package by Lemon Squeezy variant ID
 * Supports both string and number comparison
 */
function getPackageByVariantId(variantId) {
  const variantIdStr = String(variantId);
  const variantIdNum = parseInt(variantId, 10);
  
  for (const [packageId, pkg] of Object.entries(CREDIT_PACKAGES)) {
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
  for (const [packageId, pkg] of Object.entries(CREDIT_PACKAGES)) {
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
 * Calculate credits for a feature
 */
function calculateFeatureCost(featureName, params = {}) {
  const feature = FEATURE_COSTS[featureName];
  if (!feature) {
    console.warn(`[PRICING] Unknown feature: ${featureName}, using default cost`);
    return 1; // Default cost for unknown features
  }
  
  let cost = feature.baseCost;
  
  // Add per-word cost
  if (params.wordCount && feature.perWordCost) {
    cost += params.wordCount * feature.perWordCost;
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
  
  // Cap at max cost
  if (feature.maxCost) {
    cost = Math.min(cost, feature.maxCost);
  }
  
  // Round to 2 decimal places
  return Math.round(cost * 100) / 100;
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
  calculateFeatureCost,
  estimateTokens,
  countWords,
  countSentences,
  getPackageByVariantId,
  getPackageByPrice
};
