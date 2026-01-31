import type { ExtractServiceMethods } from 'electron-ipc-decorator'
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

// ExtractServiceMethods expects a service instance, so we map over each service
export type IpcServices = {
  [K in keyof typeof services]: ExtractServiceMethods<(typeof services)[K]>
}

export function initializeIpcServices(): void {
  void services
}
