'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-background)]">
      <div className="text-center space-y-6 max-w-md">
        <p
          className="text-8xl font-light text-[var(--color-accent)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          500
        </p>
        <h1 className="text-2xl font-medium text-[var(--color-text-primary)]">Algo salió mal</h1>
        <p className="text-[var(--color-text-secondary)]">
          Ocurrió un error inesperado. Nuestro equipo ya fue notificado.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 border border-[var(--color-border)] rounded-lg text-sm font-medium hover:bg-[var(--color-surface)] transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs text-[var(--color-text-muted)]">Código: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
