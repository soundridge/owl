import { FilePlus, FileEdit, FileX, FileText, FileQuestion } from 'lucide-react'
import type { FileChange, FileChangeStatus } from '../../types'

interface FileChangeItemProps {
  file: FileChange
  onClick?: () => void
}

const statusConfig: Record<
  FileChangeStatus,
  { icon: React.ReactNode; color: string; label: string }
> = {
  added: {
    icon: <FilePlus className="h-3.5 w-3.5" />,
    color: 'text-[var(--accent-green)]',
    label: 'Added',
  },
  modified: {
    icon: <FileEdit className="h-3.5 w-3.5" />,
    color: 'text-[var(--accent-orange)]',
    label: 'Modified',
  },
  deleted: {
    icon: <FileX className="h-3.5 w-3.5" />,
    color: 'text-[var(--accent-red)]',
    label: 'Deleted',
  },
  renamed: {
    icon: <FileText className="h-3.5 w-3.5" />,
    color: 'text-[var(--accent-purple)]',
    label: 'Renamed',
  },
  untracked: {
    icon: <FileQuestion className="h-3.5 w-3.5" />,
    color: 'text-[var(--text-muted)]',
    label: 'Untracked',
  },
}

export function FileChangeItem({ file, onClick }: FileChangeItemProps) {
  // Extract filename from path for display
  const filename = file.path.split('/').pop() || file.path
  const directory = file.path.split('/').slice(0, -1).join('/')

  const status = statusConfig[file.status]

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-left transition-all duration-150 hover:bg-[var(--panel-hover)]"
      title={`${status.label}: ${file.path}`}
    >
      <span className={`shrink-0 ${status.color}`}>{status.icon}</span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[12px] text-[var(--text-secondary)]">{filename}</span>
        {directory && (
          <span className="truncate text-[10px] text-[var(--text-dim)]" title={file.path}>
            {directory}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium tabular-nums">
        {file.added > 0 && <span className="text-[var(--accent-green)]">+{file.added}</span>}
        {file.removed > 0 && <span className="text-[var(--accent-red)]">-{file.removed}</span>}
      </div>
    </button>
  )
}
