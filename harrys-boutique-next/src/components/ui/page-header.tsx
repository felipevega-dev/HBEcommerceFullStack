import Link from 'next/link'

type Breadcrumb = {
  label: string
  href?: string
}

type PageHeaderProps = {
  title: string
  description?: string
  breadcrumbs?: Breadcrumb[]
}

export function PageHeader({ title, description, breadcrumbs }: PageHeaderProps) {
  return (
    <header className="mb-8 space-y-3">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-text-muted)]">
          <ol className="flex flex-wrap items-center gap-2">
            {breadcrumbs.map((item, index) => (
              <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden>/</span>}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-[var(--color-text-primary)]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-[var(--color-text-secondary)]">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="space-y-2">
        <h1
          className="text-3xl font-medium tracking-tight text-[var(--color-text-primary)] md:text-4xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-base text-[var(--color-text-secondary)]">{description}</p>
        )}
      </div>
    </header>
  )
}
