# Owl 开发计划

**创建日期**：2026-01-31
**项目状态**：架构重构 - CLI Agent 集成

---

## 概述

项目从"嵌入式终端"架构重构为"CLI Agent 壳子"架构。核心变化：
- 移除 xterm.js + node-pty
- 新增 AgentService 调用 CLI（codex exec / claude）
- 新增对话式 UI 替代终端

---

## Phase 1: Agent Service 核心实现

### 1.1 AgentService 基础
- [ ] **1.1.1** 创建 `src/main/services/agent/types.ts` - 类型定义
- [ ] **1.1.2** 创建 `src/main/services/agent/agent-service.ts` - 核心服务
- [ ] **1.1.3** 实现 `checkCliInstalled()` - 检测 CLI 是否安装
- [ ] **1.1.4** 实现 `startSession()` - 初始化 Agent 会话
- [ ] **1.1.5** 实现 `sendMessage()` - 发送消息并执行 CLI
- [ ] **1.1.6** 实现 `buildCliArgs()` - 构建 Codex exec 命令参数
- [ ] **1.1.7** 实现 `executeAgent()` - spawn 进程并处理 JSONL 输出
- [ ] **1.1.8** 实现 `handleAgentEvent()` - 解析 JSONL 事件
- [ ] **1.1.9** 实现 `interrupt()` - 中断 Agent 执行（SIGINT）
- [ ] **1.1.10** 实现 `closeSession()` - 关闭会话

### 1.2 多轮对话支持
- [ ] **1.2.1** 解析 `thread.started` 事件获取 thread_id
- [ ] **1.2.2** 存储 thread_id 到 Session
- [ ] **1.2.3** 实现 resume 命令构建（`codex exec resume <id>`）
- [ ] **1.2.4** 测试多轮对话流程

### 1.3 事件通知
- [ ] **1.3.1** 实现 `notifyRenderer()` - IPC 事件发送
- [ ] **1.3.2** 定义事件通道：`agent:message`, `agent:status`, `agent:event`, `agent:error`
- [ ] **1.3.3** 处理流式输出（item.started → item.completed）

---

## Phase 2: IPC 层实现

### 2.1 Agent IPC 服务
- [ ] **2.1.1** 创建 `src/main/ipc/services/agent.ts`
- [ ] **2.1.2** 实现 `agent:checkCli` 方法
- [ ] **2.1.3** 实现 `agent:start` 方法
- [ ] **2.1.4** 实现 `agent:send` 方法
- [ ] **2.1.5** 实现 `agent:interrupt` 方法
- [ ] **2.1.6** 实现 `agent:getMessages` 方法
- [ ] **2.1.7** 实现 `agent:close` 方法
- [ ] **2.1.8** 在 IPC index 中注册服务

### 2.2 Session IPC 更新
- [ ] **2.2.1** 更新 `session:create` - 集成 AgentService
- [ ] **2.2.2** 更新 `session:delete` - 关闭 Agent
- [ ] **2.2.3** 新增 `session:setAgentType` - 切换 Agent 类型
- [ ] **2.2.4** 持久化 agentSessionId（thread_id）

### 2.3 Preload 更新
- [ ] **2.3.1** 添加 `window.api.agent` 命名空间
- [ ] **2.3.2** 添加事件监听器：`onMessage`, `onStatus`, `onEvent`, `onError`
- [ ] **2.3.3** 更新 TypeScript 类型定义

---

## Phase 3: 前端 Agent UI

### 3.1 Agent Store
- [ ] **3.1.1** 创建 `src/renderer/src/store/agent.ts`
- [ ] **3.1.2** 实现 session 状态管理（messages, status, error）
- [ ] **3.1.3** 实现 `sendMessage` action
- [ ] **3.1.4** 实现 `interrupt` action
- [ ] **3.1.5** 实现 `initAgentListeners()` - 订阅 IPC 事件

### 3.2 AgentChat 组件
- [ ] **3.2.1** 创建 `src/renderer/src/features/agent/AgentChat.tsx`
- [ ] **3.2.2** 实现消息列表渲染（用户/助手消息）
- [ ] **3.2.3** 实现命令执行记录显示
- [ ] **3.2.4** 实现输入框和发送按钮
- [ ] **3.2.5** 实现中断按钮
- [ ] **3.2.6** 实现 Agent 类型选择器（Codex/Claude）
- [ ] **3.2.7** 实现状态指示器（idle/running/error）
- [ ] **3.2.8** 实现自动滚动到底部
- [ ] **3.2.9** 实现 Cmd+Enter 发送快捷键

### 3.3 错误状态 UI
- [ ] **3.3.1** 创建 CLI 未安装提示组件
- [ ] **3.3.2** 创建未登录提示组件
- [ ] **3.3.3** 创建通用错误提示组件

### 3.4 TerminalPanel 改造
- [ ] **3.4.1** 替换 xterm 为 AgentChat
- [ ] **3.4.2** 传递 sessionId 和 agentType
- [ ] **3.4.3** 处理 Agent 类型切换

---

## Phase 4: Session 管理完善

### 4.1 Session 创建流程
- [ ] **4.1.1** 创建 Session 时自动初始化 Agent
- [ ] **4.1.2** 默认使用用户偏好的 Agent 类型
- [ ] **4.1.3** 创建成功后自动聚焦输入框

### 4.2 Session 恢复
- [ ] **4.2.1** 应用启动时恢复 Agent 会话
- [ ] **4.2.2** 加载持久化的 thread_id
- [ ] **4.2.3** 恢复历史消息（如果有持久化）

### 4.3 Session 切换
- [ ] **4.3.1** 切换 Session 时保持各自的对话状态
- [ ] **4.3.2** 切换时不中断正在运行的 Agent

---

## Phase 5: Git 功能维护

### 5.1 Git Service（已有，验证）
- [ ] **5.1.1** 验证 worktree 创建/删除
- [ ] **5.1.2** 验证 git status 获取
- [ ] **5.1.3** 验证分支列表获取
- [ ] **5.1.4** 验证合并功能

### 5.2 文件监听
- [ ] **5.2.1** Session 打开时启动 watcher
- [ ] **5.2.2** Session 关闭时停止 watcher
- [ ] **5.2.3** 变更事件触发 status 刷新

### 5.3 改动列表 UI
- [ ] **5.3.1** 连接真实 git:status
- [ ] **5.3.2** 自动刷新
- [ ] **5.3.3** 手动刷新按钮

---

## Phase 6: 移除旧终端代码

### 6.1 清理 Main 进程
- [ ] **6.1.1** 移除 PTY Service（如果存在）
- [ ] **6.1.2** 移除 terminal IPC（如果存在）
- [ ] **6.1.3** 移除 node-pty 依赖

### 6.2 清理 Renderer 进程
- [ ] **6.2.1** 移除 xterm 相关组件
- [ ] **6.2.2** 移除 xterm 依赖
- [ ] **6.2.3** 更新 package.json

---

## Phase 7: UI 完善

### 7.1 空状态
- [ ] **7.1.1** 无 Workspace 时的引导 UI
- [ ] **7.1.2** 无 Session 时的引导 UI
- [ ] **7.1.3** 无消息时的提示

### 7.2 加载状态
- [ ] **7.2.1** 创建 Session 时的 loading
- [ ] **7.2.2** 发送消息时的 loading
- [ ] **7.2.3** 合并操作时的 loading

### 7.3 确认对话框
- [ ] **7.3.1** 删除 Session 确认
- [ ] **7.3.2** 删除 Workspace 确认
- [ ] **7.3.3** 合并确认

---

## Phase 8: 快捷键

- [ ] **8.1** `Cmd+N` - 新建 Session
- [ ] **8.2** `Cmd+W` - 关闭当前 Session
- [ ] **8.3** `Cmd+Tab` - 切换 Session
- [ ] **8.4** `Cmd+R` - 刷新改动列表
- [ ] **8.5** `Cmd+Shift+M` - 打开合并对话框
- [ ] **8.6** `Cmd+Enter` - 发送消息
- [ ] **8.7** `Ctrl+C` - 中断 Agent

---

## Phase 9: Claude Code 支持（V2）

### 9.1 Claude CLI 集成
- [ ] **9.1.1** 调研 Claude CLI 命令格式
- [ ] **9.1.2** 实现 `buildCliArgs()` for Claude
- [ ] **9.1.3** 解析 Claude 输出格式
- [ ] **9.1.4** 实现多轮对话（如果支持）

### 9.2 测试
- [ ] **9.2.1** 测试 Claude 对话流程
- [ ] **9.2.2** 测试 Agent 切换

---

## Phase 10: 测试与打包

### 10.1 测试
- [ ] **10.1.1** AgentService 单元测试
- [ ] **10.1.2** IPC 集成测试
- [ ] **10.1.3** E2E 测试：完整对话流程

### 10.2 打包
- [ ] **10.2.1** macOS 打包
- [ ] **10.2.2** 代码签名
- [ ] **10.2.3** 测试安装流程

---

## 进度追踪

| Phase | 描述 | 预计任务数 | 完成数 | 状态 |
|-------|------|-----------|--------|------|
| 1 | Agent Service 核心 | 14 | 0 | 待开始 |
| 2 | IPC 层 | 12 | 0 | 待开始 |
| 3 | 前端 Agent UI | 16 | 0 | 待开始 |
| 4 | Session 管理 | 6 | 0 | 待开始 |
| 5 | Git 功能维护 | 7 | 0 | 待开始 |
| 6 | 移除旧代码 | 6 | 0 | 待开始 |
| 7 | UI 完善 | 9 | 0 | 待开始 |
| 8 | 快捷键 | 7 | 0 | 待开始 |
| 9 | Claude Code（V2）| 5 | 0 | 延后 |
| 10 | 测试与打包 | 5 | 0 | 待开始 |
| **总计** | | **87** | **0** | |

---

## 开发顺序建议

**第一阶段（核心可用）**：
1. Phase 1 - AgentService 实现
2. Phase 2 - IPC 层
3. Phase 3 - 前端 AgentChat

**第二阶段（功能完整）**：
1. Phase 4 - Session 管理
2. Phase 5 - Git 功能
3. Phase 6 - 清理旧代码

**第三阶段（打磨）**：
1. Phase 7 - UI 完善
2. Phase 8 - 快捷键
3. Phase 10 - 测试打包

**后续迭代**：
1. Phase 9 - Claude Code 支持

---

## 关键技术决策

1. **不使用嵌入式终端**：直接调用 CLI，解析 JSONL 输出
2. **复用 CLI 认证**：用户自行在终端登录，应用复用凭证
3. **多轮对话**：通过 `codex exec resume <thread_id>` 实现
4. **进程隔离**：每个 Session 的 Agent 是独立的子进程

---

*最后更新：2026-01-31*
