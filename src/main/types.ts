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
 * Agent session status
 */
export type AgentStatus = 'idle' | 'running' | 'error'

/**
 * Runtime state for active agent sessions (in-memory only)
 */
export interface AgentSession {
  id: string
  cwd: string
  cliSessionId: string | null // codex's thread_id, used for resume
  status: AgentStatus
}
