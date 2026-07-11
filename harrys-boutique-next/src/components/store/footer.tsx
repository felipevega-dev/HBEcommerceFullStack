import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <Image src="/harrys_logo.png" alt="Harry's Boutique" width={120} height={36} />
            <p className="max-w-xs text-sm text-[var(--color-text-secondary)]">
              Ropa y accesorios premium para mascotas. Compra simple, calidad superior.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/harrysboutique"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent-dark)]"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com/harrysboutique"
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent-dark)]"
              >
                Facebook
              </a>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-[var(--color-text-primary)]">Tienda</p>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li>
                <Link href="/collection" className="hover:text-[var(--color-text-primary)]">
                  Colección
                </Link>
              </li>
              <li>
                <Link
                  href="/collection?sort=newest"
                  className="hover:text-[var(--color-text-primary)]"
                >
                  Novedades
                </Link>
              </li>
              <li>
                <Link
                  href="/collection?bestSeller=true"
                  className="hover:text-[var(--color-text-primary)]"
                >
                  Más vendidos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-[var(--color-text-primary)]">Ayuda</p>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li>
                <Link href="/envios" className="hover:text-[var(--color-text-primary)]">
                  Envíos
                </Link>
              </li>
              <li>
                <Link href="/devoluciones" className="hover:text-[var(--color-text-primary)]">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[var(--color-text-primary)]">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--color-text-primary)]">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--color-text-primary)]">
                  Nosotros
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span className="rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1 font-semibold text-[#009ee3]">
              MP
            </span>
            <span className="rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1 font-semibold tracking-wider text-[#1a1f71]">
              VISA
            </span>
            <span className="rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1 text-[var(--color-text-secondary)]">
              Mastercard
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} Harry&apos;s Boutique
          </p>
        </div>
      </div>
    </footer>
  )
}
