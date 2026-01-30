import type { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1c1c1e] text-[rgba(255,255,255,0.88)]">
      {children}
    </div>
  )
}
