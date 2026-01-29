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
      className="flex items-center gap-2"
    >
      <div className="flex items-center gap-1.5">
        <Badge>{model}</Badge>
        <Badge className="cursor-pointer transition-colors hover:bg-[var(--panel-3)]">Link issue</Badge>
      </div>
      <div className="relative flex flex-1 items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask or drop a repo diff..."
          className="h-[34px] w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] px-3 pr-10 text-[13px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:border-[var(--accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/25"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="absolute right-1.5 grid h-[26px] w-[26px] place-items-center rounded-[var(--radius-sm)] bg-[var(--accent-blue)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-all hover:bg-[#1a91ff] disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
            <path d="M5 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </form>
  )
}
