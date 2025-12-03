/**
 * API Query Hooks using TanStack Query
 * Provides caching, deduplication, and automatic refetching
 * 
 * Benefits over manual API calls:
 * - Automatic request deduplication
 * - Built-in caching with configurable TTL
 * - Automatic background refetching
 * - Optimistic updates support
 * - Error retry with exponential backoff
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api/client';
import { getUserInfo } from '../services/api/auth';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const queryKeys = {
  // User
  user: ['user'],
  userInfo: () => [...queryKeys.user, 'info'],
  
  // Profiles
  profiles: ['profiles'],
  profileList: () => [...queryKeys.profiles, 'list'],
  profileDetail: (id) => [...queryKeys.profiles, 'detail', id],
  
  // Analysis
  analysis: ['analysis'],
  analyzeText: (profileId, textHash) => [...queryKeys.analysis, 'text', profileId, textHash],
  detectAI: (textHash) => [...queryKeys.analysis, 'detect', textHash],
  
  // Credits
  credits: ['credits'],
  creditBalance: () => [...queryKeys.credits, 'balance'],
  creditHistory: () => [...queryKeys.credits, 'history'],
  
  // Notifications
  notifications: ['notifications'],
  notificationList: () => [...queryKeys.notifications, 'list'],
  unreadCount: () => [...queryKeys.notifications, 'unread'],
};

// ============================================================================
// QUERY OPTIONS
// ============================================================================

const defaultOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
  retry: 2,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// ============================================================================
// USER HOOKS
// ============================================================================

/**
 * Get current user info
 */
export function useUserInfo() {
  return useQuery({
    queryKey: queryKeys.userInfo(),
    queryFn: getUserInfo,
    ...defaultOptions,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ============================================================================
// PROFILE HOOKS
// ============================================================================

/**
 * Get all profiles for current user
 */
export function useProfiles() {
  return useQuery({
    queryKey: queryKeys.profileList(),
    queryFn: async () => {
      const userInfo = await getUserInfo();
      if (!userInfo?.userId) return [];
      
      const { data } = await apiClient.get(`/get_profiles?user_id=${userInfo.userId}`);
      return data.profiles || [];
    },
    ...defaultOptions,
  });
}

/**
 * Get profile details
 */
export function useProfileDetail(profileId) {
  return useQuery({
    queryKey: queryKeys.profileDetail(profileId),
    queryFn: async () => {
      const { data } = await apiClient.get(`/get_profile?profile_id=${profileId}`);
      return data.profile;
    },
    enabled: !!profileId,
    ...defaultOptions,
  });
}

/**
 * Create profile mutation
 */
export function useCreateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, theme, samples }) => {
      const userInfo = await getUserInfo();
      if (!userInfo?.userId) throw new Error('User not authenticated');
      
      const { data } = await apiClient.post('/create_profile_complete', {
        profile_name: name,
        email: userInfo.email,
        name: userInfo.name,
        theme,
        samples,
      });
      
      return data;
    },
    onSuccess: () => {
      // Invalidate profiles list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.profileList() });
    },
  });
}

/**
 * Delete profile mutation
 */
export function useDeleteProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileId) => {
      const { data } = await apiClient.post('/delete_profile', { profile_id: profileId });
      return data;
    },
    onSuccess: (_, profileId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profileList() });
      queryClient.removeQueries({ queryKey: queryKeys.profileDetail(profileId) });
    },
  });
}

// ============================================================================
// ANALYSIS HOOKS
// ============================================================================

/**
 * Analyze text mutation (not cached - each analysis is unique)
 */
export function useAnalyzeText() {
  return useMutation({
    mutationFn: async ({ profileId, text }) => {
      const { data } = await apiClient.post('/analyze', {
        profile_id: profileId,
        text,
      });
      return data;
    },
  });
}

/**
 * AI detection mutation
 */
export function useDetectAI() {
  return useMutation({
    mutationFn: async ({ text, enhanced = true }) => {
      const lang = localStorage.getItem('i18nextLng') || 'en';
      
      const { data } = await apiClient.post('/authenticate', {
        text,
        enhanced,
        language: lang.substring(0, 2),
      });
      
      return data;
    },
  });
}

/**
 * Rewrite text mutation
 */
export function useRewriteText() {
  return useMutation({
    mutationFn: async ({ profileId, text, model = 'gemini-2.5-flash', writingPreferences }) => {
      const { data } = await apiClient.post('/rewrite', {
        profile_id: profileId,
        text,
        model,
        writing_preferences: writingPreferences,
      });
      return data;
    },
  });
}

// ============================================================================
// CREDIT HOOKS
// ============================================================================

/**
 * Get credit balance
 */
export function useCreditBalance() {
  return useQuery({
    queryKey: queryKeys.creditBalance(),
    queryFn: async () => {
      const { data } = await apiClient.get('/api/credits/balance');
      return data;
    },
    ...defaultOptions,
    staleTime: 1 * 60 * 1000, // 1 minute - credits change frequently
  });
}

/**
 * Get credit history
 */
export function useCreditHistory() {
  return useQuery({
    queryKey: queryKeys.creditHistory(),
    queryFn: async () => {
      const { data } = await apiClient.get('/api/credits/history');
      return data.history || [];
    },
    ...defaultOptions,
  });
}

// ============================================================================
// NOTIFICATION HOOKS
// ============================================================================

/**
 * Get notifications
 */
export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: [...queryKeys.notificationList(), { unreadOnly }],
    queryFn: async () => {
      const params = new URLSearchParams({ unread_only: unreadOnly.toString() });
      const { data } = await apiClient.get(`/api/notifications?${params}`);
      return {
        notifications: data.notifications || [],
        unreadCount: data.unreadCount || 0,
      };
    },
    ...defaultOptions,
    staleTime: 30 * 1000, // 30 seconds - notifications should be fresh
  });
}

/**
 * Mark notification as read mutation
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId) => {
      await apiClient.post(`/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationList() });
    },
  });
}

/**
 * Mark all notifications as read mutation
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/api/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationList() });
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Prefetch profiles on mount
 */
export function usePrefetchProfiles() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.profileList(),
      queryFn: async () => {
        const userInfo = await getUserInfo();
        if (!userInfo?.userId) return [];
        
        const { data } = await apiClient.get(`/get_profiles?user_id=${userInfo.userId}`);
        return data.profiles || [];
      },
    });
  };
}

/**
 * Invalidate all queries (useful after logout)
 */
export function useInvalidateAll() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries();
  };
}

export default {
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
};
