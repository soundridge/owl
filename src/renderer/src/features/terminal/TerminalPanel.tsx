import type { Session, TerminalState } from '../../types'
import { Button } from '@renderer/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import {
  FolderOpen,
  PanelLeft,
  Play,
  RotateCw,
  Square,
  Terminal as TerminalIcon,
} from 'lucide-react'

interface TerminalPanelProps {
  session: Session | null
  terminal: TerminalState
  sidebarCollapsed?: boolean
  onToggleSidebar: () => void
  onStartTerminal: () => void
  onStopTerminal: () => void
  onRestartTerminal: () => void
}

export function TerminalPanel({
  session,
  terminal,
  sidebarCollapsed,
  onToggleSidebar,
  onStartTerminal,
  onStopTerminal,
  onRestartTerminal,
}: TerminalPanelProps) {
  const isConnected = terminal.isConnected && terminal.status === 'running'
  const hasError = terminal.status === 'error'

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-card text-card-foreground">
      {/* Header */}
      <div className="shrink-0 border-b border-border/60">
        <div className="flex items-center window-drag">
          {/* Sidebar toggle when collapsed */}
          {sidebarCollapsed && (
            <div className="flex h-[52px] items-center border-r border-border/60 pl-[78px] pr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onToggleSidebar}
                    className="window-no-drag flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                  >
                    <PanelLeft className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Show sidebar</TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Session header */}
          <div className="flex h-[52px] flex-1 items-center justify-between px-4">
            <div className="flex flex-col gap-0.5">
              {session
                ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {session.name}
                        </span>
                        <span
                          className={`inline-flex h-2 w-2 rounded-full ${
                            isConnected
                              ? 'bg-[color:var(--success)]'
                              : hasError
                                ? 'bg-destructive'
                                : 'bg-muted-foreground/50'
                          }`}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FolderOpen className="h-3 w-3" />
                        <span className="max-w-[300px] truncate" title={session.worktreePath}>
                          {session.worktreePath}
                        </span>
                      </div>
                    </>
                  )
                : (
                    <span className="text-sm text-muted-foreground">
                      No session selected
                    </span>
                  )}
            </div>

            {/* Terminal controls */}
            {session && (
              <div className="window-no-drag flex items-center gap-1">
                {!isConnected
                  ? (
                      <Button size="sm" onClick={onStartTerminal} className="gap-1.5">
                        <Play className="h-3.5 w-3.5" />
                        Start Terminal
                      </Button>
                    )
                  : (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={onRestartTerminal}
                              className="h-8 w-8"
                            >
                              <RotateCw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Restart terminal</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={onStopTerminal}
                              className="h-8 w-8"
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Stop terminal</TooltipContent>
                        </Tooltip>
                      </>
                    )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terminal content area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {!session
          ? (
              <EmptyTerminalState
                title="No session selected"
                description="Select a session from the sidebar to open its terminal"
              />
            )
          : hasError
            ? (
                <ErrorTerminalState
                  message="Failed to connect to terminal. The shell process may have crashed."
                  onRetry={onStartTerminal}
                />
              )
            : !isConnected
                ? (
                    <EmptyTerminalState
                      title="Terminal not started"
                      description="Click 'Start Terminal' to begin working in this session"
                      action={(
                        <Button size="sm" onClick={onStartTerminal} className="gap-1.5">
                          <Play className="h-3.5 w-3.5" />
                          Start Terminal
                        </Button>
                      )}
                    />
                  )
                : (
                    <TerminalContainer session={session} />
                  )}
      </div>
    </main>
  )
}

// Empty state component
interface EmptyTerminalStateProps {
  title: string
  description: string
  action?: React.ReactNode
}

function EmptyTerminalState({ title, description, action }: EmptyTerminalStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <TerminalIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}

// Error state component
interface ErrorTerminalStateProps {
  message: string
  onRetry: () => void
}

function ErrorTerminalState({ message, onRetry }: ErrorTerminalStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15">
        <TerminalIcon className="h-8 w-8 text-destructive" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-destructive">Terminal error</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}

// Terminal container (placeholder for xterm.js)
interface TerminalContainerProps {
  session: Session
}

function TerminalContainer({ session }: TerminalContainerProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Tab bar */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border/60 bg-muted px-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded bg-accent px-2 py-1">
            <TerminalIcon className="h-3 w-3 text-accent-foreground/80" />
            <span className="text-xs font-medium text-accent-foreground">
              Terminal
            </span>
          </div>
          <button className="rounded px-1.5 py-1 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
            +
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-muted-foreground">Run</span>
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ^R
          </kbd>
        </div>
      </div>

      {/* Terminal content placeholder */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed">
        {/* Simulated terminal prompt */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-[color:var(--success)]">
            {session.branch.replace('session/', '')}
          </span>
          <span className="text-muted-foreground">
            {session.worktreePath.split('/').slice(-2).join('/')}
          </span>
        </div>
        <div className="flex items-center text-foreground/70">
          <span className="text-[color:var(--accent-blue)]">$</span>
          <span className="ml-2 animate-pulse text-muted-foreground">_</span>
        </div>

        {/* Placeholder message */}
        <div className="mt-4 rounded-md border border-dashed border-border/60 bg-muted/40 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            xterm.js terminal will be rendered here
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            This is a placeholder for the terminal UI skeleton
          </p>
        </div>
      </div>
    </div>
  )
}
