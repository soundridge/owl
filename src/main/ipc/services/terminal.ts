/**
 * Terminal IPC service
 * Based on: docs/cli-worktree-manager-tech.md Section 8
 *
 * IPC API:
 * - terminal.write(ptyId, data)
 * - terminal.resize(ptyId, cols, rows)
 * - terminal.onData(ptyId) - handled via IPC events
 */

import type { IpcResult, TerminalResizeParams } from '../../types'
import { IpcMethod, IpcService } from 'electron-ipc-decorator'
import { ptyService } from '../../services/pty'

/**
 * Terminal IPC service for terminal operations
 */
export class TerminalService extends IpcService {
  static readonly groupName = 'terminal'

  /**
   * Write data to a terminal
   */
  @IpcMethod()
  async write(ptyId: string, data: string): Promise<IpcResult<void>> {
    // Validate parameters
    if (!ptyId || typeof ptyId !== 'string') {
      return { ok: false, error: 'Invalid ptyId: must be a non-empty string' }
    }
    if (typeof data !== 'string') {
      return { ok: false, error: 'Invalid data: must be a string' }
    }

    return ptyService.write(ptyId, data)
  }

  /**
   * Resize a terminal
   */
  @IpcMethod()
  async resize(ptyId: string, cols: number, rows: number): Promise<IpcResult<void>> {
    // Validate parameters
    if (!ptyId || typeof ptyId !== 'string') {
      return { ok: false, error: 'Invalid ptyId: must be a non-empty string' }
    }
    if (typeof cols !== 'number' || cols <= 0) {
      return { ok: false, error: 'Invalid cols: must be a positive number' }
    }
    if (typeof rows !== 'number' || rows <= 0) {
      return { ok: false, error: 'Invalid rows: must be a positive number' }
    }

    const params: TerminalResizeParams = { cols, rows }
    return ptyService.resize(ptyId, params)
  }

  /**
   * Destroy a terminal
   */
  @IpcMethod()
  async destroy(ptyId: string): Promise<IpcResult<void>> {
    // Validate parameters
    if (!ptyId || typeof ptyId !== 'string') {
      return { ok: false, error: 'Invalid ptyId: must be a non-empty string' }
    }

    return ptyService.destroy(ptyId)
  }
}
