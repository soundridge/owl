import type { AsyncState, BranchInfo, FileChange } from '../../types'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
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
    <aside className="flex h-full w-full flex-col overflow-hidden border-l border-border bg-card text-card-foreground">
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
      <div className="shrink-0 border-t border-border/60 p-3">
        <BranchInfoCard
          branchInfo={branchInfo}
          onMerge={onMerge}
          onRetry={onRetryBranchInfo}
        />
      </div>
    </aside>
  )
}
