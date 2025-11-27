/**
 * API Services Index
 * Re-exports all API functions for easy importing
 */

// API Client
export { apiClient, apiFetch } from './client';

// Auth
export { getUserInfo } from './auth';

// Analysis
export { 
  analyzeText, 
  detectAI, 
  getSuggestions,
  analyzeTextBatch,
  analyzeTextOptimized,
  getSuggestionsOptimized
} from './analysis';

// Validation
export { 
  validateTextBeforeAI,
  splitTextForModel,
  validateProfileData,
  validateSampleData
} from './validation';

// Profile (if exists)
export * from './profile';

// Rewrite (if exists)
export * from './rewrite';

// Chat (if exists)
export * from './chat';
