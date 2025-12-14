/**
 * Custom Hooks Index
 * Re-exports all custom hooks
 * 
 * Preferred imports:
 * - Data fetching: use hooks from './queries' (TanStack Query)
 * - Forms: use hooks from './forms' (React Hook Form + Zod)
 * - State: use stores from '../stores' (Zustand)
 */

// ============================================
// TanStack Query hooks (preferred for data fetching)
// ============================================
export * from './queries'

// ============================================
// React Hook Form hooks (preferred for forms)
// ============================================
export * from './forms'

// ============================================
// Utility hooks
// ============================================
export { useLocalStorage } from './useLocalStorage'
export { useOnClickOutside, useClickOutside } from './useOnClickOutside'
export { useDebounce, useDebouncedCallback } from './useDebounce'
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, usePrefersDarkMode, usePrefersReducedMotion } from './useMediaQuery'
export { useCopyToClipboard } from './useCopyToClipboard'
export { useToggle, useDisclosure } from './useToggle'
export { usePrevious } from './usePrevious'
export { useFileUpload } from './useFileUpload'
export { useAsync, useAsyncRetry } from './useAsync'
export { useKeyboardShortcuts, useKeyPress, useEscapeKey, useEnterKey } from './useKeyboard'
export { useInfiniteScroll, useScrollPosition, useScrollToTop } from './useInfiniteScroll'
export { useConfirm, useSimpleConfirm } from './useConfirm'

// ============================================
// Form + Query combination hooks
// ============================================
export { useFormWithMutation } from './useFormWithMutation'
export { useOptimisticMutation, useListMutation } from './useOptimisticMutation'

// ============================================
// Auth & Session hooks
// ============================================
export { useSessionExpired } from './useSessionExpired'
export { useCredentials } from './useCredentials'

// ============================================
// Error Reporting hooks
// ============================================
export { useErrorReporter } from './useErrorReporter'

// Re-export auth storage utilities for convenience
export { 
  clearAuthStorage,
  setUserData,
  getUserData,
  setTokens,
  getTokens,
  clearTokens,
  setAuthMethod,
  getAuthMethod,
  hasStoredAuth,
  setActiveProfile,
  getActiveProfile,
  clearActiveProfile,
} from '../utils/authStorage'

// ============================================
// API Query hooks (TanStack Query based)
// ============================================
export {
  queryKeys,
  useUserInfo,
  useProfiles,
  useProfileDetail,
  useCreateProfile,
  useDeleteProfile,
  useAnalyzeText,
  useDetectAI,
  useRewriteText,
  useCreditBalance,
  useCreditHistory,
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  usePrefetchProfiles,
  useInvalidateAll,
} from './useApiQuery'

// ============================================
// Legacy hooks (for backward compatibility)
// Consider migrating to TanStack Query or Zustand
// ============================================
export { useApi, useFetch, useMutation } from './useApi'
export { useAutoScrollbar } from './useAutoScrollbar'
export { useNotification } from './useNotification'
export { usePaymentPolling } from './usePaymentPolling'
export { useTextStats } from './useTextStats'
export { useLanguage } from './useLanguage'
export { useSpeech } from './useSpeech'

// ============================================
// Editor hooks
// ============================================
export { useTextSelection } from './useTextSelection'
