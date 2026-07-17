import type { Metadata } from 'next'
import Link from 'next/link'
import {
  PurchaseChannelGuide,
  PurchaseHelpCta,
  PurchaseHelpHero,
} from '@/components/store/purchase-help-layout'
import { getPricingSettings } from '@/lib/commerce-settings'
import { getFaqSections, getPurchaseChannelHelp } from '@/lib/purchase-channel-content'
import {
  getBreadcrumbStructuredData,
  getFaqStructuredData,
  stringifyJsonLd,
} from '@/lib/structured-data'
import { getSiteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: "Preguntas frecuentes — Harry's Boutique",
  description:
    "Respuestas sobre compras en Mercado Libre, pedidos directos, envíos, devoluciones y tallas de Harry's Boutique.",
}

export const dynamic = 'force-dynamic'

export default async function FaqPage() {
  const pricing = await getPricingSettings()
  const faqs = getFaqSections(pricing)
  const channels = getPurchaseChannelHelp(pricing)
  const siteUrl = getSiteUrl()
  const structuredData = [
    getBreadcrumbStructuredData([
      { name: 'Inicio', url: siteUrl },
      { name: 'Preguntas frecuentes', url: `${siteUrl}/faq` },
    ]),
    getFaqStructuredData(faqs.flatMap((section) => section.items)),
  ]

  return (
    <main className="ui-container py-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(structuredData) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex gap-2 text-sm text-[var(--color-text-muted)]">
          <li>
            <Link href="/" className="transition-colors hover:text-[var(--color-text-primary)]">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-[var(--color-text-primary)]">
            Preguntas frecuentes
          </li>
        </ol>
      </nav>

      <PurchaseHelpHero
        eyebrow="Guía de compra"
        title="Comprar con confianza, desde el canal correcto."
        description="Cada producto indica dónde completar la compra. Aquí encontrarás respuestas claras para Mercado Libre y para los pedidos directos o personalizados de Harry’s."
      />
      <PurchaseChannelGuide channels={channels} />

      <section aria-labelledby="faq-heading" className="mt-14">
        <div className="mb-7 max-w-2xl">
          <p className="ui-eyebrow">Respuestas rápidas</p>
          <h2
            id="faq-heading"
            className="mt-3 text-4xl text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Todo lo importante, sin letra pequeña
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          {faqs.map((section, sectionIndex) => (
            <section key={section.category} aria-labelledby={`faq-section-${sectionIndex}`}>
              <h3
                id={`faq-section-${sectionIndex}`}
                className="mb-4 border-b border-[#e2d3c4] pb-3 text-lg font-semibold text-[var(--color-text-primary)]"
              >
                {section.category}
              </h3>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-[1.1rem] border border-[#e8ddd2] bg-white px-5 py-4 open:shadow-[var(--shadow-sm)]"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-[var(--color-text-primary)] marker:hidden">
                      {item.q}
                      <span
                        aria-hidden="true"
                        className="text-xl text-[var(--color-accent-strong)] transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 pr-8 text-sm leading-7 text-[var(--color-text-secondary)]">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <PurchaseHelpCta />
    </main>
  )
}
