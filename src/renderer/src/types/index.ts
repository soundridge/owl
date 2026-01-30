// ============================================
// Workspace & Session Types (PRD aligned)
// ============================================

/** Workspace represents a registered local git repository */
export interface Workspace {
  id: string
  name: string
  repoPath: string
  sessions: Session[]
}

/** Session represents a worktree-based working unit */
export interface Session {
  id: string
  name: string
  workspaceId: string
  branch: string
  worktreePath: string
  baseBranch: string
  status: SessionStatus
  createdAt: Date
}

export type SessionStatus = 'running' | 'stopped' | 'error'

// ============================================
// File Changes Types
// ============================================

export interface FileChange {
  path: string
  status: FileChangeStatus
  added: number
  removed: number
}

export type FileChangeStatus = 'added' | 'modified' | 'deleted' | 'renamed' | 'untracked'

// ============================================
// Terminal Types
// ============================================

export interface TerminalState {
  sessionId: string | null
  isConnected: boolean
  status: 'idle' | 'running' | 'error'
}

// ============================================
// UI State Types
// ============================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
  data: T | null
  status: LoadingState
  error: string | null
}

// ============================================
// Branch Info Types
// ============================================

export interface BranchInfo {
  current: string
  target: string
  ahead: number
  behind: number
}

// ============================================
// View Model Types (for renderer state)
// ============================================

export interface AppState {
  workspaces: AsyncState<Workspace[]>
  activeWorkspaceId: string | null
  activeSessionId: string | null
  changes: AsyncState<FileChange[]>
  terminal: TerminalState
  branchInfo: AsyncState<BranchInfo>
}

// ============================================
// Legacy types for backward compatibility
// ============================================

/** @deprecated Use Workspace instead */
export interface Project {
  id: string
  name: string
  workspaces: LegacyWorkspace[]
}

/** @deprecated Use Session instead */
export interface LegacyWorkspace {
  id: string
  name: string
  branch: string
  status: 'ready' | 'conflicts' | 'archived' | 'active'
  changes: {
    added: number
    removed: number
  }
  isActive?: boolean
}

// Chat types (kept for reference, not used in worktree manager)
export interface Message {
  id: string
  type: 'user' | 'assistant' | 'error'
  content: string
  timestamp: Date
  metadata?: {
    toolCalls?: number
    messages?: number
    filesChanged?: number
  }
}

// Terminal types (legacy)
export interface TerminalLine {
  id: string
  type: 'prompt' | 'command' | 'output'
  content: string
  branch?: string
}
