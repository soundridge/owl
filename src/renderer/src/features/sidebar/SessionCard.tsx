import type { Session } from '../../types'

import { Button } from '@renderer/components/ui/button'
import { cn } from '@renderer/lib/utils'
import { TerminalSquare, X } from 'lucide-react'

interface SessionCardProps {
  session: Session
  isActive?: boolean
  onClick: () => void
  onClose?: (e: React.MouseEvent) => void
}

export function SessionCard({ session, isActive = false, onClick, onClose }: SessionCardProps) {
  const isRunning = session.status === 'running'

  return (
    <div
      onClick={onClick}
      role="button"
      className={cn(
        'group/session relative flex w-full cursor-pointer items-center gap-3 rounded-md border border-transparent px-3 py-2 transition-all',
        isActive
          ? 'bg-accent/50 text-accent-foreground shadow-sm ring-1 ring-border'
          : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground',
      )}
    >
      {/* Icon & Status */}
      <div className="relative flex shrink-0 items-center justify-center">
        <TerminalSquare className={cn('h-4 w-4', isActive ? 'text-foreground' : 'text-muted-foreground')} />
        {isRunning && (
          <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn('truncate text-sm font-medium leading-none', isActive && 'text-foreground')}>
          {session.name}
        </span>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
          <span className="truncate max-w-[120px] font-mono opacity-80">
            {session.branch.replace('session/', '')}
          </span>
        </div>
      </div>

      {/* Actions (Hover Only) */}
      <div className={cn('flex items-center opacity-0 transition-opacity group-hover/session:opacity-100', isActive && 'opacity-100')}>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-md hover:bg-destructive/10 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onClose?.(e)
          }}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
