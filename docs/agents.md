# Agent Coding Standards

本文档定义了项目的编码规范，所有 AI Agent 在生成代码时必须遵守。

## 组件文件组织

### index 文件规范

**禁止** 使用 `index.ts` 作为纯导出文件。

如果一个组件目录需要 index 文件，**必须**将默认/主组件直接写在 `index.tsx` 中。

```tsx
// ❌ 错误: 使用 index.ts 做纯导出
// features/sidebar/index.ts
export { Sidebar } from './Sidebar'
export { SessionCard } from './SessionCard'

// ✅ 正确: 主组件直接写在 index.tsx 中
// features/sidebar/index.tsx
import { SessionCard } from './SessionCard'

export function Sidebar() {
  return <div>...</div>
}

export { SessionCard }
```

## 导入规范

### 禁止动态 import

**禁止** 使用动态 `import()` 语法。所有导入必须是静态的。

```tsx
// ❌ 错误: 动态导入
const Component = lazy(() => import('./Component'))
const module = await import('./module')

// ✅ 正确: 静态导入
import { Component } from './Component'
import { module } from './module'
```

## 总结

1. 不要创建纯导出的 `index.ts` 文件
2. 主组件应该直接写在 `index.tsx` 中
3. 禁止使用动态 `import()`
