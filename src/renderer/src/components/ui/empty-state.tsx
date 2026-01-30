import * as React from 'react'
import { cn } from '@renderer/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-4 py-8 text-center',
        className
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--panel-2)] text-[var(--text-muted)]">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <h3 className="text-[13px] font-medium text-[var(--text-secondary)]">{title}</h3>
        {description && (
          <p className="text-[12px] text-[var(--text-muted)]">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
