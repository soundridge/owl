import { useState } from 'react'
import { Button, IconButton } from '../../components/ui'
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
    <div className="flex flex-col gap-3">
      {/* Tab header */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
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
              {tab.count !== undefined && ` ${tab.count}`}
            </Button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <IconButton size="sm">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[16px] w-[16px]">
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>
          <IconButton size="sm">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[16px] w-[16px]">
              <path
                d="M3 4h18M3 8h18M3 12h18M3 16h12M3 20h12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>
        </div>
      </div>

      {/* File list */}
      <div className="flex flex-col gap-1 overflow-y-auto">
        {files.map((file) => (
          <FileChangeItem key={file.path} file={file} onClick={() => onFileClick?.(file.path)} />
        ))}
      </div>
    </div>
  )
}
