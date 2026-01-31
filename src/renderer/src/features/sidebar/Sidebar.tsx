import type { AsyncState, Workspace } from '../../types'
import { Button } from '@renderer/components/ui/button'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { FolderGit2, FolderPlus, PanelLeftClose } from 'lucide-react'
import { WorkspaceGroup } from './WorkspaceGroup'

interface SidebarProps {
  workspaces: AsyncState<Workspace[]>
  activeWorkspaceId: string | null
  activeSessionId: string | null
  onWorkspaceSelect: (workspaceId: string) => void
  onSessionSelect: (sessionId: string) => void
  onAddWorkspace: () => void
  onCreateSession: (workspaceId: string) => void
  onToggleCollapse: () => void
  onRetry?: () => void
}

export function Sidebar({
  workspaces,
  activeWorkspaceId,
  activeSessionId,
  onWorkspaceSelect,
  onSessionSelect,
  onAddWorkspace,
  onCreateSession,
  onToggleCollapse,
  onRetry,
}: SidebarProps) {
  const { data, status, error } = workspaces
  const hasNoWorkspaces = status === 'success' && (!data || data.length === 0)

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-r border-border bg-sidebar text-sidebar-foreground backdrop-blur-xl">
      {/* Header - draggable region for window */}
      <div
        className="group flex h-[52px] shrink-0 items-center justify-between border-b border-border/60 pl-[78px] pr-2"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <span className="text-[13px] font-medium text-muted-foreground">
          Workspaces
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggleCollapse}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Hide sidebar</TooltipContent>
        </Tooltip>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {/* Loading state */}
          {status === 'loading' && (
            <div className="flex flex-col gap-2 p-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-3 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {error || 'Failed to load workspaces'}
              </p>
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Retry
                </Button>
              )}
            </div>
          )}

          {/* Empty state */}
          {hasNoWorkspaces && (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FolderGit2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  No workspaces
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add a git repository to get started
                </p>
              </div>
              <Button size="sm" onClick={onAddWorkspace} className="mt-2 gap-1.5">
                <FolderPlus className="h-3.5 w-3.5" />
                Add Workspace
              </Button>
            </div>
          )}

          {/* Workspace list */}
          {status === 'success'
            && data
            && data.length > 0
            && data.map(workspace => (
              <WorkspaceGroup
                key={workspace.id}
                workspace={workspace}
                isActive={workspace.id === activeWorkspaceId}
                activeSessionId={
                  activeWorkspaceId === workspace.id ? activeSessionId : null
                }
                onSelect={() => onWorkspaceSelect(workspace.id)}
                onSessionSelect={onSessionSelect}
                onCreateSession={() => onCreateSession(workspace.id)}
              />
            ))}
        </div>
      </ScrollArea>

      {/* Bottom actions */}
      <div className="flex shrink-0 items-center gap-2 border-t border-border/60 p-3">
        <Button className="flex-1 gap-1.5" onClick={onAddWorkspace}>
          <FolderPlus className="h-4 w-4" />
          Add Workspace
        </Button>
      </div>
    </aside>
  )
}
