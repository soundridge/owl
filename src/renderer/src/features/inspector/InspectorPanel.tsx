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
    <aside className="flex w-[360px] flex-col gap-3 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3">
      <ChangesTab files={files} onFileClick={onFileClick} />
      <Terminal lines={terminalLines} branch={branch} />
    </aside>
  )
}
