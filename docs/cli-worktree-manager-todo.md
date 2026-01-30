# TODO：CLI Worktree 管理器（骨架阶段）

- [ ] 0. 约束确认：仅搭架子，不做真实 git/pty/IPC 数据接入
- [ ] 1. Renderer 布局骨架：左侧 Workspace/Session，中间终端容器，右侧改动列表
- [ ] 2. Renderer 空态/加载态：Workspace/Session/Terminal/Changes 四类占位
- [ ] 3. Renderer 状态模型：workspaces/sessions/changes/terminal 的前端状态结构
- [ ] 4. Renderer 交互骨架：切换 Workspace/Session 联动展示，按钮仅触发占位行为
- [ ] 5. Main 服务层骨架：git/store/pty 方法签名与统一返回结构
- [ ] 6. Main IPC 骨架：workspace/session/terminal/git 通道注册与 mock 返回
- [ ] 7. Main 数据模型类型：Workspace/Session 类型统一引用
- [ ] 8. Preload 预留接口（可选）：window.api 下方法签名
- [ ] 9. 最小可运行验证：应用可启动，UI 状态切换，IPC 不报错
