import { Badge } from '../../components/ui'
import type { Workspace } from '../../types'

interface WorkspaceCardProps {
  workspace: Workspace
  isActive?: boolean
  onClick?: () => void
}

export function WorkspaceCard({ workspace, isActive = false, onClick }: WorkspaceCardProps) {
  const statusConfig = {
    ready: { label: 'Ready to merge', color: 'success' as const },
    conflicts: { label: 'Merge conflicts', color: 'warning' as const },
    archived: { label: 'Archived', color: 'default' as const },
    active: { label: 'Active', color: 'accent' as const },
  }

  const status = statusConfig[workspace.status]

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start justify-between gap-2 rounded-md border px-2.5 py-2 text-left transition-all hover:bg-[var(--panel-hover)] ${isActive
          ? 'border-[var(--accent-blue)] bg-[rgba(77,163,255,0.1)]'
          : 'border-[var(--border-subtle)] bg-transparent'
        }`}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="truncate text-[13px] font-medium text-[var(--text)]">{workspace.name}</div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge>{workspace.branch}</Badge>
          <span className={`text-[11px] font-medium text-[var(--${status.color === 'success' ? 'accent-green' : status.color === 'warning' ? 'accent-orange' : 'text-muted'})]`}>
            {status.label}
          </span>
        </div>
      </div>
      <div
        className={`shrink-0 text-[11px] font-semibold tabular-nums ${workspace.status === 'conflicts' ? 'text-[var(--accent-orange)]' : 'text-[var(--accent-green)]'
          }`}
      >
        +{workspace.changes.added} -{workspace.changes.removed}
      </div>
    </button>
  )
}
