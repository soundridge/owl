import { Button, IconButton } from '../../components/ui'
import type { Project } from '../../types'
import { ProjectGroup } from './ProjectGroup'

interface SidebarProps {
  projects: Project[]
  activeWorkspaceId?: string
  onWorkspaceSelect?: (workspaceId: string) => void
  onAddRepository?: () => void
}

export function Sidebar({
  projects,
  activeWorkspaceId,
  onWorkspaceSelect,
  onAddRepository,
}: SidebarProps) {
  return (
    <aside className="vibrancy flex w-[260px] flex-col overflow-hidden border-r border-[var(--border-subtle)] bg-[var(--sidebar-bg)]">
      {/* Titlebar area with window controls */}
      <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-[var(--separator)] px-4" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <div className="flex gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <span className="h-3 w-3 rounded-full bg-[#ff5f57] transition-opacity hover:opacity-80 active:bg-[#bf4942]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e] transition-opacity hover:opacity-80 active:bg-[#bf9122]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840] transition-opacity hover:opacity-80 active:bg-[#1e9631]" />
        </div>
        <span className="ml-2 text-[13px] font-medium text-[var(--text-secondary)]">Home</span>
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
