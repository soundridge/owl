import type { FileChange } from '../../types'

interface FileChangeItemProps {
  file: FileChange
  onClick?: () => void
}

export function FileChangeItem({ file, onClick }: FileChangeItemProps) {
  // Extract filename from path for display
  const filename = file.path.split('/').pop() || file.path
  const directory = file.path.split('/').slice(0, -1).join('/')

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-left transition-all duration-150 hover:bg-[var(--panel-hover)]"
    >
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[12px] text-[var(--text-secondary)]">{filename}</span>
        {directory && (
          <span className="truncate text-[10px] text-[var(--text-dim)]" title={file.path}>
            {directory}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium tabular-nums">
        <span className="text-[var(--accent-green)]">+{file.added}</span>
        <span className="text-[var(--accent-red)]">-{file.removed}</span>
      </div>
    </button>
  )
}
