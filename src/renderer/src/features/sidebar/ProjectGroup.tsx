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
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-dim)] transition-colors hover:text-[var(--text-muted)]"
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        {project.name}
      </button>

      {expanded && (
        <>
          <Button variant="ghost" size="sm" onClick={onNewWorkspace} className="justify-start gap-2">
            <span className="text-[13px] font-bold">+</span> New workspace
          </Button>

          <div className="flex flex-col gap-1.5">
            {project.workspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                isActive={workspace.id === activeWorkspaceId}
                onClick={() => onWorkspaceSelect?.(workspace.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
