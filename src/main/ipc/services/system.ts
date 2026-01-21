import { IpcMethod, IpcService } from 'electron-ipc-decorator'

/**
 * IPC 服务
 */
export class SystemService extends IpcService {
  static readonly groupName = 'system'

  // @ts-ignore - electron-ipc-decorator type definitions have issues
  @IpcMethod()
  ping(): string {
    return 'pong1'
  }
}
