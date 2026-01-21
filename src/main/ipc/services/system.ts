import { IpcMethod, IpcService } from 'electron-ipc-decorator'

/**
 * IPC 服务
 */
export class SystemService extends IpcService {
  static readonly groupName = 'system'

  @IpcMethod()
  ping(): string {
    return 'pong1'
  }
}
