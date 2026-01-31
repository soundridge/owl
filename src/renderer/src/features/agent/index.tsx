import {
  Message,
  MessageContent,
  MessageResponse,
} from '@renderer/components/ai-elements/message'
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from '@renderer/components/ai-elements/prompt-input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { ipcServices } from '@renderer/lib/ipcClient'
import { agentLogger } from '@renderer/lib/logger'
import { useSessionStore, useUIStore } from '@renderer/store'
import {
  ChevronRight,
  FolderOpen,
  Loader2,
  MessageSquare,
  PanelLeft,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// ============================================================================
// Types
// ============================================================================

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

// ============================================================================
// AgentChat Component
// ============================================================================

interface AgentChatProps {
  sessionId: string | null
  cwd: string | null
}

function AgentChat({ sessionId, cwd }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>('ready')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Send message
  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text.trim() || !sessionId || !cwd || status !== 'ready')
      return
    if (!ipcServices) {
      agentLogger.error('IPC services not available')
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.text.trim(),
    }

    setMessages(prev => [...prev, userMessage])
    setStatus('submitted')

    agentLogger.info(`Sending message to session ${sessionId}`)

    try {
      const result = await ipcServices.agent.send(sessionId, cwd, userMessage.content)
      if (!result.ok) {
        agentLogger.error(`Failed to send message: ${result.error}`)
        setStatus('error')
      }
    }
    catch (error) {
      agentLogger.error('Failed to send message', error)
      setStatus('error')
    }
  }

  // Listen for IPC events
  useEffect(() => {
    const handleMessage = (_: unknown, sid: string, text: string) => {
      if (sid !== sessionId)
        return

      agentLogger.info('Received message from agent')
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: text,
      }
      setMessages(prev => [...prev, assistantMessage])
      setStatus('ready')
    }

    const handleStatus = (_: unknown, sid: string, newStatus: string) => {
      if (sid !== sessionId)
        return
      agentLogger.debug(`Status changed: ${newStatus}`)
      if (newStatus === 'running') {
        setStatus('streaming')
      }
      else if (newStatus === 'idle') {
        setStatus('ready')
      }
    }

    const handleError = (_: unknown, sid: string, error: string) => {
      if (sid !== sessionId)
        return
      agentLogger.error(`Agent error: ${error}`)
      setStatus('error')
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

  const isGenerating = status === 'submitted' || status === 'streaming'

  return (
    <div className="flex h-full flex-col">
      {/* Message list - scrollable, takes remaining space */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 p-4 pb-8">
          {messages.length === 0 && (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground/40">
              <MessageSquare className="h-8 w-8" />
              <p className="text-sm">Start a conversation with the agent</p>
            </div>
          )}

          {messages.map(msg => (
            <Message key={msg.id} from={msg.role}>
              <MessageContent>
                {msg.role === 'assistant'
                  ? (
                      <MessageResponse>{msg.content}</MessageResponse>
                    )
                  : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )}
              </MessageContent>
            </Message>
          ))}

          {isGenerating && (
            <Message from="assistant">
              <MessageContent>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </MessageContent>
            </Message>
          )}

          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input area - fixed at bottom */}
      <div className="mx-auto w-full max-w-3xl shrink-0 px-4 pb-4">
        <PromptInput
          onSubmit={handleSubmit}
          className="border-white/10 bg-white/5 transition-colors focus-within:border-white/20 focus-within:bg-white/[0.07] [&:has([data-slot=input-group-control]:focus-visible)]:ring-0"
        >
          <PromptInputTextarea
            placeholder="Type your message..."
            disabled={isGenerating}
            className="placeholder:text-muted-foreground/50"
          />
          <PromptInputFooter>
            <span className="text-xs text-muted-foreground/70">
              Enter to send
            </span>
            <PromptInputSubmit
              status={status}
              onStop={handleInterrupt}
              disabled={isGenerating && status !== 'streaming'}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}

// ============================================================================
// AgentPanel Component (Main Export)
// ============================================================================

export function AgentPanel() {
  const activeSession = useSessionStore(state => state.getActiveSession())
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <main className="flex h-full flex-col overflow-hidden bg-[#1e1e1e] text-foreground">
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
      <div className="min-h-0 flex-1 overflow-hidden bg-[#1c1c1e]">
        <AgentChat
          sessionId={activeSession?.id ?? null}
          cwd={activeSession?.worktreePath ?? null}
        />
      </div>
    </main>
  )
}
