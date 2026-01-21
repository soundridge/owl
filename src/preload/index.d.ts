import { ElectronAPI } from '@electron-toolkit/preload'

export type { IpcServices } from '../main/ipc/index'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
  }
}
