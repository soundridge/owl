import type { AsyncState, Session, Workspace } from '../types'
import { create } from 'zustand'
import { ipcServices } from '../lib/ipcClient'

interface WorkspaceState {
  workspaces: AsyncState<Workspace[]>
  activeWorkspaceId: string | null

  // Actions
  fetchWorkspaces: () => Promise<void>
  addWorkspace: (path: string) => Promise<{ ok: boolean, error?: string }>
  removeWorkspace: (id: string) => void
  selectWorkspace: (id: string) => void

  // Session mutations (called by sessionStore)
  addSessionToWorkspace: (workspaceId: string, session: Session) => void
  updateSessionInWorkspace: (sessionId: string, updates: Partial<Session>) => void
  removeSessionFromWorkspace: (sessionId: string) => void

  // Computed
  getActiveWorkspace: () => Workspace | null
}

function createAsyncState<T>(data: T | null = null, status: 'idle' | 'loading' | 'success' | 'error' = 'idle'): AsyncState<T> {
  return { data, status, error: null }
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: createAsyncState<Workspace[]>([], 'idle'),
  activeWorkspaceId: null,

  fetchWorkspaces: async () => {
    if (!ipcServices) {
      set(state => ({
        workspaces: { ...state.workspaces, status: 'error', error: 'IPC not available' },
      }))
      return
    }

    set(state => ({
      workspaces: { ...state.workspaces, status: 'loading' },
    }))

    try {
      const result = await ipcServices.workspace.list()
      if (result.ok && result.data) {
        const workspaces: Workspace[] = result.data.map(ws => ({
          ...ws,
          sessions: [],
        }))
        set(state => ({
          workspaces: { ...state.workspaces, data: workspaces, status: 'success' },
          activeWorkspaceId: state.activeWorkspaceId ?? workspaces[0]?.id ?? null,
        }))
      }
      else {
        set(state => ({
          workspaces: { ...state.workspaces, status: 'error', error: result.error || 'Failed to fetch workspaces' },
        }))
      }
    }
    catch (error) {
      set(state => ({
        workspaces: { ...state.workspaces, status: 'error', error: String(error) },
      }))
    }
  },

  addWorkspace: async (path: string) => {
    if (!ipcServices) {
      return { ok: false, error: 'IPC not available' }
    }

    try {
      const result = await ipcServices.workspace.add(path)
      if (result.ok && result.data) {
        const workspace: Workspace = {
          ...result.data,
          sessions: [],
        }
        set(state => ({
          workspaces: {
            ...state.workspaces,
            data: [...(state.workspaces.data ?? []), workspace],
          },
          activeWorkspaceId: workspace.id,
        }))
        return { ok: true }
      }
      else {
        return { ok: false, error: result.error || 'Failed to add workspace' }
      }
    }
    catch (error) {
      return { ok: false, error: String(error) }
    }
  },

  removeWorkspace: (id: string) => {
    set(state => ({
      workspaces: {
        ...state.workspaces,
        data: state.workspaces.data?.filter(w => w.id !== id) ?? [],
      },
      activeWorkspaceId: state.activeWorkspaceId === id ? null : state.activeWorkspaceId,
    }))
  },

  selectWorkspace: (id: string) => {
    const workspace = get().workspaces.data?.find(w => w.id === id)
    set({
      activeWorkspaceId: id,
    })
    // Return first session id for sessionStore to use
    return workspace?.sessions[0]?.id ?? null
  },

  // Session mutations
  addSessionToWorkspace: (workspaceId: string, session: Session) => {
    set(state => ({
      workspaces: {
        ...state.workspaces,
        data: state.workspaces.data?.map(w =>
          w.id === workspaceId ? { ...w, sessions: [...w.sessions, session] } : w,
        ) ?? [],
      },
    }))
  },

  updateSessionInWorkspace: (sessionId: string, updates: Partial<Session>) => {
    set(state => ({
      workspaces: {
        ...state.workspaces,
        data: state.workspaces.data?.map(w => ({
          ...w,
          sessions: w.sessions.map(s =>
            s.id === sessionId ? { ...s, ...updates } : s,
          ),
        })) ?? [],
      },
    }))
  },

  removeSessionFromWorkspace: (sessionId: string) => {
    set(state => ({
      workspaces: {
        ...state.workspaces,
        data: state.workspaces.data?.map(w => ({
          ...w,
          sessions: w.sessions.filter(s => s.id !== sessionId),
        })) ?? [],
      },
    }))
  },

  getActiveWorkspace: () => {
    const { workspaces, activeWorkspaceId } = get()
    return workspaces.data?.find(w => w.id === activeWorkspaceId) ?? null
  },
}))
