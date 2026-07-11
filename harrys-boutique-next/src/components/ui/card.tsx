type CardProps = {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={[
        'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]',
        'shadow-[var(--shadow-sm)]',
        paddingClasses[padding],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
