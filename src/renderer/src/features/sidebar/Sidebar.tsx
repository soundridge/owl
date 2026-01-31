import type { ReactNode } from 'react'
import type { AsyncState, Workspace } from '../../types'
import { Button } from '@renderer/components/ui/button'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { FolderGit2, PanelLeftClose, Plus } from 'lucide-react'
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

  const renderHeader = (): ReactNode => (
    <div className="flex h-13 shrink-0 items-center justify-end border-b border-border px-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="-mr-2 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Hide sidebar</TooltipContent>
      </Tooltip>
    </div>
  )

  const renderLoadingState = (): ReactNode => (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-10 w-5/6" />
    </div>
  )

  const renderErrorState = (): ReactNode => (
    <div className="flex flex-col items-center gap-2 p-4 text-center">
      <p className="text-sm text-destructive">{error || 'Failed to load'}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )

  const renderEmptyState = (): ReactNode => (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FolderGit2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">No workspaces found</p>
      <Button size="sm" onClick={onAddWorkspace}>
        Add your first repo
      </Button>
    </div>
  )

  const renderWorkspaceList = (): ReactNode => {
    if (!data || data.length === 0)
      return null

    return data.map(workspace => (
      <WorkspaceGroup
        key={workspace.id}
        workspace={workspace}
        isActive={workspace.id === activeWorkspaceId}
        activeSessionId={activeWorkspaceId === workspace.id ? activeSessionId : null}
        onSelect={() => onWorkspaceSelect(workspace.id)}
        onSessionSelect={onSessionSelect}
        onCreateSession={() => onCreateSession(workspace.id)}
      />
    ))
  }

  const renderContent = (): ReactNode => (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-2 p-3">
        {status === 'loading' && renderLoadingState()}
        {status === 'error' && renderErrorState()}
        {hasNoWorkspaces && renderEmptyState()}
        {status === 'success' && renderWorkspaceList()}
      </div>
    </ScrollArea>
  )

  const renderFooter = (): ReactNode => (
    <div className="border-t border-border p-3">
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={onAddWorkspace}
      >
        <Plus className="h-4 w-4" />
        Add Workspace
      </Button>
    </div>
  )

  return (
    <aside className="group/sidebar flex h-full w-full flex-col overflow-hidden border-r border-border bg-sidebar text-sidebar-foreground">
      {renderHeader()}
      {renderContent()}
      {renderFooter()}
    </aside>
  )
}
