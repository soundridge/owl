import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Badge } from '../../components/ui'

interface ChatInputProps {
  onSend?: (message: string) => void
  model?: string
  disabled?: boolean
}

export function ChatInput({ onSend, model = 'Sonnet 4.5', disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim() && onSend) {
      onSend(value.trim())
      setValue('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2"
    >
      <div className="flex gap-1.5">
        <Badge>{model}</Badge>
        <Badge className="cursor-pointer transition-colors hover:bg-[var(--panel-3)]">Link issue</Badge>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Ask or drop a repo diff..."
        className="flex-1 rounded-md border-none bg-[var(--panel-3)] px-3 py-2 text-[13px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="grid h-[34px] w-[34px] place-items-center rounded-md bg-[var(--accent-blue)] text-white transition-all hover:bg-[#5eb0ff] disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
          <path d="M5 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </form>
  )
}
