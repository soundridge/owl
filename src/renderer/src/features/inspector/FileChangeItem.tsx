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
    color: 'text-[#30d158]',
    label: 'Added',
  },
  modified: {
    icon: <FileEdit className="h-3.5 w-3.5" />,
    color: 'text-[#ff9f0a]',
    label: 'Modified',
  },
  deleted: {
    icon: <FileX className="h-3.5 w-3.5" />,
    color: 'text-[#ff453a]',
    label: 'Deleted',
  },
  renamed: {
    icon: <FileText className="h-3.5 w-3.5" />,
    color: 'text-[#bf5af2]',
    label: 'Renamed',
  },
  untracked: {
    icon: <FileQuestion className="h-3.5 w-3.5" />,
    color: 'text-[rgba(255,255,255,0.5)]',
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
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-all hover:bg-[rgba(58,58,60,0.6)]"
      title={`${status.label}: ${file.path}`}
    >
      <span className={`shrink-0 ${status.color}`}>{status.icon}</span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-xs text-[rgba(255,255,255,0.7)]">
          {filename}
        </span>
        {directory && (
          <span
            className="truncate text-[10px] text-[rgba(255,255,255,0.35)]"
            title={file.path}
          >
            {directory}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium tabular-nums">
        {file.added > 0 && <span className="text-[#30d158]">+{file.added}</span>}
        {file.removed > 0 && <span className="text-[#ff453a]">-{file.removed}</span>}
      </div>
    </button>
  )
}
