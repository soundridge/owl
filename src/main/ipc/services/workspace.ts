/**
 * Workspace IPC service
 * Based on: docs/cli-worktree-manager-tech.md Section 8
 *
 * IPC API:
 * - workspace.list()
 * - workspace.add(path)
 * - workspace.remove(id)
 */

import type { IpcResult, Workspace } from '../../types'
import { IpcMethod, IpcService } from 'electron-ipc-decorator'
import { gitService } from '../../services/git'
import { storeService } from '../../services/store'

/**
 * Workspace IPC service for managing workspaces
 */
export class WorkspaceService extends IpcService {
  static readonly groupName = 'workspace'

  /**
   * List all workspaces
   */
  @IpcMethod()
  async list(): Promise<IpcResult<Workspace[]>> {
    return storeService.listWorkspaces()
  }

  /**
   * Add a new workspace by path
   * Validates that the path is a git repository
   */
  @IpcMethod()
  async add(path: string): Promise<IpcResult<Workspace>> {
    // Validate parameter
    if (!path || typeof path !== 'string') {
      return { ok: false, error: 'Invalid path: must be a non-empty string' }
    }

    // Check if it's a git repository
    const isGitResult = await gitService.isGitRepository(path)
    if (!isGitResult.ok) {
      return { ok: false, error: isGitResult.error }
    }
    if (!isGitResult.data) {
      return { ok: false, error: 'The specified path is not a git repository' }
    }

    // Generate workspace ID and name
    const id = `ws-${Date.now()}`
    const name = path.split('/').pop() || path

    const workspace: Workspace = {
      id,
      name,
      repoPath: path,
    }

    return storeService.addWorkspace(workspace)
  }

  /**
   * Remove a workspace by ID
   * Note: This removes workspace metadata only, not the actual repository
   */
  @IpcMethod()
  async remove(id: string): Promise<IpcResult<void>> {
    // Validate parameter
    if (!id || typeof id !== 'string') {
      return { ok: false, error: 'Invalid id: must be a non-empty string' }
    }

    return storeService.removeWorkspace(id)
  }
}
