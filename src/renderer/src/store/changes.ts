import type { AsyncState, BranchInfo, FileChange } from '../types'
import { create } from 'zustand'

interface ChangesState {
  changes: AsyncState<FileChange[]>
  branchInfo: AsyncState<BranchInfo>

  // Actions
  fetchChanges: (worktreePath: string) => Promise<void>
  refreshChanges: () => void
  fetchBranchInfo: (worktreePath: string) => Promise<void>
  setChangesLoading: (loading: boolean) => void
}

function createAsyncState<T>(data: T | null = null, status: 'idle' | 'loading' | 'success' | 'error' = 'idle'): AsyncState<T> {
  return { data, status, error: null }
}

export const useChangesStore = create<ChangesState>((set, get) => ({
  changes: createAsyncState<FileChange[]>([], 'idle'),
  branchInfo: createAsyncState<BranchInfo>(null, 'idle'),

  fetchChanges: async (_worktreePath: string) => {
    set(state => ({ changes: { ...state.changes, status: 'loading' } }))

    // TODO: Implement actual IPC call to get git status
    setTimeout(() => {
      set(state => ({ changes: { ...state.changes, status: 'success' } }))
    }, 300)
  },

  refreshChanges: () => {
    const { changes } = get()
    set({ changes: { ...changes, status: 'loading' } })

    // TODO: Implement actual refresh
    setTimeout(() => {
      set(state => ({ changes: { ...state.changes, status: 'success' } }))
    }, 500)
  },

  fetchBranchInfo: async (_worktreePath: string) => {
    set(state => ({ branchInfo: { ...state.branchInfo, status: 'loading' } }))

    // TODO: Implement actual IPC call
    setTimeout(() => {
      set(state => ({ branchInfo: { ...state.branchInfo, status: 'success' } }))
    }, 300)
  },

  setChangesLoading: (loading: boolean) => {
    set(state => ({
      changes: { ...state.changes, status: loading ? 'loading' : 'success' },
    }))
  },
}))
