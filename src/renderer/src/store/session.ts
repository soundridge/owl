import type { Session } from '../types'
import { create } from 'zustand'
import { ipcServices } from '../lib/ipcClient'
import { useWorkspaceStore } from './workspace'

interface SessionState {
  activeSessionId: string | null

  // Actions
  createSession: (workspaceId: string, name?: string) => Promise<{ ok: boolean, error?: string }>
  selectSession: (id: string) => void
  deleteSession: (id: string) => Promise<{ ok: boolean, error?: string }>

  // Computed
  getActiveSession: () => Session | null
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSessionId: null,

  createSession: async (workspaceId: string, name?: string) => {
    if (!ipcServices) {
      return { ok: false, error: 'IPC not available' }
    }

    try {
      const result = await ipcServices.session.create(workspaceId, name)
      if (result.ok && result.data) {
        const session: Session = {
          ...result.data,
          baseBranch: '',
          createdAt: new Date(),
          status: 'running',
        }

        // Add session to workspace store
        useWorkspaceStore.getState().addSessionToWorkspace(workspaceId, session)

        // Select the new session
        set({
          activeSessionId: session.id,
        })

        // Also select the workspace
        useWorkspaceStore.setState({ activeWorkspaceId: workspaceId })

        return { ok: true }
      }
      else {
        return { ok: false, error: result.error || 'Failed to create session' }
      }
    }
    catch (error) {
      return { ok: false, error: String(error) }
    }
  },

  selectSession: (id: string) => {
    set({ activeSessionId: id })
  },

  deleteSession: async (id: string) => {
    // TODO: Implement IPC call to delete session
    // For now, just remove from local state
    useWorkspaceStore.getState().removeSessionFromWorkspace(id)

    const { activeSessionId } = get()
    if (activeSessionId === id) {
      set({ activeSessionId: null })
    }

    return { ok: true }
  },

  getActiveSession: () => {
    const { activeSessionId } = get()
    const workspace = useWorkspaceStore.getState().getActiveWorkspace()
    return workspace?.sessions.find(s => s.id === activeSessionId) ?? null
  },
}))
