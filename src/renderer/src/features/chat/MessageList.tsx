import { useEffect, useRef } from 'react'
import type { Message } from '../../types'
import { MessageItem } from './MessageItem'

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto pr-1"
    >
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  )
}
