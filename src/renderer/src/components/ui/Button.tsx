import { type ButtonHTMLAttributes, type ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]/40 focus-visible:ring-offset-0 disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'rounded-[var(--radius-md)] bg-[var(--accent-blue)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-[#1a91ff] active:bg-[#0077e6]',
    secondary:
      'rounded-[var(--radius-md)] bg-[var(--panel-2)] text-[var(--text-secondary)] hover:bg-[var(--panel-3)] active:bg-[var(--panel-hover)]',
    ghost:
      'rounded-[var(--radius-md)] bg-transparent text-[var(--text-muted)] hover:bg-[var(--panel-hover)] hover:text-[var(--text-secondary)]',
    success:
      'rounded-[var(--radius-md)] bg-[var(--accent-green)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-[#3de066] active:bg-[#28b94c]',
    outline:
      'rounded-[var(--radius-md)] border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--panel-hover)]',
  }

  const sizes = {
    sm: 'h-[26px] px-2.5 text-[12px]',
    md: 'h-[28px] px-3 text-[13px]',
    lg: 'h-[32px] px-4 text-[13px]',
  }

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
