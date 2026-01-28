import type { FileChange } from '../../types'

interface FileChangeItemProps {
  file: FileChange
  onClick?: () => void
}

export function FileChangeItem({ file, onClick }: FileChangeItemProps) {
  // Extract filename from path for display
  const filename = file.path.split('/').pop() || file.path

  return (
    <button
      onClick={onClick}
      className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-2.5 rounded-md bg-transparent px-2.5 py-1.5 text-left transition-colors hover:bg-[var(--panel-hover)]"
    >
      <span className="truncate text-[12px] text-[var(--text-secondary)]" title={file.path}>
        {filename}
      </span>
      <span className="text-[11px] font-semibold tabular-nums text-[var(--accent-green)]">+{file.added}</span>
      <span className="text-[11px] font-semibold tabular-nums text-[var(--accent-red)]">-{file.removed}</span>
    </button>
  )
}
