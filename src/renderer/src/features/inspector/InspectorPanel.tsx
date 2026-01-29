import type { FileChange, TerminalLine } from '../../types'
import { ChangesTab } from './ChangesTab'
import { Terminal } from './Terminal'

interface InspectorPanelProps {
  files: FileChange[]
  terminalLines: TerminalLine[]
  branch?: string
  onFileClick?: (path: string) => void
}

export function InspectorPanel({
  files,
  terminalLines,
  branch,
  onFileClick,
}: InspectorPanelProps) {
  return (
    <aside className="flex w-[340px] shrink-0 flex-col overflow-hidden border-l border-[var(--separator)] bg-[var(--bg-secondary)]">
      <div className="flex-1 overflow-y-auto p-3">
        <ChangesTab files={files} onFileClick={onFileClick} />
      </div>
      <div className="shrink-0 border-t border-[var(--separator)]">
        <Terminal lines={terminalLines} branch={branch} />
      </div>
    </aside>
  )
}
