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
// Git Types
// ============================================

export interface MergeResult {
  success: boolean
  conflicted: boolean
  conflicts?: string[]
  message: string
}
