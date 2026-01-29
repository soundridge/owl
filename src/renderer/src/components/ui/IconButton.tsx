import { type ButtonHTMLAttributes, type ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md'
  children: ReactNode
}

export function IconButton({ size = 'md', className = '', children, ...props }: IconButtonProps) {
  const sizes = {
    sm: 'h-[26px] w-[26px]',
    md: 'h-[28px] w-[28px]',
  }

  return (
    <button
      className={`grid place-items-center rounded-[var(--radius-md)] bg-[var(--panel-2)] text-[var(--text-muted)] transition-all duration-150 hover:bg-[var(--panel-3)] hover:text-[var(--text-secondary)] active:bg-[var(--panel-hover)] ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
