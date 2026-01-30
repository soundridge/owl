import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { Button } from './button'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-4 py-8 text-center',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-red)]/10 text-[var(--accent-red)]">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-[13px] font-medium text-[var(--text)]">{title}</h3>
        <p className="text-[12px] text-[var(--text-muted)]">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="mt-2 gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  )
}
