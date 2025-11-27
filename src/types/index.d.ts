/**
 * TypeScript Type Definitions
 * Provides type safety for the application
 */

// ============================================================================
// USER & AUTH TYPES
// ============================================================================

export interface User {
  id: string;
  userId: string;
  email: string;
  name?: string;
  picture?: string;
  emailVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// PROFILE TYPES
// ============================================================================

export interface Profile {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  sampleCount: number;
  createdAt: string;
  updatedAt: string;
  voiceProfile?: VoiceProfile;
  statisticalFeatures?: StatisticalFeatures;
}

export interface VoiceProfile {
  tone: string;
  formality_level: number;
  key_characteristics: string[];
  sentence_starters: string[];
  transition_preferences: string[];
  punctuation_style: string;
  vocabulary_preferences: {
    common_phrases: string[];
    avoid_words: string[];
    preferred_connectors: string[];
  };
  sentence_patterns: {
    typical_length: string;
    structure_preference: string;
    opening_style: string;
  };
  rewrite_instructions: string;
}

export interface StatisticalFeatures {
  avgWordLength: number;
  avgSentenceLength: number;
  vocabularyRichness: number;
  punctuationRatio: number;
  totalWords: number;
  totalSentences: number;
  readabilityScore: number;
  topSentenceStarters: string[];
  transitionWordUsage: Record<string, number>;
}

export interface Sample {
  id: string;
  text: string;
  type: 'short' | 'long';
  wordCount: number;
  createdAt: string;
}

// ============================================================================
// ANALYSIS TYPES
// ============================================================================

export interface AnalysisResult {
  success: boolean;
  voice_compatibility_score: number;
  vector_score: number;
  statistical_score: number;
  confidence: number;
  sentence_analysis: SentenceAnalysis[];
  deviant_sentences: DeviantSentence[];
  statistics: StatisticalFeatures;
  benchmark_comparison: BenchmarkComparison;
  improvement_suggestions: ImprovementSuggestion[];
  processing_time_ms: number;
}

export interface SentenceAnalysis {
  sentence: string;
  index: number;
  similarityScore: number;
  centroidSimilarity: number;
  isDeviant: boolean;
  deviationSeverity: 'mild' | 'moderate' | 'severe' | null;
}

export interface DeviantSentence {
  sentence: string;
  score: number;
  index: number;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface BenchmarkComparison {
  comparison: Record<string, MetricComparison>;
  suggestions: ImprovementSuggestion[];
  overallBenchmarkScore: number;
  styleType: string;
  language: string;
}

export interface MetricComparison {
  value: number;
  benchmark: {
    min: number;
    max: number;
    ideal: number;
  };
  benchmarkScore: number;
  status: 'good' | 'low' | 'high';
  deviation: number;
}

export interface ImprovementSuggestion {
  metric: string;
  status: string;
  currentValue: number;
  recommendedRange: string;
  idealValue: number;
  message: string;
}

// ============================================================================
// AI DETECTION TYPES
// ============================================================================

export interface AIDetectionResult {
  success: boolean;
  ai_probability: number;
  confidence: number;
  evidence: string[];
  human_indicators: string[];
  ai_indicators: string[];
  verdict: string;
  analysis_details: {
    multi_pass: boolean;
    key_factor: string | null;
    text_length: number;
    word_count: number;
  };
}

// ============================================================================
// REWRITE TYPES
// ============================================================================

export interface RewriteResult {
  success: boolean;
  original_text: string;
  rewritten_text: string;
  profile_name: string;
  tone: string;
  processing_time_ms: number;
  ai_check?: {
    ai_probability: number;
    confidence: number;
    human_indicators: string[];
    ai_indicators: string[];
  };
}

export interface WritingPreferences {
  useVocabularyPreferences: boolean;
  useKeyCharacteristics: boolean;
  useSentencePatterns: boolean;
  useRewriteInstructions: boolean;
}

// ============================================================================
// CREDIT TYPES
// ============================================================================

export interface Credits {
  balance: number;
  purchased: number;
  used: number;
  bonus?: number;
}

export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  bonus: number;
  description: string;
}

// ============================================================================
// CHAT TYPES
// ============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  profileId?: string;
}

// ============================================================================
// NOTE TYPES
// ============================================================================

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface AppError {
  name: string;
  message: string;
  code: string;
  details?: any;
  timestamp: string;
}

// ============================================================================
// CONFIG TYPES
// ============================================================================

export interface Config {
  IS_DEV: boolean;
  IS_PROD: boolean;
  MODE: string;
  API_BASE_URL: string;
  REQUEST_TIMEOUT: number;
  ENABLE_DEBUG_LOGS: boolean;
  FEATURES: {
    ENABLE_MONITORING: boolean;
    ENABLE_ERROR_TRACKING: boolean;
    ENABLE_ANALYTICS: boolean;
    ENABLE_CACHING: boolean;
  };
}
