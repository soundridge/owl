import type { AsyncState, FileChange } from '../../types'
import { Button } from '@renderer/components/ui/button'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { FileText, RotateCw } from 'lucide-react'
import { FileChangeItem } from './FileChangeItem'

interface ChangesTabProps {
  changes: AsyncState<FileChange[]>
  onFileClick?: (path: string) => void
  onRefresh: () => void
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
          <span className="text-xs font-semibold text-muted-foreground">
            Changes
          </span>
          {status === 'success' && data && data.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {data.length}
              {' '}
              files
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Stats */}
          {status === 'success' && data && data.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium tabular-nums">
              <span className="text-[color:var(--success)]">
                +
                {totalAdded}
              </span>
              <span className="text-destructive">
                -
                {totalRemoved}
              </span>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                className="h-7 w-7"
              >
                <RotateCw
                  className={`h-3.5 w-3.5 ${status === 'loading' ? 'animate-spin' : ''}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh changes</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-0.5">
        {/* Loading state */}
        {status === 'loading' && (
          <>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-sm text-destructive">Failed to read git status</p>
            <p className="text-xs text-muted-foreground">
              {error || 'Could not get file changes'}
            </p>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Retry
            </Button>
          </div>
        )}

        {/* Empty state */}
        {status === 'success' && (!data || data.length === 0) && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <FileText className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              No changes
            </p>
            <p className="text-xs text-muted-foreground">
              Working tree is clean
            </p>
          </div>
        )}

        {/* File list */}
        {status === 'success'
          && data
          && data.length > 0
          && data.map(file => (
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
