import { useState } from 'react'
import type { TerminalLine } from '../../types'

interface TerminalProps {
  lines: TerminalLine[]
  branch?: string
}

type TerminalTabType = 'terminal' | 'run' | 'logs'

export function Terminal({ lines, branch }: TerminalProps) {
  const [activeTab, setActiveTab] = useState<TerminalTabType>('terminal')

  const tabs: { id: TerminalTabType; label: string }[] = [
    { id: 'run', label: 'Run' },
    { id: 'terminal', label: 'Terminal' },
  ]

  return (
    <div className="flex flex-col overflow-hidden bg-[#1a1a1c]">
      {/* Tab header */}
      <div className="flex h-[36px] shrink-0 items-center justify-between gap-2 border-b border-[var(--separator)] px-2">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-[var(--radius-sm)] px-2 py-1 text-[12px] font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[var(--panel-2)] text-[var(--text)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button className="ml-0.5 rounded-[var(--radius-sm)] px-1.5 py-1 text-[13px] text-[var(--text-dim)] transition-colors hover:bg-[var(--panel-hover)] hover:text-[var(--text-muted)]">
            +
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-[var(--text-dim)]">Run</span>
          <kbd className="rounded-[var(--radius-sm)] bg-[var(--panel-2)] px-1.5 py-0.5 text-[10px] text-[var(--text-dim)]">⌘R</kbd>
        </div>
      </div>

      {/* Terminal content */}
      <div className="flex h-[160px] flex-col gap-0.5 overflow-y-auto bg-[#161618] px-3 py-2 font-mono text-[12px] leading-relaxed text-[var(--text-secondary)]">
        {branch && (
          <div className="flex items-center gap-1">
            <span className="font-medium text-[var(--accent-green)]">{branch}</span>
            <span className="text-[var(--text-dim)]">git:(main)</span>
            <span className="animate-pulse text-[var(--text-muted)]">▋</span>
          </div>
        )}
        {lines.map((line) => (
          <div key={line.id} className={line.type === 'output' ? 'text-[var(--text-dim)]' : ''}>
            {line.type === 'prompt' && (
              <>
                <span className="font-medium text-[var(--accent-green)]">{line.branch || 'main'}</span>
                <span className="text-[var(--text-dim)]"> git:(main)</span>
              </>
            )}
            {line.type === 'command' && <span className="text-[var(--text-secondary)]">$ {line.content}</span>}
            {line.type === 'output' && <span>{line.content}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
