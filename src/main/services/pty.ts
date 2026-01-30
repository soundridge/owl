/**
 * PTY service - Manages pseudo-terminal sessions
 * Based on: docs/cli-worktree-manager-tech.md Section 7.3
 *
 * Note: This is a skeleton implementation.
 * Real node-pty integration will be implemented in a later phase.
 */

import type { PtySession, IpcResult, TerminalResizeParams } from '../types'

/**
 * Callback type for PTY data events
 */
export type PtyDataCallback = (ptyId: string, data: string) => void

/**
 * Callback type for PTY exit events
 */
export type PtyExitCallback = (ptyId: string, exitCode: number) => void

/**
 * PTY service for managing terminal sessions
 */
export class PtyService {
  // In-memory storage for PTY sessions
  private ptySessions: Map<string, PtySession> = new Map()

  // Event callbacks (to be connected to IPC in real implementation)
  private dataCallbacks: Set<PtyDataCallback> = new Set()
  private exitCallbacks: Set<PtyExitCallback> = new Set()

  /**
   * Create a new PTY session
   * Opens a shell in the specified working directory
   */
  async create(sessionId: string, cwd: string): Promise<IpcResult<string>> {
    if (!sessionId || typeof sessionId !== 'string') {
      return { ok: false, error: 'Invalid sessionId: must be a non-empty string' }
    }
    if (!cwd || typeof cwd !== 'string') {
      return { ok: false, error: 'Invalid cwd: must be a non-empty string' }
    }

    // Generate a unique PTY ID
    const ptyId = `pty-${sessionId}-${Date.now()}`

    // Mock: store PTY session (no real PTY created)
    const ptySession: PtySession = {
      ptyId,
      sessionId,
      pid: Math.floor(Math.random() * 10000) + 1000 // Mock PID
    }

    this.ptySessions.set(ptyId, ptySession)

    return { ok: true, data: ptyId }
  }

  /**
   * Write data to a PTY session
   */
  async write(ptyId: string, data: string): Promise<IpcResult<void>> {
    if (!ptyId || typeof ptyId !== 'string') {
      return { ok: false, error: 'Invalid ptyId: must be a non-empty string' }
    }
    if (typeof data !== 'string') {
      return { ok: false, error: 'Invalid data: must be a string' }
    }
    if (!this.ptySessions.has(ptyId)) {
      return { ok: false, error: `PTY session '${ptyId}' not found` }
    }

    // Mock: no-op (real implementation would write to PTY)
    return { ok: true }
  }

  /**
   * Resize a PTY session
   */
  async resize(ptyId: string, params: TerminalResizeParams): Promise<IpcResult<void>> {
    if (!ptyId || typeof ptyId !== 'string') {
      return { ok: false, error: 'Invalid ptyId: must be a non-empty string' }
    }
    if (!params || typeof params !== 'object') {
      return { ok: false, error: 'Invalid params: must be an object with cols and rows' }
    }
    if (typeof params.cols !== 'number' || params.cols <= 0) {
      return { ok: false, error: 'Invalid params.cols: must be a positive number' }
    }
    if (typeof params.rows !== 'number' || params.rows <= 0) {
      return { ok: false, error: 'Invalid params.rows: must be a positive number' }
    }
    if (!this.ptySessions.has(ptyId)) {
      return { ok: false, error: `PTY session '${ptyId}' not found` }
    }

    // Mock: no-op (real implementation would resize PTY)
    return { ok: true }
  }

  /**
   * Destroy a PTY session
   */
  async destroy(ptyId: string): Promise<IpcResult<void>> {
    if (!ptyId || typeof ptyId !== 'string') {
      return { ok: false, error: 'Invalid ptyId: must be a non-empty string' }
    }
    if (!this.ptySessions.has(ptyId)) {
      return { ok: false, error: `PTY session '${ptyId}' not found` }
    }

    this.ptySessions.delete(ptyId)
    return { ok: true }
  }

  /**
   * Get PTY session info
   */
  async getSession(ptyId: string): Promise<IpcResult<PtySession | null>> {
    if (!ptyId || typeof ptyId !== 'string') {
      return { ok: false, error: 'Invalid ptyId: must be a non-empty string' }
    }
    const session = this.ptySessions.get(ptyId) || null
    return { ok: true, data: session }
  }

  /**
   * Get PTY session by session ID
   */
  async getSessionBySessionId(sessionId: string): Promise<IpcResult<PtySession | null>> {
    if (!sessionId || typeof sessionId !== 'string') {
      return { ok: false, error: 'Invalid sessionId: must be a non-empty string' }
    }
    for (const session of this.ptySessions.values()) {
      if (session.sessionId === sessionId) {
        return { ok: true, data: session }
      }
    }
    return { ok: true, data: null }
  }

  /**
   * Register a callback for PTY data events
   */
  onData(callback: PtyDataCallback): void {
    this.dataCallbacks.add(callback)
  }

  /**
   * Unregister a callback for PTY data events
   */
  offData(callback: PtyDataCallback): void {
    this.dataCallbacks.delete(callback)
  }

  /**
   * Register a callback for PTY exit events
   */
  onExit(callback: PtyExitCallback): void {
    this.exitCallbacks.add(callback)
  }

  /**
   * Unregister a callback for PTY exit events
   */
  offExit(callback: PtyExitCallback): void {
    this.exitCallbacks.delete(callback)
  }

  /**
   * Emit data event (internal use)
   */
  protected emitData(ptyId: string, data: string): void {
    for (const callback of this.dataCallbacks) {
      callback(ptyId, data)
    }
  }

  /**
   * Emit exit event (internal use)
   */
  protected emitExit(ptyId: string, exitCode: number): void {
    for (const callback of this.exitCallbacks) {
      callback(ptyId, exitCode)
    }
  }
}

// Singleton instance
export const ptyService = new PtyService()
