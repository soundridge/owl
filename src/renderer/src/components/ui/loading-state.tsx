import { cn } from '@renderer/lib/utils'

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-4 py-8 text-center',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent-blue)]" />
        <div
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent-blue)]"
          style={{ animationDelay: '0.2s' }}
        />
        <div
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent-blue)]"
          style={{ animationDelay: '0.4s' }}
        />
      </div>
      <span className="text-[12px] text-[var(--text-muted)]">{message}</span>
    </div>
  )
}

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[var(--radius-md)] bg-[var(--panel-2)]',
        className
      )}
    />
  )
}

export function SessionCardSkeleton() {
  return (
    <div className="flex w-full items-start justify-between gap-2 rounded-[var(--radius-md)] px-2 py-2">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
      </div>
    </div>
  )
}

export function FileChangeSkeleton() {
  return (
    <div className="flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5">
      <Skeleton className="h-4 w-4 shrink-0" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-4 w-12" />
    </div>
  )
}
