import { FolderPlus, PanelLeftClose, FolderGit2 } from 'lucide-react'
import { Button, IconButton, EmptyState, ErrorState, LoadingState } from '../../components/ui'
import type { Workspace, AsyncState } from '../../types'
import { WorkspaceGroup } from './WorkspaceGroup'

interface SidebarProps {
  workspaces: AsyncState<Workspace[]>
  activeWorkspaceId?: string | null
  activeSessionId?: string | null
  onWorkspaceSelect?: (workspaceId: string) => void
  onSessionSelect?: (sessionId: string) => void
  onAddWorkspace?: () => void
  onNewSession?: () => void
  onToggleCollapse?: () => void
  onRetry?: () => void
}

export function Sidebar({
  workspaces,
  activeWorkspaceId,
  activeSessionId,
  onWorkspaceSelect,
  onSessionSelect,
  onAddWorkspace,
  onNewSession,
  onToggleCollapse,
  onRetry,
}: SidebarProps) {
  const { data, status, error } = workspaces
  const hasNoWorkspaces = status === 'success' && (!data || data.length === 0)

  return (
    <aside className="vibrancy flex h-full w-full flex-col overflow-hidden border-r border-[var(--border-subtle)] bg-[var(--sidebar-bg)]">
      {/* Titlebar area - draggable region for window, traffic lights handled by system */}
      <div
        className="group flex h-[52px] shrink-0 items-center justify-between border-b border-[var(--separator)] pl-[78px] pr-2"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <span className="text-[13px] font-medium text-[var(--text-secondary)]">Workspaces</span>
        <button
          onClick={onToggleCollapse}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-tertiary)] opacity-0 transition-all hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)] group-hover:opacity-100"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          title="Hide sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* Content area - scrollable */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-3">
        {/* Loading state */}
        {status === 'loading' && <LoadingState message="Loading workspaces..." />}

        {/* Error state */}
        {status === 'error' && (
          <ErrorState message={error || 'Failed to load workspaces'} onRetry={onRetry} />
        )}

        {/* Empty state */}
        {hasNoWorkspaces && (
          <EmptyState
            icon={<FolderGit2 className="h-6 w-6" />}
            title="No workspaces"
            description="Add a git repository to get started"
            action={
              <Button variant="primary" size="sm" onClick={onAddWorkspace} className="gap-1.5">
                <FolderPlus className="h-3.5 w-3.5" />
                Add Workspace
              </Button>
            }
          />
        )}

        {/* Workspace list */}
        {status === 'success' &&
          data &&
          data.length > 0 &&
          data.map((workspace) => (
            <WorkspaceGroup
              key={workspace.id}
              workspace={workspace}
              activeSessionId={activeWorkspaceId === workspace.id ? activeSessionId : null}
              onSessionSelect={(sessionId) => {
                onWorkspaceSelect?.(workspace.id)
                onSessionSelect?.(sessionId)
              }}
              onNewSession={onNewSession}
              defaultExpanded={workspace.id === activeWorkspaceId}
            />
          ))}
      </div>

      {/* Bottom actions */}
      <div className="flex shrink-0 items-center gap-2 border-t border-[var(--separator)] p-3">
        <Button variant="primary" size="md" className="flex-1 gap-1.5" onClick={onAddWorkspace}>
          <FolderPlus className="h-4 w-4" />
          Add Workspace
        </Button>
        <IconButton onClick={onNewSession} title="New Session">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
            <path
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </IconButton>
      </div>
    </aside>
  )
}
