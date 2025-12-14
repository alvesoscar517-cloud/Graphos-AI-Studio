import { create } from 'zustand'

/**
 * Store to manage UI selection state
 * Used to coordinate between SelectionFloatingToolbar and ContextMenu
 * Only one should be visible at a time
 */
export const useUISelectionStore = create((set) => ({
  // Which UI element is currently active
  activeSelectionUI: null, // 'toolbar' | 'contextMenu' | null
  
  // Show floating toolbar (hides context menu)
  showToolbar: () => set({ activeSelectionUI: 'toolbar' }),
  
  // Show context menu (hides floating toolbar)
  showContextMenu: () => set({ activeSelectionUI: 'contextMenu' }),
  
  // Hide all selection UI
  hideAll: () => set({ activeSelectionUI: null }),
}))

// Selectors
export const useActiveSelectionUI = () => useUISelectionStore((state) => state.activeSelectionUI)
export const useIsToolbarActive = () => useUISelectionStore((state) => state.activeSelectionUI === 'toolbar' || state.activeSelectionUI === null)
export const useIsContextMenuActive = () => useUISelectionStore((state) => state.activeSelectionUI === 'contextMenu')

// Actions - use shallow comparison to prevent infinite loops
// Return stable reference by selecting individual functions
export const useUISelectionActions = () => {
  const showToolbar = useUISelectionStore((state) => state.showToolbar)
  const showContextMenu = useUISelectionStore((state) => state.showContextMenu)
  const hideAll = useUISelectionStore((state) => state.hideAll)
  return { showToolbar, showContextMenu, hideAll }
}
