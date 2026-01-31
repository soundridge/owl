/**
 * Agent IPC service
 * Exposes agent operations to the Renderer process
 *
 * IPC API:
 * - agent.send(sessionId, cwd, message) - Send message to agent
 * - agent.interrupt(sessionId) - Interrupt running agent
 *
 * IPC Events (sent to Renderer):
 * - agent:message - (sessionId, text) when agent responds
 * - agent:status - (sessionId, status) when status changes
 * - agent:error - (sessionId, error) when error occurs
 */

import type { IpcResult } from '../../types'
import { IpcMethod, IpcService } from 'electron-ipc-decorator'
import { agentService } from '../../services/agent'

/**
 * Agent IPC service for agent operations
 */
export class AgentIpcService extends IpcService {
  static readonly groupName = 'agent'

  /**
   * Send a message to the agent
   */
  @IpcMethod()
  async send(sessionId: string, cwd: string, message: string): Promise<IpcResult<void>> {
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

    return agentService.sendMessage(sessionId, cwd, message)
  }

  /**
   * Interrupt a running agent session
   */
  @IpcMethod()
  async interrupt(sessionId: string): Promise<IpcResult<void>> {
    // Validate parameters
    if (!sessionId || typeof sessionId !== 'string') {
      return { ok: false, error: 'Invalid sessionId: must be a non-empty string' }
    }

    return agentService.interrupt(sessionId)
  }
}
