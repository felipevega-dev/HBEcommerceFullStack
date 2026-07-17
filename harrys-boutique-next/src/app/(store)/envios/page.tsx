import type { Metadata } from 'next'
import Link from 'next/link'
import {
  PurchaseChannelGuide,
  PurchaseHelpCta,
  PurchaseHelpHero,
} from '@/components/store/purchase-help-layout'
import { BrandIcon } from '@/components/ui/brand-icon'
import { getPricingSettings } from '@/lib/commerce-settings'
import {
  formatClp,
  getDirectShippingSummary,
  getPurchaseChannelHelp,
} from '@/lib/purchase-channel-content'

export const metadata: Metadata = {
  title: "Envíos y seguimiento — Harry's Boutique",
  description:
    'Revisa cómo se gestionan los despachos de Mercado Libre y las compras directas de Harry’s Boutique.',
}

export const dynamic = 'force-dynamic'

const directEstimates = [
  { zone: 'Región Metropolitana', estimate: '2 a 4 días hábiles' },
  { zone: 'Valparaíso y O’Higgins', estimate: '3 a 6 días hábiles' },
  { zone: 'Norte y sur de Chile', estimate: '5 a 10 días hábiles' },
  { zone: 'Zonas extremas', estimate: '7 a 15 días hábiles' },
]

export default async function ShippingPage() {
  const pricing = await getPricingSettings()
  const channels = getPurchaseChannelHelp(pricing)

  return (
    <main className="ui-container py-10 sm:py-16">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex gap-2 text-sm text-[var(--color-text-muted)]">
          <li>
            <Link href="/" className="transition-colors hover:text-[var(--color-text-primary)]">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-[var(--color-text-primary)]">
            Envíos
          </li>
        </ol>
      </nav>

      <PurchaseHelpHero
        eyebrow="Del taller a su hogar"
        title="Un despacho claro para cada compra."
        description="La fecha, el costo y el seguimiento dependen del canal indicado en el producto. Revisa siempre la información antes de confirmar el pago."
      />
      <PurchaseChannelGuide channels={channels} />

      <section className="mt-14 grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[1.25rem] border border-[#deded9] bg-white p-7 sm:p-9">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#efefec] text-[#3d3d39]">
            <BrandIcon name="shipping" className="h-5 w-5" />
          </span>
          <p className="ui-eyebrow mt-6">Compra directa</p>
          <h2
            className="mt-3 text-3xl text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Condiciones vigentes
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
            {getDirectShippingSummary(pricing)} El valor final se confirma en el resumen del pedido.
          </p>
          <dl className="mt-6 space-y-3 border-t border-[#deded9] pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-text-secondary)]">Tarifa base</dt>
              <dd className="font-semibold text-[var(--color-text-primary)]">
                {formatClp(pricing.shippingFee)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-text-secondary)]">Envío gratis desde</dt>
              <dd className="font-semibold text-[var(--color-text-primary)]">
                {pricing.freeShippingThreshold > 0
                  ? formatClp(pricing.freeShippingThreshold)
                  : 'No disponible'}
              </dd>
            </div>
          </dl>
        </article>

        <section aria-labelledby="direct-estimates-heading">
          <p className="ui-eyebrow">Tiempos orientativos</p>
          <h2
            id="direct-estimates-heading"
            className="mt-3 text-4xl text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Estimaciones para pedidos directos
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
            Los plazos comienzan después de preparar el pedido y pueden variar por temporada,
            disponibilidad del transportista y destino.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {directEstimates.map((item) => (
              <article
                key={item.zone}
                className="rounded-[1rem] border border-[#dfdfda] bg-white p-5"
              >
                <p className="font-semibold text-[var(--color-text-primary)]">{item.zone}</p>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{item.estimate}</p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="mt-10 rounded-[1.25rem] border border-[#ded9ca] bg-white p-7 shadow-[inset_3px_0_0_#d7a51f] sm:p-9">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#ffe7a7] text-[#76520d]">
            <BrandIcon name="package" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              Seguimiento sin confusiones
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
              En Mercado Libre, revisa “Mis compras” y el detalle del envío. Para pedidos directos,
              te enviaremos el número de seguimiento cuando el transportista lo haya generado.
            </p>
          </div>
        </div>
      </section>

      <PurchaseHelpCta
        title="¿Necesitas revisar un despacho?"
        description="Indícanos el número de pedido directo. Si compraste en Mercado Libre, abre primero el detalle de esa compra para ver el estado actualizado."
      />
    </main>
  )
}
