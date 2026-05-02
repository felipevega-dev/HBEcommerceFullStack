import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] mt-16 py-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Columnas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Columna 1: Logo + descripción + redes sociales */}
          <div>
            <Image
              src="/logo.png"
              alt="Harry's Boutique"
              width={120}
              height={40}
              className="mb-3"
            />
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Ropa y accesorios de moda para tu mejor amigo.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/harrysboutique"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/harrysboutique"
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Columna 2: Tienda */}
          <div>
            <p className="font-semibold text-[var(--color-text-primary)] mb-3">Tienda</p>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li>
                <Link
                  href="/collection"
                  className="hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Colecciones
                </Link>
              </li>
              <li>
                <Link
                  href="/collection?sort=newest"
                  className="hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Novedades
                </Link>
              </li>
              <li>
                <Link
                  href="/collection?bestSeller=true"
                  className="hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Más Vendidos
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Ayuda */}
          <div>
            <p className="font-semibold text-[var(--color-text-primary)] mb-3">Ayuda</p>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li>
                <Link
                  href="/envios"
                  className="hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Envíos
                </Link>
              </li>
              <li>
                <Link
                  href="/devoluciones"
                  className="hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-[var(--color-text-primary)] transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Newsletter */}
          <div>
            <p className="font-semibold text-[var(--color-text-primary)] mb-3">Newsletter</p>
            <p className="text-sm text-[var(--color-text-secondary)] mb-3">
              Suscribite para recibir novedades y ofertas exclusivas
            </p>
            <Link
              href="/contact"
              className="inline-block px-4 py-2 text-sm font-medium bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Suscribirse
            </Link>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="border-t border-[var(--color-border)] pt-6 mb-6">
          <p className="text-xs text-[var(--color-text-secondary)] mb-3">Pagos seguros con:</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-8 px-2 rounded border border-[var(--color-border)] bg-white">
              <span className="text-xs font-bold text-[#009ee3]">MP</span>
            </div>
            <div className="flex items-center justify-center h-8 px-2 rounded border border-[var(--color-border)] bg-white">
              <span className="text-xs font-bold text-[#1a1f71] tracking-wider">VISA</span>
            </div>
            <div className="flex items-center justify-center h-8 px-2 rounded border border-[var(--color-border)] bg-white">
              <svg width="32" height="20" viewBox="0 0 32 20" aria-label="Mastercard" role="img">
                <circle cx="12" cy="10" r="9" fill="#eb001b" />
                <circle cx="20" cy="10" r="9" fill="#f79e1b" fillOpacity="0.85" />
              </svg>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-[var(--color-text-secondary)]">
          © {new Date().getFullYear()} Harry&apos;s Boutique. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
