/**
 * Git service - Wraps git CLI commands
 * Based on: docs/cli-worktree-manager-tech.md Section 9
 *
 * Note: This is a skeleton implementation returning mock data.
 * Real git commands will be implemented in a later phase.
 */

import type { GitStatusEntry, GitMergeResult, IpcResult } from '../types'

/**
 * Git service for executing git commands
 */
export class GitService {
  /**
   * Check if a path is inside a git work tree
   * Command: git rev-parse --is-inside-work-tree
   */
  async isGitRepository(path: string): Promise<IpcResult<boolean>> {
    if (!path || typeof path !== 'string') {
      return { ok: false, error: 'Invalid path: path must be a non-empty string' }
    }
    // Mock: return true for demonstration
    return { ok: true, data: true }
  }

  /**
   * Get the current branch name
   * Command: git symbolic-ref --short HEAD
   */
  async getCurrentBranch(repoPath: string): Promise<IpcResult<string>> {
    if (!repoPath || typeof repoPath !== 'string') {
      return { ok: false, error: 'Invalid repoPath: must be a non-empty string' }
    }
    // Mock: return 'main'
    return { ok: true, data: 'main' }
  }

  /**
   * Create a worktree with a new branch
   * Command: git worktree add -b <branch> <path> <baseBranch>
   */
  async createWorktree(
    repoPath: string,
    worktreePath: string,
    branchName: string,
    baseBranch: string
  ): Promise<IpcResult<void>> {
    if (!repoPath || typeof repoPath !== 'string') {
      return { ok: false, error: 'Invalid repoPath: must be a non-empty string' }
    }
    if (!worktreePath || typeof worktreePath !== 'string') {
      return { ok: false, error: 'Invalid worktreePath: must be a non-empty string' }
    }
    if (!branchName || typeof branchName !== 'string') {
      return { ok: false, error: 'Invalid branchName: must be a non-empty string' }
    }
    if (!baseBranch || typeof baseBranch !== 'string') {
      return { ok: false, error: 'Invalid baseBranch: must be a non-empty string' }
    }
    // Mock: return success
    return { ok: true }
  }

  /**
   * Remove a worktree
   * Command: git worktree remove <path>
   */
  async removeWorktree(repoPath: string, worktreePath: string): Promise<IpcResult<void>> {
    if (!repoPath || typeof repoPath !== 'string') {
      return { ok: false, error: 'Invalid repoPath: must be a non-empty string' }
    }
    if (!worktreePath || typeof worktreePath !== 'string') {
      return { ok: false, error: 'Invalid worktreePath: must be a non-empty string' }
    }
    // Mock: return success
    return { ok: true }
  }

  /**
   * Delete a branch
   * Command: git branch -D <branch>
   */
  async deleteBranch(repoPath: string, branchName: string): Promise<IpcResult<void>> {
    if (!repoPath || typeof repoPath !== 'string') {
      return { ok: false, error: 'Invalid repoPath: must be a non-empty string' }
    }
    if (!branchName || typeof branchName !== 'string') {
      return { ok: false, error: 'Invalid branchName: must be a non-empty string' }
    }
    // Mock: return success
    return { ok: true }
  }

  /**
   * Get git status for a worktree
   * Command: git status --porcelain=v2 -z
   */
  async getStatus(worktreePath: string): Promise<IpcResult<GitStatusEntry[]>> {
    if (!worktreePath || typeof worktreePath !== 'string') {
      return { ok: false, error: 'Invalid worktreePath: must be a non-empty string' }
    }
    // Mock: return empty status
    return { ok: true, data: [] }
  }

  /**
   * Check if working directory is clean
   * Command: git status --porcelain
   */
  async isClean(repoPath: string): Promise<IpcResult<boolean>> {
    if (!repoPath || typeof repoPath !== 'string') {
      return { ok: false, error: 'Invalid repoPath: must be a non-empty string' }
    }
    // Mock: return true (clean)
    return { ok: true, data: true }
  }

  /**
   * Checkout a branch
   * Command: git checkout <branch>
   */
  async checkout(repoPath: string, branchName: string): Promise<IpcResult<void>> {
    if (!repoPath || typeof repoPath !== 'string') {
      return { ok: false, error: 'Invalid repoPath: must be a non-empty string' }
    }
    if (!branchName || typeof branchName !== 'string') {
      return { ok: false, error: 'Invalid branchName: must be a non-empty string' }
    }
    // Mock: return success
    return { ok: true }
  }

  /**
   * Merge a branch into current branch
   * Command: git merge <branch>
   */
  async merge(
    repoPath: string,
    sourceBranch: string,
    targetBranch: string
  ): Promise<IpcResult<GitMergeResult>> {
    if (!repoPath || typeof repoPath !== 'string') {
      return { ok: false, error: 'Invalid repoPath: must be a non-empty string' }
    }
    if (!sourceBranch || typeof sourceBranch !== 'string') {
      return { ok: false, error: 'Invalid sourceBranch: must be a non-empty string' }
    }
    if (!targetBranch || typeof targetBranch !== 'string') {
      return { ok: false, error: 'Invalid targetBranch: must be a non-empty string' }
    }
    // Mock: return success
    return {
      ok: true,
      data: {
        success: true,
        conflicted: false,
        message: `Mock: Successfully merged ${sourceBranch} into ${targetBranch}`
      }
    }
  }
}

// Singleton instance
export const gitService = new GitService()
