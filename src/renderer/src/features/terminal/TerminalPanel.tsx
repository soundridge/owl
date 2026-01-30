import { Play, Square, RefreshCw, Terminal as TerminalIcon, FolderOpen } from 'lucide-react'
import { Button, IconButton, EmptyState, ErrorState } from '../../components/ui'
import type { Session, TerminalState } from '../../types'

interface TerminalPanelProps {
  session: Session | null
  terminal: TerminalState
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
  onStartTerminal?: () => void
  onStopTerminal?: () => void
  onRestartTerminal?: () => void
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
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--bg-secondary)]">
      {/* Header with session info and controls */}
      <div className="shrink-0 border-b border-[var(--separator)]">
        <div className="flex items-center">
          {/* Sidebar toggle when collapsed */}
          {sidebarCollapsed && (
            <div
              className="flex h-[52px] items-center border-r border-[var(--separator)] pl-[78px] pr-2"
              style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
            >
              <button
                onClick={onToggleSidebar}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-tertiary)] transition-all hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)]"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                title="Show sidebar"
              >
                <TerminalIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Session header */}
          <div className="flex flex-1 items-center justify-between px-4 py-3">
            <div className="flex flex-col gap-0.5">
              {session ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-[var(--text)]">
                      {session.name}
                    </span>
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${
                        isConnected
                          ? 'bg-[var(--accent-green)]'
                          : hasError
                            ? 'bg-[var(--accent-red)]'
                            : 'bg-[var(--text-dim)]'
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
                    <FolderOpen className="h-3 w-3" />
                    <span className="truncate max-w-[300px]" title={session.worktreePath}>
                      {session.worktreePath}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-[14px] text-[var(--text-muted)]">No session selected</span>
              )}
            </div>

            {/* Terminal controls */}
            {session && (
              <div className="flex items-center gap-1">
                {!isConnected ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onStartTerminal}
                    className="gap-1.5"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Start Terminal
                  </Button>
                ) : (
                  <>
                    <IconButton size="sm" onClick={onRestartTerminal} title="Restart terminal">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton size="sm" onClick={onStopTerminal} title="Stop terminal">
                      <Square className="h-3.5 w-3.5" />
                    </IconButton>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terminal container area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {!session ? (
          <EmptyState
            icon={<TerminalIcon className="h-8 w-8" />}
            title="No session selected"
            description="Select a session from the sidebar to open its terminal"
            className="flex-1"
          />
        ) : hasError ? (
          <ErrorState
            title="Terminal error"
            message="Failed to connect to terminal. The shell process may have crashed."
            onRetry={onStartTerminal}
            className="flex-1"
          />
        ) : !isConnected ? (
          <EmptyState
            icon={<TerminalIcon className="h-8 w-8" />}
            title="Terminal not started"
            description="Click 'Start Terminal' to begin working in this session"
            action={
              <Button variant="primary" size="sm" onClick={onStartTerminal} className="gap-1.5">
                <Play className="h-3.5 w-3.5" />
                Start Terminal
              </Button>
            }
            className="flex-1"
          />
        ) : (
          <TerminalContainer session={session} />
        )}
      </div>
    </main>
  )
}

// Terminal container placeholder (xterm will be integrated here later)
interface TerminalContainerProps {
  session: Session
}

function TerminalContainer({ session }: TerminalContainerProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#161618]">
      {/* Tab bar */}
      <div className="flex h-[36px] shrink-0 items-center justify-between border-b border-[var(--separator)] bg-[#1a1a1c] px-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--panel-2)] px-2 py-1">
            <TerminalIcon className="h-3 w-3 text-[var(--text-muted)]" />
            <span className="text-[12px] font-medium text-[var(--text)]">Terminal</span>
          </div>
          <button className="rounded-[var(--radius-sm)] px-1.5 py-1 text-[13px] text-[var(--text-dim)] transition-colors hover:bg-[var(--panel-hover)] hover:text-[var(--text-muted)]">
            +
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-[var(--text-dim)]">Run</span>
          <kbd className="rounded-[var(--radius-sm)] bg-[var(--panel-2)] px-1.5 py-0.5 text-[10px] text-[var(--text-dim)]">
            ^R
          </kbd>
        </div>
      </div>

      {/* Terminal content placeholder */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed">
        {/* Simulated terminal prompt */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--accent-green)]">
            {session.branch.replace('session/', '')}
          </span>
          <span className="text-[var(--text-dim)]">
            {session.worktreePath.split('/').slice(-2).join('/')}
          </span>
        </div>
        <div className="flex items-center text-[var(--text-secondary)]">
          <span className="text-[var(--accent-blue)]">$</span>
          <span className="ml-2 animate-pulse text-[var(--text-muted)]">_</span>
        </div>

        {/* Placeholder message */}
        <div className="mt-4 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--panel)]/30 p-4 text-center">
          <p className="text-[12px] text-[var(--text-muted)]">
            xterm.js terminal will be rendered here
          </p>
          <p className="mt-1 text-[11px] text-[var(--text-dim)]">
            This is a placeholder for the terminal UI skeleton
          </p>
        </div>
      </div>
    </div>
  )
}
