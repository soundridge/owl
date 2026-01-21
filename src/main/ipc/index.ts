import type { ExtractServiceMethods } from 'electron-ipc-decorator'
import { createServices } from 'electron-ipc-decorator'

import { SystemService } from './services/system'
import { AgentService } from './services/agent'

const services = createServices([SystemService, AgentService])

// ExtractServiceMethods expects a service instance, so we map over each service
export type IpcServices = {
  [K in keyof typeof services]: ExtractServiceMethods<(typeof services)[K]>
}

export function initializeIpcServices(): void {
  console.info('IPC services initialized')
  void services
}
