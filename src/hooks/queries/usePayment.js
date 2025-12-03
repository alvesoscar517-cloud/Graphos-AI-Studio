/**
 * Payment Query Hook
 * TanStack Query hook for payment and subscription management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import apiClient from '@/services/api/client'
import { getUserInfo } from '@/services/api'

// Default packages với variant IDs
const DEFAULT_PACKAGES = [
  { id: 'basic', credits: 100, price: 4.99, bonus: 0, totalCredits: 100, description: 'Basic', icon: 'zap' },
  { id: 'pro', credits: 500, price: 19.99, bonus: 50, totalCredits: 550, description: 'Pro', popular: true, icon: 'star' },
  { id: 'pro_plus', credits: 1500, price: 49.99, bonus: 300, totalCredits: 1800, description: 'Pro+', icon: 'award' },
  { id: 'power', credits: 5000, price: 149.99, bonus: 1500, totalCredits: 6500, description: 'Power', icon: 'rocket' }
]

/**
 * Fetch credit packages
 */
export function usePackages() {
  return useQuery({
    queryKey: queryKeys.payment.packages(),
    queryFn: async () => {
      const { data } = await apiClient.get('/api/credits/packages')
      if (data.packages?.length > 0) {
        const defaultMap = DEFAULT_PACKAGES.reduce((acc, pkg) => ({ ...acc, [pkg.id]: pkg }), {})
        return data.packages.map((pkg) => ({ ...defaultMap[pkg.id], ...pkg }))
      }
      return DEFAULT_PACKAGES
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    placeholderData: DEFAULT_PACKAGES,
  })
}

/**
 * Create checkout session for package purchase
 * Note: No retry for payment endpoints to prevent duplicate charges
 */
export function useCreateCheckout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ packageId, variantId }) => {
      const userInfo = await getUserInfo()
      // Disable retry for payment to prevent duplicate charges
      const { data } = await apiClient.post('/api/payment/checkout', {
        packageId,
        variantId,
        userId: userInfo.userId,
        email: userInfo.email
      }, { retry: false })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.credits() })
    },
    // Don't retry on error - payment endpoints should not be retried automatically
    retry: false,
  })
}

/**
 * Fetch current subscription status
 */
export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.payment.subscription(),
    queryFn: async () => {
      const { data } = await apiClient.get('/api/subscription')
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch available plans
 */
export function usePlans() {
  return useQuery({
    queryKey: queryKeys.payment.plans(),
    queryFn: async () => {
      const { data } = await apiClient.get('/api/plans')
      return data.plans || []
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - plans don't change often
  })
}

/**
 * Fetch payment history
 */
export function usePaymentHistory() {
  return useQuery({
    queryKey: queryKeys.payment.history(),
    queryFn: async () => {
      const { data } = await apiClient.get('/api/payments/history')
      return data.payments || []
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Create payment/checkout session
 */
export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ planId, paymentMethod }) => {
      const { data } = await apiClient.post('/api/payments/create', {
        planId,
        paymentMethod,
      })
      return data
    },
    onSuccess: () => {
      // Invalidate related queries after payment
      queryClient.invalidateQueries({ queryKey: queryKeys.payment.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.user.credits() })
    },
  })
}

/**
 * Verify payment status
 */
export function useVerifyPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (paymentId) => {
      const { data } = await apiClient.get(`/api/payments/verify/${paymentId}`)
      return data
    },
    onSuccess: (data) => {
      if (data.status === 'completed') {
        // Refresh credits and subscription after successful payment
        queryClient.invalidateQueries({ queryKey: queryKeys.user.credits() })
        queryClient.invalidateQueries({ queryKey: queryKeys.payment.subscription() })
        queryClient.invalidateQueries({ queryKey: queryKeys.payment.history() })
      }
    },
  })
}

/**
 * Cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/api/subscription/cancel')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payment.subscription() })
    },
  })
}

/**
 * Hook to check if user has active subscription
 */
export function useHasSubscription() {
  const { data: subscription, isLoading } = useSubscription()

  return {
    hasSubscription: subscription?.status === 'active',
    subscription,
    isLoading,
  }
}

export default useSubscription
