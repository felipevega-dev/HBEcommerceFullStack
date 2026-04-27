'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'
import { ButtonWithFeedback } from '@/components/ui/button-with-feedback'

export function NewsletterBox() {
  const [email, setEmail] = useState('')

  const handleSubmit = async () => {
    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico')
      throw new Error('Email required')
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Por favor ingresa un correo electrónico válido')
      throw new Error('Invalid email')
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success('¡Gracias por suscribirte!')
    setEmail('')
  }

  return (
    <section className="py-8 bg-gradient-to-br from-[var(--color-accent-light)] to-[var(--color-gold-light)]">
      <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
        <div className="space-y-4">
          <h2
            className="text-3xl md:text-4xl font-medium text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Obtén un 10% de descuento
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Suscríbete a nuestro newsletter y recibe un 10% de descuento en tu primera compra,
            además de noticias exclusivas y ofertas especiales.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="max-w-md mx-auto"
        >
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo electrónico"
              className="flex-1 px-4 py-3 rounded-lg border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-colors outline-none bg-white"
            />
            <ButtonWithFeedback
              type="submit"
              onClick={handleSubmit}
              variant="primary"
              className="px-6 !bg-[var(--color-primary)] hover:!bg-[var(--color-primary-hover)]"
            >
              Suscribirse
            </ButtonWithFeedback>
          </div>
        </form>

        <p className="text-sm text-gray-500">
          Al suscribirte, aceptas recibir correos de marketing. Puedes darte de baja en cualquier
          momento.
        </p>
      </div>
    </section>
  )
}
