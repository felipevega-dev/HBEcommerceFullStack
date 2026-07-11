'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'

export function NewsletterBox() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (loading) return

    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Por favor ingresa un correo electrónico válido')
      return
    }

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success('Gracias por suscribirte')
    setEmail('')
    setLoading(false)
  }

  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] py-12">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2
          className="text-3xl font-medium text-[var(--color-text-primary)] md:text-4xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Recibe novedades de Harry's Boutique
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">
          Recibe novedades, lanzamientos y ofertas especiales sin saturar tu bandeja.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="mx-auto mt-8 max-w-md"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Enviando...' : 'Suscribirse'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-[var(--color-text-muted)]">
          Puedes darte de baja cuando quieras.
        </p>
      </div>
    </section>
  )
}
