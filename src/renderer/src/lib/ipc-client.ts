import type { IpcRenderer } from 'electron'
import type { IpcServices } from '../../../preload/index.d'
import { createIpcProxy } from 'electron-ipc-decorator/client'

/**
 * 创建类型安全的 IPC 代理
 * 用于在渲染进程中调用主进程的服务
 */
export const ipcServices = createIpcProxy<IpcServices>(
  window.electron.ipcRenderer as unknown as IpcRenderer,
) as IpcServices | null
