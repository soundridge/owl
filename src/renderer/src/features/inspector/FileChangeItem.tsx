import type { FileChange, FileChangeStatus } from '../../types'
import { FileEdit, FilePlus, FileQuestion, FileText, FileX } from 'lucide-react'

interface FileChangeItemProps {
  file: FileChange
  onClick?: () => void
}

const statusConfig: Record<
  FileChangeStatus,
  { icon: React.ReactNode, color: string, label: string }
> = {
  added: {
    icon: <FilePlus className="h-3.5 w-3.5" />,
    color: 'text-[color:var(--success)]',
    label: 'Added',
  },
  modified: {
    icon: <FileEdit className="h-3.5 w-3.5" />,
    color: 'text-[color:var(--warning)]',
    label: 'Modified',
  },
  deleted: {
    icon: <FileX className="h-3.5 w-3.5" />,
    color: 'text-destructive',
    label: 'Deleted',
  },
  renamed: {
    icon: <FileText className="h-3.5 w-3.5" />,
    color: 'text-[color:var(--accent-purple)]',
    label: 'Renamed',
  },
  untracked: {
    icon: <FileQuestion className="h-3.5 w-3.5" />,
    color: 'text-muted-foreground',
    label: 'Untracked',
  },
}

export function FileChangeItem({ file, onClick }: FileChangeItemProps) {
  const filename = file.path.split('/').pop() || file.path
  const directory = file.path.split('/').slice(0, -1).join('/')
  const status = statusConfig[file.status]

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-all hover:bg-accent"
      title={`${status.label}: ${file.path}`}
    >
      <span className={`shrink-0 ${status.color}`}>{status.icon}</span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-xs text-foreground/80">
          {filename}
        </span>
        {directory && (
          <span
            className="truncate text-[10px] text-muted-foreground"
            title={file.path}
          >
            {directory}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium tabular-nums">
        {file.added > 0 && (
          <span className="text-[color:var(--success)]">
            +
            {file.added}
          </span>
        )}
        {file.removed > 0 && (
          <span className="text-destructive">
            -
            {file.removed}
          </span>
        )}
      </div>
    </button>
  )
}
