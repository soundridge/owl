import { useState, useCallback, useMemo } from 'react'
import type {
  Workspace,
  FileChange,
  BranchInfo,
  AppState,
  LoadingState,
  AsyncState,
  TerminalState,
} from '../types'
import { mockWorkspaces, mockFileChanges, mockBranchInfo } from './mock-data'

// ============================================
// Initial State
// ============================================

const initialTerminalState: TerminalState = {
  sessionId: null,
  isConnected: false,
  status: 'idle',
}

const createAsyncState = <T>(data: T | null = null): AsyncState<T> => ({
  data,
  status: 'idle',
  error: null,
})

// ============================================
// Store Hook
// ============================================

export function useAppStore() {
  // Workspace state
  const [workspaces, setWorkspaces] = useState<AsyncState<Workspace[]>>(
    createAsyncState(mockWorkspaces)
  )
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
    mockWorkspaces[0]?.id ?? null
  )
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    mockWorkspaces[0]?.sessions[0]?.id ?? null
  )

  // Changes state
  const [changes, setChanges] = useState<AsyncState<FileChange[]>>(
    createAsyncState(mockFileChanges)
  )

  // Terminal state
  const [terminal, setTerminal] = useState<TerminalState>(initialTerminalState)

  // Branch info state
  const [branchInfo, setBranchInfo] = useState<AsyncState<BranchInfo>>(
    createAsyncState(mockBranchInfo)
  )

  // ============================================
  // Computed Values
  // ============================================

  const activeWorkspace = useMemo(() => {
    return workspaces.data?.find((w) => w.id === activeWorkspaceId) ?? null
  }, [workspaces.data, activeWorkspaceId])

  const activeSession = useMemo(() => {
    return activeWorkspace?.sessions.find((s) => s.id === activeSessionId) ?? null
  }, [activeWorkspace, activeSessionId])

  // ============================================
  // Actions
  // ============================================

  // Workspace actions
  const selectWorkspace = useCallback((workspaceId: string) => {
    setActiveWorkspaceId(workspaceId)
    // Reset session when workspace changes
    const workspace = mockWorkspaces.find((w) => w.id === workspaceId)
    setActiveSessionId(workspace?.sessions[0]?.id ?? null)
  }, [])

  const addWorkspace = useCallback(() => {
    // Mock: just toggle loading state for demo
    setWorkspaces((prev) => ({ ...prev, status: 'loading' }))
    setTimeout(() => {
      setWorkspaces((prev) => ({ ...prev, status: 'success' }))
    }, 1000)
  }, [])

  const removeWorkspace = useCallback((workspaceId: string) => {
    setWorkspaces((prev) => ({
      ...prev,
      data: prev.data?.filter((w) => w.id !== workspaceId) ?? null,
    }))
  }, [])

  // Session actions
  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId)
    // Update terminal connection
    setTerminal((prev) => ({
      ...prev,
      sessionId,
      isConnected: true,
      status: 'running',
    }))
    // Simulate loading changes for the session
    setChanges((prev) => ({ ...prev, status: 'loading' }))
    setTimeout(() => {
      setChanges(createAsyncState(mockFileChanges))
    }, 500)
  }, [])

  const createSession = useCallback(() => {
    // Mock: toggle loading state for demo
    setWorkspaces((prev) => ({ ...prev, status: 'loading' }))
    setTimeout(() => {
      setWorkspaces((prev) => ({ ...prev, status: 'success' }))
    }, 1000)
  }, [])

  const closeSession = useCallback((sessionId: string) => {
    if (sessionId === activeSessionId) {
      setTerminal(initialTerminalState)
    }
  }, [activeSessionId])

  // Changes actions
  const refreshChanges = useCallback(() => {
    setChanges((prev) => ({ ...prev, status: 'loading' }))
    setTimeout(() => {
      setChanges(createAsyncState(mockFileChanges))
    }, 500)
  }, [])

  // Demo state toggles
  const setLoadingState = useCallback((target: 'workspaces' | 'changes' | 'branchInfo', status: LoadingState) => {
    switch (target) {
      case 'workspaces':
        setWorkspaces((prev) => ({ ...prev, status, error: status === 'error' ? 'Failed to load workspaces' : null }))
        break
      case 'changes':
        setChanges((prev) => ({ ...prev, status, error: status === 'error' ? 'Failed to read git status' : null }))
        break
      case 'branchInfo':
        setBranchInfo((prev) => ({ ...prev, status, error: status === 'error' ? 'Failed to get branch info' : null }))
        break
    }
  }, [])

  const setEmptyState = useCallback((target: 'workspaces' | 'sessions' | 'changes') => {
    switch (target) {
      case 'workspaces':
        setWorkspaces(createAsyncState([]))
        break
      case 'sessions':
        if (activeWorkspace) {
          setWorkspaces((prev) => ({
            ...prev,
            data: prev.data?.map((w) =>
              w.id === activeWorkspaceId ? { ...w, sessions: [] } : w
            ) ?? null,
          }))
        }
        break
      case 'changes':
        setChanges(createAsyncState([]))
        break
    }
  }, [activeWorkspaceId, activeWorkspace])

  const resetToMockData = useCallback(() => {
    setWorkspaces(createAsyncState(mockWorkspaces))
    setChanges(createAsyncState(mockFileChanges))
    setBranchInfo(createAsyncState(mockBranchInfo))
    setActiveWorkspaceId(mockWorkspaces[0]?.id ?? null)
    setActiveSessionId(mockWorkspaces[0]?.sessions[0]?.id ?? null)
    setTerminal({
      sessionId: mockWorkspaces[0]?.sessions[0]?.id ?? null,
      isConnected: true,
      status: 'running',
    })
  }, [])

  return {
    // State
    workspaces,
    activeWorkspaceId,
    activeSessionId,
    activeWorkspace,
    activeSession,
    changes,
    terminal,
    branchInfo,

    // Actions
    selectWorkspace,
    addWorkspace,
    removeWorkspace,
    selectSession,
    createSession,
    closeSession,
    refreshChanges,

    // Demo helpers
    setLoadingState,
    setEmptyState,
    resetToMockData,
  }
}

// Re-export types
export type { AppState, LoadingState, AsyncState }
