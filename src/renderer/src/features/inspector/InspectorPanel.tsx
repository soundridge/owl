import type { FileChange, BranchInfo, AsyncState } from '../../types'
import { BranchInfoCard } from './BranchInfoCard'
import { ChangesTab } from './ChangesTab'

interface InspectorPanelProps {
  changes: AsyncState<FileChange[]>
  branchInfo: AsyncState<BranchInfo>
  onFileClick?: (path: string) => void
  onRefreshChanges?: () => void
  onMerge?: () => void
  onRetryBranchInfo?: () => void
}

export function InspectorPanel({
  changes,
  branchInfo,
  onFileClick,
  onRefreshChanges,
  onMerge,
  onRetryBranchInfo,
}: InspectorPanelProps) {
  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-l border-[var(--separator)] bg-[var(--bg-secondary)]">
      {/* Changes list */}
      <div className="flex-1 overflow-y-auto p-3">
        <ChangesTab changes={changes} onFileClick={onFileClick} onRefresh={onRefreshChanges} />
      </div>

      {/* Branch info card */}
      <div className="shrink-0 border-t border-[var(--separator)] p-3">
        <BranchInfoCard branchInfo={branchInfo} onMerge={onMerge} onRetry={onRetryBranchInfo} />
      </div>
    </aside>
  )
}
