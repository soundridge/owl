/**
 * Data models for CLI Worktree Manager
 * Based on: docs/cli-worktree-manager-tech.md
 */

/**
 * Workspace - A registered local git repository
 */
export interface Workspace {
  id: string
  name: string
  repoPath: string
}

/**
 * Session status enum
 */
export type SessionStatus = 'idle' | 'running' | 'error'

/**
 * Session - A worktree-based work unit
 */
export interface Session {
  id: string
  name: string
  workspaceId: string
  branch: string
  worktreePath: string
  status: SessionStatus
}

/**
 * Unified IPC result structure
 */
export interface IpcResult<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}

/**
 * Git status file entry
 */
export interface GitStatusEntry {
  path: string
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'untracked'
  staged: boolean
}

/**
 * Git merge result
 */
export interface GitMergeResult {
  success: boolean
  conflicted: boolean
  message: string
}

/**
 * Session delete options
 */
export interface SessionDeleteOptions {
  removeWorktree?: boolean
  removeBranch?: boolean
}

/**
 * Terminal resize parameters
 */
export interface TerminalResizeParams {
  cols: number
  rows: number
}

/**
 * Runtime state for active PTY sessions (in-memory only)
 */
export interface PtySession {
  ptyId: string
  sessionId: string
  pid: number
}
