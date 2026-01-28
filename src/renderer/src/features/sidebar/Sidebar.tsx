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
    <aside className="flex w-[260px] flex-col gap-4 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3">
      {/* Window controls + Home */}
      <div className="flex items-center gap-3 px-1 text-[13px] text-[var(--text-muted)]">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57] transition-opacity hover:opacity-80" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e] transition-opacity hover:opacity-80" />
          <span className="h-3 w-3 rounded-full bg-[#28c840] transition-opacity hover:opacity-80" />
        </div>
        <div className="font-medium tracking-tight">Home</div>
      </div>

      {/* Project groups - scrollable */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
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
      <div className="mt-auto flex items-center gap-2 border-t border-[var(--border)] pt-3">
        <Button variant="primary" size="lg" className="flex-1" onClick={onAddRepository}>
          Add repository
        </Button>
        <IconButton>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]">
            <path
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </IconButton>
      </div>
    </aside>
  )
}
