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
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)] disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'rounded-md bg-[var(--accent-blue)] text-white hover:bg-[#5eb0ff] active:bg-[#3d95ff]',
    secondary:
      'rounded-md border border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:bg-[var(--panel-hover)] hover:text-[var(--text-secondary)]',
    ghost:
      'rounded-md border border-dashed border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--panel-hover)] hover:text-[var(--text-secondary)]',
    success:
      'rounded-md bg-[var(--accent-green)] text-white hover:bg-[#40d165] active:bg-[#2eb84d]',
    outline:
      'rounded-md border border-[var(--accent-blue)] bg-[rgba(77,163,255,0.1)] text-[var(--text)] hover:bg-[rgba(77,163,255,0.15)]',
  }

  const sizes = {
    sm: 'px-2.5 py-1.5 text-[12px]',
    md: 'px-3 py-1.5 text-[13px]',
    lg: 'px-3.5 py-2 text-[13px]',
  }

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
