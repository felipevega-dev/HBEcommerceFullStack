type SectionProps = {
  children: React.ReactNode
  className?: string
  spacing?: 'sm' | 'md' | 'lg'
  id?: string
}

const spacingClasses = {
  sm: 'py-[var(--spacing-section-sm)]',
  md: 'py-12 md:py-16',
  lg: 'py-[var(--spacing-section)]',
}

export function Section({ children, className = '', spacing = 'md', id }: SectionProps) {
  return (
    <section id={id} className={[spacingClasses[spacing], className].filter(Boolean).join(' ')}>
      {children}
    </section>
  )
}
