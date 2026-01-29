import { useState } from 'react'
import { IconButton } from '../../components/ui'
import type { FileChange } from '../../types'
import { FileChangeItem } from './FileChangeItem'

interface ChangesTabProps {
  files: FileChange[]
  onFileClick?: (path: string) => void
}

type TabType = 'changes' | 'all' | 'review'

export function ChangesTab({ files, onFileClick }: ChangesTabProps) {
  const [activeTab, setActiveTab] = useState<TabType>('changes')

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'changes', label: 'Changes', count: files.length },
    { id: 'all', label: 'All files' },
    { id: 'review', label: 'Review' },
  ]

  return (
    <div className="flex flex-col">
      {/* Tab header - macOS segmented control style */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex rounded-[var(--radius-md)] bg-[var(--panel-2)] p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-[var(--radius-sm)] px-2.5 py-1 text-[12px] font-medium transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-[var(--panel-3)] text-[var(--text)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1 text-[var(--text-dim)]">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <IconButton size="sm">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>
          <IconButton size="sm">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
              <path
                d="M3 4h18M3 8h18M3 12h18M3 16h12M3 20h12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>
        </div>
      </div>

      {/* File list */}
      <div className="flex flex-col gap-0.5 overflow-y-auto">
        {files.map((file) => (
          <FileChangeItem key={file.path} file={file} onClick={() => onFileClick?.(file.path)} />
        ))}
      </div>
    </div>
  )
}
