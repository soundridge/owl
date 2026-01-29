import { PanelLeft } from 'lucide-react'
import type { Message, Workspace } from '../../types'
import { ChatHeader } from './ChatHeader'
import { ChatInput } from './ChatInput'
import { MessageList } from './MessageList'

interface ChatPanelProps {
  workspace?: Workspace
  messages: Message[]
  prNumber?: string
  onSendMessage?: (message: string) => void
  onMerge?: () => void
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

export function ChatPanel({
  workspace,
  messages,
  prNumber,
  onSendMessage,
  onMerge,
  sidebarCollapsed,
  onToggleSidebar,
}: ChatPanelProps) {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--bg-secondary)]">
      {/* Header with subtle bottom border */}
      <div className="shrink-0 border-b border-[var(--separator)]">
        <div className="flex items-center">
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
                <PanelLeft className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex-1">
            <ChatHeader workspace={workspace} prNumber={prNumber} onMerge={onMerge} />
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <MessageList messages={messages} />
      </div>

      {/* Input area with subtle top border */}
      <div className="shrink-0 border-t border-[var(--separator)] bg-[var(--panel-solid)] p-3">
        <ChatInput onSend={onSendMessage} />
      </div>
    </main>
  )
}
