import type { AsyncState, FileChange, FileChangeStatus } from '../../types'
import { Button } from '@renderer/components/ui/button'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { FileDiff, RotateCw } from 'lucide-react'
import { useMemo } from 'react'
import { FileChangeItem } from './FileChangeItem'

interface ChangesTabProps {
  changes: AsyncState<FileChange[]>
  onFileClick?: (path: string) => void
  onRefresh: () => void
}

const groupLabels: Record<string, string> = {
  modified: 'Modified',
  added: 'Added',
  untracked: 'Untracked',
  deleted: 'Deleted',
  renamed: 'Renamed',
}

const groupOrder: FileChangeStatus[] = ['modified', 'added', 'untracked', 'deleted', 'renamed']

export function ChangesTab({ changes, onFileClick, onRefresh }: ChangesTabProps) {
  const { data, status, error } = changes

  // Group changes by status
  const groups = useMemo(() => {
    if (!data) return {}
    return data.reduce((acc, file) => {
      const key = file.status
      if (!acc[key]) acc[key] = []
      acc[key].push(file)
      return acc
    }, {} as Record<FileChangeStatus, FileChange[]>)
  }, [data])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 mb-2 flex items-center justify-between bg-card pb-2 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Changes
          </span>
          {status === 'success' && data && data.length > 0 && (
            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
              {data.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <RotateCw
                  className={`h-3 w-3 ${status === 'loading' ? 'animate-spin' : ''}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh changes</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 pb-4">
        {/* Loading state */}
        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full bg-accent/30" />
            <Skeleton className="h-8 w-full bg-accent/30" />
            <Skeleton className="h-8 w-full bg-accent/30" />
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <p className="text-xs text-destructive">{error || 'Failed to load changes'}</p>
            <Button variant="outline" size="sm" onClick={onRefresh} className="h-6 text-[10px]">
              Retry
            </Button>
          </div>
        )}

        {/* Empty state */}
        {status === 'success' && (!data || data.length === 0) && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center opacity-60">
            <FileDiff className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-xs font-medium text-muted-foreground">
              No pending changes
            </p>
          </div>
        )}

        {/* File list groups */}
        {status === 'success' && data && data.length > 0 && (
          <div className="flex flex-col gap-4">
            {groupOrder.map(statusKey => {
              const files = groups[statusKey]
              if (!files || files.length === 0) return null

              return (
                <div key={statusKey} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    <span>{groupLabels[statusKey]}</span>
                    <span className="opacity-50">({files.length})</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {files.map(file => (
                      <FileChangeItem
                        key={file.path}
                        file={file}
                        onClick={() => onFileClick?.(file.path)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
