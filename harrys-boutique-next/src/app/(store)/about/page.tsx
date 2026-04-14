import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Nosotros — Harry's Boutique",
  description:
    "Conoce la historia de Harry's Boutique, tu tienda de ropa y accesorios para mascotas.",
}

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="h-64 flex flex-col items-center justify-center text-center px-4 bg-[var(--color-primary)]">
        <h1
          className="text-4xl md:text-5xl font-medium text-white mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Nuestra Historia
        </h1>
        <p className="text-white/70 text-lg max-w-xl">
          Una historia de amor, mascotas y moda que nació en familia
        </p>
      </section>

      {/* Historia narrativa */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              className="text-3xl font-medium mb-6 text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Cómo empezó todo
            </h2>
            <p className="text-lg leading-relaxed text-[var(--color-text-secondary)]">
              Harry&apos;s Boutique nació en 2020 del amor incondicional por las mascotas. Lo que
              comenzó como un pequeño emprendimiento familiar se convirtió en la tienda de
              referencia para dueños que quieren lo mejor para sus compañeros de vida.
            </p>
          </div>
          <div className="rounded-xl h-72 flex items-center justify-center bg-[var(--color-surface-2)]">
            <svg
              className="w-24 h-24 opacity-30 text-[var(--color-text-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-16 px-4 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl font-medium text-center mb-12 text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Misión &amp; Visión
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Misión',
                text: 'Ofrecer productos de calidad que mejoren la vida de las mascotas y sus familias',
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                ),
              },
              {
                title: 'Visión',
                text: 'Ser la marca de referencia en moda y accesorios para mascotas en Latinoamérica',
                icon: (
                  <>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </>
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl p-8 bg-[var(--color-background)] border border-[var(--color-border)]"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[var(--color-accent-light)]">
                  <svg
                    className="w-6 h-6 text-[var(--color-accent-dark)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {item.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-3 text-[var(--color-text-primary)]">
                  {item.title}
                </h3>
                <p className="text-[var(--color-text-secondary)]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <h2
          className="text-3xl font-medium text-center mb-12 text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Nuestros Valores
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {[
            {
              title: 'Calidad',
              description: 'Seleccionamos cada producto con los más altos estándares',
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              ),
            },
            {
              title: 'Amor',
              description: 'Cada decisión la tomamos pensando en el bienestar animal',
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              ),
            },
            {
              title: 'Comunidad',
              description: 'Construimos una familia de amantes de las mascotas',
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              ),
            },
            {
              title: 'Sostenibilidad',
              description: 'Comprometidos con el medio ambiente y el comercio justo',
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ),
            },
          ].map((valor) => (
            <div
              key={valor.title}
              className="flex gap-4 p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]"
            >
              <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[var(--color-accent-light)]">
                <svg
                  className="w-5 h-5 text-[var(--color-accent-dark)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {valor.icon}
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1 text-[var(--color-text-primary)]">{valor.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{valor.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Harry la mascota */}
      <section className="py-16 px-4 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-xl h-72 flex flex-col items-center justify-center gap-3 bg-[var(--color-surface-2)]">
            <svg
              className="w-20 h-20 opacity-40 text-[var(--color-text-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M14 10h.01M10 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z"
              />
            </svg>
            <span className="text-sm text-[var(--color-text-muted)]">Harry 🐾</span>
          </div>
          <div>
            <h2
              className="text-3xl font-medium mb-4 text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Conoce a Harry
            </h2>
            <p className="text-lg leading-relaxed text-[var(--color-text-secondary)]">
              Harry es el golden retriever que inspiró todo. Su personalidad desbordante, su amor
              por la moda y su carisma inigualable fueron la chispa que encendió este proyecto. Hoy,
              cada producto que ofrecemos lleva un poco de su espíritu: alegría, calidad y mucho
              amor.
            </p>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '5000+', label: 'Clientes' },
            { value: '200+', label: 'Productos' },
            { value: '4', label: 'Años' },
            { value: '4.8★', label: 'Valoración' },
          ].map((stat) => (
            <div key={stat.label}>
              <p
                className="text-4xl font-medium mb-1 text-[var(--color-accent)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {stat.value}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-4 text-center bg-[var(--color-surface)]">
        <h2
          className="text-3xl font-medium mb-4 text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ¿Listo para consentir a tu mascota?
        </h2>
        <p className="mb-8 text-lg text-[var(--color-text-secondary)]">
          Descubre nuestra colección completa de ropa y accesorios
        </p>
        <Link
          href="/collection"
          className="inline-block px-8 py-3 rounded-full text-white font-medium bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          Ver Colección
        </Link>
      </section>
    </main>
  )
}
