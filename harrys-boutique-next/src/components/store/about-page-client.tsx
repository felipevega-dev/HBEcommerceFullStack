'use client'

import Link from 'next/link'
import { BrandIcon, type BrandIconName } from '@/components/ui/brand-icon'

interface Stat {
  value: string
  label: string
  icon: BrandIconName
}

interface Value {
  title: string
  description: string
  icon: BrandIconName
}

interface Props {
  stats: Stat[]
  values: Value[]
}

const timeline = [
  {
    year: '2020',
    title: 'Origen familiar',
    text: "Harry's Boutique nace desde una necesidad simple: encontrar prendas cómodas, durables y con identidad para mascotas de la familia.",
  },
  {
    year: '2022',
    title: 'Selección y oficio',
    text: 'Consolidamos proveedores, materiales y procesos para elevar la calidad sin perder cercanía con cada cliente.',
  },
  {
    year: 'Hoy',
    title: 'Diseño con criterio',
    text: 'Creamos colecciones pensadas para el uso diario: buenos calces, telas nobles y detalles que hacen reconocible cada pieza.',
  },
]

const standards = [
  'Materiales elegidos por resistencia, tacto y facilidad de cuidado.',
  'Calces revisados para acompañar movimiento y comodidad.',
  'Atención cercana antes y después de cada compra.',
]

export function AboutPageClient({ stats, values }: Props) {
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
                  Nosotros
                </li>
              </ol>
            </nav>

            <h1
              className="max-w-3xl text-4xl font-medium leading-tight text-[var(--color-text-primary)] sm:text-5xl md:text-6xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Una boutique para mascotas con criterio, calidad y cercanía.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)] sm:text-lg">
              Harry's Boutique es una tienda familiar enfocada en prendas y accesorios que se
              sienten bien, duran en el tiempo y tienen una identidad clara. Diseñamos para que
              cada mascota este comoda, y para que cada familia compre con confianza.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/collection"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-text-primary)] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black/80"
              >
                Ver colección
                <BrandIcon name="chevron-right" className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-lg border border-[var(--color-border)] px-5 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface)]"
              >
                Contacto
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full border-y border-[var(--color-border)] py-8 md:border-x md:px-8">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Nuestro enfoque
              </p>
              <div className="mt-8 space-y-6">
                {standards.map((standard) => (
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
          {stats.map((stat) => (
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
            De una necesidad familiar a una marca con identidad.
          </h2>
          <p className="mt-5 text-sm leading-7 text-[var(--color-text-secondary)]">
                Nuestro crecimiento ha sido intencional: menos ruido, mejores productos y una
                experiencia más clara para quienes buscan vestir o equipar a sus mascotas con buen
            gusto.
          </p>
        </div>

        <div className="space-y-8">
          {timeline.map((item) => (
            <article
              key={item.year}
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
              Principios que guían cada colección
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
              Estos criterios nos ayudan a mantener una propuesta consistente, útil y reconocible.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
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
              Nuestro compromiso es que comprar se sienta simple.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">
              Desde la elección de talla hasta el seguimiento del pedido, buscamos que cada paso
              sea claro. Si tienes dudas, te acompañamos con información concreta y atención
              directa.
            </p>
          </div>
          <div className="flex items-center md:justify-end">
            <Link
              href="/envios"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-5 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface)]"
            >
              Ver información de envíos
              <BrandIcon name="chevron-right" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
