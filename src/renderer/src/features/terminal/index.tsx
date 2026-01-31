import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import {
  ChevronRight,
  FolderOpen,
  MessageSquare,
  PanelLeft,
} from 'lucide-react'
import { useSessionStore, useUIStore } from '@renderer/store'
import { AgentChat } from '../agent'

export function AgentPanel() {
  const activeSession = useSessionStore(state => state.getActiveSession())
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

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
                  onClick={toggleSidebar}
                  className="window-no-drag ml-[60px] flex items-center justify-center rounded-sm text-muted-foreground/60 transition-colors hover:text-foreground"
                >
                  <PanelLeft className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Show sidebar</TooltipContent>
            </Tooltip>
          )}

          {/* Breadcrumbs */}
          {activeSession
            ? (
                <div className="flex items-center gap-1.5 text-[13px] font-medium leading-none">
                  <span className="flex items-center gap-1.5 text-muted-foreground/60">
                    <FolderOpen className="h-3.5 w-3.5" />
                    <span>Owlet</span>
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                  <span className="flex items-center gap-1.5 text-foreground">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    <span>{activeSession.name}</span>
                  </span>

                  {/* Status Indicator */}
                  <span className="ml-2 h-1.5 w-1.5 rounded-full ring-1 ring-background bg-emerald-500 animate-pulse" />
                </div>
              )
            : (
                <span className="text-[13px] text-muted-foreground/50 italic">
                  No session active
                </span>
              )}
        </div>
      </div>

      {/* Agent Chat */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#1c1c1e]">
        <AgentChat
          sessionId={activeSession?.id ?? null}
          cwd={activeSession?.worktreePath ?? null}
        />
      </div>
    </main>
  )
}
