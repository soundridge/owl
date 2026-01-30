import { ScrollArea } from '@renderer/components/ui/scroll-area'
import type { FileChange, BranchInfo, AsyncState } from '../../types'
import { BranchInfoCard } from './BranchInfoCard'
import { ChangesTab } from './ChangesTab'

interface InspectorPanelProps {
  changes: AsyncState<FileChange[]>
  branchInfo: AsyncState<BranchInfo>
  onFileClick?: (path: string) => void
  onRefreshChanges: () => void
  onMerge: () => void
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
    <aside className="flex h-full w-full flex-col overflow-hidden border-l border-[rgba(255,255,255,0.08)] bg-[#2c2c2e]">
      {/* Changes list */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          <ChangesTab
            changes={changes}
            onFileClick={onFileClick}
            onRefresh={onRefreshChanges}
          />
        </div>
      </ScrollArea>

      {/* Branch info card */}
      <div className="shrink-0 border-t border-[rgba(255,255,255,0.08)] p-3">
        <BranchInfoCard
          branchInfo={branchInfo}
          onMerge={onMerge}
          onRetry={onRetryBranchInfo}
        />
      </div>
    </aside>
  )
}
