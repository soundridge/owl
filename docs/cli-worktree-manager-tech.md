# 技术方案：CLI Worktree 管理器（Electron）

**版本**：1.0  
**日期**：2026-01-30  
**适用仓库**：Electron + React + TypeScript（本仓库）  
**依据**：docs/cli-worktree-manager-prd.md

---

## 1. 目标与范围

**目标**
- 为单人开发者提供多 Session（git worktree）并行工作能力，避免冲突覆盖。
- 支持嵌入式终端运行 CLI agent，并可视化改动文件列表。
- 提供可控的合并入口（不自动解决冲突）。

**MVP 范围**
- Workspace 管理（添加/列表/删除）
- Session（worktree）管理（创建/打开/关闭/删除）
- 嵌入式终端
- 改动文件列表（git status）
- 合并入口（选择源/目标分支并执行 merge）

**非目标**
- diff 预览
- 自动冲突解决
- 多人协作/远程仓库管理

---

## 2. 已确认的产品决策

- Worktree 目录放在仓库内：`<repo>/.worktrees/<sessionId>`
- Session 分支命名：`session/<timestamp>-<slug>`
- 合并在**主仓库目录**执行（方案 A）
- 终端默认 shell：使用 `$SHELL`（Windows 用 `powershell`）

---

## 3. 与现有仓库的对接点

**主进程**
- 现有入口：`src/main/index.ts`
- 现有 IPC 入口：`src/main/ipc/index.ts`

**Preload**
- 现有：`src/preload/index.ts`（扩展 `window.api` 暴露 IPC）

**Renderer**
- 现有三栏布局（`Sidebar / ChatPanel / InspectorPanel`）可直接替换为：
  - 左侧：Workspace + Session 列表
  - 中间：xterm 终端
  - 右侧：改动文件列表 + 分支信息

---

## 4. 总体架构

- **Main（Node）**：git/worktree 操作、PTY 进程、持久化、IPC。
- **Preload**：最小暴露 IPC API。
- **Renderer**：UI + xterm.js 渲染 + git 状态刷新。

设计原则：KISS / YAGNI / DRY

---

## 5. 目录与模块设计（最小增量）

**Main 新增**
- `src/main/ipc/services/workspace.ts`
- `src/main/ipc/services/session.ts`
- `src/main/ipc/services/terminal.ts`
- `src/main/services/git.ts`
- `src/main/services/store.ts`
- `src/main/services/pty.ts`

**Preload**
- 扩展 `window.api.workspace` / `window.api.session` / `window.api.terminal` / `window.api.git`

**Renderer**
- Sidebar 替换为 Workspace/Session 数据
- 中间面板替换为 xterm.js
- 右侧面板显示改动列表

---

## 6. 数据模型

**持久化（JSON）**
- Workspace
  - `id`, `name`, `repoPath`
- Session
  - `id`, `name`, `workspaceId`, `branch`, `worktreePath`, `status`

**运行态（内存）**
- `sessionId -> ptyId / terminal 状态 / status 定时器`

**持久化文件**
- `app.getPath('userData')/workspaces.json`

---

## 7. 关键流程

### 7.1 添加 Workspace
1) 用户选择本地路径
2) `git rev-parse --is-inside-work-tree` 校验
3) 通过后写入持久化并更新列表

### 7.2 创建 Session
1) 获取当前分支：`git symbolic-ref --short HEAD`
2) 创建分支并添加 worktree：
   - `git worktree add -b <branch> <repo>/.worktrees/<id> <baseBranch>`
3) 写入 Session 持久化

### 7.3 打开 Session
1) `node-pty` 在 worktree 目录启动 shell
2) renderer xterm 接收数据并渲染

### 7.4 关闭/删除 Session
- 关闭：终止 pty
- 删除：`git worktree remove <path>` + 可选 `git branch -D <branch>`

### 7.5 改动文件列表
- 在 worktree 内执行：`git status --porcelain=v2 -z`
- 前端 debounce 轮询更新（500–1500ms）

### 7.6 合并（方案 A）
- 在主仓库目录执行：
  1) `git status --porcelain`（必须干净）
  2) `git checkout <target>`
  3) `git merge <source>`
- 结果：成功/冲突（冲突时停止并提示）

---

## 8. IPC API（最小集）

- `workspace.list()`
- `workspace.add(path)`
- `workspace.remove(id)`
- `session.list(workspaceId)`
- `session.create(workspaceId, name?)`
- `session.open(sessionId)`
- `session.close(sessionId)`
- `session.delete(sessionId, { removeWorktree, removeBranch })`
- `git.status(sessionId)`
- `git.merge({ sourceBranch, targetBranch })`
- `terminal.write(ptyId, data)`
- `terminal.resize(ptyId, cols, rows)`
- `terminal.onData(ptyId)`

---

## 9. Git 命令封装（KISS）

- 当前分支：`git symbolic-ref --short HEAD`
- 创建 worktree：`git worktree add -b ...`
- 改动列表：`git status --porcelain=v2 -z`
- 删除 worktree：`git worktree remove ...`
- 删除分支：`git branch -D ...`
- 合并：`git checkout ...` + `git merge ...`

---

## 10. UI 结构映射

- 左侧 Sidebar：Workspace + Session 列表 + 新建按钮
- 中间 Panel：xterm 终端（每个 Session 一个）
- 右侧 Panel：改动文件列表 + 分支信息

---

## 11. 错误处理与提示

- 非 git 目录：提示并阻止添加
- worktree 创建失败：不落盘 session
- 合并时目标分支不干净：阻止并提示清理
- 终端失败：可重试
- git status 失败：提示“无法读取 git 状态”并允许重试

---

## 12. 性能与安全

**性能**
- git 状态刷新需异步执行，避免阻塞 UI
- 大仓库用 debounce 降低频率

**安全**
- 本地离线运行，不上传代码
- Renderer 不开放 Node 权限
- Preload 仅暴露最小 IPC API

---

## 13. 依赖新增（最小）

- `xterm` / `xterm-addon-fit`
- `node-pty`

---

## 14. 风险与约束

- 依赖系统 git CLI
- 合并在主仓库执行会切换当前分支（需提示用户）
- Windows shell/pty 兼容需测试

---

## 15. MVP 交付建议

- 先打通 Main 层 git/worktree/pty + IPC
- 再替换 renderer UI 数据流
- 最后补合并入口与错误提示

