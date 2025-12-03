/**
 * UI Store (Zustand)
 * Global UI state management
 * 
 * Uses useShallow for all selectors to prevent unnecessary re-renders
 */

import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

export const useUIStore = create((set, get) => ({
  // Sidebar state
  sidebarOpen: true,
  sidebarTab: 'history', // 'history' | 'notes' | 'settings'

  // Modal states
  activeModal: null, // 'upgrade' | 'settings' | 'profile' | null
  modalData: null,

  // Loading states
  globalLoading: false,
  loadingMessage: '',

  // Toast/Notification queue
  toasts: [],

  // Actions - Sidebar
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  // Actions - Modal
  openModal: (modalName, data = null) => set({ activeModal: modalName, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  // Actions - Loading
  setGlobalLoading: (loading, message = '') => set({ globalLoading: loading, loadingMessage: message }),

  // Actions - Toast
  addToast: (toast) => {
    const id = Date.now().toString()
    const newToast = { id, ...toast }
    set((state) => ({ toasts: [...state.toasts, newToast] }))

    // Auto remove after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      get().removeToast(id)
    }, duration)

    return id
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },

  // Convenience toast methods
  showSuccess: (message, options = {}) => {
    return get().addToast({ type: 'success', message, ...options })
  },

  showError: (message, options = {}) => {
    return get().addToast({ type: 'error', message, ...options })
  },

  showWarning: (message, options = {}) => {
    return get().addToast({ type: 'warning', message, ...options })
  },

  showInfo: (message, options = {}) => {
    return get().addToast({ type: 'info', message, ...options })
  },
}))

// ============================================================================
// OPTIMIZED SELECTORS - All use useShallow to prevent unnecessary re-renders
// ============================================================================

export const useSidebar = () => useUIStore(useShallow((state) => ({
  sidebarOpen: state.sidebarOpen,
  sidebarTab: state.sidebarTab,
  toggleSidebar: state.toggleSidebar,
  setSidebarOpen: state.setSidebarOpen,
  setSidebarTab: state.setSidebarTab,
})))

export const useModal = () => useUIStore(useShallow((state) => ({
  activeModal: state.activeModal,
  modalData: state.modalData,
  openModal: state.openModal,
  closeModal: state.closeModal,
})))

export const useToasts = () => useUIStore(useShallow((state) => ({
  toasts: state.toasts,
  addToast: state.addToast,
  removeToast: state.removeToast,
  showSuccess: state.showSuccess,
  showError: state.showError,
  showWarning: state.showWarning,
  showInfo: state.showInfo,
})))

// Global loading state selector
export const useGlobalLoading = () => useUIStore(useShallow((state) => ({
  globalLoading: state.globalLoading,
  loadingMessage: state.loadingMessage,
  setGlobalLoading: state.setGlobalLoading,
})))

// All UI state (use sparingly - prefer specific selectors)
export const useAllUIState = () => useUIStore(useShallow((state) => ({
  sidebarOpen: state.sidebarOpen,
  sidebarTab: state.sidebarTab,
  activeModal: state.activeModal,
  modalData: state.modalData,
  globalLoading: state.globalLoading,
  loadingMessage: state.loadingMessage,
  toasts: state.toasts,
})))

// All UI actions
export const useUIActions = () => useUIStore(useShallow((state) => ({
  toggleSidebar: state.toggleSidebar,
  setSidebarOpen: state.setSidebarOpen,
  setSidebarTab: state.setSidebarTab,
  openModal: state.openModal,
  closeModal: state.closeModal,
  setGlobalLoading: state.setGlobalLoading,
  addToast: state.addToast,
  removeToast: state.removeToast,
  showSuccess: state.showSuccess,
  showError: state.showError,
  showWarning: state.showWarning,
  showInfo: state.showInfo,
})))

export default useUIStore
