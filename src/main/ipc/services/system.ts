import type { IpcResult } from '../../types'
import { dialog } from 'electron'
import { IpcMethod, IpcService } from 'electron-ipc-decorator'

/**
 * System IPC service for system-level operations
 */
export class SystemService extends IpcService {
  static readonly groupName = 'system'

  @IpcMethod()
  ping(): string {
    return 'pong1'
  }

  /**
   * Show native folder selection dialog
   * Returns the selected folder path or null if cancelled
   */
  @IpcMethod()
  async showOpenFolderDialog(): Promise<IpcResult<string | null>> {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select a Git Repository',
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { ok: true, data: null }
    }

    return { ok: true, data: result.filePaths[0] }
  }
}
