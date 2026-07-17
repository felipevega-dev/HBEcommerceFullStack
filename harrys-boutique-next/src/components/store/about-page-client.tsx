'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BrandIcon } from '@/components/ui/brand-icon'
import type { AboutContent } from '@/lib/about-content'

export function AboutPageClient({ content }: { content: AboutContent }) {
  const timeline = content.timeline.slice(0, 3)
  const values = content.values.slice(0, 4)

  return (
    <main>
      <section className="ui-container pb-10 pt-5 sm:pb-16 sm:pt-8 lg:pb-20 lg:pt-10">
        <nav aria-label="breadcrumb" className="mb-8 text-sm text-[var(--color-text-muted)]">
          <Link href="/" className="hover:text-[var(--color-text-primary)]">
            Inicio
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span className="text-[var(--color-text-primary)]">{content.heroEyebrow}</span>
        </nav>

        <div className="grid overflow-hidden rounded-[1.5rem] border border-[#deded9] bg-white lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16 lg:py-16">
            <p className="ui-eyebrow">{content.heroEyebrow}</p>
            <h1
              className="mt-5 max-w-xl text-5xl leading-[0.95] text-[var(--color-text-primary)] sm:text-6xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {content.heroTitle}
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-[var(--color-text-secondary)]">
              {content.heroText}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={content.primaryCtaHref} className="ui-button ui-button-primary">
                {content.primaryCtaLabel}
                <BrandIcon name="chevron-right" className="h-4 w-4" />
              </Link>
              <Link href={content.secondaryCtaHref} className="ui-button ui-button-secondary">
                {content.secondaryCtaLabel}
              </Link>
            </div>
          </div>
          <div className="relative min-h-[380px] lg:min-h-[560px]">
            <Image
              src="/nosotrosfull.png"
              alt="Familia y mascotas de Harry's Boutique"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="ui-container pb-16 sm:pb-24">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="ui-eyebrow">Nuestra forma de hacer</p>
            <h2
              className="mt-4 text-4xl leading-none text-[var(--color-text-primary)] sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {content.storyTitle}
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-[1fr_0.8fr] sm:items-center">
            <p className="text-base leading-8 text-[var(--color-text-secondary)]">
              {content.storyText}
            </p>
            <div className="relative aspect-square translate-y-0 overflow-hidden rounded-[1.5rem] sm:translate-y-8">
              <Image
                src="/nancyharry.png"
                alt="Harry's Boutique y sus mascotas"
                fill
                sizes="(max-width: 640px) 100vw, 35vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#deded9] bg-white">
        <div className="ui-container grid gap-12 py-16 sm:py-20 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="ui-eyebrow">El oficio detrás de cada pieza</p>
            <h2
              className="mt-4 text-4xl leading-none text-[var(--color-text-primary)] sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Menos ruido. Más intención.
            </h2>
            <p className="mt-6 text-base leading-8 text-[var(--color-text-secondary)]">
              Elegimos prendas y accesorios pensando en el movimiento, el tacto y la vida real de
              cada mascota.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((value) => (
              <article key={value.title} className="ui-card bg-[#f4f4f1] p-6">
                <BrandIcon name={value.icon} className="h-6 w-6 text-[var(--color-accent)]" />
                <h3 className="mt-5 text-lg font-medium text-[var(--color-text-primary)]">
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

      <section className="ui-container py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.55fr_1.45fr] lg:gap-20">
          <div>
            <p className="ui-eyebrow">Una historia en movimiento</p>
            <h2
              className="mt-4 text-4xl leading-none text-[var(--color-text-primary)] sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {content.valuesTitle}
            </h2>
          </div>
          <div className="space-y-8">
            {timeline.map((item) => (
              <article
                key={`${item.year}-${item.title}`}
                className="grid gap-3 border-t border-[var(--color-border)] pt-5 sm:grid-cols-[100px_1fr]"
              >
                <p className="text-sm font-semibold text-[var(--color-accent-strong)]">
                  {item.year}
                </p>
                <div>
                  <h3 className="text-xl text-[var(--color-text-primary)]">{item.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">
                    {item.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ui-container pb-16 sm:pb-24">
        <div className="relative min-h-[260px] overflow-hidden rounded-[2rem]">
          <Image
            src="/nosotros.JPG"
            alt="Detalles de Harry's Boutique"
            fill
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#2f2823]/45" />
          <div className="relative z-10 flex min-h-[260px] items-center justify-between gap-6 px-7 py-10 sm:px-12">
            <div className="max-w-xl text-white">
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#f4d18b]">
                HARRY&apos;S BOUTIQUE
              </p>
              <h2
                className="mt-4 text-4xl leading-none sm:text-5xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {content.closingTitle}
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/80">{content.closingText}</p>
            </div>
            <Link href={content.closingCtaHref} className="ui-button ui-button-secondary shrink-0">
              {content.closingCtaLabel}
              <BrandIcon name="chevron-right" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
