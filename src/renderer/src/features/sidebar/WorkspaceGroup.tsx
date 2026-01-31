import type { Workspace } from '../../types'
import { Button } from '@renderer/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@renderer/components/ui/collapsible'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { ChevronRight, FolderGit2, Plus } from 'lucide-react'
import { SessionCard } from './SessionCard'

interface WorkspaceGroupProps {
  workspace: Workspace
  isActive?: boolean
  activeSessionId: string | null
  onSelect: () => void
  onSessionSelect: (sessionId: string) => void
  onCreateSession: () => void
  isLoading?: boolean
}

export function WorkspaceGroup({
  workspace,
  isActive = false,
  activeSessionId,
  onSelect,
  onSessionSelect,
  onCreateSession,
  isLoading = false,
}: WorkspaceGroupProps) {
  const hasNoSessions = workspace.sessions.length === 0

  return (
    <Collapsible defaultOpen={isActive} className="group/workspace">
      <CollapsibleTrigger
        onClick={onSelect}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <ChevronRight className="h-3 w-3 transition-transform duration-200 group-data-[state=open]/workspace:rotate-90" />
        <span className="flex-1 truncate">{workspace.name}</span>
        <span className="text-[10px] font-normal normal-case tabular-nums">
          {workspace.sessions.length}
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-1 flex flex-col gap-0.5 pl-1">
          {/* New Session button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onCreateSession()
            }}
            className="h-7 justify-start gap-1.5 px-2 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="text-xs">New Session</span>
          </Button>

          {/* Loading state */}
          {isLoading && (
            <>
              <Skeleton className="ml-2 h-12 w-[calc(100%-8px)]" />
              <Skeleton className="ml-2 h-12 w-[calc(100%-8px)]" />
            </>
          )}

          {/* Empty state */}
          {!isLoading && hasNoSessions && (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <FolderGit2 className="h-5 w-5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">No sessions</p>
            </div>
          )}

          {/* Session list */}
          {!isLoading
            && workspace.sessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onClick={() => onSessionSelect(session.id)}
              />
            ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
