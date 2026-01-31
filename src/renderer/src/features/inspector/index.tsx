import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { useChangesStore, useSessionStore } from '@renderer/store'
import { Layers } from 'lucide-react'
import { useEffect } from 'react'
import { BranchInfoCard } from './BranchInfoCard'
import { ChangesTab } from './ChangesTab'

export function InspectorPanel() {
  const { changes, branchInfo, refreshChanges, fetchChanges, fetchBranchInfo } = useChangesStore()
  const activeSession = useSessionStore(state => state.getActiveSession())

  // Fetch changes when session changes
  useEffect(() => {
    if (activeSession?.worktreePath) {
      fetchChanges(activeSession.worktreePath)
      fetchBranchInfo(activeSession.worktreePath)
    }
  }, [activeSession?.id, activeSession?.worktreePath, fetchChanges, fetchBranchInfo])

  const handleMerge = () => {
    // TODO: Open merge dialog
  }

  const handleFileClick = (_path: string) => {
    // TODO: Open file in editor or diff view
  }

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
            onFileClick={handleFileClick}
            onRefresh={refreshChanges}
          />
        </div>
      </ScrollArea>

      {/* Footer / Actions */}
      <div className="shrink-0 border-t border-border/40 bg-accent/5 p-4 backdrop-blur-sm">
        <BranchInfoCard
          branchInfo={branchInfo}
          onMerge={handleMerge}
        />
      </div>
    </aside>
  )
}

export { BranchInfoCard } from './BranchInfoCard'
export { ChangesTab } from './ChangesTab'
export { FileChangeItem } from './FileChangeItem'
