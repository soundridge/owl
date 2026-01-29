import { Badge } from '../../components/ui'
import type { Message } from '../../types'

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  if (message.type === 'error') {
    return (
      <div className="rounded-[var(--radius-lg)] bg-[rgba(255,69,58,0.1)] p-3 text-[13px] leading-relaxed">
        <div className="flex items-start gap-2">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent-red)]" />
          <div className="flex-1">
            <span className="font-medium text-[var(--text)]">{message.content}</span>
            {message.metadata?.filesChanged && (
              <div className="mt-1 text-[12px] text-[var(--text-dim)]">
                {message.metadata.filesChanged} file(s) affected
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (message.type === 'user') {
    return (
      <div className="ml-auto max-w-[85%] rounded-[var(--radius-lg)] bg-[var(--accent-blue)] px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
        {message.content}
      </div>
    )
  }

  // Assistant message
  return (
    <div className="max-w-[85%] rounded-[var(--radius-lg)] bg-[var(--panel-2)] px-3.5 py-2.5 text-[13px] leading-relaxed">
      {message.metadata && (
        <div className="mb-2 flex items-center gap-2 text-[12px]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-blue)]" />
          <span className="text-[var(--text-muted)]">
            {message.metadata.toolCalls} tool calls · {message.metadata.messages} messages
          </span>
        </div>
      )}
      <div
        className="text-[var(--text-secondary)]"
        dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
      />
      {message.metadata?.filesChanged && (
        <Badge variant="accent" className="mt-2">
          {message.metadata.filesChanged} file changed
        </Badge>
      )}
    </div>
  )
}

function formatContent(content: string): string {
  // Simple markdown-like formatting
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[var(--text)]">$1</strong>')
    .replace(/`(.*?)`/g, '<code class="rounded-[var(--radius-sm)] bg-[var(--panel-3)] px-1 py-0.5 text-[12px] font-mono">$1</code>')
    .replace(/\n/g, '<br />')
}
