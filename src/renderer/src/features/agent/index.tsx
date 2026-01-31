import { Button } from '@renderer/components/ui/button'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { ipcServices } from '@renderer/lib/ipcClient'
import { agentLogger } from '@renderer/lib/logger'
import { Loader2, MessageSquare, Send, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface AgentChatProps {
  sessionId: string | null
  cwd: string | null
}

export function AgentChat({ sessionId, cwd }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'running'>('idle')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Send message
  const handleSend = async () => {
    if (!input.trim() || !sessionId || !cwd || status === 'running')
      return
    if (!ipcServices) {
      agentLogger.error('IPC services not available')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setStatus('running')

    agentLogger.info(`Sending message to session ${sessionId}`)

    try {
      const result = await ipcServices.agent.send(sessionId, cwd, userMessage.content)
      if (!result.ok) {
        agentLogger.error(`Failed to send message: ${result.error}`)
        setStatus('idle')
      }
    }
    catch (error) {
      agentLogger.error('Failed to send message', error)
      setStatus('idle')
    }
  }

  // Listen for IPC events
  useEffect(() => {
    const handleMessage = (_: unknown, sid: string, text: string) => {
      if (sid !== sessionId)
        return

      agentLogger.info('Received message from agent')
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: text,
      }
      setMessages(prev => [...prev, assistantMessage])
      setStatus('idle')
    }

    const handleStatus = (_: unknown, sid: string, newStatus: string) => {
      if (sid !== sessionId)
        return
      agentLogger.debug(`Status changed: ${newStatus}`)
      setStatus(newStatus as 'idle' | 'running')
    }

    const handleError = (_: unknown, sid: string, error: string) => {
      if (sid !== sessionId)
        return
      agentLogger.error(`Agent error: ${error}`)
      setStatus('idle')
    }

    // Listen for log messages from main process
    const handleLog = (_: unknown, sid: string, level: string, message: string, data?: unknown) => {
      if (sid !== sessionId)
        return
      const logFn = agentLogger[level as keyof typeof agentLogger] || agentLogger.info
      if (typeof logFn === 'function') {
        logFn(message, data)
      }
    }

    window.electron.ipcRenderer.on('agent:message', handleMessage)
    window.electron.ipcRenderer.on('agent:status', handleStatus)
    window.electron.ipcRenderer.on('agent:error', handleError)
    window.electron.ipcRenderer.on('agent:log', handleLog)

    return () => {
      window.electron.ipcRenderer.removeListener('agent:message', handleMessage)
      window.electron.ipcRenderer.removeListener('agent:status', handleStatus)
      window.electron.ipcRenderer.removeListener('agent:error', handleError)
      window.electron.ipcRenderer.removeListener('agent:log', handleLog)
    }
  }, [sessionId])

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  // Interrupt
  const handleInterrupt = async () => {
    if (sessionId && ipcServices) {
      agentLogger.info('Interrupting agent...')
      await ipcServices.agent.interrupt(sessionId)
    }
  }

  if (!sessionId || !cwd) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground/40">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/5">
          <MessageSquare className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium">Select a session to start chatting</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Message list */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-muted-foreground/40">
              <MessageSquare className="h-8 w-8" />
              <p className="text-sm">Start a conversation with the agent</p>
            </div>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white/5 text-foreground ring-1 ring-white/10'
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>
              </div>
            </div>
          ))}

          {status === 'running' && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-muted-foreground ring-1 ring-white/10">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t border-white/5 p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Cmd+Enter to send)"
            className="flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            rows={2}
            disabled={status === 'running'}
          />

          {status === 'running'
            ? (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleInterrupt}
                  className="h-auto self-end"
                >
                  <Square className="h-4 w-4" />
                </Button>
              )
            : (
                <Button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="h-auto self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
        </div>
      </div>
    </div>
  )
}
