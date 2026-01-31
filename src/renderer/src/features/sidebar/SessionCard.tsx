import type { Session, SessionStatus } from '../../types'
import { Badge } from '@renderer/components/ui/badge'
import { AlertCircle, Circle, StopCircle } from 'lucide-react'

interface SessionCardProps {
  session: Session
  isActive?: boolean
  onClick: () => void
}

const statusConfig: Record<
  SessionStatus,
  { label: string, icon: React.ReactNode, color: string }
> = {
  running: {
    label: 'Running',
    icon: <Circle className="h-2 w-2 fill-current" />,
    color: 'text-[color:var(--success)]',
  },
  stopped: {
    label: 'Stopped',
    icon: <StopCircle className="h-3 w-3" />,
    color: 'text-muted-foreground',
  },
  error: {
    label: 'Error',
    icon: <AlertCircle className="h-3 w-3" />,
    color: 'text-destructive',
  },
}

export function SessionCard({ session, isActive = false, onClick }: SessionCardProps) {
  const status = statusConfig[session.status]

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start justify-between gap-2 rounded-md px-2 py-2 text-left transition-all ${
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
      }`}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className={`shrink-0 ${status.color}`}>{status.icon}</span>
          <span className="truncate text-[13px] font-medium">{session.name}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pl-3.5">
          <Badge
            variant="secondary"
            className="max-w-[120px] truncate text-[10px]"
            title={session.branch}
          >
            {session.branch.replace('session/', '')}
          </Badge>
          <span className="text-[11px] text-muted-foreground">
            from
            {' '}
            {session.baseBranch}
          </span>
        </div>
      </div>
      <span className={`shrink-0 text-[11px] font-medium ${status.color}`}>
        {status.label}
      </span>
    </button>
  )
}
