/**
 * Credit Pricing Configuration
 * Hệ thống tính toán credit thông minh dựa trên usage
 */

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
  'gemini-2.5-flash': {
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    multiplier: 1.2              // Slightly more expensive
  },
  
  // Embedding model
  'text-embedding-004': {
    inputCostPer1M: 0.025,       // $0.025 per 1M tokens
    outputCostPer1M: 0,
    multiplier: 0.5
  },
  
  // Pro models (if used in future)
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
  // AI Content Detection
  'ai_detection': {
    baseCost: 2,                 // 2 credits base
    perWordCost: 0.001,          // 0.001 credit per word
    maxCost: 10,                 // Cap at 10 credits
    description: 'Phát hiện nội dung AI'
  },
  
  // Text Embedding (single)
  'embedding_single': {
    baseCost: 1,
    perWordCost: 0.0005,
    maxCost: 5,
    description: 'Tạo embedding đơn'
  },
  
  // Text Embedding (batch)
  'embedding_batch': {
    baseCost: 3,
    perWordCost: 0.0003,         // Cheaper per word in batch
    maxCost: 15,
    description: 'Tạo embedding hàng loạt'
  },
  
  // Voice Profile Generation (expensive - one-time)
  'voice_profile_generation': {
    baseCost: 50,                // High base cost
    perSampleCost: 2,            // 2 credits per sample text
    maxCost: 200,                // Cap at 200 credits
    description: 'Tạo voice profile'
  },
  
  // Text Analysis (embedding + stats)
  'text_analysis': {
    baseCost: 5,
    perSentenceCost: 0.5,        // 0.5 credit per sentence
    maxCost: 30,
    description: 'Phân tích văn bản'
  },
  
  // Text Rewriting
  'text_rewrite': {
    baseCost: 3,
    perWordCost: 0.002,
    maxCost: 20,
    modelMultiplier: true,       // Apply model multiplier
    description: 'Viết lại văn bản'
  },
  
  // Improvement Suggestions
  'improvement_suggestions': {
    baseCost: 2,
    perSentenceCost: 1,
    maxCost: 15,
    description: 'Gợi ý cải thiện'
  },
  
  // Chat Message
  'chat_message': {
    baseCost: 1,
    perWordCost: 0.001,
    maxCost: 10,
    modelMultiplier: true,
    description: 'Tin nhắn chat'
  },
  
  // Translation
  'translation': {
    baseCost: 2,
    perWordCost: 0.0015,
    maxCost: 15,
    description: 'Dịch văn bản'
  }
};

// ============================================================================
// SUBSCRIPTION PLANS
// ============================================================================

const SUBSCRIPTION_PLANS = {
  'free': {
    name: 'Free',
    monthlyCredits: 100,
    price: 0,
    features: {
      ai_detection: true,
      text_analysis: true,
      text_rewrite: true,
      chat_message: true,
      voice_profiles: 2,           // Max 2 profiles
      max_samples_per_profile: 10
    },
    limits: {
      daily_credits: 10,
      max_text_length: 5000
    }
  },
  
  'starter': {
    name: 'Starter',
    monthlyCredits: 500,
    price: 9.99,                   // $9.99/month
    features: {
      ai_detection: true,
      text_analysis: true,
      text_rewrite: true,
      chat_message: true,
      improvement_suggestions: true,
      voice_profiles: 5,
      max_samples_per_profile: 30
    },
    limits: {
      daily_credits: 50,
      max_text_length: 10000
    },
    bonus: {
      signup_credits: 100          // Bonus 100 credits on signup
    }
  },
  
  'professional': {
    name: 'Professional',
    monthlyCredits: 2000,
    price: 29.99,                  // $29.99/month
    features: {
      ai_detection: true,
      text_analysis: true,
      text_rewrite: true,
      chat_message: true,
      improvement_suggestions: true,
      translation: true,
      voice_profiles: 20,
      max_samples_per_profile: 100,
      priority_support: true
    },
    limits: {
      daily_credits: 200,
      max_text_length: 20000
    },
    bonus: {
      signup_credits: 500
    },
    discount: {
      rewrite_cost: 0.8,           // 20% discount on rewrites
      analysis_cost: 0.8
    }
  },
  
  'enterprise': {
    name: 'Enterprise',
    monthlyCredits: 10000,
    price: 99.99,                  // $99.99/month
    features: {
      ai_detection: true,
      text_analysis: true,
      text_rewrite: true,
      chat_message: true,
      improvement_suggestions: true,
      translation: true,
      voice_profiles: -1,          // Unlimited
      max_samples_per_profile: -1, // Unlimited
      priority_support: true,
      api_access: true,
      custom_models: true
    },
    limits: {
      daily_credits: -1,           // Unlimited
      max_text_length: 50000
    },
    bonus: {
      signup_credits: 2000
    },
    discount: {
      rewrite_cost: 0.6,           // 40% discount
      analysis_cost: 0.6,
      chat_cost: 0.7
    }
  }
};

// ============================================================================
// CREDIT PACKAGES (One-time purchase)
// ============================================================================

const CREDIT_PACKAGES = {
  'small': {
    credits: 100,
    price: 4.99,
    bonus: 0,
    description: 'Gói nhỏ - 100 credits'
  },
  'medium': {
    credits: 500,
    price: 19.99,
    bonus: 50,                     // +10% bonus
    description: 'Gói trung - 500 credits + 50 bonus'
  },
  'large': {
    credits: 1500,
    price: 49.99,
    bonus: 300,                    // +20% bonus
    description: 'Gói lớn - 1500 credits + 300 bonus'
  },
  'mega': {
    credits: 5000,
    price: 149.99,
    bonus: 1500,                   // +30% bonus
    description: 'Gói khổng lồ - 5000 credits + 1500 bonus'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate credits for a feature
 */
function calculateFeatureCost(featureName, params = {}) {
  const feature = FEATURE_COSTS[featureName];
  if (!feature) {
    throw new Error(`Unknown feature: ${featureName}`);
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
  
  // Apply model multiplier
  if (feature.modelMultiplier && params.model) {
    const modelConfig = MODEL_COSTS[params.model];
    if (modelConfig) {
      cost *= modelConfig.multiplier;
    }
  }
  
  // Apply subscription discount
  if (params.discount) {
    const discountKey = `${featureName.split('_')[0]}_cost`;
    if (params.discount[discountKey]) {
      cost *= params.discount[discountKey];
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
  MODEL_COSTS,
  FEATURE_COSTS,
  SUBSCRIPTION_PLANS,
  CREDIT_PACKAGES,
  calculateFeatureCost,
  estimateTokens,
  countWords,
  countSentences
};
