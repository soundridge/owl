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
}

export function ChatPanel({
  workspace,
  messages,
  prNumber,
  onSendMessage,
  onMerge,
}: ChatPanelProps) {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--bg-secondary)]">
      {/* Header with subtle bottom border */}
      <div className="shrink-0 border-b border-[var(--separator)]">
        <ChatHeader workspace={workspace} prNumber={prNumber} onMerge={onMerge} />
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
