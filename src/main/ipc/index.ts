import type { MergeIpcService } from 'electron-ipc-decorator'
import { createServices } from 'electron-ipc-decorator'

import { GitIpcService } from './services/git'
import { SessionService } from './services/session'
import { SystemService } from './services/system'
import { TerminalService } from './services/terminal'
import { WorkspaceService } from './services/workspace'

const services = createServices([
  SystemService,
  WorkspaceService,
  SessionService,
  TerminalService,
  GitIpcService,
])

// MergeIpcService correctly extracts method types for client-side proxy
export type IpcServices = MergeIpcService<typeof services>

export function initializeIpcServices(): void {
  void services
}
