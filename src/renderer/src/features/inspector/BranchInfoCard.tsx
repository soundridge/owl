import { GitBranch, GitMerge, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Skeleton } from '@renderer/components/ui/skeleton'
import type { BranchInfo, AsyncState } from '../../types'

interface BranchInfoCardProps {
  branchInfo: AsyncState<BranchInfo>
  onMerge: () => void
  onRetry?: () => void
}

export function BranchInfoCard({ branchInfo, onMerge, onRetry }: BranchInfoCardProps) {
  const { data, status, error } = branchInfo

  if (status === 'loading') {
    return (
      <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#2c2c2e] p-3">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#2c2c2e] p-3">
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <p className="text-sm text-[#ff453a]">Branch info error</p>
          <p className="text-xs text-[rgba(255,255,255,0.5)]">
            {error || 'Failed to load branch info'}
          </p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (!data || !data.current) {
    return (
      <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#2c2c2e] p-3">
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <GitBranch className="h-5 w-5 text-[rgba(255,255,255,0.35)]" />
          <p className="text-sm font-medium text-[rgba(255,255,255,0.88)]">
            No branch info
          </p>
          <p className="text-xs text-[rgba(255,255,255,0.5)]">
            Select a session to view branch information
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#2c2c2e] p-3">
      {/* Current branch */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-[rgba(255,255,255,0.35)]">
          Current Branch
        </label>
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-[#30d158]" />
          <span
            className="truncate text-[13px] font-medium text-[rgba(255,255,255,0.88)]"
            title={data.current}
          >
            {data.current.replace('session/', '')}
          </span>
        </div>
      </div>

      {/* Target branch */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-[rgba(255,255,255,0.35)]">
          Target Branch
        </label>
        <div className="flex items-center gap-2">
          <GitMerge className="h-4 w-4 text-[#0a84ff]" />
          <span
            className="truncate text-[13px] font-medium text-[rgba(255,255,255,0.88)]"
            title={data.target}
          >
            {data.target}
          </span>
        </div>
      </div>

      {/* Ahead/Behind indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <ArrowUp className="h-3.5 w-3.5 text-[#30d158]" />
          <span className="text-xs text-[rgba(255,255,255,0.7)]">
            {data.ahead} ahead
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowDown className="h-3.5 w-3.5 text-[#ff9f0a]" />
          <span className="text-xs text-[rgba(255,255,255,0.7)]">
            {data.behind} behind
          </span>
        </div>
      </div>

      {/* Merge button */}
      <Button
        size="sm"
        onClick={onMerge}
        className="mt-1 w-full gap-1.5"
        disabled={data.ahead === 0}
      >
        <GitMerge className="h-3.5 w-3.5" />
        Merge to {data.target}
      </Button>
    </div>
  )
}
