import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import ContactForm from '@/components/store/contact-form'
import { BrandIcon } from '@/components/ui/brand-icon'

export const metadata: Metadata = {
  title: "Contacto — Harry's Boutique",
  description:
    'Escríbenos para resolver tus dudas sobre tallas, productos, personalización y envíos.',
}

const contactItems = [
  {
    label: 'Email',
    value: 'contacto@harrysboutique.cl',
    href: 'mailto:contacto@harrysboutique.cl',
    icon: 'message' as const,
  },
  {
    label: 'Teléfono',
    value: '+56 58 2265 4321',
    href: 'tel:+565822654321',
    icon: 'phone' as const,
  },
  {
    label: 'Instagram',
    value: '@harrysboutique.cl',
    href: 'https://www.instagram.com/harrysboutique.cl/',
    icon: 'camera' as const,
  },
]

export default function ContactPage() {
  return (
    <main>
      <section className="ui-container py-10 sm:py-16 lg:py-20">
        <div className="grid overflow-hidden rounded-[1.5rem] border border-[#deded9] bg-white lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16">
            <p className="ui-eyebrow">Hablemos</p>
            <h1
              className="mt-5 text-5xl leading-none text-[var(--color-text-primary)] sm:text-6xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Estamos aquí para ayudarte.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-[var(--color-text-secondary)]">
              ¿Tienes dudas sobre una talla, un pedido o una personalización? Escríbenos y te
              responderemos con la atención cercana de siempre.
            </p>
          </div>
          <div className="relative min-h-[300px] lg:min-h-[390px]">
            <Image
              src="/nancyharry.png"
              alt="Harry's Boutique y sus mascotas"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="ui-container pb-16 sm:pb-24">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="ui-card p-6 sm:p-9">
            <div className="mb-8">
              <p className="ui-eyebrow">Mensaje directo</p>
              <h2
                className="mt-3 text-3xl text-[var(--color-text-primary)] sm:text-4xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Cuéntanos qué necesitas
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                Completa el formulario y revisaremos tu mensaje lo antes posible.
              </p>
            </div>
            <ContactForm />
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <p className="ui-eyebrow">Canales de atención</p>
              <h2
                className="mt-3 text-4xl leading-none text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Hablemos sin vueltas.
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {contactItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="ui-card flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#efefec] text-[#3d3d39]">
                    <BrandIcon name={item.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                      {item.label}
                    </span>
                    <span className="mt-1 block truncate text-sm font-medium text-[var(--color-text-primary)]">
                      {item.value}
                    </span>
                  </span>
                </a>
              ))}
            </div>

            <div className="ui-card bg-white p-6">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--color-background)] text-[var(--color-accent-strong)]">
                  <BrandIcon name="location" className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-medium text-[var(--color-text-primary)]">Arica, Chile</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Envíos a todo Chile. Respondemos de lunes a viernes, de 9:00 a 18:00.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/envios"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent-strong)]"
            >
              Revisa información de envíos y cambios
              <BrandIcon name="chevron-right" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
