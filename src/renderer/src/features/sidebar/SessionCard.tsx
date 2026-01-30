import { Circle, StopCircle, AlertCircle } from 'lucide-react'
import { Badge } from '../../components/ui'
import type { Session, SessionStatus } from '../../types'

interface SessionCardProps {
  session: Session
  isActive?: boolean
  onClick?: () => void
}

const statusConfig: Record<SessionStatus, { label: string; icon: React.ReactNode; color: string }> = {
  running: {
    label: 'Running',
    icon: <Circle className="h-2 w-2 fill-current" />,
    color: 'text-[var(--accent-green)]',
  },
  stopped: {
    label: 'Stopped',
    icon: <StopCircle className="h-3 w-3" />,
    color: 'text-[var(--text-muted)]',
  },
  error: {
    label: 'Error',
    icon: <AlertCircle className="h-3 w-3" />,
    color: 'text-[var(--accent-red)]',
  },
}

export function SessionCard({ session, isActive = false, onClick }: SessionCardProps) {
  const status = statusConfig[session.status]

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start justify-between gap-2 rounded-[var(--radius-md)] px-2 py-2 text-left transition-all duration-150 ${
        isActive
          ? 'bg-[var(--accent-blue)]/15 text-[var(--text)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--panel-hover)]'
      }`}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className={`shrink-0 ${status.color}`}>{status.icon}</span>
          <span className="truncate text-[13px] font-medium">{session.name}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pl-3.5">
          <Badge className="truncate max-w-[120px]" title={session.branch}>
            {session.branch.replace('session/', '')}
          </Badge>
          <span className="text-[11px] text-[var(--text-dim)]">
            from {session.baseBranch}
          </span>
        </div>
      </div>
      <div className={`shrink-0 text-[11px] font-medium ${status.color}`}>
        {status.label}
      </div>
    </button>
  )
}
