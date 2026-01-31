# CLI Worktree 管理器 - 产品需求文档

**版本**：3.0
**日期**：2026-01-31

---

## 概述

一款 Electron 桌面应用，为 CLI 编程代理（Codex、Claude Code 等）提供友好的 GUI 界面。核心理念是**最大程度复用现有 CLI 能力**，应用本身只是一个"多开 CLI 的壳子"。

**核心价值**：
- 用户无需在终端中操作复杂的 CLI 命令
- 支持多个 AI Agent 并行工作，每个在独立的 git worktree 中
- 可视化展示文件改动、分支状态
- 一键合并 Agent 的工作成果

**技术栈**：Electron + React + TypeScript + xterm.js + node-pty

---

## 核心架构

### CLI Agent 集成方式

应用通过 `spawn` 调用已安装的 CLI 工具，**不处理认证逻辑**。用户需要自行在终端完成登录：

```bash
# 用户自行完成认证
codex login
claude login
```

应用复用 CLI 已保存的凭证，支持多轮对话：

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   CLI Agent Manager                    │   │
│  │                                                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │ CodexAgent  │  │ ClaudeAgent │  │  ...Agent   │   │   │
│  │  │             │  │             │  │             │   │   │
│  │  │ sessionId   │  │ sessionId   │  │ sessionId   │   │   │
│  │  │ cwd         │  │ cwd         │  │ cwd         │   │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │   │
│  │         │                │                │          │   │
│  │         ▼                ▼                ▼          │   │
│  │     spawn            spawn            spawn          │   │
│  │   "codex exec"    "claude ..."      "xxx ..."       │   │
│  │                                                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 多轮对话机制

**Codex**：使用 `exec --json` + `resume` 实现会话保持

```bash
# 首轮对话
codex exec --json "分析项目结构"
# 输出包含 thread_id

# 后续对话 - 使用 resume 继续
codex exec resume <SESSION_ID> --json "根据分析结果进行优化"
```

**Claude Code**：类似机制（待确认具体命令）

```bash
claude --print --output-format json "分析项目"
```

### 输出解析

CLI 输出 JSONL 格式，应用解析事件流：

```jsonl
{"type":"thread.started","thread_id":"abc123"}
{"type":"item.started","item":{"type":"command_execution","command":"ls"}}
{"type":"item.completed","item":{"type":"agent_message","text":"分析完成..."}}
{"type":"turn.completed","usage":{"input_tokens":1000,"output_tokens":200}}
```

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
1. 在终端区域显示该 Session 的 AI Agent 对话界面
2. 右侧显示该 Session 的改动文件列表
3. 列表项高亮显示

**切换行为**：切换 Session 时保留之前的对话状态

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
- 停止 Agent 进程
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
1. 停止 Agent 进程
2. 执行 `git worktree remove {path}`
3. 执行 `git branch -D {branch}`
4. 删除 Session 记录

**边界处理**：
| 情况 | 处理 |
|------|------|
| Agent 正在运行 | 警告后强制终止 |
| worktree 被占用 | 显示错误，提供手动清理指引 |

---

### 3. AI Agent 对话界面

#### 3.1 Agent 选择

**位置**：Session 终端区域顶部

**选项**：
- Codex
- Claude Code
- 更多（可扩展）

**切换行为**：切换 Agent 类型会开始新的对话会话

#### 3.2 对话界面

**布局**：
```
┌─────────────────────────────────────────────┐
│ [Codex ▼]                     Session 1     │
├─────────────────────────────────────────────┤
│                                             │
│  User: 分析这个项目的结构                    │
│                                             │
│  Agent: 这是一个 Electron 项目...           │
│         正在执行: ls -la                    │
│         [执行结果显示]                       │
│                                             │
│  User: 帮我优化 App.tsx                     │
│                                             │
│  Agent: 正在分析 App.tsx...                 │
│         [流式输出中...]                      │
│                                             │
├─────────────────────────────────────────────┤
│ [输入框: 输入你的指令...]          [发送]   │
└─────────────────────────────────────────────┘
```

**功能**：
- 流式显示 Agent 输出
- 显示命令执行过程
- 支持中断当前任务（Ctrl+C）
- 历史消息滚动查看

#### 3.3 Agent 状态

| 状态 | 显示 |
|------|------|
| idle | 绿色圆点，可输入 |
| running | 黄色旋转图标，显示"思考中..." |
| error | 红色圆点，显示错误信息 |

#### 3.4 错误处理

**CLI 未安装时**：
```
┌────────────────────────────────┐
│  ⚠️ Codex CLI 未安装           │
│                                │
│  请先安装 Codex CLI:           │
│  npm install -g @openai/codex  │
│                                │
│  [打开安装文档]                 │
└────────────────────────────────┘
```

**未登录时**：
```
┌────────────────────────────────┐
│  ⚠️ 需要登录                   │
│                                │
│  请在终端中执行:               │
│  codex login                   │
│                                │
│  [复制命令]                    │
└────────────────────────────────┘
```

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
│  Owl - CLI Worktree Manager                        [—] [□] [×]      │
├────────────────────┬────────────────────────────┬───────────────────┤
│ WORKSPACES         │                            │ CHANGES           │
│                    │   [Codex ▼] Session 1      │                   │
│ ▼ my-project       │                            │ ▼ Modified (3)    │
│   ├─ Session 1 ●   │   User: 分析项目结构       │   ~ App.tsx       │
│   └─ Session 2 ○   │                            │   ~ index.ts      │
│                    │   Agent: 这是一个...       │   ~ package.json  │
│ ▼ another-repo     │                            │                   │
│   └─ Session 1     │   [输入框...]    [发送]    │ ▼ Untracked (1)   │
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
| Agent 对话区 | 弹性 | 400px | ✅ |
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
| Cmd+Enter | 发送消息 |
| Ctrl+C | 中断 Agent |

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
  agentType: 'codex' | 'claude' // 当前使用的 Agent
  agentSessionId: string | null // CLI 会话 ID（用于 resume）
  createdAt: string
}
```

### AgentMessage

```typescript
interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  // Agent 执行的命令
  commands?: {
    command: string
    output: string
    exitCode: number
  }[]
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
    defaultAgent: 'codex' | 'claude' // 默认 'codex'
    autoRefreshInterval: number // 默认 1000ms
    confirmBeforeDelete: boolean // 默认 true
  }
}
```

**存储路径**：
- macOS: `~/Library/Application Support/owl/config.json`
- Windows: `%APPDATA%/owl/config.json`
- Linux: `~/.config/owl/config.json`

---

## 依赖

### npm 包

| 包 | 版本 | 用途 |
|----|------|------|
| electron | ^28.0.0 | 桌面框架 |
| react | ^18.2.0 | UI |
| zustand | ^4.4.0 | 状态管理 |
| chokidar | ^3.5.3 | 文件监听 |

### 系统依赖

- Git ≥ 2.20（需在 PATH 中）
- Codex CLI（可选，用户自行安装）
- Claude CLI（可选，用户自行安装）

---

## 性能要求

| 操作 | 目标 |
|------|------|
| Session 创建 | < 3s |
| Agent 响应首字 | < 2s |
| Git status 刷新 | < 1s（< 10k 文件仓库）|
| UI 响应 | < 100ms |

---

## MVP 范围

**包含**：
- Workspace 增删查
- Session 增删查 + 重命名
- Codex Agent 对话（多轮）
- 改动文件列表（自动刷新）
- 合并到目标分支

**不包含（V2）**：
- Claude Code 支持
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
| Session | 一个 worktree + 关联的 AI Agent 对话 |
| Worktree | Git 的同仓库多检出目录特性 |
| Agent | CLI 编程助手（Codex、Claude Code 等）|

---

*文档版本 3.0 | 2026-01-31*
