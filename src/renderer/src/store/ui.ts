import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean

  // Actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useUIStore = create<UIState>(set => ({
  sidebarCollapsed: false,

  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
}))
