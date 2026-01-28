import { type ReactNode } from 'react'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent'
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-[var(--panel-3)] text-[var(--text-secondary)]',
    success: 'bg-[rgba(52,199,89,0.15)] text-[var(--accent-green)]',
    warning: 'bg-[rgba(255,159,10,0.15)] text-[var(--accent-orange)]',
    danger: 'bg-[rgba(255,69,58,0.15)] text-[var(--accent-red)]',
    accent: 'bg-[rgba(77,163,255,0.15)] text-[var(--accent-blue)]',
  }

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
