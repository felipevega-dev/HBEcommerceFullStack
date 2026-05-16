'use client'

import Link from 'next/link'
import { BrandIcon } from '@/components/ui/brand-icon'
import type { AboutContent } from '@/lib/about-content'

interface Props {
  content: AboutContent
}

export function AboutPageClient({ content }: Props) {
  return (
    <main className="bg-[var(--color-background)]">
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:py-20 lg:px-8">
          <div className="flex flex-col justify-center">
            <nav aria-label="breadcrumb" className="mb-8">
              <ol className="flex gap-2 text-sm text-[var(--color-text-muted)]">
                <li>
                  <Link href="/" className="hover:text-[var(--color-text-primary)]">
                    Inicio
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-[var(--color-text-primary)]">
                  {content.heroEyebrow}
                </li>
              </ol>
            </nav>

            <h1
              className="max-w-3xl text-4xl font-medium leading-tight text-[var(--color-text-primary)] sm:text-5xl md:text-6xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {content.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)] sm:text-lg">
              {content.heroText}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={content.primaryCtaHref}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-text-primary)] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black/80"
              >
                {content.primaryCtaLabel}
                <BrandIcon name="chevron-right" className="h-4 w-4" />
              </Link>
              <Link
                href={content.secondaryCtaHref}
                className="inline-flex items-center rounded-lg border border-[var(--color-border)] px-5 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface)]"
              >
                {content.secondaryCtaLabel}
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full border-y border-[var(--color-border)] py-8 md:border-x md:px-8">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                {content.standardsTitle}
              </p>
              <div className="mt-8 space-y-6">
                {content.standards.map((standard) => (
                  <div key={standard} className="flex gap-4">
                    <span className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-accent)]">
                      <BrandIcon name="check" className="h-4 w-4" />
                    </span>
                    <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                      {standard}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 border-y border-[var(--color-border)] md:grid-cols-4">
          {content.stats.map((stat) => (
            <div
              key={stat.label}
              className="border-[var(--color-border)] py-6 pr-4 md:border-r md:last:border-r-0"
            >
              <div className="mb-4 text-[var(--color-accent)]">
                <BrandIcon name={stat.icon} className="h-5 w-5" />
              </div>
              <p
                className="text-3xl font-medium text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <h2
            className="text-3xl font-medium text-[var(--color-text-primary)] sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {content.storyTitle}
          </h2>
          <p className="mt-5 text-sm leading-7 text-[var(--color-text-secondary)]">
            {content.storyText}
          </p>
        </div>

        <div className="space-y-8">
          {content.timeline.map((item) => (
            <article
              key={`${item.year}-${item.title}`}
              className="grid gap-4 border-t border-[var(--color-border)] pt-6 sm:grid-cols-[96px_1fr]"
            >
              <p className="text-sm font-medium text-[var(--color-accent)]">{item.year}</p>
              <div>
                <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                  {item.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <h2
              className="text-3xl font-medium text-[var(--color-text-primary)] sm:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {content.valuesTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
              {content.valuesText}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.values.map((value) => (
              <article
                key={value.title}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-6"
              >
                <BrandIcon name={value.icon} className="h-6 w-6 text-[var(--color-accent)]" />
                <h3 className="mt-5 text-base font-medium text-[var(--color-text-primary)]">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 border-y border-[var(--color-border)] py-12 md:grid-cols-[1fr_0.9fr]">
          <div>
            <h2
              className="text-3xl font-medium text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {content.closingTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">
              {content.closingText}
            </p>
          </div>
          <div className="flex items-center md:justify-end">
            <Link
              href={content.closingCtaHref}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-5 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface)]"
            >
              {content.closingCtaLabel}
              <BrandIcon name="chevron-right" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
