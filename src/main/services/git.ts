/**
 * Git service - Wraps git CLI commands
 * Based on: docs/cli-worktree-manager-tech.md Section 6
 */
import type { GitMergeResult, GitStatusEntry, IpcResult } from '../types'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export class GitService {
  private async runWithDir(dir: string, args: string): Promise<{ stdout: string, stderr: string }> {
    const cmd = `git -C "${dir}" ${args}`
    return execAsync(cmd, { encoding: 'utf-8' })
  }

  async isGitRepository(path: string): Promise<IpcResult<boolean>> {
    if (!path || typeof path !== 'string') {
      return { ok: false, error: 'Invalid path: path must be a non-empty string' }
    }
    try {
      await this.runWithDir(path, 'rev-parse --is-inside-work-tree')
      return { ok: true, data: true }
    }
    catch {
      return { ok: true, data: false }
    }
  }

  async getCurrentBranch(repoPath: string): Promise<IpcResult<string>> {
    if (!repoPath || typeof repoPath !== 'string') {
      return { ok: false, error: 'Invalid repoPath: must be a non-empty string' }
    }
    try {
      const { stdout } = await this.runWithDir(repoPath, 'symbolic-ref --short HEAD')
      return { ok: true, data: stdout.trim() }
    }
    catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async listBranches(repoPath: string): Promise<IpcResult<string[]>> {
    if (!repoPath || typeof repoPath !== 'string') {
      return { ok: false, error: 'Invalid repoPath: must be a non-empty string' }
    }
    try {
      const { stdout } = await this.runWithDir(
        repoPath,
        'branch --list --format="%(refname:short)"',
      )
      const branches = stdout
        .split('\n')
        .map(s => s.trim().replace(/^"|"$/g, ''))
        .filter(Boolean)
      return { ok: true, data: branches }
    }
    catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async createWorktree(
    repoPath: string,
    worktreePath: string,
    branchName: string,
    baseBranch: string,
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
    try {
      await this.runWithDir(
        repoPath,
        `worktree add -b "${branchName}" "${worktreePath}" "${baseBranch}"`,
      )
      return { ok: true }
    }
    catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async removeWorktree(repoPath: string, worktreePath: string): Promise<IpcResult<void>> {
    if (!repoPath || typeof repoPath !== 'string') {
      return { ok: false, error: 'Invalid repoPath: must be a non-empty string' }
    }
    if (!worktreePath || typeof worktreePath !== 'string') {
      return { ok: false, error: 'Invalid worktreePath: must be a non-empty string' }
    }
    try {
      await this.runWithDir(repoPath, `worktree remove --force "${worktreePath}"`)
      return { ok: true }
    }
    catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async deleteBranch(repoPath: string, branchName: string): Promise<IpcResult<void>> {
    if (!repoPath || typeof repoPath !== 'string') {
      return { ok: false, error: 'Invalid repoPath: must be a non-empty string' }
    }
    if (!branchName || typeof branchName !== 'string') {
      return { ok: false, error: 'Invalid branchName: must be a non-empty string' }
    }
    try {
      await this.runWithDir(repoPath, `branch -D "${branchName}"`)
      return { ok: true }
    }
    catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async getStatus(worktreePath: string): Promise<IpcResult<GitStatusEntry[]>> {
    if (!worktreePath || typeof worktreePath !== 'string') {
      return { ok: false, error: 'Invalid worktreePath: must be a non-empty string' }
    }
    try {
      const { stdout } = await this.runWithDir(worktreePath, 'status --porcelain')
      const lines = stdout.split('\n').map(s => s.trim()).filter(Boolean)
      const entries: GitStatusEntry[] = lines.map((line) => {
        if (line.startsWith('??')) {
          return { path: line.slice(3), status: 'untracked', staged: false }
        }
        const code = line.slice(0, 2)
        const staged = code[0] !== ' ' && code[0] !== '?'
        let filePath = line.slice(3)
        const statusChar = code[0] !== ' ' ? code[0] : code[1]
        let status: GitStatusEntry['status'] = 'modified'
        if (statusChar === 'A') {
          status = 'added'
        }
        else if (statusChar === 'M') {
          status = 'modified'
        }
        else if (statusChar === 'D') {
          status = 'deleted'
        }
        else if (statusChar === 'R') {
          status = 'renamed'
          const parts = filePath.split(' -> ')
          filePath = parts[parts.length - 1]
        }
        return { path: filePath, status, staged }
      })
      return { ok: true, data: entries }
    }
    catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async isClean(repoPath: string): Promise<IpcResult<boolean>> {
    if (!repoPath || typeof repoPath !== 'string') {
      return { ok: false, error: 'Invalid repoPath: must be a non-empty string' }
    }
    try {
      const status = await this.getStatus(repoPath)
      if (!status.ok) {
        return { ok: false, error: status.error || 'Failed to get status' }
      }
      return { ok: true, data: (status.data || []).length === 0 }
    }
    catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async checkout(repoPath: string, branchName: string): Promise<IpcResult<void>> {
    if (!repoPath || typeof repoPath !== 'string') {
      return { ok: false, error: 'Invalid repoPath: must be a non-empty string' }
    }
    if (!branchName || typeof branchName !== 'string') {
      return { ok: false, error: 'Invalid branchName: must be a non-empty string' }
    }
    try {
      await this.runWithDir(repoPath, `checkout "${branchName}"`)
      return { ok: true }
    }
    catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async merge(
    repoPath: string,
    sourceBranch: string,
    targetBranch: string,
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
    try {
      await this.runWithDir(repoPath, `checkout "${targetBranch}"`)
      try {
        await this.runWithDir(repoPath, `merge "${sourceBranch}"`)
        return {
          ok: true,
          data: { success: true, conflicted: false, message: `Merged ${sourceBranch} into ${targetBranch}` },
        }
      }
      catch (mergeError: any) {
        const { stdout } = await this.runWithDir(repoPath, 'status --porcelain')
        const conflicts = stdout
          .split('\n')
          .filter(l => l.startsWith('UU') || l.startsWith('AA') || l.startsWith('DD'))
          .map(l => l.slice(3))
          .filter(Boolean)
        if (conflicts.length > 0) {
          return {
            ok: true,
            data: {
              success: false,
              conflicted: true,
              message: 'Merge has conflicts; resolve them manually',
            },
          }
        }
        return { ok: false, error: mergeError.message }
      }
    }
    catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async getBranchInfo(
    worktreePath: string,
    baseBranch: string,
  ): Promise<IpcResult<{ current: string, ahead: number, behind: number, target: string }>> {
    if (!worktreePath || typeof worktreePath !== 'string') {
      return { ok: false, error: 'Invalid worktreePath: must be a non-empty string' }
    }
    if (!baseBranch || typeof baseBranch !== 'string') {
      return { ok: false, error: 'Invalid baseBranch: must be a non-empty string' }
    }
    try {
      const { stdout: cur } = await this.runWithDir(worktreePath, 'symbolic-ref --short HEAD')
      const { stdout: counts } = await this.runWithDir(
        worktreePath,
        `rev-list --left-right --count ${baseBranch}...HEAD`,
      )
      const parts = counts.trim().split('\t')
      const behind = Number(parts[0] || 0)
      const ahead = Number(parts[1] || 0)
      return {
        ok: true,
        data: {
          current: cur.trim(),
          target: baseBranch,
          ahead,
          behind,
        },
      }
    }
    catch (e: any) {
      return { ok: false, error: e.message }
    }
  }
}

export const gitService = new GitService()
