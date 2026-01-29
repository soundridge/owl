import { Badge } from '../../components/ui'
import type { Workspace } from '../../types'

interface WorkspaceCardProps {
  workspace: Workspace
  isActive?: boolean
  onClick?: () => void
}

export function WorkspaceCard({ workspace, isActive = false, onClick }: WorkspaceCardProps) {
  const statusConfig = {
    ready: { label: 'Ready', color: 'success' as const },
    conflicts: { label: 'Conflicts', color: 'warning' as const },
    archived: { label: 'Archived', color: 'default' as const },
    active: { label: 'Active', color: 'accent' as const },
  }

  const status = statusConfig[workspace.status]

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start justify-between gap-2 rounded-[var(--radius-md)] px-2 py-2 text-left transition-all duration-150 ${
        isActive
          ? 'bg-[var(--accent-blue)]/15 text-[var(--text)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--panel-hover)]'
      }`}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="truncate text-[13px] font-medium">{workspace.name}</div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge>{workspace.branch}</Badge>
          <Badge variant={status.color}>{status.label}</Badge>
        </div>
      </div>
      <div
        className={`shrink-0 text-[11px] font-medium tabular-nums ${
          workspace.status === 'conflicts' ? 'text-[var(--accent-orange)]' : 'text-[var(--accent-green)]'
        }`}
      >
        +{workspace.changes.added} -{workspace.changes.removed}
      </div>
    </button>
  )
}
