import type { AsyncState, BranchInfo } from '../../types'
import { Button } from '@renderer/components/ui/button'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { ArrowDown, ArrowUp, GitBranch, GitMerge, RefreshCw } from 'lucide-react'

interface BranchInfoCardProps {
  branchInfo: AsyncState<BranchInfo>
  onMerge: () => void
  onRetry?: () => void
}

export function BranchInfoCard({ branchInfo, onMerge, onRetry }: BranchInfoCardProps) {
  const { data, status } = branchInfo

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-2 h-9 w-full" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <span className="text-xs text-destructive">Failed to load branch info</span>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="h-6 text-[10px]">
            <RefreshCw className="mr-1 h-3 w-3" />
            Retry
          </Button>
        )}
      </div>
    )
  }

  if (!data || !data.current) {
    return (
      <div className="flex flex-col items-center gap-1 py-4 text-center opacity-50">
        <GitBranch className="h-4 w-4" />
        <span className="text-[11px]">Select a session</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Branch Info Compact */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Current</span>
          <div className="flex items-center gap-1.5 overflow-hidden">
            <GitBranch className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate text-xs font-semibold text-foreground" title={data.current}>
              {data.current.replace('session/', '')}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Target</span>
          <div className="flex items-center gap-1.5 overflow-hidden">
            <GitMerge className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate text-xs font-medium text-muted-foreground" title={data.target}>
              {data.target}
            </span>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      {(data.ahead > 0 || data.behind > 0) && (
        <div className="flex items-center gap-3 text-[11px] font-medium opacity-80">
          {data.ahead > 0 && (
            <span className="flex items-center gap-1 text-emerald-500">
              <ArrowUp className="h-3 w-3" />
              {data.ahead} ahead
            </span>
          )}
          {data.behind > 0 && (
            <span className="flex items-center gap-1 text-amber-500">
              <ArrowDown className="h-3 w-3" />
              {data.behind} behind
            </span>
          )}
        </div>
      )}

      {/* Primary Action */}
      <Button
        size="sm"
        onClick={onMerge}
        className="w-full shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]"
        disabled={data.ahead === 0}
      >
        <GitMerge className="mr-2 h-4 w-4" />
        Merge Changes
      </Button>
    </div>
  )
}
