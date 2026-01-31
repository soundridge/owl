import type { MergeIpcService } from 'electron-ipc-decorator'
import { createServices } from 'electron-ipc-decorator'

import { AgentIpcService } from './services/agent'
import { GitIpcService } from './services/git'
import { SessionService } from './services/session'
import { SystemService } from './services/system'
import { WorkspaceService } from './services/workspace'

const services = createServices([
  SystemService,
  WorkspaceService,
  SessionService,
  GitIpcService,
  AgentIpcService,
])

// MergeIpcService correctly extracts method types for client-side proxy
export type IpcServices = MergeIpcService<typeof services>

export function initializeIpcServices(): void {
  void services
}
