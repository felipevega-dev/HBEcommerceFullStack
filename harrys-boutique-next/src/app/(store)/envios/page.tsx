import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Información de Envíos — Harry's Boutique",
  description:
    'Conocé nuestras opciones de envío, tiempos de entrega y costos para todo Argentina.',
}

export default function EnviosPage() {
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
          <li className="text-[var(--color-text-primary)]">Envíos</li>
        </ol>
      </nav>

      <h1
        className="text-3xl font-medium mb-2 text-[var(--color-text-primary)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Información de Envíos
      </h1>
      <p className="text-[var(--color-text-secondary)] mb-12">
        Enviamos a todo el país con las mejores opciones de entrega.
      </p>

      <div className="space-y-8">
        {/* Envío gratis */}
        <div className="bg-[var(--color-accent-light)] rounded-xl p-6 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-[var(--color-text-primary)] mb-1">
              Envío gratis en compras +$50.000
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Todas las compras superiores a $50.000 tienen envío sin costo a cualquier punto del
              país.
            </p>
          </div>
        </div>

        {/* Tiempos */}
        <section>
          <h2 className="text-xl font-medium mb-4 text-[var(--color-text-primary)]">
            Tiempos de entrega
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { zona: 'AMBA (Buenos Aires)', tiempo: '2 a 4 días hábiles' },
              { zona: 'Interior de Buenos Aires', tiempo: '3 a 6 días hábiles' },
              { zona: 'Resto del país', tiempo: '5 a 10 días hábiles' },
              { zona: 'Zonas remotas', tiempo: '7 a 15 días hábiles' },
            ].map((item) => (
              <div key={item.zona} className="bg-[var(--color-surface)] rounded-xl p-4">
                <p className="font-medium text-sm text-[var(--color-text-primary)]">{item.zona}</p>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">{item.tiempo}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Costos */}
        <section>
          <h2 className="text-xl font-medium mb-4 text-[var(--color-text-primary)]">
            Costos de envío
          </h2>
          <div className="bg-[var(--color-surface)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-2)]">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-primary)]">
                    Monto de compra
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-primary)]">
                    Costo de envío
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                <tr>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">Hasta $49.999</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    Calculado al checkout según destino
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">$50.000 o más</td>
                  <td className="px-4 py-3 font-medium text-[var(--color-success)]">¡Gratis!</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Seguimiento */}
        <section>
          <h2 className="text-xl font-medium mb-4 text-[var(--color-text-primary)]">
            Seguimiento de pedidos
          </h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            Una vez que tu pedido sea despachado, recibirás un email con el número de seguimiento
            para rastrear tu envío en tiempo real. También podés consultar el estado de tu pedido
            desde tu perfil en la tienda.
          </p>
        </section>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-[var(--color-text-muted)] mb-3">
          ¿Tenés alguna duda sobre tu envío?
        </p>
        <Link href="/contact" className="text-sm text-[var(--color-accent-dark)] hover:underline">
          Contactanos →
        </Link>
      </div>
    </main>
  )
}
