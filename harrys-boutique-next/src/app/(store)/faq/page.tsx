import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Preguntas Frecuentes — Harry's Boutique",
  description:
    "Encontrá respuestas a las preguntas más comunes sobre envíos, devoluciones y productos de Harry's Boutique.",
}

const faqs = [
  {
    category: 'Pedidos y Pagos',
    items: [
      {
        q: '¿Cómo puedo realizar un pedido?',
        a: 'Podés agregar productos al carrito desde cualquier página de producto o colección, y luego completar el proceso de pago con MercadoPago.',
      },
      {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Aceptamos pagos a través de MercadoPago, que incluye tarjetas de crédito, débito, transferencia bancaria y efectivo en puntos de pago.',
      },
      {
        q: '¿Puedo modificar o cancelar mi pedido?',
        a: 'Podés cancelar tu pedido dentro de las 24 horas de realizado, siempre que no haya sido enviado. Contactanos por email para gestionar la cancelación.',
      },
    ],
  },
  {
    category: 'Envíos',
    items: [
      {
        q: '¿Cuánto tarda en llegar mi pedido?',
        a: 'Los envíos dentro de Argentina demoran entre 3 y 7 días hábiles dependiendo de tu ubicación. Para el interior del país puede demorar hasta 10 días hábiles.',
      },
      {
        q: '¿Tienen envío gratis?',
        a: 'Sí, ofrecemos envío gratis en compras superiores a $50.000. Para compras menores, el costo de envío se calcula al momento del checkout.',
      },
      {
        q: '¿Cómo puedo rastrear mi pedido?',
        a: 'Una vez despachado tu pedido, recibirás un email con el número de seguimiento para rastrear tu envío.',
      },
    ],
  },
  {
    category: 'Devoluciones y Cambios',
    items: [
      {
        q: '¿Puedo devolver un producto?',
        a: 'Sí, aceptamos devoluciones dentro de los 7 días de recibido el producto, siempre que esté en perfectas condiciones y con su etiqueta original.',
      },
      {
        q: '¿Cómo solicito un cambio de talla?',
        a: 'Contactanos por email indicando tu número de pedido y la talla que necesitás. Gestionamos el cambio sin costo adicional si hay stock disponible.',
      },
    ],
  },
  {
    category: 'Productos',
    items: [
      {
        q: '¿Los productos son aptos para todas las razas?',
        a: 'Nuestros productos están diseñados para mascotas de diferentes tamaños. Consultá la guía de tallas en cada producto para encontrar la medida correcta.',
      },
      {
        q: '¿Los materiales son seguros para mascotas?',
        a: 'Sí, todos nuestros productos están fabricados con materiales no tóxicos y seguros para mascotas, cumpliendo con los estándares de calidad.',
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <main className="py-16 px-4 max-w-3xl mx-auto">
      <nav aria-label="breadcrumb" className="mb-6">
        <ol className="flex gap-2 text-sm text-[var(--color-text-muted)]">
          <li>
            <Link href="/" className="hover:text-[var(--color-text-primary)] transition-colors">
              Inicio
            </Link>
          </li>
          <li>/</li>
          <li className="text-[var(--color-text-primary)]">Preguntas Frecuentes</li>
        </ol>
      </nav>

      <h1
        className="text-3xl font-medium mb-2 text-[var(--color-text-primary)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Preguntas Frecuentes
      </h1>
      <p className="text-[var(--color-text-secondary)] mb-12">
        Todo lo que necesitás saber sobre Harry&apos;s Boutique.
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
          Contactanos
        </Link>
      </div>
    </main>
  )
}
