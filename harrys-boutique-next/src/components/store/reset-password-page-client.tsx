'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { BrandIcon } from '@/components/ui/brand-icon'

const passwordRules = [
  { label: '8 caracteres', test: (value: string) => value.length >= 8 },
  { label: 'Una mayúscula', test: (value: string) => /[A-ZÁÉÍÓÚÑ]/.test(value) },
  { label: 'Un número', test: (value: string) => /\d/.test(value) },
]

export function ResetPasswordPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isPasswordStrong = passwordRules.every((rule) => rule.test(password))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('El enlace de recuperación no es válido.')
      return
    }

    if (!isPasswordStrong) {
      setError('La contraseña debe cumplir todos los requisitos.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message ?? 'No pudimos restablecer la contraseña.')
        return
      }

      toast.success('Contraseña actualizada. Ya puedes iniciar sesión.')
      router.push('/login')
    } catch {
      setError('No pudimos restablecer la contraseña. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 shadow-lg sm:p-8">
        <div className="mb-7 text-center">
          <h1
            className="text-3xl font-medium text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Restablecer contraseña
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Crea una nueva contraseña segura para tu cuenta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text-primary)]">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 pr-11 text-sm outline-none transition-all focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                placeholder="Ingresa tu nueva contraseña"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <BrandIcon name="eye" className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {passwordRules.map((rule) => {
              const passed = rule.test(password)
              return (
                <div
                  key={rule.label}
                  className={`flex items-center gap-1.5 text-xs ${
                    passed ? 'text-green-700' : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  <BrandIcon name={passed ? 'check-circle' : 'circle'} className="h-3.5 w-3.5" />
                  {rule.label}
                </div>
              )
            })}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text-primary)]">
              Confirmar contraseña
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
              placeholder="Repite tu nueva contraseña"
              autoComplete="new-password"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <BrandIcon name="loader" className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar nueva contraseña'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
