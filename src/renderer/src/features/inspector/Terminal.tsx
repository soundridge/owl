import { useState } from 'react'
import { Button } from '../../components/ui'
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
    <div className="mt-auto overflow-hidden rounded-lg border border-[var(--border)] bg-[#0a0a0a]">
      {/* Tab header */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-2.5 py-2">
        <div className="flex gap-1.5">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'outline' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="border-transparent"
            >
              {tab.label}
            </Button>
          ))}
          <button className="rounded-md px-1.5 py-1 text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]">
            +
          </button>
        </div>
        <div className="flex items-center gap-2 text-[12px]">
          <span className="text-[var(--text-muted)]">Run</span>
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-[var(--text-dim)]">⌘R</kbd>
        </div>
      </div>

      {/* Terminal content */}
      <div className="flex h-[180px] flex-col gap-1 overflow-y-auto px-3 py-2.5 font-mono text-[12px] text-[var(--text-secondary)]">
        {branch && (
          <div className="flex items-center gap-1">
            <span className="font-semibold text-[var(--accent-green)]">{branch}</span>
            <span className="text-[var(--text-dim)]">git:(main)</span>
            <span className="animate-pulse text-[var(--text-muted)]">▋</span>
          </div>
        )}
        {lines.map((line) => (
          <div key={line.id} className={line.type === 'output' ? 'text-[var(--text-dim)]' : ''}>
            {line.type === 'prompt' && (
              <>
                <span className="font-semibold text-[var(--accent-green)]">{line.branch || 'main'}</span>
                <span className="text-[var(--text-dim)]"> git:(main)</span>
              </>
            )}
            {line.type === 'command' && <span>$ {line.content}</span>}
            {line.type === 'output' && <span>{line.content}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
