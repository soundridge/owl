# CLI Worktree 管理器 - 产品需求文档

**版本**：2.0
**日期**：2026-01-30

---

## 概述

一款 Electron 桌面应用，为每个 CLI 编程代理（codex、claude code 等）创建独立的 git worktree，避免多代理并行时的文件冲突。

**核心功能**：
- 管理 Workspace（git 仓库）
- 管理 Session（worktree + 终端）
- 显示 Session 改动文件列表
- 合并 Session 到目标分支

**技术栈**：Electron + React + TypeScript + xterm.js + node-pty

---

## 功能规格

### 1. Workspace 管理

#### 1.1 添加 Workspace

**触发方式**：点击"+ 添加 Workspace"按钮

**流程**：
1. 打开系统文件选择器（仅目录模式）
2. 用户选择目录
3. 验证目录是否为 git 仓库（检查 `.git` 存在）
4. 验证通过 → 保存到配置，显示在列表
5. 验证失败 → Toast 提示"所选目录不是 Git 仓库"

**边界处理**：
| 情况 | 处理 |
|------|------|
| 目录已添加 | 提示"已存在"，高亮现有项 |
| 选择 .git 目录 | 自动使用父目录 |

#### 1.2 Workspace 列表

**显示内容**：
- 名称（目录名）
- 路径
- Session 数量

**排序**：按添加时间倒序

**持久化**：应用重启后保持

#### 1.3 移除 Workspace

**触发方式**：右键菜单 → 移除

**确认对话框内容**：
```
移除 Workspace: {name}

相关 Session 将被删除：
- Session 1
- Session 2

Worktree 目录处理：
○ 保留
● 同时删除 (推荐)

[取消] [确认]
```

**操作**：
- 删除 Session 元数据
- 根据选择删除或保留 worktree 目录
- 不删除原始仓库

#### 1.4 Workspace 状态检测

**时机**：应用启动时

**检测**：仓库路径是否有效

**无效时**：
- 显示警告图标
- 提供"重新定位"和"移除"选项

---

### 2. Session 管理

#### 2.1 创建 Session

**触发方式**：选中 Workspace → 点击"新建 Session"

**流程**：
1. 获取当前分支（HEAD）
2. 生成分支名：`session/{timestamp}-{random4}`（如 `session/20260130-a1b2`）
3. 创建分支：`git branch {branch}`
4. 创建 worktree：`git worktree add {path} {branch}`
   - 路径：`{repo}/.worktrees/{branch}`
5. 创建 Session 记录，名称：`Session {N}`
6. 自动打开新创建的 Session

**边界处理**：
| 情况 | 处理 |
|------|------|
| 分支名冲突 | 自动添加随机后缀重试 |
| worktree 创建失败 | 显示错误，不创建 Session |
| 磁盘空间不足 | 显示错误 |

#### 2.2 打开 Session

**触发方式**：点击 Session 列表项

**操作**：
1. 在终端区域启动 shell，工作目录为 worktree 路径
2. 右侧显示该 Session 的改动文件列表
3. 列表项高亮显示

**切换行为**：切换 Session 时保留之前的终端状态

#### 2.3 编辑 Session 名称

**触发方式**：双击名称

**交互**：
- 显示输入框，预填当前名称
- Enter 或失焦保存
- Escape 取消
- 空名称恢复原值
- 最大 50 字符

#### 2.4 关闭 Session

**触发方式**：Session 项上的关闭图标 / 右键菜单

**操作**：
- 停止终端进程
- 保留 worktree 和改动
- Session 状态变为 `closed`
- 仍在列表显示，可重新打开

#### 2.5 删除 Session

**触发方式**：右键菜单 → 删除

**确认对话框内容**：
```
删除 Session: {name}

将永久删除：
- Worktree 目录及所有改动 ({n} 个文件已修改)
- 分支: {branch}

⚠️ 此操作无法撤销

[取消] [确认删除]
```

**操作**：
1. 停止终端进程
2. 执行 `git worktree remove {path}`
3. 执行 `git branch -D {branch}`
4. 删除 Session 记录

**边界处理**：
| 情况 | 处理 |
|------|------|
| 终端正在运行 | 警告后强制终止 |
| worktree 被占用 | 显示错误，提供手动清理指引 |

---

### 3. 嵌入式终端

#### 3.1 终端配置

| 配置项 | 值 |
|--------|-----|
| Shell | 用户默认 $SHELL 或 /bin/zsh |
| 工作目录 | Session 的 worktree 路径 |
| 环境变量 | 继承用户环境 |
| 默认尺寸 | 80 × 24 |
| 颜色 | 256 色 + True Color |

#### 3.2 终端功能

- 键盘输入（含 Ctrl 组合键）
- 复制粘贴（Cmd+C/V）
- 鼠标滚动
- Tab 补全（shell 提供）
- Ctrl+C 中断
- 尺寸随窗口自适应

#### 3.3 错误处理

**Shell 启动失败时**：
```
┌────────────────────────────────┐
│  ⚠️ 终端启动失败               │
│                                │
│  无法启动 shell: {shell}       │
│  错误: {message}               │
│                                │
│  [重试]                        │
└────────────────────────────────┘
```

**Shell 异常退出**：显示退出码，提供"重启终端"按钮

---

### 4. 改动文件列表

#### 4.1 显示内容

**位置**：右侧面板

**数据来源**：`git status --porcelain` （在 worktree 目录执行）

**分组显示**：
```
▼ 新增 (2)
  + src/components/Payment.tsx
  + src/utils/stripe.ts

▼ 修改 (2)
  ~ src/App.tsx
  ~ src/routes/index.ts

▼ 删除 (1)
  - src/legacy/checkout.js
```

**图标颜色**：
- `+` 新增：绿色 #22c55e
- `~` 修改：黄色 #eab308
- `-` 删除：红色 #ef4444

**空状态**：显示"暂无改动"

#### 4.2 自动刷新

**机制**：
1. 使用 chokidar 监听 worktree 目录
2. 检测到变化后防抖 500ms
3. 执行 `git status --porcelain`
4. 更新列表

**手动刷新**：提供刷新按钮

---

### 5. 合并功能

#### 5.1 合并对话框

**触发方式**：Session 面板的"合并"按钮

**对话框内容**：
```
┌────────────────────────────────────┐
│          合并 Session              │
├────────────────────────────────────┤
│                                    │
│  源分支:  {session-branch}         │
│                                    │
│  目标分支: [main          ▼]       │
│                                    │
│  [取消]            [确认合并]      │
│                                    │
└────────────────────────────────────┘
```

**目标分支选项**：列出所有本地分支，默认为 Session 的 baseBranch

#### 5.2 合并执行

**前置检查**：
1. Session 有未提交改动 → 提示先提交或选择自动提交
2. 目标分支工作区不干净 → 阻止合并，提示清理

**执行**：
```bash
cd {repo}
git checkout {target-branch}
git merge {session-branch}
```

**结果处理**：

成功：
```
✅ 合并成功

已将 {session-branch} 合并到 {target}

合并的文件:
• file1.tsx
• file2.ts

[关闭] [删除 Session]
```

冲突：
```
⚠️ 存在冲突

冲突文件:
• src/App.tsx
• src/routes/index.ts

请在 {target} 分支手动解决后提交。

[关闭]
```

---

## UI 布局

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLI Worktree Manager                              [—] [□] [×]      │
├────────────────────┬────────────────────────────┬───────────────────┤
│ WORKSPACES         │                            │ CHANGES           │
│                    │                            │                   │
│ ▼ my-project       │                            │ ▼ Modified (3)    │
│   ├─ Session 1 ●   │       Terminal Area        │   ~ App.tsx       │
│   └─ Session 2 ○   │                            │   ~ index.ts      │
│                    │                            │   ~ package.json  │
│ ▼ another-repo     │                            │                   │
│   └─ Session 1     │                            │ ▼ Untracked (1)   │
│                    │                            │   + new.ts        │
│                    │                            │                   │
│ [+ Add Workspace]  │                            │ [Merge] [刷新]    │
├────────────────────┴────────────────────────────┴───────────────────┤
│ Session: my-project/Session 1 | .worktrees/session-20260130-a1b2    │
└─────────────────────────────────────────────────────────────────────┘
```

### 区域尺寸

| 区域 | 默认宽度 | 最小宽度 | 可拖拽调整 |
|------|----------|----------|------------|
| 左侧边栏 | 240px | 180px | ✅ |
| 终端区域 | 弹性 | 400px | ✅ |
| 右侧边栏 | 280px | 200px | ✅ |

### 配色（深色主题）

| 元素 | 颜色 |
|------|------|
| 主背景 | #1e1e1e |
| 边栏背景 | #252526 |
| 文字主色 | #cccccc |
| 文字次色 | #858585 |
| 强调色/选中 | #0e7490 |
| 边框 | #3c3c3c |

### 快捷键

| 快捷键 | 动作 |
|--------|------|
| Cmd+N | 新建 Session |
| Cmd+W | 关闭当前 Session |
| Cmd+Tab | 切换 Session |
| Cmd+R | 刷新改动列表 |
| Cmd+Shift+M | 打开合并对话框 |

---

## 数据模型

### Workspace

```typescript
interface Workspace {
  id: string // UUID
  name: string // 显示名称（目录名）
  path: string // 仓库绝对路径
  createdAt: string // ISO 时间戳
}
```

### Session

```typescript
interface Session {
  id: string // UUID
  workspaceId: string // 关联 Workspace
  name: string // 显示名称
  branchName: string // Git 分支名
  worktreePath: string // Worktree 绝对路径
  baseBranch: string // 创建时的基础分支
  status: 'active' | 'closed' | 'error'
  createdAt: string
}
```

### FileStatus

```typescript
interface FileStatus {
  path: string
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'untracked'
}
```

### MergeResult

```typescript
interface MergeResult {
  success: boolean
  conflicts?: string[]
  mergedFiles?: string[]
  errorMessage?: string
}
```

### 存储配置

```typescript
interface StoreSchema {
  workspaces: Workspace[]
  sessions: Session[]
  preferences: {
    terminalFontSize: number // 默认 13
    terminalFontFamily: string // 默认 'SF Mono, Monaco, Consolas, monospace'
    autoRefreshInterval: number // 默认 1000ms
    confirmBeforeDelete: boolean // 默认 true
  }
}
```

**存储路径**：
- macOS: `~/Library/Application Support/cli-worktree-manager/config.json`
- Windows: `%APPDATA%/cli-worktree-manager/config.json`
- Linux: `~/.config/cli-worktree-manager/config.json`

---

## 技术架构

```
┌──────────────────────────────────────────────────────────────┐
│                     Renderer Process                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │  React UI  │  │  xterm.js  │  │  Zustand   │              │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘              │
│        └───────────────┼───────────────┘                      │
│                        │                                      │
│               IPC (preload.js)                                │
└────────────────────────┼─────────────────────────────────────┘
                         │
┌────────────────────────┼─────────────────────────────────────┐
│                  Main Process                                 │
│                        │                                      │
│  ┌────────────┐  ┌─────┴──────┐  ┌────────────┐              │
│  │ GitService │  │  PTYManager │  │ConfigStore │              │
│  │(simple-git)│  │ (node-pty) │  │(electron-  │              │
│  │            │  │            │  │ store)     │              │
│  └─────┬──────┘  └─────┬──────┘  └────────────┘              │
│        │               │                                      │
│        ▼               ▼                                      │
│   [Git CLI]       [Shell]                                     │
└──────────────────────────────────────────────────────────────┘
```

### IPC 通道

```typescript
const IPC_CHANNELS = {
  // Workspace
  'workspace:add': (path: string) => Workspace | Error,
  'workspace:list': () => Workspace[],
  'workspace:remove': (id: string, deleteWorktrees: boolean) => void,

  // Session
  'session:create': (workspaceId: string) => Session,
  'session:list': (workspaceId: string) => Session[],
  'session:open': (sessionId: string) => void,
  'session:close': (sessionId: string) => void,
  'session:delete': (sessionId: string) => void,
  'session:rename': (sessionId: string, name: string) => void,

  // Terminal
  'terminal:data': (sessionId: string, data: string) => void,  // 双向
  'terminal:resize': (sessionId: string, cols: number, rows: number) => void,

  // Git
  'git:status': (worktreePath: string) => FileStatus[],
  'git:merge': (repo: string, source: string, target: string) => MergeResult,
  'git:branches': (repo: string) => string[],

  // File Watcher
  'file:changed': (sessionId: string) => void,  // Main → Renderer
};
```

### Git 命令参考

```bash
# 检测 Git 仓库
test -d {path}/.git

# 获取当前分支
git -C {repo} rev-parse --abbrev-ref HEAD

# 列出分支
git -C {repo} branch --list

# 创建分支
git -C {repo} branch {branch}

# 创建 worktree
git -C {repo} worktree add {worktree-path} {branch}

# 删除 worktree
git -C {repo} worktree remove {worktree-path}

# 删除分支
git -C {repo} branch -D {branch}

# 获取状态
git -C {worktree} status --porcelain

# 合并
git -C {repo} checkout {target} && git -C {repo} merge {source}
```

---

## 依赖

### npm 包

| 包 | 版本 | 用途 |
|----|------|------|
| electron | ^28.0.0 | 桌面框架 |
| react | ^18.2.0 | UI |
| xterm | ^5.3.0 | 终端前端 |
| xterm-addon-fit | ^0.8.0 | 终端自适应 |
| node-pty | ^1.0.0 | PTY 后端 |
| simple-git | ^3.20.0 | Git 操作 |
| electron-store | ^8.1.0 | 配置持久化 |
| chokidar | ^3.5.3 | 文件监听 |
| zustand | ^4.4.0 | 状态管理 |

### 系统依赖

- Git ≥ 2.20（需在 PATH 中）

---

## 性能要求

| 操作 | 目标 |
|------|------|
| Session 创建 | < 3s |
| 终端启动 | < 500ms |
| Git status 刷新 | < 1s（< 10k 文件仓库）|
| UI 响应 | < 100ms |

---

## MVP 范围

**包含**：
- Workspace 增删查
- Session 增删查 + 重命名
- 嵌入式终端
- 改动文件列表（自动刷新）
- 合并到目标分支

**不包含**：
- Diff 预览
- 文件内容查看
- Stage/unstage 操作
- 自动冲突解决
- 远程仓库操作

---

## 术语

| 术语 | 定义 |
|------|------|
| Workspace | 已注册的本地 Git 仓库 |
| Session | 一个 worktree + 关联终端 |
| Worktree | Git 的同仓库多检出目录特性 |

---

*文档版本 2.0 | 2026-01-30*
