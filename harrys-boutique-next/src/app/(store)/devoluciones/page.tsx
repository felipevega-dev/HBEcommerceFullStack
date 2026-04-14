import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Devoluciones y Cambios — Harry's Boutique",
  description:
    'Conocé nuestra política de devoluciones y cambios. Aceptamos devoluciones dentro de los 7 días de recibido el producto.',
}

export default function DevolucionesPage() {
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
          <li className="text-[var(--color-text-primary)]">Devoluciones</li>
        </ol>
      </nav>

      <h1
        className="text-3xl font-medium mb-2 text-[var(--color-text-primary)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Devoluciones y Cambios
      </h1>
      <p className="text-[var(--color-text-secondary)] mb-12">
        Tu satisfacción es nuestra prioridad. Si no estás conforme con tu compra, te ayudamos.
      </p>

      <div className="space-y-8">
        {/* Política */}
        <section>
          <h2 className="text-xl font-medium mb-4 text-[var(--color-text-primary)]">
            Nuestra política
          </h2>
          <div className="bg-[var(--color-surface)] rounded-xl p-6 space-y-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            <p>
              Aceptamos devoluciones y cambios dentro de los{' '}
              <strong className="text-[var(--color-text-primary)]">7 días corridos</strong> desde la
              recepción del producto.
            </p>
            <p>
              El producto debe estar en perfectas condiciones: sin uso, con su etiqueta original y
              en su embalaje original.
            </p>
            <p>
              Los gastos de envío de la devolución corren por cuenta del cliente, salvo que el
              producto presente defectos de fabricación.
            </p>
          </div>
        </section>

        {/* Pasos */}
        <section>
          <h2 className="text-xl font-medium mb-4 text-[var(--color-text-primary)]">
            ¿Cómo solicitar una devolución?
          </h2>
          <div className="space-y-3">
            {[
              {
                step: '1',
                title: 'Contactanos',
                desc: 'Envianos un email a hola@harrys-boutique.com con tu número de pedido y el motivo de la devolución.',
              },
              {
                step: '2',
                title: 'Confirmación',
                desc: 'Te responderemos dentro de las 48 horas hábiles con las instrucciones para el envío de devolución.',
              },
              {
                step: '3',
                title: 'Envío',
                desc: 'Empaquetá el producto en su embalaje original y envialo a la dirección que te indicaremos.',
              },
              {
                step: '4',
                title: 'Reembolso o cambio',
                desc: 'Una vez recibido y verificado el producto, procesamos el reembolso o el cambio en un plazo de 5 días hábiles.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-4 items-start bg-[var(--color-surface)] rounded-xl p-4"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text-primary)] text-sm">
                    {item.title}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Excepciones */}
        <section>
          <h2 className="text-xl font-medium mb-4 text-[var(--color-text-primary)]">
            Productos sin devolución
          </h2>
          <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            {[
              'Productos con signos de uso o lavado',
              'Productos sin etiqueta original',
              'Productos en oferta o liquidación (salvo defecto de fabricación)',
              'Accesorios de higiene por razones sanitarias',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-[var(--color-error)] mt-0.5">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-12 p-6 bg-[var(--color-accent-light)] rounded-xl text-center">
        <p className="text-[var(--color-text-secondary)] mb-3">
          ¿Necesitás ayuda con tu devolución?
        </p>
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
