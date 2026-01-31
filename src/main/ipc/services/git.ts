/**
 * Git IPC service
 * Based on: docs/cli-worktree-manager-tech.md Section 8
 *
 * IPC API:
 * - git.status(sessionId)
 * - git.merge({ sourceBranch, targetBranch })
 */

import type { GitMergeResult, GitStatusEntry, IpcResult } from '../../types'
import { IpcMethod, IpcService } from 'electron-ipc-decorator'
import { gitService } from '../../services/git'
import { storeService } from '../../services/store'

/**
 * Git IPC service for git operations
 */
export class GitIpcService extends IpcService {
  static readonly groupName = 'git'

  /**
   * Get git status for a session
   * Returns the list of changed files in the session's worktree
   */
  @IpcMethod()
  async status(sessionId: string): Promise<IpcResult<GitStatusEntry[]>> {
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

    // Get git status
    return gitService.getStatus(session.worktreePath)
  }

  /**
   * Merge a source branch into a target branch
   * Executes merge in the main repository directory
   */
  @IpcMethod()
  async merge(params: {
    workspaceId: string
    sourceBranch: string
    targetBranch: string
  }): Promise<IpcResult<GitMergeResult>> {
    // Validate parameters
    if (!params || typeof params !== 'object') {
      return { ok: false, error: 'Invalid params: must be an object' }
    }
    if (!params.workspaceId || typeof params.workspaceId !== 'string') {
      return { ok: false, error: 'Invalid params.workspaceId: must be a non-empty string' }
    }
    if (!params.sourceBranch || typeof params.sourceBranch !== 'string') {
      return { ok: false, error: 'Invalid params.sourceBranch: must be a non-empty string' }
    }
    if (!params.targetBranch || typeof params.targetBranch !== 'string') {
      return { ok: false, error: 'Invalid params.targetBranch: must be a non-empty string' }
    }

    // Get workspace
    const workspaceResult = await storeService.getWorkspace(params.workspaceId)
    if (!workspaceResult.ok || !workspaceResult.data) {
      return { ok: false, error: workspaceResult.error || `Workspace '${params.workspaceId}' not found` }
    }
    const workspace = workspaceResult.data

    // Check if working directory is clean
    const isCleanResult = await gitService.isClean(workspace.repoPath)
    if (!isCleanResult.ok) {
      return { ok: false, error: isCleanResult.error || 'Failed to check working directory status' }
    }
    if (!isCleanResult.data) {
      return {
        ok: false,
        error: 'Working directory is not clean. Please commit or stash changes before merging.',
      }
    }

    // Checkout target branch
    const checkoutResult = await gitService.checkout(workspace.repoPath, params.targetBranch)
    if (!checkoutResult.ok) {
      return { ok: false, error: checkoutResult.error || `Failed to checkout branch '${params.targetBranch}'` }
    }

    // Merge source branch
    return gitService.merge(workspace.repoPath, params.sourceBranch, params.targetBranch)
  }
}
