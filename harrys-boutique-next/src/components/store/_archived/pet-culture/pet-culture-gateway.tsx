import Image from 'next/image'
import Link from 'next/link'
import { BrandIcon } from '@/components/ui/brand-icon'
import { EXPERIENCE_CARDS, OCCASION_SHOPS } from '@/lib/pet-experience'

export function PetCultureGateway() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
      <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative min-h-[360px] bg-[#1d1a18] p-8 text-white sm:p-10">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/harrys_logo.png"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-contain p-16"
            />
          </div>
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="max-w-xl space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                <BrandIcon name="sparkles" className="h-4 w-4" />
                Harry's World
              </span>
              <div className="space-y-4">
                <h2
                  className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  La tienda ahora tambien se compra por personalidad, ocasion y comunidad.
                </h2>
                <p className="max-w-lg text-sm leading-6 text-white/78 sm:text-base">
                  Prueba el quiz de estilo, prepara un cumpleanos, entra a los drops y convierte
                  cada compra en una historia compartible.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/experiencias#quiz"
                className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#1d1a18] transition hover:bg-[var(--color-gold-light)]"
              >
                Encontrar estilo
              </Link>
              <Link
                href="/experiencias"
                className="rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Ver experiencias
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          {EXPERIENCE_CARDS.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-md)]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-dark)]">
                  {item.eyebrow}
                </span>
                <span className="rounded-full bg-white p-2 text-[var(--color-primary)] shadow-[var(--shadow-sm)]">
                  <BrandIcon name={item.icon} className="h-4 w-4" />
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 sm:px-6">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {OCCASION_SHOPS.slice(0, 4).map((occasion) => (
            <Link
              key={occasion.title}
              href={occasion.href}
              className="inline-flex min-w-max items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-primary)]"
            >
              <BrandIcon name={occasion.icon} className="h-4 w-4" />
              {occasion.title}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
