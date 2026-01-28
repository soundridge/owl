import { Badge, Button } from '../../components/ui'
import type { Workspace } from '../../types'

interface ChatHeaderProps {
  workspace?: Workspace
  prNumber?: string
  onMerge?: () => void
}

export function ChatHeader({ workspace, prNumber, onMerge }: ChatHeaderProps) {
  if (!workspace) return null

  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-3">
      <div className="flex flex-col gap-1">
        <span className="text-[14px] font-semibold text-[var(--text)]">
          {workspace.name}
        </span>
        <div className="flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
          <span className="opacity-50">/</span>
          <span className="text-[var(--text-secondary)]">{workspace.branch}</span>
          <button className="text-[var(--text-dim)] transition-colors hover:text-[var(--text-muted)]">
            Open
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        {prNumber && <Badge>PR #{prNumber}</Badge>}
        {workspace.status === 'ready' && (
          <>
            <span className="text-[11px] font-semibold text-[var(--accent-green)]">Ready to merge</span>
            <Button variant="success" size="md" onClick={onMerge}>
              Merge
            </Button>
          </>
        )}
        {workspace.status === 'conflicts' && (
          <span className="text-[11px] font-semibold text-[var(--accent-orange)]">Merge conflicts</span>
        )}
      </div>
    </div>
  )
}
