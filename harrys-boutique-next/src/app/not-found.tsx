import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Página no encontrada — Harry's Boutique",
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-background)]">
      <div className="text-center space-y-6 max-w-md">
        <p
          className="text-8xl font-light text-[var(--color-accent)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          404
        </p>
        <h1 className="text-2xl font-medium text-[var(--color-text-primary)]">
          Página no encontrada
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Lo sentimos, la página que buscás no existe o fue movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Ir al inicio
          </Link>
          <Link
            href="/collection"
            className="px-6 py-2.5 border border-[var(--color-border)] rounded-lg text-sm font-medium hover:bg-[var(--color-surface)] transition-colors"
          >
            Ver colección
          </Link>
        </div>
      </div>
    </div>
  )
}
