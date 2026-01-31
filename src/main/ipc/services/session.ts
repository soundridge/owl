/**
 * Session IPC service
 * Based on: docs/cli-worktree-manager-tech.md Section 8
 *
 * IPC API:
 * - session.list(workspaceId)
 * - session.create(workspaceId, name?)
 * - session.open(sessionId)
 * - session.close(sessionId)
 * - session.delete(sessionId, { removeWorktree, removeBranch })
 */

import type { IpcResult, Session, SessionDeleteOptions } from '../../types'
import { IpcMethod, IpcService } from 'electron-ipc-decorator'
import { gitService } from '../../services/git'
import { storeService } from '../../services/store'

/**
 * Session IPC service for managing sessions (worktrees)
 */
export class SessionService extends IpcService {
  static readonly groupName = 'session'

  /**
   * List all sessions for a workspace
   */
  @IpcMethod()
  async list(workspaceId: string): Promise<IpcResult<Session[]>> {
    // Validate parameter
    if (!workspaceId || typeof workspaceId !== 'string') {
      return { ok: false, error: 'Invalid workspaceId: must be a non-empty string' }
    }

    return storeService.listSessions(workspaceId)
  }

  /**
   * Create a new session
   * Creates a worktree based on the current branch
   */
  @IpcMethod()
  async create(workspaceId: string, name?: string): Promise<IpcResult<Session>> {
    // Validate parameter
    if (!workspaceId || typeof workspaceId !== 'string') {
      return { ok: false, error: 'Invalid workspaceId: must be a non-empty string' }
    }

    // Get workspace
    const workspaceResult = await storeService.getWorkspace(workspaceId)
    if (!workspaceResult.ok || !workspaceResult.data) {
      return { ok: false, error: workspaceResult.error || `Workspace '${workspaceId}' not found` }
    }
    const workspace = workspaceResult.data

    // Get current branch
    const branchResult = await gitService.getCurrentBranch(workspace.repoPath)
    if (!branchResult.ok || !branchResult.data) {
      return { ok: false, error: branchResult.error || 'Failed to get current branch' }
    }
    const baseBranch = branchResult.data

    // Generate session ID and branch name
    const timestamp = Date.now()
    const sessionId = `session-${timestamp}`
    const slug = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'work'
    const sessionBranch = `session/${timestamp}-${slug}`
    const worktreePath = `${workspace.repoPath}/.worktrees/${sessionId}`

    // Create worktree
    const worktreeResult = await gitService.createWorktree(
      workspace.repoPath,
      worktreePath,
      sessionBranch,
      baseBranch,
    )
    if (!worktreeResult.ok) {
      return { ok: false, error: worktreeResult.error || 'Failed to create worktree' }
    }

    // Create session record
    const session: Session = {
      id: sessionId,
      name: name || `Session ${new Date(timestamp).toLocaleString()}`,
      workspaceId,
      branch: sessionBranch,
      worktreePath,
      status: 'idle',
    }

    return storeService.addSession(session)
  }

  /**
   * Open a session
   * Marks the session as active
   */
  @IpcMethod()
  async open(sessionId: string): Promise<IpcResult<void>> {
    // Validate parameter
    if (!sessionId || typeof sessionId !== 'string') {
      return { ok: false, error: 'Invalid sessionId: must be a non-empty string' }
    }

    // Get session
    const sessionResult = await storeService.getSession(sessionId)
    if (!sessionResult.ok || !sessionResult.data) {
      return { ok: false, error: sessionResult.error || `Session '${sessionId}' not found` }
    }
    const session = sessionResult.data

    // Update session status
    session.status = 'running'
    await storeService.updateSession(session)

    return { ok: true }
  }

  /**
   * Close a session
   * Marks the session as idle
   */
  @IpcMethod()
  async close(sessionId: string): Promise<IpcResult<void>> {
    // Validate parameter
    if (!sessionId || typeof sessionId !== 'string') {
      return { ok: false, error: 'Invalid sessionId: must be a non-empty string' }
    }

    // Get session
    const sessionResult = await storeService.getSession(sessionId)
    if (!sessionResult.ok || !sessionResult.data) {
      return { ok: false, error: sessionResult.error || `Session '${sessionId}' not found` }
    }
    const session = sessionResult.data

    // Update session status
    session.status = 'idle'
    await storeService.updateSession(session)

    return { ok: true }
  }

  /**
   * Delete a session
   * Optionally removes the worktree and branch
   */
  @IpcMethod()
  async delete(sessionId: string, options?: SessionDeleteOptions): Promise<IpcResult<void>> {
    // Validate parameter
    if (!sessionId || typeof sessionId !== 'string') {
      return { ok: false, error: 'Invalid sessionId: must be a non-empty string' }
    }

    const opts = options || {}

    // Get session
    const sessionResult = await storeService.getSession(sessionId)
    if (!sessionResult.ok || !sessionResult.data) {
      return { ok: false, error: sessionResult.error || `Session '${sessionId}' not found` }
    }
    const session = sessionResult.data

    // Get workspace
    const workspaceResult = await storeService.getWorkspace(session.workspaceId)
    if (!workspaceResult.ok || !workspaceResult.data) {
      return { ok: false, error: workspaceResult.error || `Workspace '${session.workspaceId}' not found` }
    }
    const workspace = workspaceResult.data

    // Remove worktree if requested
    if (opts.removeWorktree) {
      const removeResult = await gitService.removeWorktree(workspace.repoPath, session.worktreePath)
      if (!removeResult.ok) {
        return { ok: false, error: removeResult.error || 'Failed to remove worktree' }
      }
    }

    // Delete branch if requested
    if (opts.removeBranch) {
      const deleteResult = await gitService.deleteBranch(workspace.repoPath, session.branch)
      if (!deleteResult.ok) {
        return { ok: false, error: deleteResult.error || 'Failed to delete branch' }
      }
    }

    // Remove session from store
    return storeService.removeSession(sessionId)
  }
}
