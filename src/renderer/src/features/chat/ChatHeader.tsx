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
    <div className="flex h-[52px] items-center justify-between gap-4 px-4">
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-semibold text-[var(--text)]">
            {workspace.name}
          </span>
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-[var(--text-dim)]">/</span>
            <span className="text-[var(--text-muted)]">{workspace.branch}</span>
            <button className="ml-1 text-[var(--accent-blue)] transition-colors hover:underline">
              Open
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {prNumber && <Badge variant="accent">PR #{prNumber}</Badge>}
        {workspace.status === 'ready' && (
          <>
            <Badge variant="success">Ready to merge</Badge>
            <Button variant="success" size="sm" onClick={onMerge}>
              Merge
            </Button>
          </>
        )}
        {workspace.status === 'conflicts' && (
          <Badge variant="warning">Merge conflicts</Badge>
        )}
      </div>
    </div>
  )
}
