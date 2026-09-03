import Link from 'next/link'
import { EditorialPanel, SectionTitle } from './editorial'
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
    <EditorialPanel className="px-7 py-11 sm:px-11 sm:py-14 lg:px-16" tone="soft">
      <div className="relative max-w-3xl">
        <p className="ui-eyebrow">{eyebrow}</p>
        <h1 className="ui-display mt-5 text-5xl leading-[0.95] sm:text-6xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)]">
          {description}
        </p>
      </div>
    </EditorialPanel>
  )
}

export function PurchaseChannelGuide({ channels }: { channels: PurchaseChannelHelpContent[] }) {
  return (
    <section aria-labelledby="purchase-channel-heading" className="mt-9">
      <SectionTitle
        headingId="purchase-channel-heading"
        eyebrow="Dos caminos, una experiencia clara"
        title="Revisa el canal indicado en cada producto"
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {channels.map((item) => {
          const isMercadoLibre = item.channel === 'mercadolibre'
          return (
            <article
              key={item.channel}
              className={`relative overflow-hidden rounded-[1.25rem] border bg-[var(--color-surface)] p-6 sm:p-8 ${
                isMercadoLibre
                  ? 'border-[var(--color-ml-border)] shadow-[inset_3px_0_0_var(--color-gold)]'
                  : 'border-[var(--color-stitch-line)]'
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
                    isMercadoLibre
                      ? 'bg-[var(--color-ml-bg)] text-[var(--color-ml-text)]'
                      : 'bg-[var(--color-panel-soft)] text-[var(--color-ink)]'
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
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ml-text)] hover:underline"
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
    <EditorialPanel className="mt-12 p-7 text-center sm:p-9" tone="cream">
      <div className="relative">
        <h2 className="ui-display text-3xl">{title}</h2>
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
      </div>
    </EditorialPanel>
  )
}
