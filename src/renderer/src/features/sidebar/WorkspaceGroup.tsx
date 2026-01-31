import type { Workspace } from '../../types'
import { Button } from '@renderer/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@renderer/components/ui/collapsible'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { ChevronRight, FolderGit2, Plus } from 'lucide-react'
import { useState } from 'react'
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
  const [isOpen, setIsOpen] = useState(isActive)
  const hasNoSessions = workspace.sessions.length === 0

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/workspace space-y-1"
    >
      <CollapsibleTrigger
        onClick={onSelect}
        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium transition-colors hover:bg-accent/50 hover:text-foreground data-[state=open]:text-foreground"
      >
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-data-[state=open]/workspace:rotate-90" />
        <FolderGit2 className="h-4 w-4 shrink-0 text-muted-foreground group-data-[state=open]/workspace:text-foreground" />
        <span className="flex-1 truncate">{workspace.name}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
          {workspace.sessions.length}
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="flex flex-col gap-1 pl-6">
          {/* Loading state */}
          {isLoading && (
            <div className="space-y-2 py-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && hasNoSessions && (
            <div className="py-2 text-xs text-muted-foreground/60 italic">
              No sessions active
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

          {/* Add Session Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onCreateSession()
            }}
            className="h-8 justify-start gap-2 px-3 text-xs text-muted-foreground hover:bg-accent hover:text-primary"
          >
            <Plus className="h-3 w-3" />
            New Session
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
