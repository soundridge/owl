/**
 * Store service - Manages persistence for Workspace and Session data
 * Based on: docs/cli-worktree-manager-tech.md Section 6
 *
 * Note: This is a skeleton implementation using in-memory storage.
 * Real file persistence will be implemented in a later phase.
 * Persistence file: app.getPath('userData')/workspaces.json
 */

import type { IpcResult, Session, Workspace } from '../types'

/**
 * Store service for managing Workspace and Session data
 */
export class StoreService {
  // In-memory storage (mock persistence)
  private workspaces: Map<string, Workspace> = new Map()
  private sessions: Map<string, Session> = new Map()

  // ============ Workspace Methods ============

  /**
   * List all workspaces
   */
  async listWorkspaces(): Promise<IpcResult<Workspace[]>> {
    const workspaces = Array.from(this.workspaces.values())
    return { ok: true, data: workspaces }
  }

  /**
   * Get a workspace by ID
   */
  async getWorkspace(id: string): Promise<IpcResult<Workspace | null>> {
    if (!id || typeof id !== 'string') {
      return { ok: false, error: 'Invalid id: must be a non-empty string' }
    }
    const workspace = this.workspaces.get(id) || null
    return { ok: true, data: workspace }
  }

  /**
   * Add a new workspace
   */
  async addWorkspace(workspace: Workspace): Promise<IpcResult<Workspace>> {
    if (!workspace) {
      return { ok: false, error: 'Invalid workspace: workspace object is required' }
    }
    if (!workspace.id || typeof workspace.id !== 'string') {
      return { ok: false, error: 'Invalid workspace.id: must be a non-empty string' }
    }
    if (!workspace.name || typeof workspace.name !== 'string') {
      return { ok: false, error: 'Invalid workspace.name: must be a non-empty string' }
    }
    if (!workspace.repoPath || typeof workspace.repoPath !== 'string') {
      return { ok: false, error: 'Invalid workspace.repoPath: must be a non-empty string' }
    }
    if (this.workspaces.has(workspace.id)) {
      return { ok: false, error: `Workspace with id '${workspace.id}' already exists` }
    }
    this.workspaces.set(workspace.id, workspace)
    return { ok: true, data: workspace }
  }

  /**
   * Update an existing workspace
   */
  async updateWorkspace(workspace: Workspace): Promise<IpcResult<Workspace>> {
    if (!workspace) {
      return { ok: false, error: 'Invalid workspace: workspace object is required' }
    }
    if (!workspace.id || typeof workspace.id !== 'string') {
      return { ok: false, error: 'Invalid workspace.id: must be a non-empty string' }
    }
    if (!this.workspaces.has(workspace.id)) {
      return { ok: false, error: `Workspace with id '${workspace.id}' not found` }
    }
    this.workspaces.set(workspace.id, workspace)
    return { ok: true, data: workspace }
  }

  /**
   * Remove a workspace by ID
   */
  async removeWorkspace(id: string): Promise<IpcResult<void>> {
    if (!id || typeof id !== 'string') {
      return { ok: false, error: 'Invalid id: must be a non-empty string' }
    }
    if (!this.workspaces.has(id)) {
      return { ok: false, error: `Workspace with id '${id}' not found` }
    }
    this.workspaces.delete(id)
    // Also remove all sessions associated with this workspace
    for (const [sessionId, session] of this.sessions) {
      if (session.workspaceId === id) {
        this.sessions.delete(sessionId)
      }
    }
    return { ok: true }
  }

  // ============ Session Methods ============

  /**
   * List all sessions for a workspace
   */
  async listSessions(workspaceId: string): Promise<IpcResult<Session[]>> {
    if (!workspaceId || typeof workspaceId !== 'string') {
      return { ok: false, error: 'Invalid workspaceId: must be a non-empty string' }
    }
    const sessions = Array.from(this.sessions.values()).filter(
      s => s.workspaceId === workspaceId,
    )
    return { ok: true, data: sessions }
  }

  /**
   * Get a session by ID
   */
  async getSession(id: string): Promise<IpcResult<Session | null>> {
    if (!id || typeof id !== 'string') {
      return { ok: false, error: 'Invalid id: must be a non-empty string' }
    }
    const session = this.sessions.get(id) || null
    return { ok: true, data: session }
  }

  /**
   * Add a new session
   */
  async addSession(session: Session): Promise<IpcResult<Session>> {
    if (!session) {
      return { ok: false, error: 'Invalid session: session object is required' }
    }
    if (!session.id || typeof session.id !== 'string') {
      return { ok: false, error: 'Invalid session.id: must be a non-empty string' }
    }
    if (!session.name || typeof session.name !== 'string') {
      return { ok: false, error: 'Invalid session.name: must be a non-empty string' }
    }
    if (!session.workspaceId || typeof session.workspaceId !== 'string') {
      return { ok: false, error: 'Invalid session.workspaceId: must be a non-empty string' }
    }
    if (!session.branch || typeof session.branch !== 'string') {
      return { ok: false, error: 'Invalid session.branch: must be a non-empty string' }
    }
    if (!session.worktreePath || typeof session.worktreePath !== 'string') {
      return { ok: false, error: 'Invalid session.worktreePath: must be a non-empty string' }
    }
    if (this.sessions.has(session.id)) {
      return { ok: false, error: `Session with id '${session.id}' already exists` }
    }
    this.sessions.set(session.id, session)
    return { ok: true, data: session }
  }

  /**
   * Update an existing session
   */
  async updateSession(session: Session): Promise<IpcResult<Session>> {
    if (!session) {
      return { ok: false, error: 'Invalid session: session object is required' }
    }
    if (!session.id || typeof session.id !== 'string') {
      return { ok: false, error: 'Invalid session.id: must be a non-empty string' }
    }
    if (!this.sessions.has(session.id)) {
      return { ok: false, error: `Session with id '${session.id}' not found` }
    }
    this.sessions.set(session.id, session)
    return { ok: true, data: session }
  }

  /**
   * Remove a session by ID
   */
  async removeSession(id: string): Promise<IpcResult<void>> {
    if (!id || typeof id !== 'string') {
      return { ok: false, error: 'Invalid id: must be a non-empty string' }
    }
    if (!this.sessions.has(id)) {
      return { ok: false, error: `Session with id '${id}' not found` }
    }
    this.sessions.delete(id)
    return { ok: true }
  }
}

// Singleton instance
export const storeService = new StoreService()
