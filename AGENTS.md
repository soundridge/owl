You are Linus Torvalds,
    KISS, YAGNI, DRY & SOLID,
    and use AskUserQuestion tool if you are not clear about my requirements

## 项目目录结构

```
src/
├── main/
│   ├── index.ts                    # 主进程入口
│   ├── types.ts                    # 类型定义
│   ├── services/
│   │   ├── git.ts                  # Git 命令封装
│   │   ├── pty.ts                  # PTY 管理
│   │   └── store.ts                # 持久化存储
│   └── ipc/
│       ├── index.ts                # IPC 服务注册
│       └── services/
│           ├── workspace.ts        # Workspace IPC
│           ├── session.ts          # Session IPC
│           ├── terminal.ts         # Terminal IPC
│           └── git.ts              # Git IPC
│
├── preload/
│   └── index.ts                    # Preload 脚本
│
├── renderer/src/
│   ├── App.tsx                     # 应用入口，渲染 AppLayout
│   ├── app.css                     # 全局样式
│   ├── types/                      # 前端类型
│   │   └── index.ts
│   ├── store/
│   │   ├── index.ts                # 应用状态
│   │   └── mock-data.ts            # Mock 数据
│   │
│   ├── components/ui/              # ⚠️ shadcn/ui 组件（禁止修改）
│   │   ├── button.tsx              #   这些是 shadcn/ui 官方组件
│   │   ├── dialog.tsx              #   通过 `npx shadcn@latest add` 安装
│   │   ├── scroll-area.tsx         #   任何修改都会在升级时丢失
│   │   └── ...                     #   如需定制，在 features 中封装
│   │
│   ├── layout/                     # 布局层
│   │   ├── index.ts                # 导出
│   │   ├── AppLayout.tsx           # 应用主布局（全屏容器）
│   │   └── PanelLayout.tsx         # 三栏面板布局（react-resizable-panels）
│   │
│   └── features/
│       ├── sidebar/                # 左侧边栏
│       │   ├── index.ts
│       │   ├── Sidebar.tsx
│       │   ├── WorkspaceGroup.tsx
│       │   ├── WorkspaceCard.tsx
│       │   └── SessionCard.tsx
│       ├── terminal/               # 终端面板
│       │   ├── index.ts
│       │   └── TerminalPanel.tsx
│       └── inspector/              # 右侧面板
│           ├── index.ts
│           ├── InspectorPanel.tsx
│           ├── ChangesTab.tsx
│           ├── FileChangeItem.tsx
│           └── BranchInfoCard.tsx
│
└── types/
    └── ipc.ts                      # IPC 类型定义
```

## UI 分层结构

```
App.tsx (应用入口，Provider 注入)
    │
    ▼
layout/ (布局层)
    ├── AppLayout.tsx    - 全屏容器，窗口级样式
    └── PanelLayout.tsx  - 三栏布局，面板尺寸管理
            │
            ▼
features/ (功能模块)
    ├── sidebar/     - 左侧边栏
    ├── terminal/    - 终端面板
    └── inspector/   - 右侧面板
            │
            ▼
components/ui/ (shadcn/ui，禁止修改)
```

## shadcn/ui 组件规范

`src/renderer/src/components/ui/` 存放 shadcn/ui 官方组件。

**规则**：
1. **禁止直接修改** - 通过 `npx shadcn@latest add <component>` 安装
2. **定制样式** - 在使用处用 `className` 覆盖，或在 `features/` 中封装
