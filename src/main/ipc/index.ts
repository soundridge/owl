import type { MergeIpcService } from 'electron-ipc-decorator'
import { createServices } from 'electron-ipc-decorator'

import { SystemService } from './services/system'

const services = createServices([SystemService])

export type IpcServices = MergeIpcService<typeof services>

export function initializeIpcServices(): void {
  console.info('IPC services initialized')
  void services
}
