import Link from 'next/link'
import type { ReactNode } from 'react'

export function EditorialArrow({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 20 20" fill="none">
      <path
        d="M3 10h13M11 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SectionTitle({
  eyebrow,
  title,
  link,
  href,
  headingId,
}: {
  eyebrow: string
  title: string
  link?: string
  href?: string
  headingId?: string
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="ui-eyebrow">{eyebrow}</p>
        <h2 id={headingId} className="ui-display mt-3 text-4xl leading-none sm:text-5xl">
          {title}
        </h2>
      </div>
      {link && href && (
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-gold-dark)]"
        >
          {link} <EditorialArrow />
        </Link>
      )}
    </div>
  )
}

export function EditorialPanel({
  children,
  className = '',
  tone = 'peach',
}: {
  children: ReactNode
  className?: string
  tone?: 'peach' | 'cream' | 'soft'
}) {
  const toneClass =
    tone === 'cream' ? 'ui-editorial-panel-cream' : tone === 'soft' ? 'ui-editorial-panel-soft' : ''

  return (
    <section className={`ui-editorial-panel ${toneClass} ${className}`.trim()}>
      <div className="relative">{children}</div>
    </section>
  )
}
