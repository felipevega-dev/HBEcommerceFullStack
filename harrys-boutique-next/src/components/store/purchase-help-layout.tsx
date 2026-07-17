import Link from 'next/link'
import { BrandIcon } from '@/components/ui/brand-icon'
import {
  MERCADO_LIBRE_HELP_URL,
  type PurchaseChannelHelpContent,
} from '@/lib/purchase-channel-content'

export function PurchaseHelpHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <section className="relative overflow-hidden rounded-[1.5rem] border border-[#deded9] bg-[linear-gradient(135deg,#ffffff_0%,#f1f1ee_100%)] px-7 py-11 shadow-[0_16px_40px_rgba(20,20,20,0.05)] sm:px-11 sm:py-14 lg:px-16">
      <div className="pointer-events-none absolute inset-3 rounded-[1.1rem] border border-dashed border-[#d5d5cf]" />
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-[#d6d6d0]" />
      <div className="relative max-w-3xl">
        <p className="ui-eyebrow">{eyebrow}</p>
        <h1
          className="mt-5 text-5xl leading-[0.95] text-[var(--color-text-primary)] sm:text-6xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)]">
          {description}
        </p>
      </div>
    </section>
  )
}

export function PurchaseChannelGuide({ channels }: { channels: PurchaseChannelHelpContent[] }) {
  return (
    <section aria-labelledby="purchase-channel-heading" className="mt-9">
      <div className="mb-5">
        <p className="ui-eyebrow">Dos caminos, una experiencia clara</p>
        <h2
          id="purchase-channel-heading"
          className="mt-3 text-3xl text-[var(--color-text-primary)] sm:text-4xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Revisa el canal indicado en cada producto
        </h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {channels.map((item) => {
          const isMercadoLibre = item.channel === 'mercadolibre'
          return (
            <article
              key={item.channel}
              className={`relative overflow-hidden rounded-[1.25rem] border bg-white p-6 sm:p-8 ${
                isMercadoLibre
                  ? 'border-[#ded9ca] shadow-[inset_3px_0_0_#d7a51f]'
                  : 'border-[#deded9]'
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
                    isMercadoLibre ? 'bg-[#ffe7a7] text-[#76520d]' : 'bg-[#efefec] text-[#3d3d39]'
                  }`}
                >
                  <BrandIcon
                    name={isMercadoLibre ? 'shopping-bag' : 'sparkles'}
                    className="h-5 w-5"
                  />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                    {item.eyebrow}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-[var(--color-text-primary)]">
                    {item.title}
                  </h3>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-[var(--color-text-secondary)]">
                {item.description}
              </p>
              <ul className="mt-5 space-y-3 text-sm text-[var(--color-text-secondary)]">
                {item.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <BrandIcon
                      name="check-circle"
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent-strong)]"
                    />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              {isMercadoLibre && (
                <a
                  href={MERCADO_LIBRE_HELP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#76520d] hover:underline"
                >
                  Ir a la ayuda de Mercado Libre
                  <BrandIcon name="external-link" className="h-4 w-4" />
                </a>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function PurchaseHelpCta({
  title = '¿Todavía tienes dudas?',
  description = 'Cuéntanos qué producto estás mirando y te ayudaremos a identificar el canal y la talla adecuada.',
}: {
  title?: string
  description?: string
}) {
  return (
    <section className="mt-12 rounded-[1.25rem] border border-[#deded9] bg-white p-7 text-center sm:p-9">
      <h2
        className="text-3xl text-[var(--color-text-primary)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)]">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/contact" className="ui-button ui-button-primary">
          Contactar a Harry&apos;s
        </Link>
        <Link href="/tienda" className="ui-button ui-button-secondary">
          Explorar la tienda
        </Link>
      </div>
    </section>
  )
}
