import { Badge } from '../../components/ui'
import type { Message } from '../../types'

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  if (message.type === 'error') {
    return (
      <div className="rounded-lg border border-[rgba(255,69,58,0.3)] bg-[rgba(255,69,58,0.08)] p-3 text-[13px] leading-relaxed">
        <div className="flex items-center gap-2 text-[13px] font-medium">
          <span className="h-2 w-2 rounded-full bg-[var(--accent-red)]" />
          <span className="text-[var(--text)]">{message.content}</span>
        </div>
        {message.metadata?.filesChanged && (
          <div className="mt-1.5 text-[12px] text-[var(--text-dim)]">
            {message.metadata.filesChanged} file(s) affected
          </div>
        )}
      </div>
    )
  }

  if (message.type === 'user') {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-2)] p-3 text-[13px] leading-relaxed text-[var(--text-secondary)]">
        {message.content}
      </div>
    )
  }

  // Assistant message
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-2)] p-3 text-[13px] leading-relaxed">
      {message.metadata && (
        <div className="flex items-center gap-2 text-[13px] font-medium">
          <span className="h-2 w-2 rounded-full bg-[var(--accent-blue)]" />
          <span className="text-[var(--text-muted)]">
            {message.metadata.toolCalls} tool calls, {message.metadata.messages} messages
          </span>
        </div>
      )}
      <div
        className={`text-[var(--text-secondary)] ${message.metadata ? 'mt-2' : ''}`}
        dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
      />
      {message.metadata?.filesChanged && (
        <Badge variant="accent" className="mt-2.5">
          {message.metadata.filesChanged} file changed
        </Badge>
      )}
    </div>
  )
}

function formatContent(content: string): string {
  // Simple markdown-like formatting
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--text)]">$1</strong>')
    .replace(/`(.*?)`/g, '<code class="rounded bg-white/10 px-1.5 py-0.5 text-[12px]">$1</code>')
    .replace(/\n/g, '<br />')
}
