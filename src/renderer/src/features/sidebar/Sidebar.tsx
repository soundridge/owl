import { PanelLeftClose } from 'lucide-react'
import { Button, IconButton } from '../../components/ui'
import type { Project } from '../../types'
import { ProjectGroup } from './ProjectGroup'

interface SidebarProps {
  projects: Project[]
  activeWorkspaceId?: string
  onWorkspaceSelect?: (workspaceId: string) => void
  onAddRepository?: () => void
  onToggleCollapse?: () => void
}

export function Sidebar({
  projects,
  activeWorkspaceId,
  onWorkspaceSelect,
  onAddRepository,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <aside className="vibrancy flex h-full w-full flex-col overflow-hidden border-r border-[var(--border-subtle)] bg-[var(--sidebar-bg)]">
      {/* Titlebar area - draggable region for window, traffic lights handled by system */}
      <div className="group flex h-[52px] shrink-0 items-center justify-between border-b border-[var(--separator)] pl-[78px] pr-2" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <span className="text-[13px] font-medium text-[var(--text-secondary)]">Home</span>
        <button
          onClick={onToggleCollapse}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-tertiary)] opacity-0 transition-all hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)] group-hover:opacity-100"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          title="Hide sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* Project groups - scrollable */}
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 py-3">
        {projects.map((project) => (
          <ProjectGroup
            key={project.id}
            project={project}
            activeWorkspaceId={activeWorkspaceId}
            onWorkspaceSelect={onWorkspaceSelect}
          />
        ))}
      </div>

      {/* Bottom actions */}
      <div className="flex shrink-0 items-center gap-2 border-t border-[var(--separator)] p-3">
        <Button variant="primary" size="md" className="flex-1" onClick={onAddRepository}>
          Add repository
        </Button>
        <IconButton>
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
