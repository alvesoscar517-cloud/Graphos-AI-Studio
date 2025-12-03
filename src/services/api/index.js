/**
 * API Services Index
 * Re-exports all API functions for easy importing
 * 
 * Now supports both legacy client and new ky-based client
 */

// API Clients
export { apiClient, apiFetch } from './client';
export { kyClient } from './kyClient';

// Error Handling - All exports for flexibility
export { 
  ApiError,
  parseApiError,
  parseNetworkError,
  handleApiError,
  withErrorHandling,
  getErrorMessage,
  isRetryableError,
  requestDeduplicator,
  ERROR_MESSAGES,
} from './errorHandler';

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
