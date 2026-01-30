import type { ExtractServiceMethods } from 'electron-ipc-decorator'
import { createServices } from 'electron-ipc-decorator'

import { SystemService } from './services/system'
import { WorkspaceService } from './services/workspace'
import { SessionService } from './services/session'
import { TerminalService } from './services/terminal'
import { GitIpcService } from './services/git'

const services = createServices([
  SystemService,
  WorkspaceService,
  SessionService,
  TerminalService,
  GitIpcService
])

// ExtractServiceMethods expects a service instance, so we map over each service
export type IpcServices = {
  [K in keyof typeof services]: ExtractServiceMethods<(typeof services)[K]>
}

export function initializeIpcServices(): void {
  console.info('IPC services initialized')
  void services
}
