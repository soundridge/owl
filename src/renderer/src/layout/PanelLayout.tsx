import type { ReactNode } from 'react'

interface PanelLayoutProps {
  sidebar: ReactNode
  main: ReactNode
  inspector: ReactNode
  sidebarCollapsed?: boolean
}

export function PanelLayout({
  sidebar,
  main,
  inspector,
  sidebarCollapsed = false,
}: PanelLayoutProps) {
  return (
    <div className="flex h-full w-full">
      {/* Sidebar - fixed 220px */}
      {!sidebarCollapsed && (
        <div className="h-full w-[220px] shrink-0">{sidebar}</div>
      )}

      {/* Main (Terminal) - flexible */}
      <div className="h-full min-w-0 flex-1">{main}</div>

      {/* Inspector - fixed 220px */}
      <div className="h-full w-[220px] shrink-0">{inspector}</div>
    </div>
  )
}
