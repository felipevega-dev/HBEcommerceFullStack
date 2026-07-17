import type { Metadata } from 'next'
import Link from 'next/link'
import {
  PurchaseChannelGuide,
  PurchaseHelpCta,
  PurchaseHelpHero,
} from '@/components/store/purchase-help-layout'
import { BrandIcon } from '@/components/ui/brand-icon'
import { getPricingSettings } from '@/lib/commerce-settings'
import { PUBLIC_CONTACT_EMAIL, getPurchaseChannelHelp } from '@/lib/purchase-channel-content'

export const metadata: Metadata = {
  title: "Cambios y devoluciones — Harry's Boutique",
  description:
    'Conoce cómo gestionar devoluciones en Mercado Libre y los derechos aplicables a compras directas de Harry’s Boutique.',
}

export const dynamic = 'force-dynamic'

const directReturnSteps = [
  {
    title: 'Escríbenos',
    description: `Envía el número de pedido y el motivo a ${PUBLIC_CONTACT_EMAIL}.`,
  },
  {
    title: 'Recibe las instrucciones',
    description: 'Te responderemos con los pasos y la dirección de devolución correspondientes.',
  },
  {
    title: 'Protege la prenda',
    description: 'Envíala sin uso, con sus etiquetas y accesorios, en un embalaje adecuado.',
  },
  {
    title: 'Revisión y solución',
    description:
      'Al recibirla, confirmaremos si corresponde retracto, cambio, reparación o reembolso.',
  },
]

export default async function ReturnsPage() {
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
            Cambios y devoluciones
          </li>
        </ol>
      </nav>

      <PurchaseHelpHero
        eyebrow="Postventa clara"
        title="Te acompañamos también después de comprar."
        description="El procedimiento depende del canal donde completaste el pago. Conserva el comprobante y revisa aquí el camino que corresponde."
      />
      <PurchaseChannelGuide channels={channels} />

      <section className="mt-14 grid gap-6 lg:grid-cols-3">
        <article className="rounded-[1.2rem] border border-[#deded9] bg-white p-6">
          <BrandIcon name="handshake" className="h-6 w-6 text-[var(--color-accent-strong)]" />
          <h2 className="mt-5 text-xl font-semibold text-[var(--color-text-primary)]">
            Retracto en compra directa
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
            Para productos estándar comprados a distancia, puedes solicitar el retracto dentro de
            los 10 días siguientes a la recepción, siempre que la prenda no haya sido usada.
          </p>
        </article>
        <article className="rounded-[1.2rem] border border-[#deded9] bg-white p-6">
          <BrandIcon name="check-circle" className="h-6 w-6 text-[var(--color-accent-strong)]" />
          <h2 className="mt-5 text-xl font-semibold text-[var(--color-text-primary)]">
            Garantía legal
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
            Si el producto presenta una falla, la garantía legal permite solicitar cambio,
            reparación o devolución dentro de los seis meses siguientes a la recepción, cuando
            corresponde.
          </p>
        </article>
        <article className="rounded-[1.2rem] border border-[#ded9ca] bg-white p-6 shadow-[inset_0_3px_0_#d7a51f]">
          <BrandIcon name="design" className="h-6 w-6 text-[#76520d]" />
          <h2 className="mt-5 text-xl font-semibold text-[var(--color-text-primary)]">
            Encargos personalizados
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
            Las piezas confeccionadas según tus especificaciones pueden tener condiciones
            particulares. Las informaremos de forma destacada antes de confirmar el encargo y el
            pago.
          </p>
        </article>
      </section>

      <section aria-labelledby="direct-return-heading" className="mt-14">
        <p className="ui-eyebrow">Pedidos directos</p>
        <h2
          id="direct-return-heading"
          className="mt-3 text-4xl text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Cómo iniciar una solicitud
        </h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {directReturnSteps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[1rem] border border-[#dfdfda] bg-white p-5"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#efefec] text-sm font-bold text-[#3d3d39]">
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold text-[var(--color-text-primary)]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <aside className="mt-10 rounded-[1.15rem] border border-[#deded9] bg-white p-6 text-sm leading-7 text-[var(--color-text-secondary)]">
        <strong className="text-[var(--color-text-primary)]">Importante:</strong> una compra hecha
        en Mercado Libre debe gestionarse desde el detalle de esa compra. Este procedimiento de
        contacto corresponde únicamente a pedidos directos de Harry&apos;s.
      </aside>

      <PurchaseHelpCta
        title="Revisemos tu caso"
        description="Ten a mano el número de pedido, fotografías y una breve descripción. Así podremos orientarte con mayor rapidez."
      />
    </main>
  )
}
