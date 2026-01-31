# 技术方案：CLI Worktree 管理器

**版本**：3.0
**日期**：2026-01-31
**依据**：docs/cli-worktree-manager-prd.md v3.0

---

## 1. 核心架构

### 1.1 CLI Agent 集成架构

应用作为 CLI 的 GUI 壳子，通过 `spawn` 调用已认证的 CLI 工具：

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Renderer Process                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐          │
│  │   Sidebar      │  │  AgentChat     │  │   Inspector    │          │
│  │   Component    │  │  Component     │  │   Component    │          │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘          │
│          │                   │                   │                    │
│          └───────────────────┼───────────────────┘                    │
│                              │                                        │
│                     IPC (preload.js)                                  │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────────┐
│                        Main Process                                   │
│                              │                                        │
│  ┌────────────────┐  ┌──────┴───────┐  ┌────────────────┐            │
│  │  GitService    │  │ AgentService │  │  StoreService  │            │
│  │                │  │              │  │                │            │
│  └───────┬────────┘  └──────┬───────┘  └────────────────┘            │
│          │                  │                                         │
│          ▼                  ▼                                         │
│     [Git CLI]          [CLI Agents]                                   │
│                        ┌─────────────────────────────────┐            │
│                        │  codex exec --json "..."        │            │
│                        │  codex exec resume <id> "..."   │            │
│                        │  claude --print "..."           │            │
│                        └─────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────────────┘
```

### 1.2 关键设计决策

1. **不处理认证**：用户自行在终端执行 `codex login` / `claude login`
2. **复用 CLI 会话**：通过 `resume` 机制实现多轮对话
3. **JSONL 解析**：解析 CLI 输出的事件流，提取消息和状态
4. **进程隔离**：每个 Session 的 Agent 是独立进程

---

## 2. 技术栈

### 2.1 已有依赖（直接使用）

| 类别 | 技术 | 用途 |
|------|------|------|
| 框架 | Electron 40 + electron-vite | 桌面应用 |
| 前端 | React 19 + TypeScript 5.9 | UI |
| 样式 | Tailwind CSS 4 + shadcn/ui | 组件库 |
| 布局 | react-resizable-panels | 三栏布局 |
| IPC | electron-ipc-decorator | Main/Renderer 通信 |
| 通知 | sonner | Toast 通知 |
| 图标 | lucide-react | 图标库 |

### 2.2 需新增依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| chokidar | ^3.6.0 | 文件监听 |

**注意**：不再需要 `xterm.js` 和 `node-pty`，因为我们不是嵌入终端，而是调用 CLI 并解析输出。

**安装命令**：
```bash
npm install chokidar
```

---

## 3. Agent Service 实现

### 3.1 Agent 接口定义

位置：`src/main/services/agent/types.ts`

```typescript
// Agent 类型
type AgentType = 'codex' | 'claude'

// Agent 消息
interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  commands?: CommandExecution[]
}

// 命令执行记录
interface CommandExecution {
  command: string
  cwd: string
  output: string
  exitCode: number
  durationMs: number
}

// Agent 事件（JSONL 解析结果）
type AgentEvent =
  | { type: 'thread.started'; threadId: string }
  | { type: 'turn.started' }
  | { type: 'turn.completed'; usage: TokenUsage }
  | { type: 'item.started'; item: AgentItem }
  | { type: 'item.completed'; item: AgentItem }
  | { type: 'error'; message: string }

// Agent Item 类型
type AgentItem =
  | { type: 'agent_message'; id: string; text: string }
  | { type: 'command_execution'; id: string; command: string; status: string; output?: string }
  | { type: 'reasoning'; id: string; summary: string }

// Token 使用统计
interface TokenUsage {
  inputTokens: number
  outputTokens: number
  cachedInputTokens?: number
}

// Agent 会话状态
interface AgentSession {
  sessionId: string      // 应用内的 Session ID
  agentType: AgentType
  cliSessionId: string | null  // CLI 返回的 thread_id（用于 resume）
  cwd: string
  status: 'idle' | 'running' | 'error'
  messages: AgentMessage[]
  process: ChildProcess | null
}
```

### 3.2 Agent Service 实现

位置：`src/main/services/agent/agent-service.ts`

```typescript
import { spawn, ChildProcess } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { BrowserWindow } from 'electron'

export class AgentService extends EventEmitter {
  private sessions: Map<string, AgentSession> = new Map()

  /**
   * 检查 CLI 是否已安装
   */
  async checkCliInstalled(agentType: AgentType): Promise<IpcResult<boolean>> {
    const cli = agentType === 'codex' ? 'codex' : 'claude'

    return new Promise((resolve) => {
      const proc = spawn(cli, ['--version'], { shell: true })
      proc.on('close', (code) => {
        resolve({ ok: true, data: code === 0 })
      })
      proc.on('error', () => {
        resolve({ ok: true, data: false })
      })
    })
  }

  /**
   * 启动 Agent 会话
   */
  async startSession(
    sessionId: string,
    agentType: AgentType,
    cwd: string
  ): Promise<IpcResult<void>> {
    // 检查是否已有会话
    if (this.sessions.has(sessionId)) {
      return { ok: false, error: '会话已存在' }
    }

    const session: AgentSession = {
      sessionId,
      agentType,
      cliSessionId: null,
      cwd,
      status: 'idle',
      messages: [],
      process: null
    }

    this.sessions.set(sessionId, session)
    return { ok: true }
  }

  /**
   * 发送消息给 Agent
   */
  async sendMessage(
    sessionId: string,
    message: string
  ): Promise<IpcResult<void>> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return { ok: false, error: '会话不存在' }
    }

    if (session.status === 'running') {
      return { ok: false, error: 'Agent 正在处理中' }
    }

    // 记录用户消息
    const userMessage: AgentMessage = {
      id: randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }
    session.messages.push(userMessage)
    this.notifyRenderer('agent:message', sessionId, userMessage)

    // 构建命令
    const args = this.buildCliArgs(session, message)

    session.status = 'running'
    this.notifyRenderer('agent:status', sessionId, 'running')

    try {
      await this.executeAgent(session, args)
    } catch (error: any) {
      session.status = 'error'
      this.notifyRenderer('agent:error', sessionId, error.message)
      return { ok: false, error: error.message }
    }

    session.status = 'idle'
    this.notifyRenderer('agent:status', sessionId, 'idle')
    return { ok: true }
  }

  /**
   * 构建 CLI 命令参数
   */
  private buildCliArgs(session: AgentSession, message: string): string[] {
    if (session.agentType === 'codex') {
      if (session.cliSessionId) {
        // 继续会话
        return ['exec', 'resume', session.cliSessionId, '--json', message]
      } else {
        // 新会话
        return ['exec', '--json', message]
      }
    } else {
      // Claude Code - 待确认具体参数
      return ['--print', '--output-format', 'json', message]
    }
  }

  /**
   * 执行 Agent CLI
   */
  private executeAgent(session: AgentSession, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const cli = session.agentType === 'codex' ? 'codex' : 'claude'

      const proc = spawn(cli, args, {
        cwd: session.cwd,
        shell: true,
        env: { ...process.env }
      })

      session.process = proc

      let currentAssistantMessage: AgentMessage | null = null

      // 处理 stdout（JSONL 格式）
      proc.stdout?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(Boolean)

        for (const line of lines) {
          try {
            const event = JSON.parse(line) as AgentEvent
            this.handleAgentEvent(session, event, currentAssistantMessage)

            // 捕获 thread_id 用于后续 resume
            if (event.type === 'thread.started') {
              session.cliSessionId = event.threadId
            }

            // 创建助手消息
            if (event.type === 'item.started' && event.item.type === 'agent_message') {
              currentAssistantMessage = {
                id: event.item.id,
                role: 'assistant',
                content: '',
                timestamp: new Date().toISOString(),
                commands: []
              }
            }

            // 更新助手消息内容
            if (event.type === 'item.completed' && event.item.type === 'agent_message') {
              if (currentAssistantMessage) {
                currentAssistantMessage.content = event.item.text
                session.messages.push(currentAssistantMessage)
                this.notifyRenderer('agent:message', session.sessionId, currentAssistantMessage)
              }
            }
          } catch {
            // 非 JSON 行，可能是普通输出
            console.log('[Agent stdout]', line)
          }
        }
      })

      // 处理 stderr
      proc.stderr?.on('data', (data: Buffer) => {
        const text = data.toString()
        // stderr 是进度信息，可以选择显示或忽略
        this.notifyRenderer('agent:progress', session.sessionId, text)
      })

      proc.on('close', (code) => {
        session.process = null
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Agent 进程退出，代码: ${code}`))
        }
      })

      proc.on('error', (error) => {
        session.process = null
        reject(error)
      })
    })
  }

  /**
   * 处理 Agent 事件
   */
  private handleAgentEvent(
    session: AgentSession,
    event: AgentEvent,
    currentMessage: AgentMessage | null
  ): void {
    this.notifyRenderer('agent:event', session.sessionId, event)

    // 处理命令执行
    if (event.type === 'item.completed' && event.item.type === 'command_execution') {
      if (currentMessage) {
        currentMessage.commands = currentMessage.commands || []
        currentMessage.commands.push({
          command: event.item.command,
          cwd: session.cwd,
          output: event.item.output || '',
          exitCode: 0,
          durationMs: 0
        })
      }
    }
  }

  /**
   * 中断当前 Agent 执行
   */
  async interrupt(sessionId: string): Promise<IpcResult<void>> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return { ok: false, error: '会话不存在' }
    }

    if (session.process) {
      session.process.kill('SIGINT')
      session.process = null
      session.status = 'idle'
      this.notifyRenderer('agent:status', sessionId, 'idle')
    }

    return { ok: true }
  }

  /**
   * 获取会话历史
   */
  getMessages(sessionId: string): IpcResult<AgentMessage[]> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return { ok: false, error: '会话不存在' }
    }
    return { ok: true, data: session.messages }
  }

  /**
   * 关闭会话
   */
  async closeSession(sessionId: string): Promise<IpcResult<void>> {
    const session = this.sessions.get(sessionId)
    if (session?.process) {
      session.process.kill()
    }
    this.sessions.delete(sessionId)
    return { ok: true }
  }

  /**
   * 恢复会话（从持久化数据）
   */
  async restoreSession(
    sessionId: string,
    agentType: AgentType,
    cwd: string,
    cliSessionId: string | null,
    messages: AgentMessage[]
  ): Promise<IpcResult<void>> {
    const session: AgentSession = {
      sessionId,
      agentType,
      cliSessionId,
      cwd,
      status: 'idle',
      messages,
      process: null
    }
    this.sessions.set(sessionId, session)
    return { ok: true }
  }

  /**
   * 通知 Renderer 进程
   */
  private notifyRenderer(channel: string, sessionId: string, data: any): void {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((win) => {
      win.webContents.send(channel, sessionId, data)
    })
  }
}

export const agentService = new AgentService()
```

---

## 4. IPC API 规范

### 4.1 Agent IPC 服务

位置：`src/main/ipc/services/agent.ts`

```typescript
import { IpcMethod, IpcService } from 'electron-ipc-decorator'
import { agentService } from '../../services/agent/agent-service'

@IpcService('agent')
export class AgentIpcService {
  @IpcMethod()
  async checkCli(agentType: AgentType): Promise<IpcResult<boolean>> {
    return agentService.checkCliInstalled(agentType)
  }

  @IpcMethod()
  async start(
    sessionId: string,
    agentType: AgentType,
    cwd: string
  ): Promise<IpcResult<void>> {
    return agentService.startSession(sessionId, agentType, cwd)
  }

  @IpcMethod()
  async send(sessionId: string, message: string): Promise<IpcResult<void>> {
    return agentService.sendMessage(sessionId, message)
  }

  @IpcMethod()
  async interrupt(sessionId: string): Promise<IpcResult<void>> {
    return agentService.interrupt(sessionId)
  }

  @IpcMethod()
  async getMessages(sessionId: string): Promise<IpcResult<AgentMessage[]>> {
    return agentService.getMessages(sessionId)
  }

  @IpcMethod()
  async close(sessionId: string): Promise<IpcResult<void>> {
    return agentService.closeSession(sessionId)
  }
}
```

### 4.2 Workspace IPC 服务

位置：`src/main/ipc/services/workspace.ts`

```typescript
import { randomUUID } from 'node:crypto'
import { basename } from 'node:path'
import { IpcMethod, IpcService } from 'electron-ipc-decorator'
import { gitService } from '../../services/git'
import { storeService } from '../../services/store'

@IpcService('workspace')
export class WorkspaceService {
  @IpcMethod()
  async list(): Promise<IpcResult<Workspace[]>> {
    return { ok: true, data: storeService.getWorkspaces() }
  }

  @IpcMethod()
  async add(path: string): Promise<IpcResult<Workspace>> {
    const isRepo = await gitService.isGitRepository(path)
    if (!isRepo.ok || !isRepo.data) {
      return { ok: false, error: '所选目录不是 Git 仓库' }
    }

    const existing = storeService.getWorkspaces().find(w => w.repoPath === path)
    if (existing) {
      return { ok: false, error: '该 Workspace 已存在' }
    }

    const workspace: Workspace = {
      id: randomUUID(),
      name: basename(path),
      repoPath: path
    }
    storeService.addWorkspace(workspace)
    return { ok: true, data: workspace }
  }

  @IpcMethod()
  async remove(id: string, deleteWorktrees: boolean = true): Promise<IpcResult<void>> {
    const sessions = storeService.getSessions(id)

    if (deleteWorktrees) {
      for (const session of sessions) {
        const ws = storeService.getWorkspaces().find(w => w.id === id)
        if (ws) {
          await gitService.removeWorktree(ws.repoPath, session.worktreePath)
          await gitService.deleteBranch(ws.repoPath, session.branch)
        }
      }
    }

    storeService.removeWorkspace(id)
    return { ok: true }
  }

  @IpcMethod()
  async validate(id: string): Promise<IpcResult<boolean>> {
    const ws = storeService.getWorkspaces().find(w => w.id === id)
    if (!ws) return { ok: true, data: false }
    return gitService.isGitRepository(ws.repoPath)
  }
}
```

### 4.3 Session IPC 服务

位置：`src/main/ipc/services/session.ts`

```typescript
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { IpcMethod, IpcService } from 'electron-ipc-decorator'
import { agentService } from '../../services/agent/agent-service'
import { gitService } from '../../services/git'
import { storeService } from '../../services/store'

@IpcService('session')
export class SessionService {
  @IpcMethod()
  async list(workspaceId: string): Promise<IpcResult<Session[]>> {
    return { ok: true, data: storeService.getSessions(workspaceId) }
  }

  @IpcMethod()
  async create(
    workspaceId: string,
    options?: { name?: string; agentType?: AgentType }
  ): Promise<IpcResult<Session>> {
    const workspace = storeService.getWorkspaces().find(w => w.id === workspaceId)
    if (!workspace) {
      return { ok: false, error: 'Workspace 不存在' }
    }

    const branchResult = await gitService.getCurrentBranch(workspace.repoPath)
    if (!branchResult.ok) {
      return { ok: false, error: branchResult.error }
    }
    const baseBranch = branchResult.data!

    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).slice(2, 6)
    const branchName = `session/${timestamp}-${random}`
    const worktreePath = join(workspace.repoPath, '.worktrees', `${timestamp}-${random}`)

    const createResult = await gitService.createWorktree(
      workspace.repoPath,
      worktreePath,
      branchName,
      baseBranch
    )
    if (!createResult.ok) {
      return { ok: false, error: createResult.error }
    }

    const existingSessions = storeService.getSessions(workspaceId)
    const sessionNumber = existingSessions.length + 1

    const session: Session = {
      id: randomUUID(),
      workspaceId,
      name: options?.name || `Session ${sessionNumber}`,
      branch: branchName,
      worktreePath,
      baseBranch,
      status: 'idle',
      agentType: options?.agentType || 'codex',
      agentSessionId: null
    }

    storeService.addSession(session)

    // 启动 Agent 会话
    await agentService.startSession(session.id, session.agentType, worktreePath)

    return { ok: true, data: session }
  }

  @IpcMethod()
  async delete(sessionId: string): Promise<IpcResult<void>> {
    const session = storeService.getSession(sessionId)
    if (!session) {
      return { ok: false, error: 'Session 不存在' }
    }

    const workspace = storeService.getWorkspaces().find(w => w.id === session.workspaceId)
    if (!workspace) {
      return { ok: false, error: 'Workspace 不存在' }
    }

    // 关闭 Agent
    await agentService.closeSession(sessionId)

    // 删除 worktree 和分支
    await gitService.removeWorktree(workspace.repoPath, session.worktreePath)
    await gitService.deleteBranch(workspace.repoPath, session.branch)

    storeService.removeSession(sessionId)
    return { ok: true }
  }

  @IpcMethod()
  async rename(sessionId: string, name: string): Promise<IpcResult<void>> {
    storeService.updateSession(sessionId, { name })
    return { ok: true }
  }

  @IpcMethod()
  async setAgentType(sessionId: string, agentType: AgentType): Promise<IpcResult<void>> {
    const session = storeService.getSession(sessionId)
    if (!session) {
      return { ok: false, error: 'Session 不存在' }
    }

    // 关闭旧 Agent，启动新 Agent
    await agentService.closeSession(sessionId)
    await agentService.startSession(sessionId, agentType, session.worktreePath)

    storeService.updateSession(sessionId, {
      agentType,
      agentSessionId: null // 重置会话 ID
    })
    return { ok: true }
  }
}
```

### 4.4 Git IPC 服务

位置：`src/main/ipc/services/git.ts`

```typescript
import { IpcMethod, IpcService } from 'electron-ipc-decorator'
import { gitService } from '../../services/git'
import { storeService } from '../../services/store'

@IpcService('git')
export class GitIpcService {
  @IpcMethod()
  async status(sessionId: string): Promise<IpcResult<GitStatusEntry[]>> {
    const session = storeService.getSession(sessionId)
    if (!session) {
      return { ok: false, error: 'Session 不存在' }
    }
    return gitService.getStatus(session.worktreePath)
  }

  @IpcMethod()
  async branches(workspaceId: string): Promise<IpcResult<string[]>> {
    const workspace = storeService.getWorkspaces().find(w => w.id === workspaceId)
    if (!workspace) {
      return { ok: false, error: 'Workspace 不存在' }
    }
    return gitService.listBranches(workspace.repoPath)
  }

  @IpcMethod()
  async merge(sessionId: string, targetBranch: string): Promise<IpcResult<GitMergeResult>> {
    const session = storeService.getSession(sessionId)
    if (!session) {
      return { ok: false, error: 'Session 不存在' }
    }

    const workspace = storeService.getWorkspaces().find(w => w.id === session.workspaceId)
    if (!workspace) {
      return { ok: false, error: 'Workspace 不存在' }
    }

    return gitService.merge(workspace.repoPath, session.branch, targetBranch)
  }

  @IpcMethod()
  async branchInfo(sessionId: string): Promise<IpcResult<BranchInfo>> {
    const session = storeService.getSession(sessionId)
    if (!session) {
      return { ok: false, error: 'Session 不存在' }
    }
    return gitService.getBranchInfo(session.worktreePath, session.baseBranch)
  }
}
```

---

## 5. Preload API

位置：`src/preload/index.ts`

```typescript
import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // Workspace
  workspace: {
    list: () => ipcRenderer.invoke('workspace:list'),
    add: (path: string) => ipcRenderer.invoke('workspace:add', path),
    remove: (id: string, deleteWorktrees?: boolean) =>
      ipcRenderer.invoke('workspace:remove', id, deleteWorktrees),
    validate: (id: string) => ipcRenderer.invoke('workspace:validate', id),
  },

  // Session
  session: {
    list: (workspaceId: string) => ipcRenderer.invoke('session:list', workspaceId),
    create: (workspaceId: string, options?: { name?: string; agentType?: AgentType }) =>
      ipcRenderer.invoke('session:create', workspaceId, options),
    rename: (id: string, name: string) => ipcRenderer.invoke('session:rename', id, name),
    delete: (id: string) => ipcRenderer.invoke('session:delete', id),
    setAgentType: (id: string, agentType: AgentType) =>
      ipcRenderer.invoke('session:setAgentType', id, agentType),
  },

  // Agent
  agent: {
    checkCli: (agentType: AgentType) => ipcRenderer.invoke('agent:checkCli', agentType),
    start: (sessionId: string, agentType: AgentType, cwd: string) =>
      ipcRenderer.invoke('agent:start', sessionId, agentType, cwd),
    send: (sessionId: string, message: string) =>
      ipcRenderer.invoke('agent:send', sessionId, message),
    interrupt: (sessionId: string) => ipcRenderer.invoke('agent:interrupt', sessionId),
    getMessages: (sessionId: string) => ipcRenderer.invoke('agent:getMessages', sessionId),
    close: (sessionId: string) => ipcRenderer.invoke('agent:close', sessionId),

    // 事件监听
    onMessage: (callback: (sessionId: string, message: AgentMessage) => void) => {
      const handler = (_: unknown, sid: string, msg: AgentMessage) => callback(sid, msg)
      ipcRenderer.on('agent:message', handler)
      return () => ipcRenderer.removeListener('agent:message', handler)
    },
    onStatus: (callback: (sessionId: string, status: string) => void) => {
      const handler = (_: unknown, sid: string, status: string) => callback(sid, status)
      ipcRenderer.on('agent:status', handler)
      return () => ipcRenderer.removeListener('agent:status', handler)
    },
    onEvent: (callback: (sessionId: string, event: AgentEvent) => void) => {
      const handler = (_: unknown, sid: string, event: AgentEvent) => callback(sid, event)
      ipcRenderer.on('agent:event', handler)
      return () => ipcRenderer.removeListener('agent:event', handler)
    },
    onProgress: (callback: (sessionId: string, text: string) => void) => {
      const handler = (_: unknown, sid: string, text: string) => callback(sid, text)
      ipcRenderer.on('agent:progress', handler)
      return () => ipcRenderer.removeListener('agent:progress', handler)
    },
    onError: (callback: (sessionId: string, error: string) => void) => {
      const handler = (_: unknown, sid: string, error: string) => callback(sid, error)
      ipcRenderer.on('agent:error', handler)
      return () => ipcRenderer.removeListener('agent:error', handler)
    },
  },

  // Git
  git: {
    status: (sessionId: string) => ipcRenderer.invoke('git:status', sessionId),
    branches: (workspaceId: string) => ipcRenderer.invoke('git:branches', workspaceId),
    merge: (sessionId: string, targetBranch: string) =>
      ipcRenderer.invoke('git:merge', sessionId, targetBranch),
    branchInfo: (sessionId: string) => ipcRenderer.invoke('git:branchInfo', sessionId),

    // 变更监听
    onChanged: (callback: (sessionId: string) => void) => {
      const handler = (_: unknown, sid: string) => callback(sid)
      ipcRenderer.on('git:changed', handler)
      return () => ipcRenderer.removeListener('git:changed', handler)
    },
  },

  // System
  system: {
    selectDirectory: () => ipcRenderer.invoke('system:selectDirectory'),
  },
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
```

---

## 6. 前端组件

### 6.1 Agent 对话组件

位置：`src/renderer/src/features/agent/AgentChat.tsx`

```tsx
import { useEffect, useRef, useState } from 'react'
import { Send, Square, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAgentStore } from '@/store/agent'

interface AgentChatProps {
  sessionId: string
  agentType: AgentType
  onAgentTypeChange: (type: AgentType) => void
}

export function AgentChat({ sessionId, agentType, onAgentTypeChange }: AgentChatProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, status, error, sendMessage, interrupt } = useAgentStore(sessionId)

  const handleSend = async () => {
    if (!input.trim() || status === 'running') return
    const msg = input
    setInput('')
    await sendMessage(sessionId, msg)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSend()
    }
  }

  // 自动滚动到底部
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      {/* 头部 - Agent 选择 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
        <Select value={agentType} onValueChange={onAgentTypeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="codex">Codex</SelectItem>
            <SelectItem value="claude">Claude</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          {status === 'running' && (
            <span className="text-sm text-yellow-500">思考中...</span>
          )}
          {status === 'error' && (
            <span className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </span>
          )}
        </div>
      </div>

      {/* 消息列表 */}
      <ScrollArea className="flex-1 px-4 py-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}
          >
            <div
              className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--panel)] text-[var(--text)]'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* 命令执行记录 */}
              {msg.commands?.map((cmd, i) => (
                <div key={i} className="mt-2 p-2 bg-black/20 rounded text-sm font-mono">
                  <div className="text-green-400">$ {cmd.command}</div>
                  <div className="text-gray-400 mt-1">{cmd.output}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </ScrollArea>

      {/* 输入区 */}
      <div className="px-4 py-3 border-t border-[var(--border)]">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的指令... (Cmd+Enter 发送)"
            className="flex-1 px-3 py-2 bg-[var(--panel)] border border-[var(--border)] rounded-lg resize-none"
            rows={2}
            disabled={status === 'running'}
          />

          {status === 'running' ? (
            <Button variant="destructive" onClick={() => interrupt(sessionId)}>
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSend} disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
```

### 6.2 Agent Store

位置：`src/renderer/src/store/agent.ts`

```typescript
import { create } from 'zustand'

interface AgentState {
  sessions: Map<string, {
    messages: AgentMessage[]
    status: 'idle' | 'running' | 'error'
    error: string | null
  }>
}

interface AgentActions {
  initSession: (sessionId: string) => void
  sendMessage: (sessionId: string, message: string) => Promise<void>
  interrupt: (sessionId: string) => Promise<void>
  addMessage: (sessionId: string, message: AgentMessage) => void
  setStatus: (sessionId: string, status: 'idle' | 'running' | 'error') => void
  setError: (sessionId: string, error: string | null) => void
}

export const useAgentStore = create<AgentState & AgentActions>((set, get) => ({
  sessions: new Map(),

  initSession: (sessionId) => {
    const sessions = new Map(get().sessions)
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        messages: [],
        status: 'idle',
        error: null
      })
      set({ sessions })
    }
  },

  sendMessage: async (sessionId, message) => {
    const result = await window.api.agent.send(sessionId, message)
    if (!result.ok) {
      get().setError(sessionId, result.error || '发送失败')
    }
  },

  interrupt: async (sessionId) => {
    await window.api.agent.interrupt(sessionId)
  },

  addMessage: (sessionId, message) => {
    const sessions = new Map(get().sessions)
    const session = sessions.get(sessionId)
    if (session) {
      session.messages = [...session.messages, message]
      set({ sessions })
    }
  },

  setStatus: (sessionId, status) => {
    const sessions = new Map(get().sessions)
    const session = sessions.get(sessionId)
    if (session) {
      session.status = status
      set({ sessions })
    }
  },

  setError: (sessionId, error) => {
    const sessions = new Map(get().sessions)
    const session = sessions.get(sessionId)
    if (session) {
      session.error = error
      session.status = 'error'
      set({ sessions })
    }
  },
}))

// 初始化事件监听
export function initAgentListeners() {
  const store = useAgentStore.getState()

  window.api.agent.onMessage((sessionId, message) => {
    store.addMessage(sessionId, message)
  })

  window.api.agent.onStatus((sessionId, status) => {
    store.setStatus(sessionId, status as any)
  })

  window.api.agent.onError((sessionId, error) => {
    store.setError(sessionId, error)
  })
}
```

---

## 7. 数据模型

### 7.1 持久化模型

位置：`src/main/types.ts`

```typescript
// Workspace - 已注册的 Git 仓库
interface Workspace {
  id: string
  name: string
  repoPath: string
}

// Session - worktree + Agent 会话
interface Session {
  id: string
  workspaceId: string
  name: string
  branch: string
  worktreePath: string
  baseBranch: string
  status: SessionStatus
  agentType: AgentType
  agentSessionId: string | null  // CLI 的 thread_id
}

type SessionStatus = 'idle' | 'running' | 'error'
type AgentType = 'codex' | 'claude'

// Git 文件状态
interface GitStatusEntry {
  path: string
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'untracked'
  staged: boolean
}

// 合并结果
interface GitMergeResult {
  success: boolean
  conflicted: boolean
  conflicts?: string[]
  message: string
}
```

### 7.2 Store Service

位置：`src/main/services/store.ts`

```typescript
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { app } from 'electron'

interface StoreData {
  workspaces: Workspace[]
  sessions: Session[]
  preferences: {
    defaultAgent: AgentType
    autoRefreshInterval: number
  }
}

class StoreService {
  private filePath: string
  private data: StoreData

  constructor() {
    this.filePath = join(app.getPath('userData'), 'data.json')
    this.data = this.load()
  }

  private load(): StoreData {
    if (existsSync(this.filePath)) {
      const raw = readFileSync(this.filePath, 'utf-8')
      return JSON.parse(raw)
    }
    return {
      workspaces: [],
      sessions: [],
      preferences: {
        defaultAgent: 'codex',
        autoRefreshInterval: 1000
      }
    }
  }

  private save(): void {
    const dir = dirname(this.filePath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(this.filePath, JSON.stringify(this.data, null, 2))
  }

  // Workspace CRUD
  getWorkspaces(): Workspace[] { return this.data.workspaces }
  addWorkspace(ws: Workspace): void { this.data.workspaces.push(ws); this.save() }
  removeWorkspace(id: string): void {
    this.data.workspaces = this.data.workspaces.filter(w => w.id !== id)
    this.data.sessions = this.data.sessions.filter(s => s.workspaceId !== id)
    this.save()
  }

  // Session CRUD
  getSessions(workspaceId: string): Session[] {
    return this.data.sessions.filter(s => s.workspaceId === workspaceId)
  }
  getSession(id: string): Session | undefined {
    return this.data.sessions.find(s => s.id === id)
  }
  addSession(session: Session): void { this.data.sessions.push(session); this.save() }
  updateSession(id: string, updates: Partial<Session>): void {
    const idx = this.data.sessions.findIndex(s => s.id === id)
    if (idx !== -1) {
      this.data.sessions[idx] = { ...this.data.sessions[idx], ...updates }
      this.save()
    }
  }
  removeSession(id: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.id !== id)
    this.save()
  }

  // Preferences
  getPreferences() { return this.data.preferences }
  updatePreferences(updates: Partial<StoreData['preferences']>): void {
    this.data.preferences = { ...this.data.preferences, ...updates }
    this.save()
  }
}

export const storeService = new StoreService()
```

---

## 8. 文件监听

位置：`src/main/services/watcher.ts`

```typescript
import chokidar from 'chokidar'
import { BrowserWindow } from 'electron'

const watchers: Map<string, chokidar.FSWatcher> = new Map()

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function watchSession(sessionId: string, worktreePath: string): void {
  if (watchers.has(sessionId)) return

  const notify = debounce(() => {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((win) => {
      win.webContents.send('git:changed', sessionId)
    })
  }, 500)

  const watcher = chokidar.watch(worktreePath, {
    ignored: [
      /(^|[/\\])\../,
      '**/node_modules/**',
      '**/.git/**'
    ],
    persistent: true,
    ignoreInitial: true
  })

  watcher.on('all', notify)
  watchers.set(sessionId, watcher)
}

export function unwatchSession(sessionId: string): void {
  const watcher = watchers.get(sessionId)
  if (watcher) {
    watcher.close()
    watchers.delete(sessionId)
  }
}
```

---

## 9. 错误处理

### 9.1 CLI 检测

```typescript
// 启动时检测 CLI 是否可用
async function checkCliAvailability() {
  const codexInstalled = await agentService.checkCliInstalled('codex')
  const claudeInstalled = await agentService.checkCliInstalled('claude')

  return {
    codex: codexInstalled.data,
    claude: claudeInstalled.data
  }
}
```

### 9.2 认证状态检测

通过尝试执行简单命令来检测认证状态：

```typescript
async function checkAuth(agentType: AgentType): Promise<boolean> {
  try {
    const cli = agentType === 'codex' ? 'codex' : 'claude'
    // 执行一个简单的测试命令
    const result = await execAsync(`${cli} exec --json "echo test"`)
    return !result.includes('login') && !result.includes('auth')
  } catch {
    return false
  }
}
```

---

## 10. 开发顺序

### Phase 1：核心 Agent 集成
1. 实现 AgentService
2. 实现 Agent IPC
3. 创建 AgentChat 组件
4. 测试 Codex 对话流程

### Phase 2：Session 管理
1. 实现完整的 Session CRUD
2. 集成 Git worktree 创建/删除
3. 持久化 Agent 会话 ID（用于 resume）

### Phase 3：UI 完善
1. 改动文件列表
2. 合并功能
3. 错误提示和空状态

### Phase 4：打磨
1. Claude Code 支持（待 API 确认）
2. 快捷键
3. 边界情况处理

---

*文档版本 3.0 | 2026-01-31*
