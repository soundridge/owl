import { RefreshCw, FileText } from 'lucide-react'
import { IconButton, EmptyState, ErrorState, FileChangeSkeleton } from '../../components/ui'
import type { FileChange, AsyncState } from '../../types'
import { FileChangeItem } from './FileChangeItem'

interface ChangesTabProps {
  changes: AsyncState<FileChange[]>
  onFileClick?: (path: string) => void
  onRefresh?: () => void
}

export function ChangesTab({ changes, onFileClick, onRefresh }: ChangesTabProps) {
  const { data, status, error } = changes

  const totalAdded = data?.reduce((sum, f) => sum + f.added, 0) ?? 0
  const totalRemoved = data?.reduce((sum, f) => sum + f.removed, 0) ?? 0

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[var(--text-secondary)]">Changes</span>
          {status === 'success' && data && data.length > 0 && (
            <span className="text-[11px] text-[var(--text-muted)]">
              {data.length} files
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Stats */}
          {status === 'success' && data && data.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium tabular-nums">
              <span className="text-[var(--accent-green)]">+{totalAdded}</span>
              <span className="text-[var(--accent-red)]">-{totalRemoved}</span>
            </div>
          )}
          <IconButton size="sm" onClick={onRefresh} title="Refresh changes">
            <RefreshCw className={`h-3.5 w-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} />
          </IconButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-0.5 overflow-y-auto">
        {/* Loading state */}
        {status === 'loading' && (
          <>
            <FileChangeSkeleton />
            <FileChangeSkeleton />
            <FileChangeSkeleton />
            <FileChangeSkeleton />
          </>
        )}

        {/* Error state */}
        {status === 'error' && (
          <ErrorState
            title="Failed to read git status"
            message={error || 'Could not get file changes'}
            onRetry={onRefresh}
            className="py-4"
          />
        )}

        {/* Empty state */}
        {status === 'success' && (!data || data.length === 0) && (
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="No changes"
            description="Working tree is clean"
            className="py-4"
          />
        )}

        {/* File list */}
        {status === 'success' &&
          data &&
          data.length > 0 &&
          data.map((file) => (
            <FileChangeItem
              key={file.path}
              file={file}
              onClick={() => onFileClick?.(file.path)}
            />
          ))}
      </div>
    </div>
  )
}
