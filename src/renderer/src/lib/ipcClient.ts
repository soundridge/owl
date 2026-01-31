import type { IpcRenderer } from 'electron'
import type { IpcServices } from '../../../preload/index.d'
import { createIpcProxy } from 'electron-ipc-decorator/client'

export const ipcServices = createIpcProxy<IpcServices>(
  window.electron.ipcRenderer as unknown as IpcRenderer,
) as IpcServices | null
