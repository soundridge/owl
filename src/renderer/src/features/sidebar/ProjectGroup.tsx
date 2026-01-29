import { useState } from 'react'
import { Button } from '../../components/ui'
import type { Project } from '../../types'
import { WorkspaceCard } from './WorkspaceCard'

interface ProjectGroupProps {
  project: Project
  activeWorkspaceId?: string
  onWorkspaceSelect?: (workspaceId: string) => void
  onNewWorkspace?: () => void
  defaultExpanded?: boolean
}

export function ProjectGroup({
  project,
  activeWorkspaceId,
  onWorkspaceSelect,
  onNewWorkspace,
  defaultExpanded = true,
}: ProjectGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="flex flex-col">
      {/* Section header */}
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
        {project.name}
      </button>

      {expanded && (
        <div className="mt-1 flex flex-col gap-0.5">
          <Button variant="ghost" size="sm" onClick={onNewWorkspace} className="justify-start gap-1.5 text-[var(--text-dim)]">
            <span className="text-[14px]">+</span>
            <span className="text-[12px]">New workspace</span>
          </Button>

          {project.workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              isActive={workspace.id === activeWorkspaceId}
              onClick={() => onWorkspaceSelect?.(workspace.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
