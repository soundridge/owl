import type { AsyncState, BranchInfo, FileChange } from '../../types'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Layers } from 'lucide-react'
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
    <aside className="group/inspector flex h-full w-full flex-col overflow-hidden border-l border-border bg-card text-card-foreground">
      {/* Header */}
      <div className="flex h-13 shrink-0 items-center border-b border-border/40 px-4 window-drag">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Layers className="h-4 w-4" />
          <span className="text-[13px] font-medium">Inspector</span>
        </div>
      </div>

      {/* Changes Scroll Area */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          <ChangesTab
            changes={changes}
            onFileClick={onFileClick}
            onRefresh={onRefreshChanges}
          />
        </div>
      </ScrollArea>

      {/* Footer / Actions */}
      <div className="shrink-0 border-t border-border/40 bg-accent/5 p-4 backdrop-blur-sm">
        <BranchInfoCard
          branchInfo={branchInfo}
          onMerge={onMerge}
          onRetry={onRetryBranchInfo}
        />
      </div>
    </aside>
  )
}
