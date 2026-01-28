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
    <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3">
      <ChatHeader workspace={workspace} prNumber={prNumber} onMerge={onMerge} />

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <MessageList messages={messages} />
      </div>

      <ChatInput onSend={onSendMessage} />
    </main>
  )
}
