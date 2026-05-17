import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbStructuredData,
  getFaqStructuredData,
  stringifyJsonLd,
} from '@/lib/structured-data'
import { getSiteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: "Preguntas frecuentes - Harry's Boutique",
  description:
    "Respuestas sobre envíos en Chile, cambios, pagos, tallas y productos de Harry's Boutique.",
}

const faqs = [
  {
    category: 'Pedidos y pagos',
    items: [
      {
        q: '¿Cómo puedo realizar un pedido?',
        a: 'Puedes agregar productos al carrito desde cualquier página de producto o colección, y luego completar el pago con MercadoPago.',
      },
      {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Aceptamos pagos a través de MercadoPago, incluyendo tarjetas de crédito, débito y otros medios disponibles para Chile.',
      },
      {
        q: '¿Puedo modificar o cancelar mi pedido?',
        a: 'Puedes solicitar cambios o cancelación antes del despacho. Si el pedido ya fue enviado, revisaremos el caso según la política de cambios y devoluciones.',
      },
    ],
  },
  {
    category: 'Envíos',
    items: [
      {
        q: '¿Cuánto tarda en llegar mi pedido?',
        a: 'Los envíos dentro de Chile demoran entre 2 y 7 días hábiles dependiendo de tu comuna y región. Para zonas extremas puede demorar hasta 15 días hábiles.',
      },
      {
        q: '¿Tienen envío gratis?',
        a: 'Sí, ofrecemos envío gratis en compras superiores a $50.000. Para compras menores, el costo de envío se calcula al momento del checkout.',
      },
      {
        q: '¿Cómo puedo rastrear mi pedido?',
        a: 'Cuando el pedido sea despachado, recibirás un correo con el courier y el número de seguimiento si está disponible.',
      },
    ],
  },
  {
    category: 'Devoluciones y cambios',
    items: [
      {
        q: '¿Puedo devolver un producto?',
        a: 'Sí, aceptamos devoluciones dentro de los 7 días desde la recepción, siempre que el producto esté sin uso, en buen estado y con su etiqueta original.',
      },
      {
        q: '¿Cómo solicito un cambio de talla?',
        a: 'Contáctanos indicando tu número de pedido y la talla que necesitas. Revisaremos disponibilidad de stock y te guiaremos con el cambio.',
      },
    ],
  },
  {
    category: 'Productos',
    items: [
      {
        q: '¿Los productos son aptos para todas las razas?',
        a: 'Tenemos prendas y accesorios para mascotas de distintos tamaños. Revisa la guía de tallas de cada producto antes de comprar.',
      },
      {
        q: '¿Los materiales son seguros para mascotas?',
        a: 'Sí, seleccionamos materiales cómodos y seguros para mascotas, priorizando calidad, resistencia y buen calce.',
      },
    ],
  },
]

export default function FaqPage() {
  const siteUrl = getSiteUrl()
  const flatFaqs = faqs.flatMap((section) => section.items)
  const structuredData = [
    getBreadcrumbStructuredData([
      { name: 'Inicio', url: siteUrl },
      { name: 'Preguntas frecuentes', url: `${siteUrl}/faq` },
    ]),
    getFaqStructuredData(flatFaqs),
  ]

  return (
    <main className="py-16 px-4 max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(structuredData) }}
      />
      <nav aria-label="breadcrumb" className="mb-6">
        <ol className="flex gap-2 text-sm text-[var(--color-text-muted)]">
          <li>
            <Link href="/" className="hover:text-[var(--color-text-primary)] transition-colors">
              Inicio
            </Link>
          </li>
          <li>/</li>
          <li className="text-[var(--color-text-primary)]">Preguntas frecuentes</li>
        </ol>
      </nav>

      <h1
        className="text-3xl font-medium mb-2 text-[var(--color-text-primary)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Preguntas frecuentes
      </h1>
      <p className="text-[var(--color-text-secondary)] mb-12">
        Todo lo que necesitas saber sobre Harry&apos;s Boutique.
      </p>

      <div className="space-y-10">
        {faqs.map((section) => (
          <section key={section.category}>
            <h2 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
              {section.category}
            </h2>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.q} className="bg-[var(--color-surface)] rounded-xl p-5">
                  <h3 className="font-medium text-[var(--color-text-primary)] mb-2">{item.q}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 p-6 bg-[var(--color-accent-light)] rounded-xl text-center">
        <p className="text-[var(--color-text-secondary)] mb-3">¿No encontraste lo que buscabas?</p>
        <Link
          href="/contact"
          className="inline-block px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          Contáctanos
        </Link>
      </div>
    </main>
  )
}
