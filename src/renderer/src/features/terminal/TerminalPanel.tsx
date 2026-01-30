import {
  Play,
  Square,
  RotateCw,
  Terminal as TerminalIcon,
  FolderOpen,
  PanelLeft,
} from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import type { Session, TerminalState } from '../../types'

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
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#2c2c2e]">
      {/* Header */}
      <div className="shrink-0 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center">
          {/* Sidebar toggle when collapsed */}
          {sidebarCollapsed && (
            <div
              className="flex h-[52px] items-center border-r border-[rgba(255,255,255,0.08)] pl-[78px] pr-2"
              style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onToggleSidebar}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-[rgba(255,255,255,0.35)] transition-all hover:bg-[rgba(58,58,60,0.6)] hover:text-[rgba(255,255,255,0.7)]"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                  >
                    <PanelLeft className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Show sidebar</TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Session header */}
          <div className="flex flex-1 items-center justify-between px-4 py-3">
            <div className="flex flex-col gap-0.5">
              {session ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[rgba(255,255,255,0.88)]">
                      {session.name}
                    </span>
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${
                        isConnected
                          ? 'bg-[#30d158]'
                          : hasError
                            ? 'bg-[#ff453a]'
                            : 'bg-[rgba(255,255,255,0.35)]'
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[rgba(255,255,255,0.5)]">
                    <FolderOpen className="h-3 w-3" />
                    <span className="max-w-[300px] truncate" title={session.worktreePath}>
                      {session.worktreePath}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-sm text-[rgba(255,255,255,0.5)]">
                  No session selected
                </span>
              )}
            </div>

            {/* Terminal controls */}
            {session && (
              <div className="flex items-center gap-1">
                {!isConnected ? (
                  <Button size="sm" onClick={onStartTerminal} className="gap-1.5">
                    <Play className="h-3.5 w-3.5" />
                    Start Terminal
                  </Button>
                ) : (
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
        {!session ? (
          <EmptyTerminalState
            title="No session selected"
            description="Select a session from the sidebar to open its terminal"
          />
        ) : hasError ? (
          <ErrorTerminalState
            message="Failed to connect to terminal. The shell process may have crashed."
            onRetry={onStartTerminal}
          />
        ) : !isConnected ? (
          <EmptyTerminalState
            title="Terminal not started"
            description="Click 'Start Terminal' to begin working in this session"
            action={
              <Button size="sm" onClick={onStartTerminal} className="gap-1.5">
                <Play className="h-3.5 w-3.5" />
                Start Terminal
              </Button>
            }
          />
        ) : (
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
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(58,58,60,0.6)]">
        <TerminalIcon className="h-8 w-8 text-[rgba(255,255,255,0.5)]" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[rgba(255,255,255,0.88)]">{title}</p>
        <p className="mt-1 text-xs text-[rgba(255,255,255,0.5)]">{description}</p>
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
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,69,58,0.15)]">
        <TerminalIcon className="h-8 w-8 text-[#ff453a]" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[#ff453a]">Terminal error</p>
        <p className="mt-1 max-w-sm text-xs text-[rgba(255,255,255,0.5)]">{message}</p>
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
    <div className="flex flex-1 flex-col overflow-hidden bg-[#161618]">
      {/* Tab bar */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-[#1a1a1c] px-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded bg-[#3a3a3c] px-2 py-1">
            <TerminalIcon className="h-3 w-3 text-[rgba(255,255,255,0.5)]" />
            <span className="text-xs font-medium text-[rgba(255,255,255,0.88)]">
              Terminal
            </span>
          </div>
          <button className="rounded px-1.5 py-1 text-[13px] text-[rgba(255,255,255,0.35)] transition-colors hover:bg-[rgba(58,58,60,0.6)] hover:text-[rgba(255,255,255,0.5)]">
            +
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-[rgba(255,255,255,0.35)]">Run</span>
          <kbd className="rounded bg-[#3a3a3c] px-1.5 py-0.5 text-[10px] text-[rgba(255,255,255,0.35)]">
            ^R
          </kbd>
        </div>
      </div>

      {/* Terminal content placeholder */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed">
        {/* Simulated terminal prompt */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#30d158]">
            {session.branch.replace('session/', '')}
          </span>
          <span className="text-[rgba(255,255,255,0.35)]">
            {session.worktreePath.split('/').slice(-2).join('/')}
          </span>
        </div>
        <div className="flex items-center text-[rgba(255,255,255,0.7)]">
          <span className="text-[#0a84ff]">$</span>
          <span className="ml-2 animate-pulse text-[rgba(255,255,255,0.5)]">_</span>
        </div>

        {/* Placeholder message */}
        <div className="mt-4 rounded-md border border-dashed border-[rgba(255,255,255,0.1)] bg-[rgba(44,44,46,0.3)] p-4 text-center">
          <p className="text-xs text-[rgba(255,255,255,0.5)]">
            xterm.js terminal will be rendered here
          </p>
          <p className="mt-1 text-[11px] text-[rgba(255,255,255,0.35)]">
            This is a placeholder for the terminal UI skeleton
          </p>
        </div>
      </div>
    </div>
  )
}
