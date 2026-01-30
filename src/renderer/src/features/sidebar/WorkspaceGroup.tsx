import { useState } from 'react'
import { FolderGit2, Plus } from 'lucide-react'
import { Button, EmptyState, SessionCardSkeleton } from '../../components/ui'
import type { Workspace, LoadingState } from '../../types'
import { SessionCard } from './SessionCard'

interface WorkspaceGroupProps {
  workspace: Workspace
  activeSessionId?: string | null
  onSessionSelect?: (sessionId: string) => void
  onNewSession?: () => void
  defaultExpanded?: boolean
  loadingState?: LoadingState
}

export function WorkspaceGroup({
  workspace,
  activeSessionId,
  onSessionSelect,
  onNewSession,
  defaultExpanded = true,
  loadingState = 'success',
}: WorkspaceGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const hasNoSessions = workspace.sessions.length === 0
  const isLoading = loadingState === 'loading'

  return (
    <div className="flex flex-col">
      {/* Workspace header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)] transition-colors hover:bg-[var(--panel-hover)] hover:text-[var(--text-muted)]"
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-3 w-3 transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        {workspace.name}
        <span className="ml-auto text-[10px] font-normal normal-case text-[var(--text-dim)]">
          {workspace.sessions.length} sessions
        </span>
      </button>

      {expanded && (
        <div className="mt-1 flex flex-col gap-0.5">
          {/* New Session button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewSession}
            className="justify-start gap-1.5 text-[var(--text-dim)] hover:text-[var(--text-secondary)]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="text-[12px]">New Session</span>
          </Button>

          {/* Loading state */}
          {isLoading && (
            <>
              <SessionCardSkeleton />
              <SessionCardSkeleton />
            </>
          )}

          {/* Empty state */}
          {!isLoading && hasNoSessions && (
            <EmptyState
              icon={<FolderGit2 className="h-5 w-5" />}
              title="No sessions"
              description="Create a session to start working"
              className="py-4"
            />
          )}

          {/* Session list */}
          {!isLoading &&
            workspace.sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onClick={() => onSessionSelect?.(session.id)}
              />
            ))}
        </div>
      )}
    </div>
  )
}
