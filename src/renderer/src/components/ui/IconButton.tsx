import { type ButtonHTMLAttributes, type ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md'
  children: ReactNode
}

export function IconButton({ size = 'md', className = '', children, ...props }: IconButtonProps) {
  const sizes = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
  }

  return (
    <button
      className={`grid place-items-center rounded-md border border-[var(--border)] bg-transparent text-[var(--text-muted)] transition-colors hover:bg-[var(--panel-hover)] hover:text-[var(--text-secondary)] ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
