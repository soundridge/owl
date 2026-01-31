/**
 * Agent service - Manages Codex CLI agent sessions
 * Spawns codex exec processes and handles JSONL output
 */

import type { Buffer } from 'node:buffer'
import type { ChildProcess } from 'node:child_process'
import type { AgentSession as AgentSessionBase, AgentStatus, IpcResult } from '../types'
import { spawn } from 'node:child_process'
import process from 'node:process'
import { BrowserWindow } from 'electron'

/**
 * Agent session state with process handle (internal use)
 */
interface AgentSessionInternal extends AgentSessionBase {
  process: ChildProcess | null
}

/**
 * JSONL event types from codex exec --json
 */
interface CodexEvent {
  type: string
  thread_id?: string
  item?: {
    id?: string
    type?: string
    text?: string
    command?: string
    status?: string
  }
  usage?: {
    input_tokens?: number
    output_tokens?: number
  }
}

/**
 * Log levels for renderer
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * Agent service for managing Codex CLI sessions
 */
export class AgentService {
  private sessions: Map<string, AgentSessionInternal> = new Map()

  /**
   * Get or create an agent session
   */
  private getOrCreateSession(sessionId: string, cwd: string): AgentSessionInternal {
    let session = this.sessions.get(sessionId)
    if (!session) {
      session = {
        id: sessionId,
        cwd,
        cliSessionId: null,
        status: 'idle',
        process: null,
      }
      this.sessions.set(sessionId, session)
    }
    return session
  }

  /**
   * Send a message to the agent
   * Spawns codex exec process and handles JSONL output
   */
  async sendMessage(sessionId: string, cwd: string, message: string): Promise<IpcResult<void>> {
    // Validate parameters
    if (!sessionId || typeof sessionId !== 'string') {
      return { ok: false, error: 'Invalid sessionId: must be a non-empty string' }
    }
    if (!cwd || typeof cwd !== 'string') {
      return { ok: false, error: 'Invalid cwd: must be a non-empty string' }
    }
    if (!message || typeof message !== 'string') {
      return { ok: false, error: 'Invalid message: must be a non-empty string' }
    }

    const session = this.getOrCreateSession(sessionId, cwd)

    // If already running, return error
    if (session.status === 'running' && session.process) {
      return { ok: false, error: 'Agent session is already running' }
    }

    // Build command arguments
    // Note: --json must come before the prompt for codex exec
    const args: string[] = ['exec', '--json']

    // If we have a previous thread_id, use resume
    if (session.cliSessionId) {
      args.push('resume', session.cliSessionId)
    }

    // Add the message as the last argument
    args.push(message)

    this.log(sessionId, 'info', `Running: codex ${args.join(' ')}`)
    this.log(sessionId, 'debug', `CWD: ${cwd}`)

    // Update status
    session.status = 'running'
    this.notifyStatus(sessionId, 'running')

    try {
      // Spawn the codex process
      // Don't use shell: true to avoid argument splitting issues
      const proc = spawn('codex', args, {
        cwd,
        env: { ...process.env },
      })

      session.process = proc

      // Buffer for incomplete lines
      let buffer = ''
      // Collect stderr for error reporting
      let stderrBuffer = ''

      // Handle stdout (JSONL output)
      proc.stdout?.on('data', (data: Buffer) => {
        const text = data.toString()
        buffer += text

        // Log raw stdout for debugging
        this.log(sessionId, 'debug', `stdout: ${text.trim()}`)

        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim())
            continue
          try {
            const event = JSON.parse(line) as CodexEvent
            this.log(sessionId, 'info', `Event: ${event.type}`, event)
            this.handleEvent(sessionId, event)
          }
          catch {
            // Non-JSON line - might be useful info
            this.log(sessionId, 'warn', `Non-JSON stdout: ${line}`)
          }
        }
      })

      // Handle stderr (progress info, errors)
      proc.stderr?.on('data', (data: Buffer) => {
        const text = data.toString()
        stderrBuffer += text
        // Log stderr for debugging
        this.log(sessionId, 'warn', `stderr: ${text.trim()}`)
      })

      // Handle process exit
      proc.on('close', (code) => {
        this.log(sessionId, 'info', `Process exited with code ${code}`)

        // Process any remaining buffer content
        if (buffer.trim()) {
          try {
            const event = JSON.parse(buffer) as CodexEvent
            this.handleEvent(sessionId, event)
          }
          catch {
            // Ignore
          }
        }

        session.process = null
        session.status = code === 0 ? 'idle' : 'error'
        this.notifyStatus(sessionId, session.status)

        if (code !== 0) {
          // Include stderr in error message for better debugging
          const errorMsg = stderrBuffer.trim()
            ? `Process exited with code ${code}: ${stderrBuffer.trim()}`
            : `Process exited with code ${code}`
          this.notifyError(sessionId, errorMsg)
        }
      })

      // Handle process error
      proc.on('error', (err) => {
        this.log(sessionId, 'error', `Process error: ${err.message}`)
        session.process = null
        session.status = 'error'
        this.notifyStatus(sessionId, 'error')
        this.notifyError(sessionId, err.message)
      })

      return { ok: true }
    }
    catch (err) {
      session.status = 'error'
      this.notifyStatus(sessionId, 'error')
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      this.log(sessionId, 'error', `Failed to spawn: ${errorMessage}`)
      this.notifyError(sessionId, errorMessage)
      return { ok: false, error: errorMessage }
    }
  }

  /**
   * Handle JSONL events from codex
   */
  private handleEvent(sessionId: string, event: CodexEvent): void {
    const session = this.sessions.get(sessionId)
    if (!session)
      return

    // Save thread_id for resume
    if (event.type === 'thread.started' && event.thread_id) {
      session.cliSessionId = event.thread_id
      this.log(sessionId, 'info', `Thread started: ${event.thread_id}`)
    }

    // Send agent message to Renderer
    if (event.type === 'item.completed' && event.item?.type === 'agent_message' && event.item.text) {
      this.notifyMessage(sessionId, event.item.text)
    }

    // Log command executions
    if (event.item?.type === 'command_execution') {
      this.log(sessionId, 'info', `Command: ${event.item.command}`)
    }

    // Log usage stats
    if (event.type === 'turn.completed' && event.usage) {
      this.log(sessionId, 'info', `Usage: ${event.usage.input_tokens} in / ${event.usage.output_tokens} out`)
    }
  }

  /**
   * Interrupt a running agent session
   */
  async interrupt(sessionId: string): Promise<IpcResult<void>> {
    if (!sessionId || typeof sessionId !== 'string') {
      return { ok: false, error: 'Invalid sessionId: must be a non-empty string' }
    }

    const session = this.sessions.get(sessionId)
    if (!session) {
      return { ok: false, error: `Agent session '${sessionId}' not found` }
    }

    if (session.process) {
      try {
        this.log(sessionId, 'info', 'Interrupting process...')
        session.process.kill('SIGINT')
        session.process = null
      }
      catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to kill process'
        return { ok: false, error: errorMessage }
      }
    }

    session.status = 'idle'
    this.notifyStatus(sessionId, 'idle')

    return { ok: true }
  }

  /**
   * Get session info
   */
  async getSession(sessionId: string): Promise<IpcResult<AgentSessionBase | null>> {
    if (!sessionId || typeof sessionId !== 'string') {
      return { ok: false, error: 'Invalid sessionId: must be a non-empty string' }
    }
    const session = this.sessions.get(sessionId) || null
    return { ok: true, data: session }
  }

  /**
   * Destroy an agent session
   */
  async destroy(sessionId: string): Promise<IpcResult<void>> {
    if (!sessionId || typeof sessionId !== 'string') {
      return { ok: false, error: 'Invalid sessionId: must be a non-empty string' }
    }

    const session = this.sessions.get(sessionId)
    if (session?.process) {
      try {
        session.process.kill('SIGKILL')
      }
      catch {
        // Ignore kill errors
      }
    }

    this.sessions.delete(sessionId)
    return { ok: true }
  }

  /**
   * Send log to Renderer console
   */
  private log(sessionId: string, level: LogLevel, message: string, data?: unknown): void {
    // Also log to main process console
    const prefix = `[Agent ${sessionId}]`
    if (level === 'warn') {
      if (data) {
        console.warn(prefix, message, data)
      }
      else {
        console.warn(prefix, message)
      }
    }
    else if (level === 'error') {
      if (data) {
        console.error(prefix, message, data)
      }
      else {
        console.error(prefix, message)
      }
    }

    // Send to renderer
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((win) => {
      win.webContents.send('agent:log', sessionId, level, message, data)
    })
  }

  /**
   * Notify Renderer of agent message
   */
  private notifyMessage(sessionId: string, text: string): void {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((win) => {
      win.webContents.send('agent:message', sessionId, text)
    })
  }

  /**
   * Notify Renderer of status change
   */
  private notifyStatus(sessionId: string, status: AgentStatus): void {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((win) => {
      win.webContents.send('agent:status', sessionId, status)
    })
  }

  /**
   * Notify Renderer of error
   */
  private notifyError(sessionId: string, error: string): void {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((win) => {
      win.webContents.send('agent:error', sessionId, error)
    })
  }
}

// Singleton instance
export const agentService = new AgentService()
