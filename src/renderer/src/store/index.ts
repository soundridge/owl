import { create } from 'zustand'
import type {
  Workspace,
  Session,
  FileChange,
  BranchInfo,
  TerminalState,
  AsyncState,
} from '../types'
import { mockWorkspaces, mockFileChanges, mockBranchInfo } from './mock-data'

// ============================================
// Store State Interface
// ============================================

interface AppState {
  // Data
  workspaces: AsyncState<Workspace[]>
  changes: AsyncState<FileChange[]>
  branchInfo: AsyncState<BranchInfo>
  terminal: TerminalState

  // UI State
  activeWorkspaceId: string | null
  activeSessionId: string | null
  sidebarCollapsed: boolean

  // Computed (accessed via getters)
  getActiveWorkspace: () => Workspace | null
  getActiveSession: () => Session | null

  // Actions - Workspace
  setWorkspaces: (workspaces: Workspace[]) => void
  selectWorkspace: (workspaceId: string) => void
  addWorkspace: (workspace: Workspace) => void
  removeWorkspace: (workspaceId: string) => void

  // Actions - Session
  selectSession: (sessionId: string) => void
  addSession: (workspaceId: string, session: Session) => void
  updateSession: (sessionId: string, updates: Partial<Session>) => void
  removeSession: (sessionId: string) => void

  // Actions - Changes
  setChanges: (changes: FileChange[]) => void
  setChangesLoading: (loading: boolean) => void
  refreshChanges: () => void

  // Actions - Branch Info
  setBranchInfo: (branchInfo: BranchInfo) => void

  // Actions - Terminal
  setTerminal: (terminal: Partial<TerminalState>) => void

  // Actions - UI
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Actions - Loading States
  setWorkspacesLoading: (loading: boolean) => void
  setWorkspacesError: (error: string | null) => void

  // Demo helpers
  resetToMockData: () => void
}

// ============================================
// Helper Functions
// ============================================

const createAsyncState = <T>(data: T | null = null): AsyncState<T> => ({
  data,
  status: 'idle',
  error: null,
})

const initialTerminalState: TerminalState = {
  sessionId: null,
  ptyId: null,
  isConnected: false,
  status: 'idle',
}

// ============================================
// Store Implementation
// ============================================

export const useAppStore = create<AppState>((set, get) => ({
  // Initial Data
  workspaces: createAsyncState(mockWorkspaces),
  changes: createAsyncState(mockFileChanges),
  branchInfo: createAsyncState(mockBranchInfo),
  terminal: initialTerminalState,

  // Initial UI State
  activeWorkspaceId: mockWorkspaces[0]?.id ?? null,
  activeSessionId: mockWorkspaces[0]?.sessions[0]?.id ?? null,
  sidebarCollapsed: false,

  // Computed Getters
  getActiveWorkspace: () => {
    const { workspaces, activeWorkspaceId } = get()
    return workspaces.data?.find((w) => w.id === activeWorkspaceId) ?? null
  },

  getActiveSession: () => {
    const workspace = get().getActiveWorkspace()
    const { activeSessionId } = get()
    return workspace?.sessions.find((s) => s.id === activeSessionId) ?? null
  },

  // Workspace Actions
  setWorkspaces: (workspaces) =>
    set((state) => ({
      workspaces: { ...state.workspaces, data: workspaces, status: 'success' },
    })),

  selectWorkspace: (workspaceId) => {
    const workspace = get().workspaces.data?.find((w) => w.id === workspaceId)
    set({
      activeWorkspaceId: workspaceId,
      activeSessionId: workspace?.sessions[0]?.id ?? null,
    })
  },

  addWorkspace: (workspace) =>
    set((state) => ({
      workspaces: {
        ...state.workspaces,
        data: [...(state.workspaces.data ?? []), workspace],
      },
    })),

  removeWorkspace: (workspaceId) =>
    set((state) => ({
      workspaces: {
        ...state.workspaces,
        data: state.workspaces.data?.filter((w) => w.id !== workspaceId) ?? [],
      },
      activeWorkspaceId:
        state.activeWorkspaceId === workspaceId ? null : state.activeWorkspaceId,
    })),

  // Session Actions
  selectSession: (sessionId) => {
    set({
      activeSessionId: sessionId,
      terminal: {
        ...get().terminal,
        sessionId,
        isConnected: true,
        status: 'running',
      },
    })
    // Simulate loading changes
    get().setChangesLoading(true)
    setTimeout(() => {
      set((state) => ({
        changes: { ...state.changes, status: 'success' },
      }))
    }, 300)
  },

  addSession: (workspaceId, session) =>
    set((state) => ({
      workspaces: {
        ...state.workspaces,
        data:
          state.workspaces.data?.map((w) =>
            w.id === workspaceId ? { ...w, sessions: [...w.sessions, session] } : w
          ) ?? [],
      },
    })),

  updateSession: (sessionId, updates) =>
    set((state) => ({
      workspaces: {
        ...state.workspaces,
        data:
          state.workspaces.data?.map((w) => ({
            ...w,
            sessions: w.sessions.map((s) =>
              s.id === sessionId ? { ...s, ...updates } : s
            ),
          })) ?? [],
      },
    })),

  removeSession: (sessionId) =>
    set((state) => ({
      workspaces: {
        ...state.workspaces,
        data:
          state.workspaces.data?.map((w) => ({
            ...w,
            sessions: w.sessions.filter((s) => s.id !== sessionId),
          })) ?? [],
      },
      activeSessionId:
        state.activeSessionId === sessionId ? null : state.activeSessionId,
    })),

  // Changes Actions
  setChanges: (changes) =>
    set((state) => ({
      changes: { ...state.changes, data: changes, status: 'success' },
    })),

  setChangesLoading: (loading) =>
    set((state) => ({
      changes: { ...state.changes, status: loading ? 'loading' : 'success' },
    })),

  refreshChanges: () => {
    set((state) => ({ changes: { ...state.changes, status: 'loading' } }))
    setTimeout(() => {
      set((state) => ({ changes: { ...state.changes, status: 'success' } }))
    }, 500)
  },

  // Branch Info Actions
  setBranchInfo: (branchInfo) =>
    set((state) => ({
      branchInfo: { ...state.branchInfo, data: branchInfo, status: 'success' },
    })),

  // Terminal Actions
  setTerminal: (terminal) =>
    set((state) => ({
      terminal: { ...state.terminal, ...terminal },
    })),

  // UI Actions
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // Loading State Actions
  setWorkspacesLoading: (loading) =>
    set((state) => ({
      workspaces: { ...state.workspaces, status: loading ? 'loading' : 'success' },
    })),

  setWorkspacesError: (error) =>
    set((state) => ({
      workspaces: { ...state.workspaces, status: error ? 'error' : 'success', error },
    })),

  // Demo helpers
  resetToMockData: () =>
    set({
      workspaces: createAsyncState(mockWorkspaces),
      changes: createAsyncState(mockFileChanges),
      branchInfo: createAsyncState(mockBranchInfo),
      activeWorkspaceId: mockWorkspaces[0]?.id ?? null,
      activeSessionId: mockWorkspaces[0]?.sessions[0]?.id ?? null,
      terminal: {
        sessionId: mockWorkspaces[0]?.sessions[0]?.id ?? null,
        ptyId: null,
        isConnected: true,
        status: 'running',
      },
    }),
}))
