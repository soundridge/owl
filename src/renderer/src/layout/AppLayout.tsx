import type { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {children}
    </div>
  )
}
