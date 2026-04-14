import type { Metadata } from 'next'
import ContactForm from '@/components/store/contact-form'

export const metadata: Metadata = {
  title: "Contacto — Harry's Boutique",
  description: 'Contáctanos para cualquier consulta sobre nuestros productos.',
}

export default function ContactPage() {
  return (
    <main className="py-16 px-4 max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <h1
          className="text-4xl font-medium mb-3 text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Contacto
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)]">
          ¿Tienes alguna pregunta? Estamos aquí para ayudarte
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Formulario */}
        <div className="rounded-xl p-8 border border-[var(--color-border)] bg-[var(--color-surface)]">
          <h2 className="text-xl font-medium mb-6 text-[var(--color-text-primary)]">
            Envíanos un mensaje
          </h2>
          <ContactForm />
        </div>

        {/* Info de contacto */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-xl font-medium mb-6 text-[var(--color-text-primary)]">
              Información de contacto
            </h2>
            <ul className="flex flex-col gap-5">
              {[
                {
                  label: 'Email',
                  value: 'hola@harrys-boutique.com',
                  href: 'mailto:hola@harrys-boutique.com',
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  ),
                },
                {
                  label: 'Teléfono',
                  value: '+54 11 1234-5678',
                  href: 'tel:+541112345678',
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  ),
                },
                {
                  label: 'Instagram',
                  value: '@harrys.boutique',
                  href: 'https://instagram.com/harrys.boutique',
                  icon: (
                    <>
                      <rect
                        x="2"
                        y="2"
                        width="20"
                        height="20"
                        rx="5"
                        ry="5"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01"
                      />
                    </>
                  ),
                },
                {
                  label: 'Facebook',
                  value: "Harry's Boutique",
                  href: 'https://facebook.com/harrys.boutique',
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"
                    />
                  ),
                },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[var(--color-accent-light)] text-[var(--color-accent-dark)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.icon}
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide mb-0.5 text-[var(--color-text-muted)]">
                      {item.label}
                    </p>
                    <a
                      href={item.href}
                      className="text-sm hover:underline text-[var(--color-text-primary)]"
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {item.value}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl p-6 bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[var(--color-accent-light)] text-[var(--color-accent-dark)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-[var(--color-text-primary)]">Horario de atención</h3>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">Lun–Vie: 9:00 – 18:00</p>
            <p className="text-sm mt-1 text-[var(--color-text-muted)]">
              Respondemos en menos de 24 horas hábiles
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
