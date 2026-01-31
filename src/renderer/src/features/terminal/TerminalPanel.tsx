import type { Session, TerminalState } from '../../types'
import { Button } from '@renderer/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import {
  ChevronRight,
  FolderOpen,
  PanelLeft,
  Play,
  RotateCw,
  Square,
  Terminal as TerminalIcon,
} from 'lucide-react'
import { XTerm } from './XTerm'

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
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#1e1e1e] text-foreground">
      {/* Header */}
      <div className="flex h-13 shrink-0 items-center justify-between border-b border-white/5 bg-[#1e1e1e] px-4 window-drag">
        <div className="flex items-center gap-3">
          {/* Sidebar Left Toggle - offset for macOS traffic lights when sidebar is collapsed */}
          {sidebarCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleSidebar}
                  className="window-no-drag ml-[60px] flex items-center justify-center rounded-sm text-muted-foreground/60 transition-colors hover:text-foreground"
                >
                  <PanelLeft className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Show sidebar</TooltipContent>
            </Tooltip>
          )}

          {/* Breadcrumbs */}
          {session
            ? (
                <div className="flex items-center gap-1.5 text-[13px] font-medium leading-none">
                  <span className="flex items-center gap-1.5 text-muted-foreground/60">
                    <FolderOpen className="h-3.5 w-3.5" />
                    <span>Owlet</span>
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                  <span className="flex items-center gap-1.5 text-foreground">
                    <TerminalIcon className="h-3.5 w-3.5 text-primary" />
                    <span>{session.name}</span>
                  </span>

                  {/* Status Indicator */}
                  <span className={`ml-2 h-1.5 w-1.5 rounded-full ring-1 ring-background ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                </div>
              )
            : (
                <span className="text-[13px] text-muted-foreground/50 italic">
                  No session active
                </span>
              )}
        </div>

        {/* Controls */}
        {session && (
          <div className="window-no-drag flex items-center gap-1">
            <div className="flex items-center bg-white/5 rounded-md p-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRestartTerminal}
                    className="h-6 w-6 rounded-sm text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  >
                    <RotateCw className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restart Session</TooltipContent>
              </Tooltip>
              <div className="mx-0.5 h-3 w-px bg-white/10" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onStopTerminal}
                    className="h-6 w-6 rounded-sm text-muted-foreground hover:bg-white/10 hover:text-destructive"
                  >
                    <Square className="h-3 w-3 fill-current" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Kill Session</TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Viewport */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#1c1c1e]">
        {!session
          ? (
              <EmptyTerminalState />
            )
          : hasError
            ? (
                <ErrorTerminalState message="Connection to pty host failed" onRetry={onStartTerminal} />
              )
            : !isConnected
                ? (
                    <DisconnectedState onConnect={onStartTerminal} />
                  )
                : (
                    <XTerm ptyId={terminal.ptyId} />
                  )}
      </div>
    </main>
  )
}

function EmptyTerminalState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/5">
        <TerminalIcon className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium">Select a session to start</p>
    </div>
  )
}

function DisconnectedState({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <div className="text-center">
        <h3 className="text-sm font-medium text-foreground">Session Ready</h3>
        <p className="text-xs text-muted-foreground/60">Ready to attach to worktree</p>
      </div>
      <Button onClick={onConnect} className="gap-2">
        <Play className="h-3.5 w-3.5" />
        Start Terminal
      </Button>
    </div>
  )
}

function ErrorTerminalState({ message, onRetry }: { message: string, onRetry: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TerminalIcon className="h-6 w-6" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-destructive">Terminal Error</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>Retry</Button>
    </div>
  )
}
