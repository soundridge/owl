import { GitBranch, GitMerge, ArrowUp, ArrowDown } from 'lucide-react'
import { Button, EmptyState, ErrorState, LoadingState } from '../../components/ui'
import type { BranchInfo, AsyncState } from '../../types'

interface BranchInfoCardProps {
  branchInfo: AsyncState<BranchInfo>
  onMerge?: () => void
  onRetry?: () => void
}

export function BranchInfoCard({ branchInfo, onMerge, onRetry }: BranchInfoCardProps) {
  const { data, status, error } = branchInfo

  if (status === 'loading') {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--panel-solid)] p-3">
        <LoadingState message="Loading branch info..." className="py-2" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--panel-solid)] p-3">
        <ErrorState
          title="Branch info error"
          message={error || 'Failed to load branch info'}
          onRetry={onRetry}
          className="py-2"
        />
      </div>
    )
  }

  if (!data || !data.current) {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--panel-solid)] p-3">
        <EmptyState
          icon={<GitBranch className="h-5 w-5" />}
          title="No branch info"
          description="Select a session to view branch information"
          className="py-2"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--panel-solid)] p-3">
      {/* Current branch */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">
          Current Branch
        </label>
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-[var(--accent-green)]" />
          <span className="truncate text-[13px] font-medium text-[var(--text)]" title={data.current}>
            {data.current.replace('session/', '')}
          </span>
        </div>
      </div>

      {/* Target branch */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">
          Target Branch
        </label>
        <div className="flex items-center gap-2">
          <GitMerge className="h-4 w-4 text-[var(--accent-blue)]" />
          <span className="truncate text-[13px] font-medium text-[var(--text)]" title={data.target}>
            {data.target}
          </span>
        </div>
      </div>

      {/* Ahead/Behind indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <ArrowUp className="h-3.5 w-3.5 text-[var(--accent-green)]" />
          <span className="text-[12px] text-[var(--text-secondary)]">
            {data.ahead} ahead
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowDown className="h-3.5 w-3.5 text-[var(--accent-orange)]" />
          <span className="text-[12px] text-[var(--text-secondary)]">
            {data.behind} behind
          </span>
        </div>
      </div>

      {/* Merge button */}
      <Button
        variant="primary"
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
