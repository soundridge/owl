# 技术方案：CLI Worktree 管理器

**版本**：2.0
**日期**：2026-01-30
**依据**：docs/cli-worktree-manager-prd-v2.md

---

## 1. 技术栈

### 已有依赖（直接使用）

| 类别 | 技术 | 用途 |
|------|------|------|
| 框架 | Electron 40 + electron-vite | 桌面应用 |
| 前端 | React 19 + TypeScript 5.9 | UI |
| 样式 | Tailwind CSS 4 + shadcn/ui | 组件库 |
| 布局 | react-resizable-panels | 三栏布局 |
| IPC | electron-ipc-decorator | Main/Renderer 通信 |
| 通知 | sonner | Toast 通知 |
| 表单 | react-hook-form + zod | 表单验证 |
| 图标 | lucide-react | 图标库 |

### 需新增依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| xterm | ^5.3.0 | 终端前端 |
| @xterm/addon-fit | ^0.10.0 | 终端自适应尺寸 |
| @xterm/addon-web-links | ^0.11.0 | 终端链接支持 |
| node-pty | ^1.0.0 | PTY 后端 |
| chokidar | ^3.6.0 | 文件监听 |

**安装命令**：
```bash
npm install xterm @xterm/addon-fit @xterm/addon-web-links node-pty chokidar
```

---

## 2. UI 架构

### 3.1 分层结构

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  (应用入口，Provider 注入，渲染 AppLayout)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      layout/                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ AppLayout.tsx                                        │    │
│  │ - 全屏容器，处理窗口级样式                            │    │
│  │ - 可选：标题栏、全局快捷键                            │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ PanelLayout.tsx                                      │    │
│  │ - 三栏布局（react-resizable-panels）                  │    │
│  │ - 管理 Sidebar / Terminal / Inspector 的尺寸和折叠    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      features/                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   sidebar/   │  │  terminal/   │  │  inspector/  │       │
│  │  Sidebar.tsx │  │TerminalPanel │  │InspectorPanel│       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              components/ui/ (shadcn/ui)                      │
│  ⚠️ 禁止修改 - 通过 npx shadcn@latest add 安装              │
│  Button, Dialog, ScrollArea, Select, Collapsible...         │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Layout 层组件

#### AppLayout.tsx

应用的最外层容器，职责：
- 提供全屏容器和基础样式
- 处理 Electron 窗口相关逻辑（如 frameless 模式下的标题栏）
- 可选：全局键盘快捷键监听

```tsx
// src/renderer/src/layout/AppLayout.tsx
import { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      {children}
    </div>
  )
}
```

#### PanelLayout.tsx

三栏可调整面板布局，职责：
- 使用 `react-resizable-panels` 实现三栏布局
- 管理各面板的尺寸约束（minSize/maxSize/defaultSize）
- 处理 Sidebar 的折叠/展开逻辑
- 渲染分隔线（Separator）

```tsx
// src/renderer/src/layout/PanelLayout.tsx
import { ReactNode, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

interface PanelLayoutProps {
  sidebar: ReactNode
  main: ReactNode
  inspector: ReactNode
}

export function PanelLayout({ sidebar, main, inspector }: PanelLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <PanelGroup direction="horizontal" id="main-layout">
      {/* Sidebar */}
      {!sidebarCollapsed && (
        <>
          <Panel id="sidebar" defaultSize={15} minSize={12} maxSize={25}>
            {sidebar}
          </Panel>
          <PanelResizeHandle className="w-px bg-[var(--separator)] hover:bg-[var(--border-active)]" />
        </>
      )}

      {/* Main (Terminal) */}
      <Panel id="main" minSize={30}>
        {main}
      </Panel>

      <PanelResizeHandle className="w-px bg-[var(--separator)] hover:bg-[var(--border-active)]" />

      {/* Inspector */}
      <Panel id="inspector" defaultSize={22} minSize={15} maxSize={40}>
        {inspector}
      </Panel>
    </PanelGroup>
  )
}
```

### 3.3 shadcn/ui 组件规范

`src/renderer/src/components/ui/` 目录存放的是 [shadcn/ui](https://ui.shadcn.com/) 官方组件。

**重要规则**：

1. **禁止直接修改** - 这些组件通过 `npx shadcn@latest add <component>` 安装，任何手动修改都会在升级时丢失

2. **添加新组件** - 使用 CLI 安装：
   ```bash
   npx shadcn@latest add button
   npx shadcn@latest add dialog
   ```

3. **定制样式** - 如需定制，有两种方式：
   - 在使用处通过 `className` 覆盖样式
   - 在 `features/` 中创建封装组件，内部使用 shadcn 组件

4. **现有组件列表**：
   - accordion, alert, alert-dialog, aspect-ratio, avatar
   - badge, breadcrumb, button, button-group
   - calendar, card, carousel, chart, checkbox, collapsible, command, context-menu
   - dialog, drawer, dropdown-menu
   - empty, empty-state, error-state
   - field, form
   - hover-card
   - icon-button, input, input-group, input-otp, item
   - kbd
   - label, loading-state
   - menubar
   - navigation-menu
   - pagination, popover, progress
   - radio-group, resizable
   - scroll-area, select, separator, sheet, skeleton, slider, sonner, spinner, switch
   - table, tabs, textarea, toggle, toggle-group, tooltip

---

## 3. 数据模型

### 3.1 持久化模型（Main）

位置：`src/main/types.ts`

```typescript
// Workspace - 已注册的 Git 仓库
interface Workspace {
  id: string           // UUID
  name: string         // 显示名称（目录名）
  repoPath: string     // 仓库绝对路径
}

// Session - worktree 工作单元
interface Session {
  id: string           // UUID
  workspaceId: string  // 关联 Workspace
  name: string         // 显示名称
  branch: string       // Git 分支名
  worktreePath: string // Worktree 绝对路径
  baseBranch: string   // 创建时的基础分支
  status: SessionStatus
}

type SessionStatus = 'idle' | 'running' | 'error'

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

### 3.2 运行态模型（内存）

```typescript
// PTY 会话（仅运行时）
interface PtySession {
  ptyId: string
  sessionId: string
  pid: number
}
```

### 3.3 前端状态模型

位置：`src/renderer/src/types/index.ts`

```typescript
// 异步状态包装
interface AsyncState<T> {
  data: T | null
  status: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
}

// 终端状态
interface TerminalState {
  sessionId: string | null
  ptyId: string | null
  isConnected: boolean
  status: 'idle' | 'running' | 'error'
}

// 前端 Workspace（含 sessions）
interface WorkspaceWithSessions extends Workspace {
  sessions: Session[]
}

// 分支信息
interface BranchInfo {
  current: string
  baseBranch: string
  ahead: number
  behind: number
}

// 文件改动（前端展示用）
interface FileChange {
  path: string
  status: 'added' | 'modified' | 'deleted' | 'untracked'
  staged: boolean
}
```

---

## 4. 持久化存储

### 4.1 存储方案

使用 Electron 原生 `app.getPath('userData')` + JSON 文件。

**存储路径**：
- macOS: `~/Library/Application Support/owl/data.json`
- Windows: `%APPDATA%/owl/data.json`
- Linux: `~/.config/owl/data.json`

### 4.2 Store Service

位置：`src/main/services/store.ts`

```typescript
import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

interface StoreData {
  workspaces: Workspace[]
  sessions: Session[]
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
    return { workspaces: [], sessions: [] }
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
  getSession(id: string): Session | undefined {
    return this.data.sessions.find(s => s.id === id)
  }
}

export const storeService = new StoreService()
```

---

## 5. IPC API 规范

使用 `electron-ipc-decorator`，装饰器自动处理 IPC 通道注册。

### 5.1 Workspace Service

位置：`src/main/ipc/services/workspace.ts`

```typescript
import { IpcService, IpcMethod } from 'electron-ipc-decorator'
import { storeService } from '../../services/store'
import { gitService } from '../../services/git'
import { randomUUID } from 'crypto'
import { basename } from 'path'

@IpcService('workspace')
export class WorkspaceService {
  @IpcMethod()
  async list(): Promise<IpcResult<Workspace[]>> {
    return { ok: true, data: storeService.getWorkspaces() }
  }

  @IpcMethod()
  async add(path: string): Promise<IpcResult<Workspace>> {
    // 验证是否为 git 仓库
    const isRepo = await gitService.isGitRepository(path)
    if (!isRepo.ok || !isRepo.data) {
      return { ok: false, error: '所选目录不是 Git 仓库' }
    }

    // 检查是否已存在
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
        // 删除 worktree 和分支
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

### 5.2 Session Service

位置：`src/main/ipc/services/session.ts`

```typescript
import { IpcService, IpcMethod } from 'electron-ipc-decorator'
import { storeService } from '../../services/store'
import { gitService } from '../../services/git'
import { ptyService } from '../../services/pty'
import { randomUUID } from 'crypto'
import { join } from 'path'

@IpcService('session')
export class SessionService {
  @IpcMethod()
  async list(workspaceId: string): Promise<IpcResult<Session[]>> {
    return { ok: true, data: storeService.getSessions(workspaceId) }
  }

  @IpcMethod()
  async create(workspaceId: string, name?: string): Promise<IpcResult<Session>> {
    const workspace = storeService.getWorkspaces().find(w => w.id === workspaceId)
    if (!workspace) {
      return { ok: false, error: 'Workspace 不存在' }
    }

    // 获取当前分支
    const branchResult = await gitService.getCurrentBranch(workspace.repoPath)
    if (!branchResult.ok) {
      return { ok: false, error: branchResult.error }
    }
    const baseBranch = branchResult.data!

    // 生成分支名和路径
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).slice(2, 6)
    const branchName = `session/${timestamp}-${random}`
    const worktreePath = join(workspace.repoPath, '.worktrees', `${timestamp}-${random}`)

    // 创建 worktree
    const createResult = await gitService.createWorktree(
      workspace.repoPath,
      worktreePath,
      branchName,
      baseBranch
    )
    if (!createResult.ok) {
      return { ok: false, error: createResult.error }
    }

    // 计算 session 序号
    const existingSessions = storeService.getSessions(workspaceId)
    const sessionNumber = existingSessions.length + 1

    const session: Session = {
      id: randomUUID(),
      workspaceId,
      name: name || `Session ${sessionNumber}`,
      branch: branchName,
      worktreePath,
      baseBranch,
      status: 'idle'
    }

    storeService.addSession(session)
    return { ok: true, data: session }
  }

  @IpcMethod()
  async rename(sessionId: string, name: string): Promise<IpcResult<void>> {
    storeService.updateSession(sessionId, { name })
    return { ok: true }
  }

  @IpcMethod()
  async delete(
    sessionId: string,
    options: { removeWorktree?: boolean; removeBranch?: boolean } = {}
  ): Promise<IpcResult<void>> {
    const { removeWorktree = true, removeBranch = true } = options
    const session = storeService.getSession(sessionId)
    if (!session) {
      return { ok: false, error: 'Session 不存在' }
    }

    const workspace = storeService.getWorkspaces().find(w => w.id === session.workspaceId)
    if (!workspace) {
      return { ok: false, error: 'Workspace 不存在' }
    }

    // 先销毁 PTY
    const ptySession = await ptyService.getSessionBySessionId(sessionId)
    if (ptySession.ok && ptySession.data) {
      await ptyService.destroy(ptySession.data.ptyId)
    }

    // 删除 worktree
    if (removeWorktree) {
      await gitService.removeWorktree(workspace.repoPath, session.worktreePath)
    }

    // 删除分支
    if (removeBranch) {
      await gitService.deleteBranch(workspace.repoPath, session.branch)
    }

    storeService.removeSession(sessionId)
    return { ok: true }
  }
}
```

### 5.3 Terminal Service

位置：`src/main/ipc/services/terminal.ts`

```typescript
import { IpcService, IpcMethod } from 'electron-ipc-decorator'
import { ptyService } from '../../services/pty'
import { storeService } from '../../services/store'
import { BrowserWindow } from 'electron'

@IpcService('terminal')
export class TerminalService {
  @IpcMethod()
  async open(sessionId: string): Promise<IpcResult<string>> {
    const session = storeService.getSession(sessionId)
    if (!session) {
      return { ok: false, error: 'Session 不存在' }
    }

    // 检查是否已有 PTY
    const existing = await ptyService.getSessionBySessionId(sessionId)
    if (existing.ok && existing.data) {
      return { ok: true, data: existing.data.ptyId }
    }

    // 创建新 PTY
    const result = await ptyService.create(sessionId, session.worktreePath)
    if (!result.ok) {
      return { ok: false, error: result.error }
    }

    // 更新 session 状态
    storeService.updateSession(sessionId, { status: 'running' })

    return { ok: true, data: result.data }
  }

  @IpcMethod()
  async close(sessionId: string): Promise<IpcResult<void>> {
    const ptySession = await ptyService.getSessionBySessionId(sessionId)
    if (ptySession.ok && ptySession.data) {
      await ptyService.destroy(ptySession.data.ptyId)
    }
    storeService.updateSession(sessionId, { status: 'idle' })
    return { ok: true }
  }

  @IpcMethod()
  async write(ptyId: string, data: string): Promise<IpcResult<void>> {
    return ptyService.write(ptyId, data)
  }

  @IpcMethod()
  async resize(ptyId: string, cols: number, rows: number): Promise<IpcResult<void>> {
    return ptyService.resize(ptyId, { cols, rows })
  }
}
```

### 5.4 Git Service (IPC)

位置：`src/main/ipc/services/git.ts`

```typescript
import { IpcService, IpcMethod } from 'electron-ipc-decorator'
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
  async merge(
    sessionId: string,
    targetBranch: string
  ): Promise<IpcResult<GitMergeResult>> {
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

## 6. Git Service 实现

位置：`src/main/services/git.ts`

```typescript
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export class GitService {
  private async run(cwd: string, cmd: string): Promise<{ stdout: string; stderr: string }> {
    return execAsync(cmd, { cwd, encoding: 'utf-8' })
  }

  async isGitRepository(path: string): Promise<IpcResult<boolean>> {
    try {
      await this.run(path, 'git rev-parse --is-inside-work-tree')
      return { ok: true, data: true }
    } catch {
      return { ok: true, data: false }
    }
  }

  async getCurrentBranch(repoPath: string): Promise<IpcResult<string>> {
    try {
      const { stdout } = await this.run(repoPath, 'git symbolic-ref --short HEAD')
      return { ok: true, data: stdout.trim() }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async listBranches(repoPath: string): Promise<IpcResult<string[]>> {
    try {
      const { stdout } = await this.run(repoPath, 'git branch --list --format="%(refname:short)"')
      const branches = stdout.trim().split('\n').filter(Boolean)
      return { ok: true, data: branches }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async createWorktree(
    repoPath: string,
    worktreePath: string,
    branchName: string,
    baseBranch: string
  ): Promise<IpcResult<void>> {
    try {
      await this.run(repoPath, `git worktree add -b "${branchName}" "${worktreePath}" "${baseBranch}"`)
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async removeWorktree(repoPath: string, worktreePath: string): Promise<IpcResult<void>> {
    try {
      await this.run(repoPath, `git worktree remove "${worktreePath}" --force`)
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async deleteBranch(repoPath: string, branchName: string): Promise<IpcResult<void>> {
    try {
      await this.run(repoPath, `git branch -D "${branchName}"`)
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async getStatus(worktreePath: string): Promise<IpcResult<GitStatusEntry[]>> {
    try {
      const { stdout } = await this.run(worktreePath, 'git status --porcelain')
      const entries: GitStatusEntry[] = stdout
        .trim()
        .split('\n')
        .filter(Boolean)
        .map(line => {
          const staged = line[0] !== ' ' && line[0] !== '?'
          const statusChar = line[0] === ' ' ? line[1] : line[0]
          const path = line.slice(3)

          let status: GitStatusEntry['status']
          switch (statusChar) {
            case 'A': status = 'added'; break
            case 'M': status = 'modified'; break
            case 'D': status = 'deleted'; break
            case 'R': status = 'renamed'; break
            case '?': status = 'untracked'; break
            default: status = 'modified'
          }

          return { path, status, staged }
        })
      return { ok: true, data: entries }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async isClean(repoPath: string): Promise<IpcResult<boolean>> {
    try {
      const { stdout } = await this.run(repoPath, 'git status --porcelain')
      return { ok: true, data: stdout.trim() === '' }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async merge(
    repoPath: string,
    sourceBranch: string,
    targetBranch: string
  ): Promise<IpcResult<GitMergeResult>> {
    try {
      // 检查目标分支是否干净
      const cleanResult = await this.isClean(repoPath)
      if (!cleanResult.ok || !cleanResult.data) {
        return {
          ok: true,
          data: {
            success: false,
            conflicted: false,
            message: '目标分支有未提交的更改，请先处理'
          }
        }
      }

      // 切换到目标分支
      await this.run(repoPath, `git checkout "${targetBranch}"`)

      // 执行合并
      try {
        const { stdout } = await this.run(repoPath, `git merge "${sourceBranch}"`)
        return {
          ok: true,
          data: {
            success: true,
            conflicted: false,
            message: stdout.trim()
          }
        }
      } catch (mergeError: any) {
        // 检查是否有冲突
        const { stdout: statusOut } = await this.run(repoPath, 'git status --porcelain')
        const conflicts = statusOut
          .split('\n')
          .filter(line => line.startsWith('UU') || line.startsWith('AA'))
          .map(line => line.slice(3))

        if (conflicts.length > 0) {
          return {
            ok: true,
            data: {
              success: false,
              conflicted: true,
              conflicts,
              message: '合并存在冲突，请手动解决'
            }
          }
        }

        throw mergeError
      }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async getBranchInfo(worktreePath: string, baseBranch: string): Promise<IpcResult<BranchInfo>> {
    try {
      const { stdout: currentBranch } = await this.run(worktreePath, 'git symbolic-ref --short HEAD')

      // 获取 ahead/behind
      const { stdout: counts } = await this.run(
        worktreePath,
        `git rev-list --left-right --count ${baseBranch}...HEAD`
      )
      const [behind, ahead] = counts.trim().split('\t').map(Number)

      return {
        ok: true,
        data: {
          current: currentBranch.trim(),
          baseBranch,
          ahead: ahead || 0,
          behind: behind || 0
        }
      }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  }
}

export const gitService = new GitService()
```

---

## 7. PTY Service 实现

位置：`src/main/services/pty.ts`

```typescript
import * as pty from 'node-pty'
import { platform } from 'os'
import { BrowserWindow } from 'electron'

interface PtyInstance {
  pty: pty.IPty
  sessionId: string
}

export class PtyService {
  private instances: Map<string, PtyInstance> = new Map()

  async create(sessionId: string, cwd: string): Promise<IpcResult<string>> {
    const shell = platform() === 'win32'
      ? 'powershell.exe'
      : process.env.SHELL || '/bin/zsh'

    const ptyId = `pty-${sessionId}-${Date.now()}`

    try {
      const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-256color',
        cols: 80,
        rows: 24,
        cwd,
        env: process.env as { [key: string]: string }
      })

      this.instances.set(ptyId, { pty: ptyProcess, sessionId })

      // 转发数据到 Renderer
      ptyProcess.onData(data => {
        const windows = BrowserWindow.getAllWindows()
        windows.forEach(win => {
          win.webContents.send('terminal:data', ptyId, data)
        })
      })

      // 处理退出
      ptyProcess.onExit(({ exitCode }) => {
        this.instances.delete(ptyId)
        const windows = BrowserWindow.getAllWindows()
        windows.forEach(win => {
          win.webContents.send('terminal:exit', ptyId, exitCode)
        })
      })

      return { ok: true, data: ptyId }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async write(ptyId: string, data: string): Promise<IpcResult<void>> {
    const instance = this.instances.get(ptyId)
    if (!instance) {
      return { ok: false, error: 'PTY not found' }
    }
    instance.pty.write(data)
    return { ok: true }
  }

  async resize(ptyId: string, params: { cols: number; rows: number }): Promise<IpcResult<void>> {
    const instance = this.instances.get(ptyId)
    if (!instance) {
      return { ok: false, error: 'PTY not found' }
    }
    instance.pty.resize(params.cols, params.rows)
    return { ok: true }
  }

  async destroy(ptyId: string): Promise<IpcResult<void>> {
    const instance = this.instances.get(ptyId)
    if (!instance) {
      return { ok: false, error: 'PTY not found' }
    }
    instance.pty.kill()
    this.instances.delete(ptyId)
    return { ok: true }
  }

  async getSessionBySessionId(sessionId: string): Promise<IpcResult<{ ptyId: string } | null>> {
    for (const [ptyId, instance] of this.instances) {
      if (instance.sessionId === sessionId) {
        return { ok: true, data: { ptyId } }
      }
    }
    return { ok: true, data: null }
  }
}

export const ptyService = new PtyService()
```

---

## 8. 前端组件

### 8.1 终端组件

位置：`src/renderer/src/features/terminal/XTerm.tsx`

```tsx
import { useEffect, useRef, useCallback } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import 'xterm/css/xterm.css'

interface XTermProps {
  ptyId: string | null
  onReady?: () => void
}

export function XTerm({ ptyId, onReady }: XTermProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  // 初始化终端
  useEffect(() => {
    if (!containerRef.current) return

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: '"SF Mono", Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1c1c1e',
        foreground: '#e5e5e5',
        cursor: '#e5e5e5',
        cursorAccent: '#1c1c1e',
        selectionBackground: 'rgba(255, 255, 255, 0.2)',
      }
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.loadAddon(new WebLinksAddon())

    terminal.open(containerRef.current)
    fitAddon.fit()

    terminalRef.current = terminal
    fitAddonRef.current = fitAddon

    // 处理输入 -> 发送到 Main
    terminal.onData(data => {
      if (ptyId) {
        window.electron.ipcRenderer.invoke('terminal:write', ptyId, data)
      }
    })

    onReady?.()

    return () => {
      terminal.dispose()
    }
  }, [])

  // 监听 PTY 数据
  useEffect(() => {
    if (!ptyId) return

    const handleData = (_: unknown, id: string, data: string) => {
      if (id === ptyId && terminalRef.current) {
        terminalRef.current.write(data)
      }
    }

    const handleExit = (_: unknown, id: string, code: number) => {
      if (id === ptyId && terminalRef.current) {
        terminalRef.current.writeln(`\r\n[Process exited with code ${code}]`)
      }
    }

    window.electron.ipcRenderer.on('terminal:data', handleData)
    window.electron.ipcRenderer.on('terminal:exit', handleExit)

    return () => {
      window.electron.ipcRenderer.removeListener('terminal:data', handleData)
      window.electron.ipcRenderer.removeListener('terminal:exit', handleExit)
    }
  }, [ptyId])

  // 处理尺寸变化
  const handleResize = useCallback(() => {
    if (fitAddonRef.current && terminalRef.current && ptyId) {
      fitAddonRef.current.fit()
      const { cols, rows } = terminalRef.current
      window.electron.ipcRenderer.invoke('terminal:resize', ptyId, cols, rows)
    }
  }, [ptyId])

  useEffect(() => {
    const observer = new ResizeObserver(handleResize)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => observer.disconnect()
  }, [handleResize])

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-[#1c1c1e]"
    />
  )
}
```

### 8.2 文件改动列表组件

使用现有 shadcn 组件，位置：`src/renderer/src/features/inspector/ChangesTab.tsx`

```tsx
import { RefreshCw, GitBranch, FilePlus, FileEdit, FileX, File } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { FileChange, AsyncState } from '@/types'

interface ChangesTabProps {
  changes: AsyncState<FileChange[]>
  onRefresh: () => void
}

const statusConfig = {
  added: { icon: FilePlus, color: 'text-green-500', label: '新增' },
  modified: { icon: FileEdit, color: 'text-yellow-500', label: '修改' },
  deleted: { icon: FileX, color: 'text-red-500', label: '删除' },
  untracked: { icon: File, color: 'text-gray-400', label: '未跟踪' },
}

export function ChangesTab({ changes, onRefresh }: ChangesTabProps) {
  const grouped = groupByStatus(changes.data || [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
        <span className="text-sm font-medium">
          改动文件 ({changes.data?.length || 0})
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={changes.status === 'loading'}
        >
          <RefreshCw className={`h-4 w-4 ${changes.status === 'loading' ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {Object.entries(grouped).map(([status, files]) => {
          if (files.length === 0) return null
          const config = statusConfig[status as keyof typeof statusConfig]
          const Icon = config.icon

          return (
            <Collapsible key={status} defaultOpen>
              <CollapsibleTrigger className="flex items-center gap-2 px-3 py-1.5 w-full hover:bg-[var(--panel-hover)]">
                <Icon className={`h-4 w-4 ${config.color}`} />
                <span className="text-sm">{config.label} ({files.length})</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {files.map(file => (
                  <div
                    key={file.path}
                    className="flex items-center gap-2 px-6 py-1 text-sm hover:bg-[var(--panel-hover)] cursor-pointer"
                  >
                    <span className="truncate text-[var(--text-secondary)]">
                      {file.path}
                    </span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )
        })}

        {changes.data?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-[var(--text-muted)]">
            <GitBranch className="h-8 w-8 mb-2" />
            <span>暂无改动</span>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

function groupByStatus(files: FileChange[]) {
  return {
    added: files.filter(f => f.status === 'added'),
    modified: files.filter(f => f.status === 'modified'),
    deleted: files.filter(f => f.status === 'deleted'),
    untracked: files.filter(f => f.status === 'untracked'),
  }
}
```

### 8.3 合并对话框

位置：`src/renderer/src/features/inspector/MergeDialog.tsx`

```tsx
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface MergeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceBranch: string
  branches: string[]
  defaultTarget: string
  onMerge: (targetBranch: string) => Promise<MergeResult>
}

interface MergeResult {
  success: boolean
  conflicted: boolean
  conflicts?: string[]
  message: string
}

export function MergeDialog({
  open,
  onOpenChange,
  sourceBranch,
  branches,
  defaultTarget,
  onMerge,
}: MergeDialogProps) {
  const [target, setTarget] = useState(defaultTarget)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MergeResult | null>(null)

  const handleMerge = async () => {
    setLoading(true)
    const res = await onMerge(target)
    setResult(res)
    setLoading(false)
  }

  const handleClose = () => {
    setResult(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>合并 Session</DialogTitle>
        </DialogHeader>

        {!result ? (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)]">源分支</label>
                <div className="px-3 py-2 bg-[var(--panel)] rounded-md text-sm">
                  {sourceBranch}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)]">目标分支</label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.filter(b => b !== sourceBranch).map(branch => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>取消</Button>
              <Button onClick={handleMerge} disabled={loading}>
                {loading ? '合并中...' : '确认合并'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-6 text-center">
              {result.success ? (
                <>
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium mb-2">合并成功</p>
                  <p className="text-sm text-[var(--text-secondary)]">{result.message}</p>
                </>
              ) : result.conflicted ? (
                <>
                  <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                  <p className="text-lg font-medium mb-2">存在冲突</p>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    以下文件需要手动解决：
                  </p>
                  <ul className="text-sm text-left bg-[var(--panel)] rounded-md p-3">
                    {result.conflicts?.map(file => (
                      <li key={file} className="py-1">• {file}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                  <p className="text-lg font-medium mb-2">合并失败</p>
                  <p className="text-sm text-[var(--text-secondary)]">{result.message}</p>
                </>
              )}
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>关闭</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

---

## 9. 文件监听（改动自动刷新）

在 Main 进程监听 worktree 变化，通知 Renderer：

```typescript
// src/main/services/watcher.ts
import chokidar from 'chokidar'
import { BrowserWindow } from 'electron'
import { debounce } from './utils'

const watchers: Map<string, chokidar.FSWatcher> = new Map()

export function watchSession(sessionId: string, worktreePath: string): void {
  // 已有 watcher 则跳过
  if (watchers.has(sessionId)) return

  const notify = debounce(() => {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach(win => {
      win.webContents.send('git:changed', sessionId)
    })
  }, 500)

  const watcher = chokidar.watch(worktreePath, {
    ignored: [
      /(^|[\/\\])\../,  // dotfiles
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

## 10. Preload 扩展

位置：`src/preload/index.ts`

```typescript
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  workspace: {
    list: () => ipcRenderer.invoke('workspace:list'),
    add: (path: string) => ipcRenderer.invoke('workspace:add', path),
    remove: (id: string, deleteWorktrees?: boolean) =>
      ipcRenderer.invoke('workspace:remove', id, deleteWorktrees),
  },
  session: {
    list: (workspaceId: string) => ipcRenderer.invoke('session:list', workspaceId),
    create: (workspaceId: string, name?: string) =>
      ipcRenderer.invoke('session:create', workspaceId, name),
    rename: (id: string, name: string) => ipcRenderer.invoke('session:rename', id, name),
    delete: (id: string, options?: { removeWorktree?: boolean; removeBranch?: boolean }) =>
      ipcRenderer.invoke('session:delete', id, options),
  },
  terminal: {
    open: (sessionId: string) => ipcRenderer.invoke('terminal:open', sessionId),
    close: (sessionId: string) => ipcRenderer.invoke('terminal:close', sessionId),
    write: (ptyId: string, data: string) => ipcRenderer.invoke('terminal:write', ptyId, data),
    resize: (ptyId: string, cols: number, rows: number) =>
      ipcRenderer.invoke('terminal:resize', ptyId, cols, rows),
  },
  git: {
    status: (sessionId: string) => ipcRenderer.invoke('git:status', sessionId),
    branches: (workspaceId: string) => ipcRenderer.invoke('git:branches', workspaceId),
    merge: (sessionId: string, targetBranch: string) =>
      ipcRenderer.invoke('git:merge', sessionId, targetBranch),
    branchInfo: (sessionId: string) => ipcRenderer.invoke('git:branchInfo', sessionId),
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

## 11. 性能要求

| 操作 | 目标 |
|------|------|
| Session 创建（含 worktree） | < 3s |
| 终端启动 | < 500ms |
| Git status 刷新 | < 1s（10k 文件以下） |
| UI 响应 | < 100ms |

### 优化策略

- Git 操作异步执行，不阻塞 UI
- 文件监听防抖 500ms
- 大仓库提供手动刷新按钮
- 终端使用 xterm.js 虚拟化渲染

---

## 12. 错误处理

统一使用 `IpcResult<T>` 结构：

```typescript
interface IpcResult<T> {
  ok: boolean
  data?: T
  error?: string
}
```

前端使用 sonner 显示 Toast：

```typescript
import { toast } from 'sonner'

async function createSession() {
  const result = await window.api.session.create(workspaceId)
  if (!result.ok) {
    toast.error(result.error || '创建 Session 失败')
    return
  }
  toast.success('Session 创建成功')
}
```

---

## 13. 开发顺序建议

1. **Phase 1：补全 Main 层**
   - 实现真实的 GitService（替换 mock）
   - 实现真实的 PtyService（集成 node-pty）
   - 实现 StoreService 持久化

2. **Phase 2：连通 IPC**
   - 扩展 Preload API
   - 前端调用真实 IPC

3. **Phase 3：完善 UI**
   - 集成 xterm.js
   - 文件监听 + 自动刷新
   - 合并对话框

4. **Phase 4：打磨**
   - 错误处理
   - 边界情况
   - 快捷键

---

*文档版本 2.0 | 2026-01-30*
