import type { FileChange, FileChangeStatus } from '../../types'
import { cn } from '@renderer/lib/utils'
import { FileCode, FileIcon, FileJson } from 'lucide-react'

interface FileChangeItemProps {
  file: FileChange
  onClick?: () => void
}

const statusColors: Record<FileChangeStatus, string> = {
  added: 'text-emerald-500',
  modified: 'text-amber-500',
  deleted: 'text-rose-500',
  renamed: 'text-blue-500',
  untracked: 'text-emerald-500',
}

export function FileChangeItem({ file, onClick }: FileChangeItemProps) {
  const filename = file.path.split('/').pop() || file.path
  const directory = file.path.split('/').slice(0, -1).join('/')

  // Identify file type icon (simple logic)
  const FileTypeIcon = filename.endsWith('.ts') || filename.endsWith('.tsx') || filename.endsWith('.js')
    ? FileCode
    : filename.endsWith('.json')
      ? FileJson
      : FileIcon

  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-muted/50"
      title={`${file.status}: ${file.path}`}
    >
      {/* File Type Icon */}
      <FileTypeIcon className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-foreground" />

      {/* Path */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className={cn('truncate text-[13px] font-medium leading-none text-foreground/90 transition-colors', file.status === 'deleted' && 'line-through opacity-70')}>
          {filename}
        </span>
        {directory && (
          <span className="truncate text-[10px] text-muted-foreground/50 group-hover:text-muted-foreground">
            {directory}
          </span>
        )}
      </div>

      {/* Status Identifier - Right aligned */}
      <span className={cn('flex h-5 items-center justify-center rounded px-1.5 text-[10px] font-medium uppercase tracking-wider bg-opacity-10 dark:bg-opacity-20', statusColors[file.status].replace('text-', 'bg-'), statusColors[file.status])}>
        {file.status === 'untracked' ? 'U' : file.status === 'modified' ? 'M' : file.status === 'added' ? 'A' : file.status === 'deleted' ? 'D' : 'R'}
      </span>
    </button>
  )
}
